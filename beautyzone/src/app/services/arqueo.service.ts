import type {
  ArqueoTurno,
  ConteoDenominaciones,
  ResumenConteo,
} from "@/src/app/types/arqueo";

export class ArqueoService {
  /** Turnos cerrados con su conteo pendiente o ya realizado. */
  static async listarTurnos(): Promise<ArqueoTurno[]> {
    const res = await fetch("/api/arqueo", { cache: "no-store" });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Error al cargar los arqueos");
    }

    const data = await res.json();
    return data.turnos;
  }

  /**
   * Guarda el conteo físico de un turno y recalcula la diferencia.
   *
   * `passwordAdmin` solo hace falta cuando el arqueo ya estaba archivado: el
   * servidor lo exige para corregirlo y lo revalida aunque el cliente lo omita.
   */
  static async registrarConteo(
    idcajaTurno: number,
    denominaciones: Partial<ConteoDenominaciones>,
    totalTarjeta: number,
    totalTransferencia: number,
    passwordAdmin?: string,
  ): Promise<ResumenConteo> {
    const res = await fetch("/api/arqueo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idcajaTurno,
        denominaciones,
        totalTarjeta,
        totalTransferencia,
        passwordAdmin,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || "Error al guardar el conteo");
    }

    return data.resumen;
  }
}
