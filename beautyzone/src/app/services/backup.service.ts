import { existsSync, unlinkSync } from "node:fs";
import path from "node:path";
import { db } from "@/src/lib/db";
import {
  CARPETA_BACKUPS,
  ErrorBackup,
  ejecutarVolcado,
} from "@/src/lib/pgDump";
import {
  FRECUENCIAS_BACKUP,
  type BackupConfigItem,
  type BackupItem,
  type CrearBackupDTO,
  type EstadoBackup,
  type FrecuenciaBackup,
  type OrigenBackup,
} from "@/src/app/types/backup";

/** Solo se conservan los respaldos mas recientes; el resto se borra del disco. */
export const MAXIMO_BACKUPS = 5;

const ID_CONFIG = 1;

function dosDigitos(valor: number): string {
  return String(valor).padStart(2, "0");
}

/** beautyzone_2026-09-30_143012.sql */
function nombreArchivo(fecha: Date): string {
  return (
    [
      "beautyzone",
      fecha.getFullYear(),
      dosDigitos(fecha.getMonth() + 1),
      dosDigitos(fecha.getDate()),
      `${dosDigitos(fecha.getHours())}${dosDigitos(fecha.getMinutes())}${dosDigitos(fecha.getSeconds())}`,
    ].join("_") + ".sql"
  );
}

function comoFecha(valor: Date | string | null | undefined): Date | null {
  if (!valor) return null;
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

/** Elige el dia del mes respetando los meses cortos (1..28 siempre existe). */
function diaMesSeguro(anio: number, mes: number, diaMes: number): number {
  const ultimoDia = new Date(anio, mes + 1, 0).getDate();
  return Math.min(Math.max(diaMes, 1), ultimoDia);
}

export interface ConfigOperativa {
  frecuencia: FrecuenciaBackup;
  diaSemana: number;
  diaMes: number;
  hora: number;
  minuto: number;
  activo: boolean;
  ultimoEjecutado: Date | null;
  /** Momento en que se guardo la programacion; acota los slots validos. */
  creadoEn?: Date | null;
}

/**
 * Devuelve la ultima hora de ejecucion que ya paso segun la programacion, o
 * null si todavia no llego. Es lo que decide si toca respaldar ahora.
 */
export function calcularSlotVencido(
  config: ConfigOperativa,
  ahora: Date = new Date(),
): Date | null {
  const { hora, minuto } = config;

  if (config.frecuencia === "DIARIO") {
    const hoy = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      ahora.getDate(),
      hora,
      minuto,
      0,
      0,
    );

    if (ahora >= hoy) return hoy;

    return new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      ahora.getDate() - 1,
      hora,
      minuto,
      0,
      0,
    );
  }

  if (config.frecuencia === "SEMANAL") {
    const diasAtras = (ahora.getDay() - config.diaSemana + 7) % 7;
    const candidato = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      ahora.getDate() - diasAtras,
      hora,
      minuto,
      0,
      0,
    );

    if (ahora >= candidato) return candidato;

    return new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      ahora.getDate() - diasAtras - 7,
      hora,
      minuto,
      0,
      0,
    );
  }

  const candidatoMes = new Date(
    ahora.getFullYear(),
    ahora.getMonth(),
    diaMesSeguro(ahora.getFullYear(), ahora.getMonth(), config.diaMes),
    hora,
    minuto,
    0,
    0,
  );

  if (ahora >= candidatoMes) return candidatoMes;

  const mesAnterior = ahora.getMonth() - 1;
  return new Date(
    ahora.getFullYear(),
    mesAnterior,
    diaMesSeguro(ahora.getFullYear(), mesAnterior, config.diaMes),
    hora,
    minuto,
    0,
    0,
  );
}

/**
 * Slot vencido que todavia no se ha respaldado, o null si no toca. Un slot
 * anterior a cuando se guardo la programacion no cuenta: evita que el primer
 * arranque dispare un respaldo de "ayer" que el admin nunca pidio.
 */
