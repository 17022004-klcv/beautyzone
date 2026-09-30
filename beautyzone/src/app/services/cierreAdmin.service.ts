import { Prisma } from "@prisma/client";
import { db } from "@/src/lib/db";
import {
  calcularTotales,
  hoyComoDateISO,
  redondear2,
} from "@/src/lib/cajaTotales";
import {
  calcularTotalEfectivo,
  normalizarConteo,
} from "@/src/lib/cajaDenominaciones";
import type { ConteoDenominaciones } from "@/src/app/types/arqueo";
import type { ResumenCierreAdmin } from "@/src/app/types/cierreAdmin";

const Decimal = Prisma.Decimal;

/** Rango [inicio, fin) del día local, para filtrar por `fechaCierre`. */
function rangoHoy(hoy: string) {
  return {
    gte: new Date(`${hoy}T00:00:00`),
    lt: new Date(`${hoy}T23:59:59.999`),
  };
}

/** Turns cerrados de hoy con su efectivo esperado, en orden de cierre. */
async function cajasCerradasDeHoy(hoy: string) {
  return await db.cajaTurno.findMany({
    where: { estado: "CERRADA", fechaCierre: rangoHoy(hoy) },
    include: {
      cajero: { select: { nombre: true, apellido: true } },
      ventas: {
        where: { estado: "PAGADO" },
        select: { total: true, metodoPago: true },
      },
      arqueoDenominacion: true,
    },
    orderBy: { fechaCierre: "asc" },
  });
}

