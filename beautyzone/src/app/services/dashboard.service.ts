import { db } from "@/src/lib/db";
import { DashboardStats } from "@/src/app/types/dashboard";

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // 1. Fechas para el filtro (Hoy e inicio de la semana)
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay()); // Domingo/Lunes como inicio

    // 2. Consultas concurrentes
    const [
      citasDiaCount,
      citasSemanaCount,
      totalClientesCount,
      serviciosCompletadosCount,
    ] = await Promise.all([
      // Citas del día de hoy
      db.cita.count({
        where: {
          fecha: { gte: hoy },
        },
      }),
      // Citas de esta semana
      db.cita.count({
        where: {
          fecha: { gte: inicioSemana },
        },
      }),
      // Total usuarios con rol CLIENTE
      db.usuario.count({
        where: {
          rol: {
            nombre: {
              equals: "CLIENTE",
              mode: "insensitive", // Permite coincidir independientemente de mayúsculas/minúsculas
            },
          },
        },
      }),
      // Citas con estado FINALIZADA
      db.cita.count({
        where: {
          estado: "FINALIZADA",
        },
      }),
    ]);

    // 3. Servicios más solicitados (agrupados desde DetalleCita)
    const serviciosAgrupados = await db.detalleCita.groupBy({
      by: ["idservicio"],
      _count: {
        idservicio: true,
      },
      orderBy: {
        _count: {
          idservicio: "desc",
        },
      },
      take: 4,
    });

    // Mapear el nombre del servicio para cada idservicio agrupado
    const serviciosPopulares = await Promise.all(
      serviciosAgrupados.map(async (item) => {
        const servicio = await db.servicio.findUnique({
          where: { id: item.idservicio },
          select: { nombre: true },
        });
        return {
          servicio: servicio?.nombre || "Servicio General",
          cantidad: item._count.idservicio,
        };
      }),
    );

    // 4. Productos más vendidos (agrupados desde DetalleVenta)
    const productosAgrupados = await db.detalleVenta.groupBy({
      by: ["idproducto"],
      _count: {
        idproducto: true,
      },
      _sum: {
        cantidad: true,
      },
      where: {
        idproducto: { not: null }, // Filtrar solo los detalles de productos
      },
      orderBy: {
        _sum: {
          cantidad: "desc",
        },
      },
      take: 4,
    });

    // Mapear detalles e información del producto
    const productosMasVendidos = await Promise.all(
      productosAgrupados.map(async (item) => {
        if (!item.idproducto) return null;

        const producto = await db.producto.findUnique({
          where: { id: item.idproducto },
          select: { id: true, nombre: true, precio: true },
        });

        if (!producto) return null;

        return {
          id: producto.id,
          nombre: producto.nombre,
          ventas: item._sum.cantidad || 0,
          precio: Number(producto.precio),
        };
      }),
    );

    // Filtrar nulos si los hubiera
    const productosValidos = productosMasVendidos.filter(
      (p): p is NonNullable<typeof p> => p !== null,
    );

    return {
      citasDia: citasDiaCount,
      citasSemana: citasSemanaCount,
      totalClientes: totalClientesCount,
      serviciosCompletados: serviciosCompletadosCount,
      serviciosPopulares:
        serviciosPopulares.length > 0
          ? serviciosPopulares
          : [{ servicio: "Sin registros aún", cantidad: 0 }],
      productosMasVendidos: productosValidos,
    };
  } catch (error) {
    console.error("Error al consultar estadísticas del dashboard:", error);
    return {
      citasDia: 0,
      citasSemana: 0,
      totalClientes: 0,
      serviciosCompletados: 0,
      serviciosPopulares: [],
      productosMasVendidos: [],
    };
  }
}
