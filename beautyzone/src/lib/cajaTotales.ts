// Cálculos compartidos de caja. Los usan el arqueo por turno
// (`/api/arqueo`) y el cierre administrativo (`/api/cierre-admin`), que
// necesita exactamente la misma suma de efectivo por caja.

export type VentaResumen = { total: unknown; metodoPago: string };

export interface TotalesCaja {
  montoApertura: number;
  ventasEfectivo: number;
  ventasTarjeta: number;
  ventasTransferencia: number;
  totalVendido: number;
  /** Efectivo que debería haber en el cajón: apertura + ventas en efectivo. */
  montoEsperado: number;
}

/** Suma de las ventas de un turno por método de pago. */
export function calcularTotales(
  montoApertura: number,
  ventas: VentaResumen[],
): TotalesCaja {
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
    montoApertura,
    ventasEfectivo: efectivo,
    ventasTarjeta: tarjeta,
    ventasTransferencia: transferencia,
    totalVendido: efectivo + tarjeta + transferencia,
    montoEsperado: Number((montoApertura + efectivo).toFixed(2)),
  };
}

/** Redondea a 2 decimales evitando el error de coma flotante de `toFixed`. */
export function redondear2(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

/** Inicio del día local en formato `YYYY-MM-DD`, para comparar con `@db.Date`. */
export function hoyComoDateISO(fecha: Date = new Date()): string {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const d = String(fecha.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** ¿Cayó la fecha dentro del día local de hoy? */
export function esHoy(fecha: Date | string | null | undefined): boolean {
  if (!fecha) return false;
  const f = fecha instanceof Date ? fecha : new Date(fecha);
  if (Number.isNaN(f.getTime())) return false;
  return hoyComoDateISO(f) === hoyComoDateISO();
}
