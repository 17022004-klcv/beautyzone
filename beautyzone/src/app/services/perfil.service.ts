import { PerfilUsuario, ActualizarPerfilDTO } from "@/src/app/types/perfil";

export class PerfilService {
  static async getPerfil(id: number): Promise<PerfilUsuario> {
    const res = await fetch(`/api/perfil/${id}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Error al obtener perfil");
    }
    return res.json();
  }

  static async updatePerfil(
    id: number,
    data: ActualizarPerfilDTO,
  ): Promise<PerfilUsuario> {
    const res = await fetch(`/api/perfil/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Error al actualizar perfil");
    }

    return res.json();
  }
}
