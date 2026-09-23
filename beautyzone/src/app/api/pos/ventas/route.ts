import { NextResponse } from "next/server";
import { db } from "@/src/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      cajaTurnoId,
      idempleadoCaja,
      clienteId,
      citaId,
      metodoPago,
      montoTotal,
      items,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "La orden no tiene ítems para cobrar." },
        { status: 400 },
      );
    }

    const resultado = await db.$transaction(async (tx) => {
      // 1. Crear el registro principal de la Venta
      const venta = await tx.venta.create({
        data: {
          idcajaTurno: cajaTurnoId ? Number(cajaTurnoId) : null,
          idempleadoCaja: Number(idempleadoCaja || 1),
          idcliente: clienteId ? Number(clienteId) : null,
          idcita: citaId ? Number(citaId) : null,
          total: Number(montoTotal),
          metodoPago: metodoPago,
          estado: "PAGADO",
        },
      });

      // 2. Insertar detalles de venta, comisiones e inventario
      for (const item of items) {
        const esServicio = item.tipo === "SERVICIO";

        const detalle = await tx.detalleVenta.create({
          data: {
            idventa: venta.id,
            idservicio: esServicio ? Number(item.itemId) : null,
            idproducto: !esServicio ? Number(item.itemId) : null,
            idestilista: item.estilistaId ? Number(item.estilistaId) : null,
            cantidad: Number(item.cantidad),
            precioUnitario: Number(item.precioUnitario),
            subtotal: Number(item.subtotal),
          },
        });

        if (esServicio && item.estilistaId) {
          const servicioDb = await tx.servicio.findUnique({
            where: { id: Number(item.itemId) },
            select: { porcentajeComision: true },
          });

          const pct = Number(servicioDb?.porcentajeComision || 0);
          if (pct > 0) {
            const montoComision = (Number(item.subtotal) * pct) / 100;
            await tx.comision.create({
              data: {
                idestilista: Number(item.estilistaId),
                iddetalleVenta: detalle.id,
                montoComision: montoComision,
                estado: "PENDIENTE",
              },
            });
          }
        }

        if (!esServicio) {
          await tx.producto.update({
            where: { id: Number(item.itemId) },
            data: { stock: { decrement: Number(item.cantidad) } },
          });
        }
      }

      if (citaId) {
        await tx.cita.update({
          where: { id: Number(citaId) },
          data: { estado: "FINALIZADA" },
        });
      }

      return venta;
    });

    return NextResponse.json(
      { success: true, ventaId: resultado.id },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("❌ Error procesando venta:", error);
    return NextResponse.json(
      { error: "Error al procesar la venta", detalles: error?.message },
      { status: 500 },
    );
  }
}
