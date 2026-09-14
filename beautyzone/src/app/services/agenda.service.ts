import { db } from "@/src/lib/db";
import { CitaAgenda } from "@/src/app/types/agenda";

export async function getCitasPorFecha(
  fechaStr: string,
): Promise<CitaAgenda[]> {
  try {
    const fecha = new Date(fechaStr);
    fecha.setHours(0, 0, 0, 0);

    const citasDb = await db.cita.findMany({
      where: {
        fecha: fecha,
      },
      include: {
        cliente: {
          select: { nombre: true, apellido: true },
        },
        detallesCita: {
          include: {
            servicio: { select: { nombre: true } },
          },
        },
      },
      orderBy: { horaInicio: "asc" },
    });

    return citasDb.map((cita) => {
      const nombreCliente = cita.cliente
        ? `${cita.cliente.nombre} ${cita.cliente.apellido}`
        : "Cliente General";

      const servicios = cita.detallesCita
        .map((d) => d.servicio?.nombre)
        .filter(Boolean)
        .join(", ");

      return {
        id: cita.id,
        cliente: nombreCliente,
        servicio: servicios || "Servicio General",
        hora: cita.horaInicio,
        estado: cita.estado,
      };
    });
  } catch (error) {
    console.error("Error al obtener citas de la agenda:", error);
    return [];
  }
}
