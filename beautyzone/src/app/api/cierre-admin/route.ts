import { NextResponse } from "next/server";
import { CierreAdminService } from "@/src/app/services/cierreAdmin.service";
import { UsuarioService } from "@/src/app/services/usuario.service";
import { db } from "@/src/lib/db";
import {
  BitacoraService,
  contextoDesdeRequest,
} from "@/src/app/services/bitacora.service";

/**
 * Puerta de autorización de las escrituras de este módulo.
 *
 * La app no tiene sesión real (el login solo escribía en localStorage), así que
 * se revalida la contraseña de administrador en el servidor en cada escritura en
 * lugar de confiar en un chequeo hecho en el cliente.
 *
 * Devuelve el admin que autorizó, para poder atribuir la escritura en la
 * bitácora, o la respuesta de error si la autorización falla.
 */
async function autorizar(password: unknown) {
  if (typeof password !== "string" || password.trim().length === 0) {
    return NextResponse.json(
      { error: "Escribe la contraseña de administrador." },
      { status: 400 },
    );
  }

  const resultado = await UsuarioService.verificarPasswordAdmin(password);

  if (!resultado.ok) {
    return NextResponse.json(
      {
        error:
          resultado.motivo === "sinConfigurar"
            ? "Ningún administrador tiene una contraseña de administrador asignada. Configúrala en Usuarios."
            : "La contraseña de administrador no es correcta.",
      },
      { status: resultado.motivo === "sinConfigurar" ? 409 : 401 },
    );
  }

  return { admin: resultado.admin };
}

function mensaje(error: unknown, porDefecto: string) {
  return error instanceof Error ? error.message : porDefecto;
}

/** GET: estado completo del cierre de hoy. */
export async function GET() {
  try {
    const resumen = await CierreAdminService.obtenerResumen();
    return NextResponse.json(resumen);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: mensaje(error, "Error al cargar el cierre administrativo") },
      { status: 500 },
    );
  }
}

/**
 * POST /api/cierre-admin
 *
 * Guarda el conteo físico final. Recalcula en el servidor el total contado a
 * partir de las denominaciones y lo contrasta contra el esperado.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { denominaciones, passwordAdmin } = body;

    const autorizacion = await autorizar(passwordAdmin);
    if (autorizacion instanceof NextResponse) return autorizacion;

    if (!denominaciones || typeof denominaciones !== "object") {
      return NextResponse.json(
        { error: "Faltan las denominaciones del conteo." },
        { status: 400 },
      );
    }

    const admin = await db.usuario.findFirst({
      where: { rol: { nombre: "Admin" }, estado: true },
      select: { id: true },
      orderBy: { id: "asc" },
    });
    if (!admin) {
      return NextResponse.json(
        { error: "No hay un administrador activo para asignar el cierre." },
        { status: 409 },
      );
    }

    const resultado = await CierreAdminService.guardarConteo(
      admin.id,
      denominaciones,
    );

    await BitacoraService.registrar({
      accion: "GUARDO_CIERRE_ADMIN",
      entidad: "CierreAdmin",
      descripcion: `${autorizacion.admin.nombre} guardó el cierre administrativo del día`,
      usuario: {
        id: autorizacion.admin.id,
        rol: "Admin",
        nombre: autorizacion.admin.nombre,
      },
      datos: resultado,
      ...contextoDesdeRequest(request, "/api/cierre-admin"),
    });

    return NextResponse.json({ mensaje: "Cierre administrativo guardado", ...resultado });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: mensaje(error, "Error al guardar el cierre administrativo") },
      { status: 500 },
    );
  }
}
