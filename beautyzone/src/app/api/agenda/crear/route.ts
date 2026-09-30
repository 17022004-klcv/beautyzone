import { NextResponse } from "next/server";
import { db } from "@/src/lib/db";
import {
  BitacoraService,
  contextoDesdeRequest,
} from "@/src/app/services/bitacora.service";
import { validarFechaHoraCita } from "@/src/lib/validaciones";
import type { DetalleCitaInput } from "@/src/app/types/agenda";

/** Acepta el payload nuevo (`detalles`) y el antiguo (`idservicio`/`idestilista`). */
function normalizarDetalles(body: {
  detalles?: DetalleCitaInput[];
  idservicio?: number | string;
  idestilista?: number | string;
}): DetalleCitaInput[] {
  if (Array.isArray(body.detalles) && body.detalles.length > 0) {
    return body.detalles
      .filter((d) => d && Number(d.idservicio) > 0)
      .map((d) => ({
        idservicio: Number(d.idservicio),
        idestilista: Number(d.idestilista) || Number(d.idservicio),
      }));
  }

  if (body.idservicio) {
    return [
      {
        idservicio: Number(body.idservicio),
        idestilista: Number(body.idestilista) || Number(body.idservicio),
      },
    ];
  }

  return [];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idcliente, fecha, horaInicio, notas } = body;

    if (!idcliente || !fecha || !horaInicio) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 },
      );
    }

    // La misma regla que aplica el formulario, repetida aquí: el cliente puede
    // saltarse la pantalla, y una cita en el pasado o en una hora que ya pasó
    // nunca debería existir en la agenda.
    const errorCita = validarFechaHoraCita(String(fecha), String(horaInicio));
    if (errorCita) {
      return NextResponse.json({ error: errorCita }, { status: 400 });
    }

    const detalles = normalizarDetalles(body);
    if (detalles.length === 0) {
      return NextResponse.json(
        { error: "Selecciona al menos un servicio" },
        { status: 400 },
      );
    }

    // Se resuelve el precio actual de cada servicio en una sola consulta: el
    // `precioHistorico` es una foto del precio al momento de agendar.
    const ids = [...new Set(detalles.map((d) => d.idservicio))];
    const servicios = await db.servicio.findMany({
      where: { id: { in: ids } },
      select: { id: true, nombre: true, precio: true },
    });

    if (servicios.length !== ids.length) {
      return NextResponse.json(
        { error: "Uno de los servicios seleccionados no existe" },
        { status: 404 },
      );
    }

    const precioPorId = new Map(servicios.map((s) => [s.id, s.precio]));

    const cliente = await db.usuario.findFirst({
      where: { id: Number(idcliente), estado: true },
      select: { id: true },
    });
    if (!cliente) {
      return NextResponse.json(
        { error: "El cliente seleccionado no existe" },
        { status: 404 },
      );
    }

    const nuevaCita = await db.cita.create({
      data: {
        idcliente: Number(idcliente),
        fecha: new Date(`${fecha}T00:00:00.000Z`),
        horaInicio,
        estado: "PENDIENTE",
        notas: notas || null,
        detallesCita: {
          create: detalles.map((d) => ({
            idservicio: d.idservicio,
            idestilista: d.idestilista,
            precioHistorico: precioPorId.get(d.idservicio) ?? 0,
          })),
        },
      },
      include: { detallesCita: true },
    });

    await BitacoraService.registrar({
      accion: "AGENDO",
      entidad: "Cita",
      entidadId: nuevaCita.id,
      descripcion: `Agendó una cita para el ${fecha} a las ${horaInicio}`,
      datos: {
        idCliente: nuevaCita.idcliente,
        detalles: nuevaCita.detallesCita.map((d) => ({
          idServicio: d.idservicio,
          idEstilista: d.idestilista,
        })),
        estado: nuevaCita.estado,
        notas: notas || null,
      },
      ...contextoDesdeRequest(request, "/api/agenda/crear"),
    });

    return NextResponse.json(nuevaCita, { status: 201 });
  } catch (error) {
    console.error("Error al crear cita:", error);
    return NextResponse.json(
      { error: "Error interno al agendar cita" },
      { status: 500 },
    );
  }
}
