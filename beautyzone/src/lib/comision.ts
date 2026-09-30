import { ServicioItem } from "@/src/app/types/servicio";

/**
 * `servicios.porcentaje_comision` guarda un porcentaje o un monto fijo según
 * `tipo_comision`. Estos helpers son el único lugar donde se decide cómo se
 * presenta ese número, para que la tarjeta, la ficha y los reportes no se
 * contradigan.
 */

export const COMISION_PORCENTAJE = "PORCENTAJE";
export const COMISION_MONTO = "MONTO";

/** Normaliza el valor que llega de la base (puede venir null o ser inválido). */
export function esComisionMonto(tipo?: string | null): boolean {
  return String(tipo ?? "").toUpperCase() === COMISION_MONTO;
}

/** El valor real de la comisión: `Decimal` llega como string por el JSON. */
export function valorComision(servicio: {
  porcentajeComision?: number | string | null;
}): number {
  const valor = Number(servicio.porcentajeComision ?? 0);
  return Number.isFinite(valor) ? valor : 0;
}

/** "15%" o "$15.00", según el modo del servicio. */
export function formatoComision(
  valor: number | string | null | undefined,
  tipo?: string | null,
): string {
  const numero = Number(valor ?? 0);
  const seguro = Number.isFinite(numero) ? numero : 0;

  return esComisionMonto(tipo)
    ? `$$${seguro.toFixed(2)}`
    : `${seguro.toFixed(2)}%`;
}

/** Comisión estimada sobre el precio del servicio, siempre en dinero. */
export function comisionEnDinero(servicio: ServicioItem): number {
  const valor = valorComision(servicio);

  if (esComisionMonto(servicio.tipoComision)) return valor;

  const precio = Number(servicio.precio ?? 0);
  return Number.isFinite(precio) ? (precio * valor) / 100 : 0;
}
