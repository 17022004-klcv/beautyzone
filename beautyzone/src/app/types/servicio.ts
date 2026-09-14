export interface ServicioItem {
  id: number;
  idcategoria: number;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  porcentajeComision: number;
  imagen?: string | null;
  estado: boolean;
  categoria?: {
    id: number;
    nombre: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateServicioDTO {
  idcategoria: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  porcentajeComision?: number;
  imagen?: string;
}

export interface UpdateServicioDTO extends Partial<CreateServicioDTO> {
  estado?: boolean;
}
