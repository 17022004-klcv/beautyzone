import { NextResponse } from "next/server";
import { db } from "@/src/lib/db";

// GET: Obtener la caja activa del sistema
export async function GET() {
  try {
    const cajaActiva = await db.cajaTurno.findFirst({
      where: { estado: "ABIERTA" },
      include: {
        cajero: {
          select: { id: true, nombre: true, apellido: true },
        },
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
          montoEsperadoEnCaja,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Abrir un nuevo turno de caja autenticando mediante PIN
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { passwordPin, montoApertura, nombreCaja } = body;

    if (!passwordPin || montoApertura === undefined) {
      return NextResponse.json(
        { error: "El PIN de seguridad y el monto de apertura son requeridos" },
        { status: 400 },
      );
    }

    const montoNum = Number(montoApertura);
    if (isNaN(montoNum) || montoNum <= 0) {
      return NextResponse.json(
        { error: "El monto de apertura debe ser mayor a 0" },
        { status: 400 },
      );
    }

    // 1. Buscar al cajero/recepcionista por su PIN único en la base de datos
    const usuario = await db.usuario.findFirst({
      where: {
        pinCaja: String(passwordPin).trim(),
        estado: true,
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "PIN de seguridad incorrecto o usuario inactivo" },
        { status: 401 },
      );
    }

    // 2. Verificar si ya existe una caja ABIERTA actualmente en el negocio
    const existente = await db.cajaTurno.findFirst({
      where: { estado: "ABIERTA" },
    });

    if (existente) {
      return NextResponse.json(
        { error: "Ya existe un turno de caja abierto actualmente" },
        { status: 400 },
      );
    }

    // 3. Crear el turno de caja asignado automáticamente al usuario encontrado
    const nuevaCaja = await db.cajaTurno.create({
      data: {
        idcajero: usuario.id,
        nombreCaja: nombreCaja || "Caja Principal",
        passwordPin: String(passwordPin).trim(),
        montoApertura: montoNum,
        estado: "ABIERTA",
      },
      include: {
        cajero: {
          select: { id: true, nombre: true, apellido: true },
        },
      },
    });

    return NextResponse.json(
      {
        message: `Caja abierta correctamente por ${usuario.nombre} ${usuario.apellido}`,
        caja: nuevaCaja,
      },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
