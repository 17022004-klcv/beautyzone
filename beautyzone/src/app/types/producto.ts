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

export interface CreateCategoriaDTO {
  nombre: string;
  tipo: "PRODUCTO" | "SERVICIO";
}
