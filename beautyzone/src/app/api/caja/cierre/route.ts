import { NextResponse } from "next/server";
import { db } from "@/src/lib/db";
import {
  BitacoraService,
  contextoDesdeRequest,
} from "@/src/app/services/bitacora.service";

type VentaResumen = { total: unknown; metodoPago: string };

function calcularTotales(montoApertura: number, ventas: VentaResumen[]) {
  let efectivo = 0;
  let tarjeta = 0;
  let transferencia = 0;

  for (const venta of ventas) {
    const total = Number(venta.total);
    if (venta.metodoPago === "EFECTIVO") efectivo += total;
    else if (venta.metodoPago === "TARJETA") tarjeta += total;
    else if (venta.metodoPago === "TRANSFERENCIA") transferencia += total;
  }

  return {
    ventasEfectivo: efectivo,
    ventasTarjeta: tarjeta,
    ventasTransferencia: transferencia,
    totalVendido: efectivo + tarjeta + transferencia,
  };
}

// POST: cierra el turno de caja pidiendo solo el PIN.
// El conteo de billetes y monedas NO se hace aquí: eso vive en /arqueo.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idcajaTurno, passwordPin } = body;

    if (!idcajaTurno || !passwordPin) {
      return NextResponse.json(
        { error: "Faltan datos requeridos para efectuar el cierre" },
        { status: 400 },
      );
    }

    // 1. Obtener la caja con sus ventas pagadas
    const caja = await db.cajaTurno.findUnique({
      where: { id: Number(idcajaTurno) },
      include: {
        ventas: { where: { estado: "PAGADO" } },
      },
    });

    if (!caja || caja.estado !== "ABIERTA") {
      return NextResponse.json(
        { error: "La caja no existe o ya fue cerrada previamente" },
        { status: 400 },
      );
    }

    // 2. Validar contraseña / PIN de caja
    if (caja.passwordPin !== String(passwordPin).trim()) {
      return NextResponse.json(
        { error: "La contraseña o PIN de caja es incorrecto" },
        { status: 401 },
      );
    }

    // 3. Totales reales por método de pago del turno
    const montoApertura = Number(caja.montoApertura);
    const { ventasEfectivo, ventasTarjeta, ventasTransferencia, totalVendido } =
      calcularTotales(montoApertura, caja.ventas);
    const montoEsperado = Number((montoApertura + ventasEfectivo).toFixed(2));

    // 4. Cerrar el turno. montoCierreReal queda provisional: el conteo real
    //    de efectivo lo confirma después el arqueo en /arqueo.
    const cajaCerrada = await db.$transaction(async (tx) => {
      const cerrada = await tx.cajaTurno.update({
        where: { id: caja.id },
        data: {
          montoCierreEsperado: montoEsperado,
          montoCierreReal: montoEsperado,
          diferencia: 0,
          estado: "CERRADA",
          fechaCierre: new Date(),
        },
      });

      // Se crea la fila en cero para que /arqueo tenga dónde cargar el conteo.
      await tx.arqueoDenominacion.upsert({
        where: { idcajaTurno: caja.id },
        create: {
          idcajaTurno: caja.id,
          totalTarjeta: ventasTarjeta,
          totalTransferencia: ventasTransferencia,
          totalEfectivoContado: 0,
        },
        update: {},
      });

      return cerrada;
    });

    await BitacoraService.registrar({
      accion: "CERRO_CAJA",
      entidad: "CajaTurno",
      entidadId: caja.id,
      descripcion: `Cerró el turno de caja ${caja.nombreCaja} (esperado ${montoEsperado}, pendiente de arqueo)`,
      datos: {
        montoApertura,
        ventasEfectivo,
        ventasTarjeta,
        ventasTransferencia,
        totalVendido,
        montoEsperado,
      },
      ...contextoDesdeRequest(request, "/api/caja/cierre"),
    });

    return NextResponse.json({
      mensaje: "Turno cerrado exitosamente",
      cierre: cajaCerrada,
      resumen: {
        montoApertura,
        ventasEfectivo,
        ventasTarjeta,
        ventasTransferencia,
        totalVendido,
        montoEsperado,
        totalTarjeta: ventasTarjeta,
        totalTransferencia: ventasTransferencia,
        // Pendiente hasta que se haga el conteo físico en /arqueo.
        estadoConteo: "PENDIENTE",
      },
    });
  } catch (error: any) {
    console.error("Error en POST /api/caja/cierre:", error);
    return NextResponse.json(
      { error: error?.message || "Error al cerrar el turno de caja" },
      { status: 500 },
    );
  }
}
