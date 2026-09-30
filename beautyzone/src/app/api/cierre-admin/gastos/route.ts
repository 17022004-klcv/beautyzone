import { NextResponse } from "next/server";
import { CierreAdminService } from "@/src/app/services/cierreAdmin.service";
import { UsuarioService } from "@/src/app/services/usuario.service";
import { db } from "@/src/lib/db";
import {
  BitacoraService,
  contextoDesdeRequest,
} from "@/src/app/services/bitacora.service";

/** Verifica la contraseña de administrador. Ver /api/cierre-admin para el porqué. */
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

async function adminActivo() {
  return await db.usuario.findFirst({
    where: { rol: { nombre: "Admin" }, estado: true },
    select: { id: true },
    orderBy: { id: "asc" },
  });
}

function mensaje(error: unknown, porDefecto: string) {
  return error instanceof Error ? error.message : porDefecto;
}

/**
 * POST /api/cierre-admin/gastos
 *
 * Registra una factura pagada en efectivo (luz, agua, etc). El total esperado
 * del cierre se recalcula solo: `totalCajas - totalGastos`.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tipo, numeroComprobante, monto, passwordAdmin } = body;

    const autorizacion = await autorizar(passwordAdmin);
    if (autorizacion instanceof NextResponse) return autorizacion;

    if (typeof tipo !== "string" || tipo.trim().length === 0) {
      return NextResponse.json(
        { error: "Escribe el tipo de factura (luz, agua, etc)." },
        { status: 400 },
      );
    }

    const importe = Number(monto);
    if (!Number.isFinite(importe) || importe <= 0) {
      return NextResponse.json(
        { error: "El monto de la factura debe ser mayor que cero." },
        { status: 400 },
      );
    }

    const admin = await adminActivo();
    if (!admin) {
      return NextResponse.json(
        { error: "No hay un administrador activo para asignar el cierre." },
        { status: 409 },
      );
    }

    const gasto = await CierreAdminService.agregarGasto(admin.id, {
      tipo,
      numeroComprobante,
      monto: importe,
    });

    await BitacoraService.registrar({
      accion: "AGREGO_GASTO",
      entidad: "Gasto",
      entidadId: gasto.id,
      descripcion: `${autorizacion.admin.nombre} registró una factura de ${tipo} por ${importe}`,
      usuario: {
        id: autorizacion.admin.id,
        rol: "Admin",
        nombre: autorizacion.admin.nombre,
      },
      datos: {
        tipo: gasto.tipo,
        numeroComprobante: gasto.numeroComprobante,
        monto: Number(gasto.monto),
      },
      ...contextoDesdeRequest(request, "/api/cierre-admin/gastos"),
    });

    return NextResponse.json({
      mensaje: "Factura agregada",
      gasto: {
        id: gasto.id,
        tipo: gasto.tipo,
        numeroComprobante: gasto.numeroComprobante,
        monto: Number(gasto.monto),
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: mensaje(error, "Error al registrar la factura") },
      { status: 500 },
    );
  }
}
