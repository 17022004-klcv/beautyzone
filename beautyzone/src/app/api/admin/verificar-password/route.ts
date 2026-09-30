import { NextResponse } from "next/server";
import { UsuarioService } from "@/src/app/services/usuario.service";
import {
  BitacoraService,
  contextoDesdeRequest,
} from "@/src/app/services/bitacora.service";

/**
 * POST /api/admin/verificar-password
 *
 * Puerta de autorización para las operaciones sensibles: editar un arqueo ya
 * guardado y guardar el cierre administrativo. Devuelve si la contraseña de
 * administrador es correcta y, aparte, si hay alguna configurada, para que la
 * interfaz pueda avisar en vez de pedir una contraseña que no existe.
 */
export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (typeof password !== "string" || password.trim().length === 0) {
      return NextResponse.json(
        { error: "Escribe la contraseña de administrador." },
        { status: 400 },
      );
    }

    const resultado = await UsuarioService.verificarPasswordAdmin(password);

    if (resultado.ok) {
      return NextResponse.json({ ok: true, admin: resultado.admin });
    }

    if (resultado.motivo === "sinConfigurar") {
      return NextResponse.json(
        {
          error:
            "Ningún administrador tiene una contraseña de administrador asignada. Configúrala en Usuarios.",
        },
        { status: 409 },
      );
    }

    // Un intento fallido no cambia datos, pero es justo el tipo de evento que
    // sirve para detectar intentos de acceso a operaciones sensibles.
    await BitacoraService.registrar({
      accion: "FALLO_AUTORIZACION",
      entidad: "Admin",
      descripcion: "Intento fallido de verificar la contraseña de administrador",
      resultado: "FALLO",
      datos: { motivo: "contraseña incorrecta" },
      ...contextoDesdeRequest(request, "/api/admin/verificar-password"),
    });

    return NextResponse.json(
      { error: "La contraseña de administrador no es correcta." },
      { status: 401 },
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error al verificar la contraseña",
      },
      { status: 500 },
    );
  }
}

/** GET: solo pregunta si ya hay una contraseña configurada (no la expone). */
export async function GET() {
  try {
    const configurada = await UsuarioService.hayPasswordAdminConfigurada();
    return NextResponse.json({ configurada });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error al consultar la configuración",
      },
      { status: 500 },
    );
  }
}
