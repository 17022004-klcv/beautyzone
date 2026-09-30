export type ResultadoBitacora = "EXITO" | "FALLO";

/** Una entrada de la bitácora, tal como la devuelve GET /api/bitacora. */
export interface BitacoraItem {
  id: number;
  idUsuario: number | null;
  usuario: {
    id: number;
    nombre: string;
    correo: string;
  } | null;
  accion: string;
  entidad: string;
  entidadId: string | null;
  descripcion: string;
  datos: unknown;
  metodo: string | null;
  ruta: string | null;
  ip: string | null;
  userAgent: string | null;
  resultado: ResultadoBitacora;
  fecha: string;
}

export interface BitacoraFiltros {
  page: number;
  pageSize: number;
  total: number;
  totalPaginas: number;
}

export interface BitacoraRespuesta extends BitacoraFiltros {
  entradas: BitacoraItem[];
  filtros: {
    acciones: { valor: string; conteo: number }[];
    entidades: { valor: string; conteo: number }[];
    usuarios: { id: number; nombre: string }[];
  };
}

export interface BitacoraQuery {
  page?: number;
  pageSize?: number;
  idUsuario?: string;
  accion?: string;
  entidad?: string;
  resultado?: string;
  desde?: string;
  hasta?: string;
  busqueda?: string;
}
