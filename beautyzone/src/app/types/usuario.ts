export interface RoleItem {
  id: number;
  nombre: string;
  estado: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface UsuarioItem {
  id: number;
  idrol: number;
  nombre: string;
  apellido: string;
  correo: string;
  password?: string;
  telefono?: string | null;
  estado: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  rol?: RoleItem;
}

export interface CreateUsuarioDTO {
  idrol: number;
  nombre: string;
  apellido: string;
  correo: string;
  password?: string;
  telefono?: string;
  estado?: boolean;
}

export interface UpdateUsuarioDTO {
  idrol?: number;
  nombre?: string;
  apellido?: string;
  correo?: string;
  password?: string;
  telefono?: string;
  estado?: boolean;
}