export const CierreAdminService = {
  /**
   * Estado del cierre del día: las cajas cerradas de hoy, sus gastos y el
   * guardado si existe. Todo se recalcula desde la base; el cliente nunca
   * manda totales.
   */
  async obtenerResumen(): Promise<ResumenCierreAdmin> {
    const hoy = hoyComoDateISO();

    const [turnos, cierre, admin] = await Promise.all([
      cajasCerradasDeHoy(hoy),
      db.cierreAdministrativo.findUnique({
        where: { fecha: new Date(`${hoy}T00:00:00`) },
        include: { gastos: true, denominaciones: true },
      }),
      db.usuario.findFirst({
        where: { rol: { nombre: "Admin" } },
        select: { id: true },
        orderBy: { id: "asc" },
      }),
    ]);

    const cajas = turnos.map((turno) => {
      const totales = calcularTotales(
        Number(turno.montoApertura),
        turno.ventas,
      );
      const arq = turno.arqueoDenominacion;
      const totalContado = arq ? Number(arq.totalEfectivoContado) : 0;
      const conteoRealizado =
        arq !== null &&
        (totalContado > 0 ||
          Number(turno.montoCierreReal ?? 0) !== totales.montoEsperado);

      return {
        id: turno.id,
        nombreCaja: turno.nombreCaja,
        cajero: `${turno.cajero.nombre} ${turno.cajero.apellido}`.trim(),
        fechaCierre: turno.fechaCierre?.toISOString() ?? null,
        totales,
        estadoConteo: conteoRealizado ? ("REALIZADO" as const) : ("PENDIENTE" as const),
        diferencia: conteoRealizado ? Number(turno.diferencia ?? 0) : 0,
      };
    });

    // Cajas aún abiertas hoy: el total no está completo hasta que cierren.
    const abiertas = await db.cajaTurno.findMany({
      where: { estado: "ABIERTA", fechaApertura: rangoHoy(hoy) },
      include: { cajero: { select: { nombre: true, apellido: true } } },
    });

    // Solo el efectivo facturado por las cajas: el fondo de apertura no
    // cuenta como dinero que la administradora haya producido.
    const totalCajas = redondear2(
      cajas.reduce((acc, c) => acc + c.totales.ventasEfectivo, 0),
    );

    const gastos = (cierre?.gastos ?? [])
      .map((g) => ({
        id: g.id,
        tipo: g.tipo,
        numeroComprobante: g.numeroComprobante,
        monto: Number(g.monto),
      }))
      .sort((a, b) => b.id - a.id);

    const totalGastos = redondear2(gastos.reduce((acc, g) => acc + g.monto, 0));

    return {
      fecha: hoy,
      cajas,
      cajasAbiertas: abiertas.map((t) => ({
        id: t.id,
        nombreCaja: t.nombreCaja,
        cajero: `${t.cajero.nombre} ${t.cajero.apellido}`.trim(),
      })),
      totalCajas,
      gastos,
      totalGastos,
      totalEsperado: redondear2(totalCajas - totalGastos),
      cierre: cierre
        ? {
            id: cierre.id,
            montoReal:
              cierre.montoReal === null ? null : Number(cierre.montoReal),
            diferencia:
              cierre.diferencia === null ? null : Number(cierre.diferencia),
            estado:
              cierre.estado === "REALIZADO"
                ? ("REALIZADO" as const)
                : ("PENDIENTE" as const),
            conteo: normalizarConteo(
              cierre.denominaciones,
            ) as ConteoDenominaciones,
            totalContado: cierre.denominaciones
              ? Number(cierre.denominaciones.totalContado)
              : 0,
          }
        : null,
      adminDisponible: admin !== null,
    };
  },

  /** Devuelve el id del cierre del día, creándolo en PENDIENTE si no existe. */
  async asegurarCierreDelDia(idadmin: number): Promise<number> {
    const hoy = new Date(`${hoyComoDateISO()}T00:00:00`);

    const existente = await db.cierreAdministrativo.findUnique({
      where: { fecha: hoy },
      select: { id: true },
    });
    if (existente) return existente.id;

    const nuevo = await db.cierreAdministrativo.create({
      data: { idadmin, fecha: hoy, estado: "PENDIENTE" },
      select: { id: true },
    });
    return nuevo.id;
  },

  /** Recalcula totalCajas / totalGastos / totalEsperado del cierre. */
  async recalcular(id: number) {
    const hoy = hoyComoDateISO();
    const turnos = await cajasCerradasDeHoy(hoy);

    const totalCajas = redondear2(
      turnos.reduce(
        (acc, t) =>
          acc + calcularTotales(Number(t.montoApertura), t.ventas).ventasEfectivo,
        0,
      ),
    );

    const gastos = await db.gastoCierre.aggregate({
      where: { idcierreAdmin: id },
      _sum: { monto: true },
    });
    const totalGastos = redondear2(Number(gastos._sum.monto ?? 0));

    return await db.cierreAdministrativo.update({
      where: { id },
      data: {
        totalCajas,
        totalGastos,
        totalEsperado: redondear2(totalCajas - totalGastos),
      },
    });
  },

  async agregarGasto(
    idadmin: number,
    gasto: { tipo: string; numeroComprobante?: string | null; monto: number },
  ) {
    const idCierre = await this.asegurarCierreDelDia(idadmin);

    const creado = await db.gastoCierre.create({
      data: {
        idcierreAdmin: idCierre,
        tipo: gasto.tipo.trim().toUpperCase(),
        numeroComprobante: gasto.numeroComprobante?.trim() || null,
        monto: new Decimal(gasto.monto),
      },
    });

    await this.recalcular(idCierre);
    return creado;
  },

  async eliminarGasto(idGasto: number) {
    const gasto = await db.gastoCierre.findUnique({
      where: { id: idGasto },
      select: { idcierreAdmin: true },
    });
    if (!gasto) throw new Error("El gasto no existe.");

    await db.gastoCierre.delete({ where: { id: idGasto } });
    await this.recalcular(gasto.idcierreAdmin);
  },

  /**
   * Guarda el conteo físico final. El total se recalcula en el servidor desde
   * las denominaciones y se contrasta contra `totalEsperado` (cajas menos
   * gastos), que es lo que la administradora debería tener en mano.
   */
  async guardarConteo(idadmin: number, conteo: ConteoDenominaciones) {
    const idCierre = await this.asegurarCierreDelDia(idadmin);

    // El cierre recién creado nace con totales en cero: hay que recalcular
    // para que `totalEsperado` ya tenga las cajas menos las facturas.
    await this.recalcular(idCierre);

    const normalizado = normalizarConteo(conteo);
    const totalContado = redondear2(calcularTotalEfectivo(conteo));

    return await db.$transaction(async (tx) => {
      await tx.denominacionCierreAdmin.upsert({
        where: { idcierreAdmin: idCierre },
        create: {
          idcierreAdmin: idCierre,
          ...normalizado,
          totalContado: new Decimal(totalContado),
        },
        update: {
          ...normalizado,
          totalContado: new Decimal(totalContado),
        },
      });

      const cierre = await tx.cierreAdministrativo.findUniqueOrThrow({
        where: { id: idCierre },
      });
      const diferencia = redondear2(
        totalContado - Number(cierre.totalEsperado),
      );

      await tx.cierreAdministrativo.update({
        where: { id: idCierre },
        data: {
          montoReal: new Decimal(totalContado),
          diferencia: new Decimal(diferencia),
          estado: "REALIZADO",
        },
      });

      return {
        totalContado,
        totalEsperado: Number(cierre.totalEsperado),
        diferencia,
      };
    });
  },
};
