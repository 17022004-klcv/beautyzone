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
    nombre: string;
    apellido: string;
  };
}

export interface AperturaCajaDTO {
  idcajero: number;
  nombreCaja: string;
  passwordPin: string;
  montoApertura: number;
}

export interface DesgloseDenominaciones {
  // Billetes
  b100: number;
  b50: number;
  b20: number;
  b10: number;
  b5: number;
  b1: number;
  // Monedas
  m100: number; // $1.00
  m025: number; // $0.25
  m010: number; // $0.10
  m005: number; // $0.05
  m001: number; // $0.01
  // Otros Métodos
  totalTarjeta: number;
  totalTransferencia: number;
}

export interface CierreCajaDTO {
  idcajaTurno: number;
  montoCierreReal: number; // El valor ingresado en el textfield principal
  passwordPin: string;
  denominaciones: DesgloseDenominaciones;
}
