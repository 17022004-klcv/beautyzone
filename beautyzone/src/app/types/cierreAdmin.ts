import type { ConteoDenominaciones } from "@/src/app/types/arqueo";
import type { TotalesCaja } from "@/src/lib/cajaTotales";

/** Una caja cerrada que compone el total del cierre del día. */
export interface CajaDelDia {
  id: number;
  nombreCaja: string;
  cajero: string;
  fechaCierre: string | null;
  totales: TotalesCaja;
  estadoConteo: "REALIZADO" | "PENDIENTE";
  diferencia: number;
}

/** Caja que sigue abierta hoy: su efectivo todavía no suma al cierre. */
export interface CajaAbierta {
  id: number;
  nombreCaja: string;
  cajero: string;
}

/** Factura pagada en efectivo (luz, agua, etc). */
export interface GastoCierre {
  id: number;
  tipo: string;
  numeroComprobante: string | null;
  monto: number;
}

export interface CierreAdminGuardado {
  id: number;
  montoReal: number | null;
  diferencia: number | null;
  estado: "PENDIENTE" | "REALIZADO";
  conteo: ConteoDenominaciones;
  totalContado: number;
}

export interface ResumenCierreAdmin {
  /** `YYYY-MM-DD` del día que se está cerrando. */
  fecha: string;
  cajas: CajaDelDia[];
  cajasAbiertas: CajaAbierta[];
  /** Suma del efectivo de todas las cajas cerradas del día. */
  totalCajas: number;
  gastos: GastoCierre[];
  totalGastos: number;
  /** Lo que la administradora debería tener: totalCajas - totalGastos. */
  totalEsperado: number;
  cierre: CierreAdminGuardado | null;
  adminDisponible: boolean;
}

export interface CrearGastoDTO {
  tipo: string;
  numeroComprobante?: string;
  monto: number;
}

export interface GuardarConteoAdminDTO {
  denominaciones: ConteoDenominaciones;
}
