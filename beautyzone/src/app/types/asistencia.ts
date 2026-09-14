export type TipoRegistro =
  | "ENTRADA"
  | "SALIDA_ALMUERZO"
  | "ENTRADA_ALMUERZO"
  | "SALIDA";

export interface AsistenciaItem {
  id: number;
  idempleado: number;
  fecha: string;
  hora: string;
  tipoRegistro: TipoRegistro;
  createdAt?: string;
  empleado?: {
    id: number;
    nombre: string;
    apellido: string;
    correo?: string;
    rol?: {
      nombre: string;
    };
  };
}

export interface AsistenciaFiltros {
  search?: string;
  tipo?: string;
  fecha?: string;
}

export interface RegistrarAsistenciaDTO {
  idempleado: number;
  tipoRegistro: TipoRegistro;
  fecha?: string;
  hora?: string;
}
