import { NextResponse } from "next/server";
import { db } from "@/src/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

// DELETE: Eliminar un registro de asistencia
export async function DELETE(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const asistenciaId = Number(id);

    if (isNaN(asistenciaId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    await db.asistencia.delete({
      where: { id: asistenciaId },
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
