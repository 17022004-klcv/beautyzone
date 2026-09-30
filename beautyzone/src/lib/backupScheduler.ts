import { BackupService, tocaRespaldar } from "@/src/app/services/backup.service";
import { BitacoraService } from "@/src/app/services/bitacora.service";
import { ErrorBackup } from "@/src/lib/pgDump";

/** Cada cuanto se revisa la programacion. 1 minuto es suficiente para el granularity de la UI. */
const INTERVALO_MS = 60 * 1000;

let temporizador: NodeJS.Timeout | null = null;
let enEjecucion = false;

/** Evita que se pisen un respaldo manual y uno programado al mismo tiempo. */
export function hayBackupEnCurso(): boolean {
  return enEjecucion;
}

/**
 * Revisa la programacion y respalda si toca. Devuelve el respaldo creado o
 * null. Nunca lanza: un fallo queda registrado y el ciclo sigue.
 */
export async function evaluarProgramacion(): Promise<string | null> {
  if (enEjecucion) return null;
  enEjecucion = true;

  try {
    const config = await BackupService.obtenerConfig();

    // Un volcado manual en curso no se interrumpe ni se audita como fallo.
    if (BackupService.hayRespaldoEnCurso()) return null;

    const debe = tocaRespaldar({
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

    if (!debe) return null;

    const respaldo = await BackupService.crear("PROGRAMADO");

    await BitacoraService.registrar({
      accion: "GENERO_BACKUP",
      entidad: "Backup",
      entidadId: respaldo.id,
      descripcion: `Respaldo programado generado: ${respaldo.archivo}`,
      datos: {
        archivo: respaldo.archivo,
        tamanoBytes: respaldo.tamanoBytes,
        origen: respaldo.origen,
      },
    });

    console.log(
      `[backups] Respaldo programado creado: ${respaldo.archivo} (${respaldo.tamanoBytes} bytes)`,
    );

    return respaldo.archivo;
  } catch (error) {
    const mensaje =
      error instanceof Error ? error.message : "Error desconocido";

    console.error("[backups] Fallo el respaldo programado:", mensaje);

    if (error instanceof Error && !(error instanceof ErrorBackup)) {
      console.error(error);
    }

    // Si otro volcado estaba ocupando el hueco, no es un fallo real.
    if (BackupService.hayRespaldoEnCurso()) return null;

    await BitacoraService.registrar({
      accion: "FALLO_BACKUP",
      entidad: "Backup",
      descripcion: `No se pudo generar el respaldo programado: ${mensaje.slice(0, 300)}`,
      resultado: "FALLO",
    }).catch(() => undefined);

    return null;
  } finally {
    enEjecucion = false;
  }
}

/** Arranca el ciclo de respaldo. Lo llama instrumentation.ts al iniciar. */
export function iniciarProgramadorBackups(): void {
  if (temporizador) return;

  const revisar = () => {
    void evaluarProgramacion();
  };

  // Primera revision a los 20s para no competir con el arranque del server.
  setTimeout(revisar, 20 * 1000).unref?.();
  temporizador = setInterval(revisar, INTERVALO_MS);
  temporizador.unref?.();

  console.log(
    "[backups] Programador de respaldos activo (revisa cada 60s).",
  );
}

export function detenerProgramadorBackups(): void {
  if (temporizador) {
    clearInterval(temporizador);
    temporizador = null;
  }
}
