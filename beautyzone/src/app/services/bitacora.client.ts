import type { BitacoraQuery, BitacoraRespuesta } from "@/src/app/types/bitacora";

/**
 * Cliente de solo lectura para la bitácora.
 *
 * La bitácora es append-only: aquí no existe ningún método de escritura ni de
 * borrado, y la API tampoco los expone.
 */
export const BitacoraService = {
  async getBitacora(query: BitacoraQuery = {}): Promise<BitacoraRespuesta> {
    const params = new URLSearchParams();

    if (query.page) params.set("page", String(query.page));
    if (query.pageSize) params.set("pageSize", String(query.pageSize));
    if (query.idUsuario) params.set("idUsuario", query.idUsuario);
    if (query.accion) params.set("accion", query.accion);
    if (query.entidad) params.set("entidad", query.entidad);
    if (query.resultado) params.set("resultado", query.resultado);
    if (query.desde) params.set("desde", query.desde);
    if (query.hasta) params.set("hasta", query.hasta);
    if (query.busqueda) params.set("busqueda", query.busqueda);

    const res = await fetch(`/api/bitacora?${params.toString()}`);

    if (!res.ok) {
      const detalle = await res.json().catch(() => null);
      throw new Error(detalle?.error || "No se pudo cargar la bitácora");
    }

    return res.json();
  },
};
