export interface PerfilUsuario {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string | null;
  estado: boolean;
  createdAt?: string;
  rol: {
    id: number;
    nombre: string;
  };
}

export interface ActualizarPerfilDTO {
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string;
  passwordActual?: string;
  nuevaPassword?: string;
}
