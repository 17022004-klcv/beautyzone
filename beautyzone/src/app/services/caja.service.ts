import { AperturaCajaDTO, CierreCajaDTO } from "@/src/app/types/caja";

export class CajaService {
  // Método para obtener el estado de la caja activa
  static async obtenerEstadoCaja(idcajero: number = 1) {
    const res = await fetch(`/api/caja?idcajero=${idcajero}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Error al verificar caja activa");
    }
    return res.json();
  }

  // Alias para mantener compatibilidad si lo usas en otro lugar
  static async getCajaActiva(idcajero: number = 1) {
    return this.obtenerEstadoCaja(idcajero);
  }

  static async abrirCaja(data: AperturaCajaDTO) {
    const res = await fetch("/api/caja", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Error al abrir la caja");
    }
    return res.json();
  }

  static async cerrarCaja(data: CierreCajaDTO) {
    const res = await fetch("/api/caja/cierre", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Error al efectuar el cierre de caja");
    }
    return res.json();
  }
}
