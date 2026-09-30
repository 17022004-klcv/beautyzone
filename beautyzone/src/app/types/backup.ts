export const FRECUENCIAS_BACKUP = ["DIARIO", "SEMANAL", "MENSUAL"] as const;
export type FrecuenciaBackup = (typeof FRECUENCIAS_BACKUP)[number];

export const ESTADOS_BACKUP = ["PENDIENTE", "EXITOSO", "ERROR"] as const;
export type EstadoBackup = (typeof ESTADOS_BACKUP)[number];

export const ORIGENES_BACKUP = ["MANUAL", "PROGRAMADO"] as const;
export type OrigenBackup = (typeof ORIGENES_BACKUP)[number];

export const DIAS_SEMANA = [
  { valor: 1, etiqueta: "Lunes" },
  { valor: 2, etiqueta: "Martes" },
  { valor: 3, etiqueta: "Miércoles" },
  { valor: 4, etiqueta: "Jueves" },
  { valor: 5, etiqueta: "Viernes" },
  { valor: 6, etiqueta: "Sábado" },
  { valor: 0, etiqueta: "Domingo" },
];

export interface BackupConfigItem {
  id: number;
  frecuencia: FrecuenciaBackup;
  diaSemana: number;
  diaMes: number;
  hora: number;
  minuto: number;
  activo: boolean;
  ultimoEjecutado: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BackupItem {
  id: number;
  archivo: string;
  tamanoBytes: number;
  estado: EstadoBackup;
  mensaje: string | null;
  origen: OrigenBackup;
  iniciadoEn: string;
  finalizadoEn: string | null;
  creadoEn: string;
}

export interface CrearBackupDTO {
  frecuencia: FrecuenciaBackup;
  diaSemana: number;
  diaMes: number;
  hora: number;
  minuto: number;
  activo: boolean;
}
