import { NextResponse } from "next/server";
import { db } from "@/src/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idcajaTurno, montoCierreReal, passwordPin, denominaciones } = body;

    if (!idcajaTurno || !passwordPin) {
      return NextResponse.json(
        { error: "Faltan datos requeridos para efectuar el cierre" },
        { status: 400 },
      );
    }

    // 1. Obtener la caja activa
    const caja = await db.cajaTurno.findUnique({
      where: { id: Number(idcajaTurno) },
      include: {
        ventas: {
          where: { estado: "PAGADO" },
        },
      },
    });

    if (!caja || caja.estado !== "ABIERTA") {
      return NextResponse.json(
        { error: "La caja no existe o ya fue cerrada previamente" },
        { status: 400 },
      );
    }

    // 2. Validar contraseña / PIN de caja
    if (caja.passwordPin !== passwordPin) {
      return NextResponse.json(
        { error: "La contraseña o PIN de caja es incorrecto" },
        { status: 401 },
      );
    }

    // 3. Calcular total de ventas registradas
    let ventasEfectivo = 0;
    caja.ventas.forEach((v) => {
      if (v.metodoPago === "EFECTIVO") {
        ventasEfectivo += Number(v.total);
      }
    });

    const montoApertura = Number(caja.montoApertura);
    const montoEsperado = montoApertura + ventasEfectivo;
    const real = Number(montoCierreReal ?? montoEsperado);

    // 4. Cerrar turno
    const cajaCerrada = await db.cajaTurno.update({
      where: { id: Number(idcajaTurno) },
      data: {
        montoCierreEsperado: montoEsperado,
        montoCierreReal: real,
        diferencia: 0,
        estado: "CERRADA",
        fechaCierre: new Date(),
      },
    });

    return NextResponse.json({
      mensaje: "Turno cerrado exitosamente",
      cierre: cajaCerrada,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
