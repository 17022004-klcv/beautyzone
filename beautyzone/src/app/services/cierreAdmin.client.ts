import type { ConteoDenominaciones } from "@/src/app/types/arqueo";
import type {
  CrearGastoDTO,
  ResumenCierreAdmin,
} from "@/src/app/types/cierreAdmin";

const BASE = "/api/cierre-admin";

async function pedir<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });

  const texto = await res.text();
  let datos: unknown = null;
  try {
    datos = texto ? JSON.parse(texto) : null;
  } catch {
    datos = null;
  }

  if (!res.ok) {
    const mensaje =
      datos && typeof datos === "object" && "error" in datos
        ? String((datos as { error: unknown }).error)
        : `Error ${res.status} al llamar a ${url}`;
    throw new Error(mensaje);
  }

  return datos as T;
}

export const CierreAdminService = {
  listarResumen(): Promise<ResumenCierreAdmin> {
    return pedir<ResumenCierreAdmin>(BASE);
  },

  /** Guarda el conteo final. Requiere la contraseña de administrador. */
  guardarConteo(
    denominaciones: ConteoDenominaciones,
    passwordAdmin: string,
  ): Promise<{ totalContado: number; totalEsperado: number; diferencia: number }> {
    return pedir(`${BASE}`, {
      method: "POST",
      body: JSON.stringify({ denominaciones, passwordAdmin }),
    });
  },

  /** Registra una factura pagada en efectivo. */
  agregarGasto(
    gasto: CrearGastoDTO,
    passwordAdmin: string,
  ): Promise<{ mensaje: string }> {
    return pedir(`${BASE}/gastos`, {
      method: "POST",
      body: JSON.stringify({ ...gasto, passwordAdmin }),
    });
  },

  eliminarGasto(id: number, passwordAdmin: string): Promise<{ mensaje: string }> {
    return pedir(`${BASE}/gastos/${id}`, {
      method: "DELETE",
      body: JSON.stringify({ passwordAdmin }),
    });
  },
};
