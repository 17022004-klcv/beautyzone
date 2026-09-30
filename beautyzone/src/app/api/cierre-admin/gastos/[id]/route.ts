import { NextResponse } from "next/server";
import { CierreAdminService } from "@/src/app/services/cierreAdmin.service";
import { UsuarioService } from "@/src/app/services/usuario.service";
import { db } from "@/src/lib/db";
import {
  BitacoraService,
  contextoDesdeRequest,
} from "@/src/app/services/bitacora.service";

/**
 * DELETE /api/cierre-admin/gastos/[id]
 *
 * Quita una factura del cierre. La contraseña de administrador va en el cuerpo
 * del request, nunca en la query, para que no quede en logs ni en el historial
 * del navegador.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const gastoId = Number(id);

    if (!Number.isInteger(gastoId) || gastoId <= 0) {
      return NextResponse.json(
        { error: "El gasto indicado no es válido." },
        { status: 400 },
      );
    }

    let passwordAdmin: unknown;
    try {
      ({ passwordAdmin } = await request.json());
    } catch {
      passwordAdmin = undefined;
    }

    const resultado = await UsuarioService.verificarPasswordAdmin(
      typeof passwordAdmin === "string" ? passwordAdmin : "",
    );

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

    // Se recupera la factura antes de borrarla para poder describirla.
    const gasto = await db.gastoCierre.findUnique({
      where: { id: gastoId },
      select: { tipo: true, numeroComprobante: true, monto: true },
    });

    await CierreAdminService.eliminarGasto(gastoId);

    await BitacoraService.registrar({
      accion: "ELIMINO_GASTO",
      entidad: "Gasto",
      entidadId: gastoId,
      descripcion: `${resultado.admin.nombre} eliminó la factura ${gasto?.tipo ?? gastoId}${
        gasto ? ` por ${Number(gasto.monto)}` : ""
      }`,
      usuario: {
        id: resultado.admin.id,
        rol: "Admin",
        nombre: resultado.admin.nombre,
      },
      datos: gasto
        ? {
            tipo: gasto.tipo,
            numeroComprobante: gasto.numeroComprobante,
            monto: Number(gasto.monto),
          }
        : undefined,
      ...contextoDesdeRequest(request, `/api/cierre-admin/gastos/${gastoId}`),
    });

    return NextResponse.json({ mensaje: "Factura eliminada" });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error al eliminar la factura",
      },
      { status: 500 },
    );
  }
}
