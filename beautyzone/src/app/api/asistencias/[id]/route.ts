import { NextResponse } from "next/server";
import { db } from "@/src/lib/db";
import {
  BitacoraService,
  contextoDesdeRequest,
} from "@/src/app/services/bitacora.service";

interface Params {
  params: Promise<{ id: string }>;
}

// DELETE: Eliminar un registro de asistencia
export async function DELETE(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const asistenciaId = Number(id);

    if (isNaN(asistenciaId)) {
      return NextResponse.json({ error: "ID invǭlido" }, { status: 400 });
    }

    // Se recupera la asistencia antes de borrarla para poder describirla.
    const asistencia = await db.asistencia.findUnique({
      where: { id: asistenciaId },
      include: {
        empleado: { select: { nombre: true, apellido: true } },
      },
    });

    await db.asistencia.delete({
      where: { id: asistenciaId },
    });

    await BitacoraService.registrar({
      accion: "ELIMINO",
      entidad: "Asistencia",
      entidadId: asistenciaId,
      descripcion: asistencia
        ? `Eliminó el registro ${asistencia.tipoRegistro} de ${asistencia.empleado.nombre} ${asistencia.empleado.apellido}`
        : `Eliminó el registro de asistencia ${asistenciaId}`,
      datos: asistencia
        ? {
            tipoRegistro: asistencia.tipoRegistro,
            fecha: asistencia.fecha.toISOString(),
            hora: asistencia.hora,
          }
        : undefined,
      ...contextoDesdeRequest(req, `/api/asistencias/${asistenciaId}`),
    });

    return NextResponse.json({ message: "Registro de asistencia eliminado" });
  } catch (error) {
    console.error("Error al eliminar asistencia:", error);
    return NextResponse.json(
      { error: "No se pudo eliminar el registro de asistencia" },
      { status: 500 },
    );
  }
}
