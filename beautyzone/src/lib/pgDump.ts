import { execFile } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

/** Rutas habituales de PostgreSQL en Windows cuando pg_dump no esta en el PATH. */
const RUTAS_PG_DUMP_WINDOWS = [
  "C:\\Program Files\\PostgreSQL",
  "C:\\Program Files (x86)\\PostgreSQL",
  "C:\\xampp\\pgsql",
];

const RUTAS_PG_DUMP_UNIX = ["/usr/bin/pg_dump", "/usr/local/bin/pg_dump"];

/** Carpeta de respaldos: fuera de /public para que nunca se sirvan como web. */
export const CARPETA_BACKUPS = path.join(process.cwd(), "backups");

export class ErrorBackup extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "ErrorBackup";
  }
}

/** Localiza el binario pg_dump instalado en la maquina. */
export function resolverPgDump(): string {
  if (process.env.PG_DUMP_PATH && existsSync(process.env.PG_DUMP_PATH)) {
    return process.env.PG_DUMP_PATH;
  }

  if (process.platform !== "win32") {
    const encontrada = RUTAS_PG_DUMP_UNIX.find((ruta) => existsSync(ruta));
    if (!encontrada) {
      throw new ErrorBackup(
        "No se encontro pg_dump en el sistema. Instala PostgreSQL o define PG_DUMP_PATH.",
      );
    }
    return encontrada;
  }

  for (const base of RUTAS_PG_DUMP_WINDOWS) {
    if (!existsSync(base)) continue;

    // Busca la version mas reciente instalada (16 > 15 > 14...).
    const versiones = readdirSync(base, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort()
      .reverse();

    for (const version of versiones) {
      const candidato = path.join(base, version, "bin", "pg_dump.exe");
      if (existsSync(candidato)) return candidato;
    }
  }

  throw new ErrorBackup(
    "No se encontro pg_dump. Instala PostgreSQL o define la variable PG_DUMP_PATH.",
  );
}

interface ConexionPostgres {
  host: string;
  puerto: string;
  usuario: string;
  password: string;
  base: string;
}

/** Separa el DATABASE_URL en las piezas que pg_dump entiende. */
export function leerConexion(url?: string): ConexionPostgres {
  const crudita = url ?? process.env.DATABASE_URL;

  if (!crudita) {
    throw new ErrorBackup("No esta configurado DATABASE_URL.");
  }

  let parseada: URL;
  try {
    // new URL() no entiende el prefijo postgresql://, hay que normalizarlo.
    parseada = new URL(crudita.replace(/^postgres(ql)?:\/\//, "http://"));
  } catch {
    throw new ErrorBackup("El DATABASE_URL no tiene un formato valido.");
  }

  const base = decodeURIComponent(parseada.pathname.replace(/^\//, ""));

  if (!base) {
    throw new ErrorBackup("El DATABASE_URL no indica el nombre de la base.");
  }

  return {
    host: parseada.hostname || "localhost",
    puerto: parseada.port || "5432",
    usuario: decodeURIComponent(parseada.username || "postgres"),
    password: decodeURIComponent(parseada.password || ""),
    base,
  };
}

export interface ResultadoVolcado {
  ruta: string;
  archivo: string;
  bytes: number;
}

/**
 * Ejecuta pg_dump y deja el .sql en la carpeta de respaldos. La contraseña
 * viaja por PGPASSWORD en el entorno: nunca aparece en la linea de comandos
 * ni en los mensajes de error.
 */
export async function ejecutarVolcado(
  destino: string,
  url?: string,
): Promise<ResultadoVolcado> {
  const binario = resolverPgDump();
  const conexion = leerConexion(url);

  if (!existsSync(CARPETA_BACKUPS)) {
    mkdirSync(CARPETA_BACKUPS, { recursive: true });
  }

  const argumentos = [
    "--host", conexion.host,
    "--port", conexion.puerto,
    "--username", conexion.usuario,
    "--dbname", conexion.base,
    "--file", destino,
    "--format", "plain",
    "--no-owner",
    "--no-privileges",
    "--clean",
    "--if-exists",
    "--no-password",
  ];

  try {
    await execFileAsync(binario, argumentos, {
      env: { ...process.env, PGPASSWORD: conexion.password },
      maxBuffer: 10 * 1024 * 1024,
      timeout: 10 * 60 * 1000,
      windowsHide: true,
    });
  } catch (error) {
    const salida =
      (error as { stderr?: string; message?: string }).stderr ||
      (error as { message?: string }).message ||
      "error desconocido";

    throw new ErrorBackup(
      `pg_dump fallo: ${salida.replace(conexion.password, "***").trim()}`,
    );
  }

  if (!existsSync(destino)) {
    throw new ErrorBackup("pg_dump no genero el archivo de respaldo.");
  }

  return {
    ruta: destino,
    archivo: path.basename(destino),
    bytes: statSync(destino).size,
  };
}
