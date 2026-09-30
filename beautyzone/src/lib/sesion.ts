import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

/**
 * Sesión mínima para poder atribuir acciones en la bitácora.
 *
 * La app no tenía ninguna sesión real: el login solo escribía `localStorage`,
 * así que el servidor no sabía quién hacía cada cosa. Aquí se emite una cookie
 * HttpOnly firmada con HMAC-SHA256. El `localStorage` del login sigue igual
 * para el flujo de la interfaz; esta cookie es solo el canal confiable para el
 * servidor.
 *
 * No guarda contraseñas ni datos sensibles: únicamente id, rol y nombre.
 */

const NOMBRE_COOKIE = "bz_sesion";
const DURACION_SEGUNDOS = 60 * 60 * 12; // 12 horas

/**
 * Secreto de firma. Se lee del entorno porque en producción debe ser propio.
 * El valor por defecto existe para que el proyecto arranque en desarrollo
 * (XAMPP local) sin configurar nada, pero es público: hay que cambiarlo antes
 * de desplegar.
 */
const SECRETO =
  process.env.SESSION_SECRET ?? "beautyzone-local-dev-secret-cambiar-en-produccion";

export interface SesionUsuario {
  id: number;
  rol: string;
  nombre: string;
}

function firmar(cuerpo: string): string {
  return createHmac("sha256", SECRETO).update(cuerpo).digest("base64url");
}

function aBase64Url(texto: string): string {
  return Buffer.from(texto, "utf8").toString("base64url");
}

function deBase64Url(texto: string): string {
  return Buffer.from(texto, "base64url").toString("utf8");
}

/** Crea el valor de la cookie: `cuerpo.firma`. */
export function serializarSesion(usuario: SesionUsuario): string {
  const cuerpo = aBase64Url(JSON.stringify(usuario));
  return `${cuerpo}.${firmar(cuerpo)}`;
}

/** Valida la firma y devuelve la sesión, o `null` si no es válida. */
export function parsearSesion(valor?: string | null): SesionUsuario | null {
  if (!valor) return null;

  const separador = valor.lastIndexOf(".");
  if (separador <= 0) return null;

  const cuerpo = valor.slice(0, separador);
  const firma = valor.slice(separador + 1);
  const esperada = firmar(cuerpo);

  // Compara en tiempo constante para no filtrar información por tiempos.
  const a = Buffer.from(firma);
  const b = Buffer.from(esperada);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const datos = JSON.parse(deBase64Url(cuerpo)) as SesionUsuario;
    if (typeof datos.id !== "number" || !datos.rol) return null;
    return datos;
  } catch {
    return null;
  }
}

export async function establecerSesion(usuario: SesionUsuario): Promise<void> {
  const almacen = await cookies();
  almacen.set(NOMBRE_COOKIE, serializarSesion(usuario), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: DURACION_SEGUNDOS,
  });
}

export async function cerrarSesion(): Promise<void> {
  const almacen = await cookies();
  almacen.delete(NOMBRE_COOKIE);
}

/** Sesión actual del servidor, o `null` si no hay o no es válida. */
export async function obtenerSesion(): Promise<SesionUsuario | null> {
  const almacen = await cookies();
  return parsearSesion(almacen.get(NOMBRE_COOKIE)?.value);
}

export { NOMBRE_COOKIE };
