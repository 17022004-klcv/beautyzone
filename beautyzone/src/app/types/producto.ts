export interface Producto {
  id: number;
  idcategoria: number;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  stock: number;
  stockMinimo?: number | null;
  estado: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  categoria?: {
    id: number;
    nombre: string;
  };
}

export interface CreateProductoDTO {
  idcategoria: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  stockMinimo?: number;
}

export interface Categoria {
  id: number;
  nombre: string;
  tipo: "PRODUCTO" | "SERVICIO";
  estado: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export const TIPOS_CATEGORIA = ["PRODUCTO", "SERVICIO"] as const;

export type TipoCategoria = (typeof TIPOS_CATEGORIA)[number];

export interface CreateCategoriaDTO {
  nombre: string;
  tipo: "PRODUCTO" | "SERVICIO";
}

export interface UpdateProductoDTO {
  idcategoria?: number | string;
  nombre?: string;
  descripcion?: string;
  precio?: number;
  stock?: number | string;
  stockMinimo?: number | string;
  estado?: boolean;
}

export interface UpdateCategoriaDTO {
  nombre?: string;
  tipo?: "PRODUCTO" | "SERVICIO";
  estado?: boolean;
}
