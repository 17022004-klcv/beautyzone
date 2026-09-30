export interface CajaTurno {
  id: number;
  idcajero: number;
  nombreCaja: string;
  montoApertura: number;
  montoCierreEsperado?: number | null;
  montoCierreReal?: number | null;
  diferencia?: number | null;
  estado: "ABIERTA" | "CERRADA";
  fechaApertura: string;
  fechaCierre?: string | null;
  cajero?: {
    id: number;
    nombre: string;
    apellido: string;
  };
}

export interface ResumenVentas {
  efectivo: number;
  tarjeta: number;
  transferencia: number;
  totalAcumuladoVentas: number;
  montoEsperadoEnCaja: number;
}

export interface CajaActiva extends CajaTurno {
  cajero: { id: number; nombre: string; apellido: string };
  resumenVentas: ResumenVentas;
}

export interface EstadoCaja {
  activa: boolean;
  caja: CajaActiva | null;
}

export interface AperturaCajaDTO {
  nombreCaja: string;
  passwordPin: string;
  montoApertura: number;
}

/**
 * El POS cierra el turno solo con el PIN. El conteo de billetes y monedas se
 * completa después en /arqueo, así que no viaja nada de eso en el cierre.
 */
export interface CierreCajaDTO {
  idcajaTurno: number;
  passwordPin: string;
}

export interface ResumenCierre {
  montoApertura: number;
  ventasEfectivo: number;
  ventasTarjeta: number;
  ventasTransferencia: number;
  totalVendido: number;
  montoEsperado: number;
  totalTarjeta: number;
  totalTransferencia: number;
  /** El conteo físico sigue pendiente hasta pasar por /arqueo. */
  estadoConteo: "PENDIENTE" | "REALIZADO";
}