export function slotARespaldar(
  config: ConfigOperativa,
  ahora: Date = new Date(),
): Date | null {
  if (!config.activo) return null;

  const slot = calcularSlotVencido(config, ahora);
  if (!slot) return null;

  const creado = comoFecha(config.creadoEn);
  if (creado && slot < creado) return null;

  const ultimo = comoFecha(config.ultimoEjecutado);
  return !ultimo || ultimo < slot ? slot : null;
}

/** true cuando la programacion pide un respaldo y aun no se hizo ese slot. */
export function tocaRespaldar(
  config: ConfigOperativa,
  ahora: Date = new Date(),
): boolean {
  return slotARespaldar(config, ahora) !== null;
}

function validarConfig(datos: Partial<CrearBackupDTO>): CrearBackupDTO {
  const frecuencia = String(
    datos.frecuencia ?? "DIARIO",
  ).toUpperCase() as FrecuenciaBackup;

  if (!FRECUENCIAS_BACKUP.includes(frecuencia)) {
    throw new ErrorBackup("La frecuencia indicada no es válida.");
  }

  const entero = (valor: unknown, porDefecto: number) => {
    const n = Number(valor);
    return Number.isInteger(n) ? n : porDefecto;
  };

  const hora = Math.min(Math.max(entero(datos.hora, 2), 0), 23);
  const minuto = Math.min(Math.max(entero(datos.minuto, 0), 0), 59);
  const diaSemana = Math.min(Math.max(entero(datos.diaSemana, 1), 0), 6);
  const diaMes = Math.min(Math.max(entero(datos.diaMes, 1), 1), 28);

  return {
    frecuencia,
    diaSemana,
    diaMes,
    hora,
    minuto,
    activo: datos.activo !== false,
  };
}

export class BackupService {
  /** Un volcado a la vez, sin importar si lo pide un humano o el ciclo. */
  private static enCurso = false;

  static hayRespaldoEnCurso(): boolean {
    return this.enCurso;
  }

  static async obtenerConfig(): Promise<BackupConfigItem> {
    const config =
      (await db.backupConfig.findUnique({ where: { id: ID_CONFIG } })) ??
      (await db.backupConfig.create({ data: { id: ID_CONFIG } }));

    return {
      id: config.id,
      frecuencia: config.frecuencia as FrecuenciaBackup,
      diaSemana: config.diaSemana,
      diaMes: config.diaMes,
      hora: config.hora,
      minuto: config.minuto,
      activo: config.activo,
      ultimoEjecutado: config.ultimoEjecutado?.toISOString() ?? null,
      createdAt: config.createdAt.toISOString(),
      updatedAt: config.updatedAt.toISOString(),
    };
  }

  static async guardarConfig(datos: Partial<CrearBackupDTO>) {
    const limpio = validarConfig(datos);

    const config = await db.backupConfig.upsert({
      where: { id: ID_CONFIG },
      create: { id: ID_CONFIG, ...limpio },
      update: limpio,
    });

    return {
      id: config.id,
      frecuencia: config.frecuencia as FrecuenciaBackup,
      diaSemana: config.diaSemana,
      diaMes: config.diaMes,
      hora: config.hora,
      minuto: config.minuto,
      activo: config.activo,
      ultimoEjecutado: config.ultimoEjecutado?.toISOString() ?? null,
      createdAt: config.createdAt.toISOString(),
      updatedAt: config.updatedAt.toISOString(),
    } satisfies BackupConfigItem;
  }

  static async listar(): Promise<BackupItem[]> {
    const respaldos = await db.backup.findMany({
      orderBy: { creadoEn: "desc" },
    });

    return respaldos.map((b) => ({
      id: b.id,
      archivo: b.archivo,
      tamanoBytes: b.tamanoBytes,
      estado: b.estado as EstadoBackup,
      mensaje: b.mensaje,
      origen: b.origen as OrigenBackup,
      iniciadoEn: b.iniciadoEn.toISOString(),
      finalizadoEn: b.finalizadoEn?.toISOString() ?? null,
      creadoEn: b.creadoEn.toISOString(),
    }));
  }

  static async obtener(id: number) {
    return db.backup.findUnique({ where: { id } });
  }

