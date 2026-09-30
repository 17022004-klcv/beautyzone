/**
 * Punto de entrada del servidor. Next lo ejecuta una vez por proceso al
 * arrancar, asi que desde aqui se enciende el ciclo que revisa la
 * programacion de respaldos.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { iniciarProgramadorBackups } = await import(
    "@/src/lib/backupScheduler"
  );

  iniciarProgramadorBackups();
}
