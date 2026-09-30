// Fuente única de verdad para el conteo de efectivo. La comparten el POS
// (para calcular el total contado en vivo) y el endpoint de cierre (que
// recalcula el total en el servidor y nunca confía en el del cliente).

export const VALOR_DENOMINACIONES = {
  b100: 100,
  b50: 50,
  b20: 20,
  b10: 10,
  b5: 5,
  b1: 1,
  m100: 1,
  m025: 0.25,
  m010: 0.1,
  m005: 0.05,
  m001: 0.01,
} as const;

export type ClaveDenominacion = keyof typeof VALOR_DENOMINACIONES;

export const ETIQUETA_DENOMINACION: Record<ClaveDenominacion, string> = {
  b100: "$100",
  b50: "$50",
  b20: "$20",
  b10: "$10",
  b5: "$5",
  b1: "$1",
  m100: "$1.00",
  m025: "$0.25",
  m010: "$0.10",
  m005: "$0.05",
  m001: "$0.01",
};

export const CLAVES_DENOMINACION = Object.keys(
  VALOR_DENOMINACIONES,
) as ClaveDenominacion[];

export const BILLETES = CLAVES_DENOMINACION.filter((c) => c.startsWith("b"));
export const MONEDAS = CLAVES_DENOMINACION.filter((c) => c.startsWith("m"));

/** Normaliza un conteo a enteros no negativos (fracciones y negativos se van a 0). */
export function normalizarConteo(
  denominaciones: Partial<Record<ClaveDenominacion, unknown>> | null | undefined,
): Record<ClaveDenominacion, number> {
  const conteo = {} as Record<ClaveDenominacion, number>;
  for (const clave of CLAVES_DENOMINACION) {
    const valor = Number(denominaciones?.[clave] ?? 0);
    conteo[clave] = Number.isFinite(valor) ? Math.max(0, Math.trunc(valor)) : 0;
  }
  return conteo;
}

/** Total de efectivo contado a partir de billetes y monedas. */
export function calcularTotalEfectivo(
  denominaciones: Partial<Record<ClaveDenominacion, unknown>> | null | undefined,
): number {
  const conteo = normalizarConteo(denominaciones);
  return CLAVES_DENOMINACION.reduce(
    (total, clave) => total + conteo[clave] * VALOR_DENOMINACIONES[clave],
    0,
  );
}
