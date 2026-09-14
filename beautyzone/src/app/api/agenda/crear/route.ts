import { NextResponse } from "next/server";
import { db } from "@/src/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idcliente, fecha, horaInicio, idservicio, idestilista, notas } =
      body;

    if (!idcliente || !fecha || !horaInicio || !idservicio) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 },
      );
    }

    // Obtener precio actual del servicio
    const servicio = await db.servicio.findUnique({
      where: { id: Number(idservicio) },
      select: { precio: true },
    });

    if (!servicio) {
      return NextResponse.json(
        { error: "El servicio seleccionado no existe" },
        { status: 404 },
      );
    }

    // Crear la cita y su detalle correspondiente en una transacción
    const nuevaCita = await db.cita.create({
      data: {
        idcliente: Number(idcliente),
        fecha: new Date(fecha),
        horaInicio,
        estado: "PENDIENTE",
        notas: notas || null,
        detallesCita: {
          create: {
            idservicio: Number(idservicio),
            idestilista: Number(idestilista || idcliente), // Usar estilista enviado o fallback
            precioHistorico: servicio.precio,
          },
        },
      },
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
