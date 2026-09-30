import { db } from "@/src/lib/db";
import { redondear2 } from "@/src/lib/cajaTotales";
import type { CitaAgenda, CitaDetalle, DetalleCita } from "@/src/app/types/agenda";

/**
 * `cita.fecha` es `@db.Date`: en Postgres es una fecha sin hora, pero Prisma la
 * maneja con `Date`. Comparar contra la medianoche *local* desplaza el día
 * cuando el servidor no está en UTC, así que el rango se arma en UTC a
 * partir del `YYYY-MM-DD` recibido.
 */
function rangoDelDia(fechaISO: string) {
  const inicio = new Date(`${fechaISO}T00:00:00.000Z`);
  const fin = new Date(inicio);
  fin.setUTCDate(fin.getUTCDate() + 1);
  return { gte: inicio, lt: fin };
}

const INCLUYE_CITA = {
  cliente: { select: { id: true, nombre: true, apellido: true } },
  detallesCita: {
    include: {
      servicio: { select: { nombre: true } },
      estilista: { select: { nombre: true, apellido: true } },
    },
  },
} as const;

function nombreCompleto(usuario: { nombre: string; apellido: string }) {
  return `${usuario.nombre} ${usuario.apellido}`.trim();
}

/**
 * `YYYY-MM-DD` de una columna `@db.Date`. Prisma la devuelve como medianoche
 * UTC, así que hay que leerla con `getUTC*()`: usar los accesores locales
 * retrasaría un día en zonas con desplazamiento negativo.
 */
function fechaDateAIString(fecha: Date): string {
  const y = fecha.getUTCFullYear();
  const m = String(fecha.getUTCMonth() + 1).padStart(2, "0");
  const d = String(fecha.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function getCitasPorFecha(
  fechaStr: string,
): Promise<CitaAgenda[]> {
  try {
    const citasDb = await db.cita.findMany({
      where: { fecha: rangoDelDia(fechaStr) },
      include: INCLUYE_CITA,
      orderBy: { horaInicio: "asc" },
    });

    return citasDb.map((cita) => {
      const servicios = cita.detallesCita
        .map((d) => d.servicio?.nombre)
        .filter(Boolean)
        .join(", ");

      const total = cita.detallesCita.reduce(
        (acc, d) => acc + Number(d.precioHistorico),
        0,
      );

      return {
        id: cita.id,
        cliente: cita.cliente ? nombreCompleto(cita.cliente) : "Cliente General",
        servicio: servicios || "Servicio General",
        hora: cita.horaInicio,
        estado: cita.estado,
        notas: cita.notas,
        total: redondear2(total),
      };
    });
  } catch (error) {
    console.error("Error al obtener citas de la agenda:", error);
    return [];
  }
}

export async function getCitaPorId(id: number): Promise<CitaDetalle | null> {
  const cita = await db.cita.findUnique({
    where: { id },
    include: INCLUYE_CITA,
  });

  if (!cita) return null;

  const detalles: DetalleCita[] = cita.detallesCita.map((d) => ({
    id: d.id,
    idservicio: d.idservicio,
    idestilista: d.idestilista,
    servicio: d.servicio?.nombre ?? "Servicio eliminado",
    estilista: d.estilista ? nombreCompleto(d.estilista) : "Sin asignar",
    precioHistorico: Number(d.precioHistorico),
  }));

  return {
    id: cita.id,
    cliente: cita.cliente ? nombreCompleto(cita.cliente) : "Cliente General",
    clienteId: cita.idcliente,
    fecha: fechaDateAIString(cita.fecha),
    hora: cita.horaInicio,
    estado: cita.estado,
    notas: cita.notas,
    detalles,
    total: redondear2(
      detalles.reduce((acc, d) => acc + d.precioHistorico, 0),
    ),
  };
}
