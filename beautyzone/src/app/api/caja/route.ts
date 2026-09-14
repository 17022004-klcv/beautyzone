import { NextResponse } from "next/server";
import { db } from "@/src/lib/db";

// GET: Obtener la caja activa del cajero
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idcajero = searchParams.get("idcajero");

    if (!idcajero) {
      return NextResponse.json(
        { error: "El ID del cajero es requerido" },
        { status: 400 },
      );
    }

    const cajaActiva = await db.cajaTurno.findFirst({
      where: {},
      include: {
        ventas: {
          where: { estado: "PAGADO" },
          select: {
            total: true,
            metodoPago: true,
          },
        },
      },
    });

    if (!cajaActiva) {
      return NextResponse.json({ caja: null, activa: false });
    }

    // Calcular resumen acumulado actual
    let totalEfectivoVentas = 0;
    let totalTarjetaVentas = 0;
    let totalTransferenciaVentas = 0;

    cajaActiva.ventas.forEach((v) => {
      const total = Number(v.total);
      if (v.metodoPago === "EFECTIVO") totalEfectivoVentas += total;
      if (v.metodoPago === "TARJETA") totalTarjetaVentas += total;
      if (v.metodoPago === "TRANSFERENCIA") totalTransferenciaVentas += total;
    });

    const montoApertura = Number(cajaActiva.montoApertura);
    const montoEsperadoEnCaja = montoApertura + totalEfectivoVentas;

    return NextResponse.json({
      activa: true,
      caja: {
        ...cajaActiva,
        montoApertura,
        resumenVentas: {
          efectivo: totalEfectivoVentas,
          tarjeta: totalTarjetaVentas,
          transferencia: totalTransferenciaVentas,
          totalAcumuladoVentas:
            totalEfectivoVentas + totalTarjetaVentas + totalTransferenciaVentas,
          montoEsperadoEnCaja, // Apertura + Efectivo cobrado
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Abrir un nuevo turno de caja
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idcajero, nombreCaja, passwordPin, montoApertura } = body;

    if (!idcajero || !passwordPin || montoApertura === undefined) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios para abrir caja" },
        { status: 400 },
      );
    }

    if (Number(montoApertura) <= 0) {
      return NextResponse.json(
        { error: "El monto de apertura debe ser mayor a 0" },
        { status: 400 },
      );
    }

    // Verificar si ya hay una caja abierta para este usuario
    const existente = await db.cajaTurno.findFirst({
      where: {
        idcajero: Number(idcajero),
        estado: "ABIERTA",
      },
    });

    if (existente) {
      return NextResponse.json(
        { error: "Ya existe un turno de caja abierto para este usuario" },
        { status: 400 },
      );
    }

    const nuevaCaja = await db.cajaTurno.create({
      data: {
        idcajero: Number(idcajero),
        nombreCaja: nombreCaja || "Caja Principal",
        passwordPin,
        montoApertura: Number(montoApertura),
        estado: "ABIERTA",
      },
    });

    return NextResponse.json(nuevaCaja, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
