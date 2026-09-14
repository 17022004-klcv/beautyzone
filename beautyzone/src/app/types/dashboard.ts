export interface ServicioPopular {
  servicio: string;
  cantidad: number;
}

export interface ProductoMasVendido {
  id: number;
  nombre: string;
  ventas: number;
  precio: number;
}

export interface DashboardStats {
  citasDia: number;
  citasSemana: number;
  totalClientes: number;
  serviciosCompletados: number;
  serviciosPopulares: ServicioPopular[];
  productosMasVendidos: ProductoMasVendido[];
}