  /**
   * Crea un respaldo. Registra la fila antes de volcar para que quede traza
   * aunque pg_dump reviente, y despues aplica la retencion.
   */
  static async crear(origen: OrigenBackup = "MANUAL"): Promise<BackupItem> {
    if (this.enCurso) {
      throw new ErrorBackup(
        "Ya hay un respaldo en curso, espera a que termine.",
      );
    }

    this.enCurso = true;

    try {
      return await this.volcar(origen);
    } finally {
      this.enCurso = false;
    }
  }

  private static async volcar(origen: OrigenBackup): Promise<BackupItem> {
    const ahora = new Date();
    const registro = await db.backup.create({
      data: { archivo: nombreArchivo(ahora), ruta: "", origen, estado: "PENDIENTE" },
    });

    const destino = path.join(CARPETA_BACKUPS, registro.archivo);

    try {
      const volcado = await ejecutarVolcado(destino);
      const mensaje = `Volcado generado con pg_dump (${volcado.bytes} bytes)`;

      const actualizado = await db.backup.update({
        where: { id: registro.id },
        data: {
          ruta: volcado.ruta,
          tamanoBytes: volcado.bytes,
          estado: "EXITOSO",
          mensaje,
          finalizadoEn: new Date(),
        },
      });

      if (origen === "PROGRAMADO") {
        const slot = await this.slotPendiente();
        if (slot) {
          await db.backupConfig.update({
            where: { id: ID_CONFIG },
            data: { ultimoEjecutado: slot },
          });
        }
      }

      await this.aplicarRetencion();

      return {
        id: actualizado.id,
        archivo: actualizado.archivo,
        tamanoBytes: actualizado.tamanoBytes,
        estado: actualizado.estado as EstadoBackup,
        mensaje: actualizado.mensaje,
        origen: actualizado.origen as OrigenBackup,
        iniciadoEn: actualizado.iniciadoEn.toISOString(),
        finalizadoEn: actualizado.finalizadoEn?.toISOString() ?? null,
        creadoEn: actualizado.creadoEn.toISOString(),
      };
    } catch (error) {
      const detalle =
        error instanceof Error ? error.message : "Error desconocido";

      await db.backup.update({
        where: { id: registro.id },
        data: {
          ruta: destino,
          estado: "ERROR",
          mensaje: detalle.slice(0, 500),
          finalizadoEn: new Date(),
        },
      });

      throw new ErrorBackup(detalle);
    }
  }

  /** El slot vencido actual, para no repetir el mismo respaldo tras reiniciar. */
  private static async slotPendiente(): Promise<Date | null> {
    const config = await this.obtenerConfig();
    return slotARespaldar({
      frecuencia: config.frecuencia,
      diaSemana: config.diaSemana,
      diaMes: config.diaMes,
      hora: config.hora,
      minuto: config.minuto,
      activo: config.activo,
      ultimoEjecutado: config.ultimoEjecutado
        ? new Date(config.ultimoEjecutado)
        : null,
      creadoEn: new Date(config.createdAt),
    });
  }

  /** Deja solo los MAXIMO_BACKUPS mas recientes y borra del disco el resto. */
  static async aplicarRetencion(): Promise<number> {
    const todos = await db.backup.findMany({
      orderBy: { creadoEn: "desc" },
    });

    if (todos.length <= MAXIMO_BACKUPS) return 0;

    const sobrantes = todos.slice(MAXIMO_BACKUPS);
    let borrados = 0;

    for (const backup of sobrantes) {
      try {
        if (backup.ruta && existsSync(backup.ruta)) {
          unlinkSync(backup.ruta);
        }
        await db.backup.delete({ where: { id: backup.id } });
        borrados++;
      } catch (error) {
        console.error(
          `No se pudo eliminar el respaldo ${backup.archivo}:`,
          error,
        );
      }
    }

    return borrados;
  }

  static async eliminar(id: number): Promise<boolean> {
    const backup = await db.backup.findUnique({ where: { id } });
    if (!backup) return false;

    if (backup.ruta && existsSync(backup.ruta)) {
      unlinkSync(backup.ruta);
    }

    await db.backup.delete({ where: { id } });
    return true;
  }
}
