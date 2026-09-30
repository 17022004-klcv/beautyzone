/**
 * Validaciones compartidas entre formularios y rutas de la API.
 *
 * Todas devuelven `null` cuando el valor es válido, o el mensaje de error en
 * español. Ese contrato permite que el mismo texto se muestre en el formulario
 * y en la respuesta de la API, sin duplicar las reglas en dos lugares.
 *
 * Reglas de uso:
 * - Un valor vacío devuelve `null` (no hay error). Que el campo sea obligatorio
 *   o no lo decide quien lo usa, no este archivo.
 * - La validación del cliente es una barrera de interfaz. La ruta que escribe
 *   vuelve a llamar a la misma función: nunca confíes solo en el formulario.
 */

import { hoyComoDateISO } from "@/src/lib/cajaTotales";

/** Teléfono salvadoreño: cuatro dígitos, guion, cuatro dígitos. */
export const REGEX_TELEFONO = /^\d{4}-\d{4}$/;

/** DUI de El Salvador: ocho dígitos, guion, un dígito verificador. */
export const REGEX_DUI = /^\d{8}-\d$/;

/** `YYYY-MM-DD`, el formato que devuelve `<input type="date">`. */
export const REGEX_FECHA = /^\d{4}-\d{2}-\d{2}$/;

/** `HH:MM` en formato de 24 horas, como se guarda en `Cita.horaInicio`. */
export const REGEX_HORA = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const MENSAJES = {
  TELEFONO: "El teléfono debe tener el formato 0000-0000.",
  DUI: "El DUI debe tener el formato 00000000-0.",
  FECHA_INVALIDA: "La fecha no es válida.",
  HORA_INVALIDA: "La hora no es válida.",
  CITA_EN_PASADO: "No se pueden agendar citas en fechas anteriores a hoy.",
  CITA_HORA_PASADA: "No se pueden agendar citas en una hora que ya pasó hoy.",
} as const;

/** Teléfono `0000-0000`. Un valor vacío no produce error. */
export function validarTelefono(valor: string | null | undefined): string | null {
  const v = (valor ?? "").trim();
  if (v === "") return null;
  return REGEX_TELEFONO.test(v) ? null : MENSAJES.TELEFONO;
}

/** DUI `00000000-0`. Un valor vacío no produce error. */
export function validarDui(valor: string | null | undefined): string | null {
  const v = (valor ?? "").trim();
  if (v === "") return null;
  return REGEX_DUI.test(v) ? null : MENSAJES.DUI;
}

export function esTelefonoValido(valor: string | null | undefined): boolean {
  return validarTelefono(valor) === null;
}

export function esDuiValido(valor: string | null | undefined): boolean {
  return validarDui(valor) === null;
}

/** Minutos desde medianoche de un `HH:MM`, o `null` si el formato no cuadra. */
function minutosDeHora(hora: string): number | null {
  const coincidencia = REGEX_HORA.exec(hora);
  if (!coincidencia) return null;
  return Number(coincidencia[1]) * 60 + Number(coincidencia[2]);
}

/**
 * Una cita solo puede agendarse hacia adelante: hoy a una hora que todavía no
 * pasó, o cualquier día futuro.
 *
 * El ejemplo: si ahora son las 2:00 pm del 28 de septiembre, una cita del 28 a
 * la 1:00 pm se rechaza, y también cualquier fecha anterior a ese día.
 *
 * @param ahora Se inyecta para que el servidor y el navegador puedan fijar el
 *   momento de la comparación (y para que la regla sea verificable).
 */
export function validarFechaHoraCita(
  fecha: string,
  horaInicio: string,
  ahora: Date = new Date(),
): string | null {
  if (!REGEX_FECHA.test(fecha)) return MENSAJES.FECHA_INVALIDA;

  const minutosCita = minutosDeHora(horaInicio);
  if (minutosCita === null) return MENSAJES.HORA_INVALIDA;

  const hoy = hoyComoDateISO(ahora);
  if (fecha < hoy) return MENSAJES.CITA_EN_PASADO;

  if (fecha === hoy) {
    const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();
    if (minutosCita <= minutosAhora) return MENSAJES.CITA_HORA_PASADA;
  }

  return null;
}
