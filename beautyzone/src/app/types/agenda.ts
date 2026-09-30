export interface CitaAgenda {
  id: number;
  cliente: string;
  servicio: string;
  hora: string;
  estado: string;
  notas: string | null;
  total: number;
}

/** Estados posibles de `cita.estado` (String en el esquema, sin enum de Prisma). */
export const ESTADOS_CITA = [
  "PENDIENTE",
  "CONFIRMADA",
  "EN_PROCESO",
  "FINALIZADA",
  "CANCELADA",
] as const;

export type EstadoCita = (typeof ESTADOS_CITA)[number];

export interface OpcionAgenda {
  id: number;
  nombre: string;
  apellido?: string;
  precio?: number;
}

export interface OpcionesAgenda {
  clientes: OpcionAgenda[];
  servicios: OpcionAgenda[];
  estilistas: OpcionAgenda[];
}

/** Una línea de servicio dentro de la cita, con su propio estilista. */
export interface DetalleCitaInput {
  idservicio: number;
  idestilista: number;
}

export interface DetalleCita extends DetalleCitaInput {
  id: number;
  servicio: string;
  estilista: string;
  precioHistorico: number;
}

export interface CitaDetalle {
  id: number;
  cliente: string;
  clienteId: number;
  fecha: string;
  hora: string;
  estado: string;
  notas: string | null;
  detalles: DetalleCita[];
  total: number;
}

export interface CrearCitaPayload {
  idcliente: number;
  fecha: string;
  horaInicio: string;
  notas: string;
  detalles: DetalleCitaInput[];
}

export interface ActualizarCitaPayload {
  idcliente?: number;
  fecha?: string;
  horaInicio?: string;
  estado?: string;
  notas?: string;
  detalles?: DetalleCitaInput[];
}
