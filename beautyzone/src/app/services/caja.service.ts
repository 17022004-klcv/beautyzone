import {
  AperturaCajaDTO,
  CajaTurno,
  CierreCajaDTO,
  EstadoCaja,
  ResumenCierre,
} from "@/src/app/types/caja";

export class CajaService {
  // Estado de la caja activa. El cajero se deduce del turno abierto, no del
  // cliente: el endpoint no acepta idcajero.
  static async obtenerEstadoCaja(): Promise<EstadoCaja> {
    const res = await fetch("/api/caja", { cache: "no-store" });
    if (!res.ok) {
      throw new Error("Error al verificar la caja activa");
    }
    return res.json();
  }

  static async abrirCaja(data: AperturaCajaDTO): Promise<CajaTurno> {
    const res = await fetch("/api/caja", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Error al abrir la caja");
    }

    const data2 = await res.json();
    return data2.caja;
  }

  static async cerrarCaja(data: CierreCajaDTO): Promise<ResumenCierre> {
    const res = await fetch("/api/caja/cierre", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        err.error || "Error al efectuar el cierre de caja",
      );
    }

    const data2 = await res.json();
    return data2.resumen;
  }
}
