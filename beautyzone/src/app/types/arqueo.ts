import type { ClaveDenominacion } from "@/src/lib/cajaDenominaciones";

/** Conteo de una sola denominación tal como se guarda en la BD. */
export type ConteoDenominaciones = Record<ClaveDenominacion, number>;

export type EstadoConteo = "PENDIENTE" | "REALIZADO";

export interface ArqueoTotales {
  montoApertura: number;
  ventasEfectivo: number;
  ventasTarjeta: number;
  ventasTransferencia: number;
  totalVendido: number;
  montoEsperado: number;
}

export interface ArqueoTurno {
  id: number;
  nombreCaja: string;
  cajero: string;
  fechaApertura: string;
  fechaCierre: string | null;
  totales: ArqueoTotales;
  conteo: ConteoDenominaciones;
  totalTarjeta: number;
  totalTransferencia: number;
  totalEfectivoContado: number;
  diferencia: number;
  /** PENDIENTE cuando el turno se cerró en el POS pero aún no se contó. */
  estadoConteo: EstadoConteo;
}

export interface ResumenConteo {
  idcajaTurno: number;
  montoEsperado: number;
  totalEfectivoContado: number;
  totalTarjeta: number;
  totalTransferencia: number;
  diferencia: number;
  estadoConteo: EstadoConteo;
}

export interface RegistrarConteoDTO {
  idcajaTurno: number;
  denominaciones: Partial<ConteoDenominaciones>;
  totalTarjeta?: number;
  totalTransferencia?: number;
}
