import {
  AsistenciaItem,
  AsistenciaFiltros,
  RegistrarAsistenciaDTO,
} from "@/src/app/types/asistencia";

export class AsistenciaService {
  // Obtener la lista de asistencias aplicando filtros (Búsqueda, Tipo, Fecha)
  static async getAsistencias(
    filtros: AsistenciaFiltros = {},
  ): Promise<AsistenciaItem[]> {
    const params = new URLSearchParams();

    if (filtros.search) params.append("search", filtros.search);
    if (filtros.tipo) params.append("tipo", filtros.tipo);
    if (filtros.fecha) params.append("fecha", filtros.fecha);

    const res = await fetch(`/api/asistencias?${params.toString()}`);
    if (!res.ok) {
      throw new Error("Error al obtener asistencias");
    }
    return res.json();
  }

  // Registrar un nuevo acceso (Entrada / Salida)
  static async registrarAsistencia(
    dto: RegistrarAsistenciaDTO,
  ): Promise<AsistenciaItem> {
    const res = await fetch("/api/asistencias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Error al registrar la asistencia");
    }

    return res.json();
  }

  // Eliminar un registro de asistencia
  static async eliminarAsistencia(id: number): Promise<void> {
    const res = await fetch(`/api/asistencias/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Error al eliminar la asistencia");
    }
  }
}
