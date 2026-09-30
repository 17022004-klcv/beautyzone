import { NextResponse } from "next/server";
import { db } from "@/src/lib/db";
import {
  BitacoraService,
  contextoDesdeRequest,
} from "@/src/app/services/bitacora.service";

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

    // No se defaultea el cajero: cada venta debe quedar atribuida a alguien.
    const empleadoCajaId = Number(idempleadoCaja);
    if (!empleadoCajaId || Number.isNaN(empleadoCajaId)) {
      return NextResponse.json(
        { error: "No se pudo identificar al cajero de la venta." },
        { status: 400 },
      );
    }

    if (!cajaTurnoId) {
      return NextResponse.json(
        { error: "No hay una caja abierta para registrar la venta." },
        { status: 400 },
      );
    }

    // La venta debe pertenecer a un turno abierto, si no el arqueo no la verá.
    const turno = await db.cajaTurno.findUnique({
      where: { id: Number(cajaTurnoId) },
      select: { id: true, estado: true },
    });

    if (!turno || turno.estado !== "ABIERTA") {
      return NextResponse.json(
        { error: "El turno de caja no está abierto." },
        { status: 400 },
      );
    }

    const resultado = await db.$transaction(async (tx) => {
      // 1. Crear el registro principal de la Venta
      const venta = await tx.venta.create({
        data: {
          idcajaTurno: Number(cajaTurnoId),
          idempleadoCaja: empleadoCajaId,
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

    await BitacoraService.registrar({
      accion: "REGISTRO_VENTA",
      entidad: "Venta",
      entidadId: resultado.id,
      descripcion: `Registró una venta por ${Number(montoTotal)} (${metodoPago}) con ${items.length} ítem(s)`,
      // La venta la hace quien opera el POS, que puede no ser la sesión abierta
      // en el navegador (por ejemplo, una caja abierta por recepción).
      usuario: empleadoCajaId
        ? { id: Number(empleadoCajaId), rol: "CAJERO", nombre: `Empleado ${empleadoCajaId}` }
        : undefined,
      datos: {
        idCajaTurno: Number(cajaTurnoId),
        idCliente: clienteId ? Number(clienteId) : null,
        idCita: citaId ? Number(citaId) : null,
        metodoPago,
        total: Number(montoTotal),
        items: (items as Record<string, unknown>[]).map((i) => ({
          tipo: i.tipo,
          itemId: i.itemId,
          cantidad: i.cantidad,
          precioUnitario: i.precioUnitario,
          subtotal: i.subtotal,
          estilistaId: i.estilistaId ?? null,
        })),
      },
      ...contextoDesdeRequest(req, "/api/pos/ventas"),
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
