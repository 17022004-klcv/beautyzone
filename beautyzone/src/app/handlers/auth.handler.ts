"use server";
import {
  findUserByEmail,
  createClientUser,
} from "@/src/app/services/auth.service";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { BitacoraService, contextoPeticion } from "@/src/app/services/bitacora.service";
import { cerrarSesion, establecerSesion, obtenerSesion } from "@/src/lib/sesion";

export async function handleLogin(formData: FormData) {
  const correo = formData.get("correo") as string;
  const password = formData.get("password") as string;

  if (!correo || !password) {
    return { error: "Por favor, ingresa tu correo y contraseña." };
  }

  const peticion = await headers();
  const contexto = contextoPeticion(peticion);
  const correoLimpio = correo.trim().toLowerCase();

  const user = await findUserByEmail(correo);

  if (!user || user.password !== password) {
    // Se registra el intento fallido sin revelar si el correo existe.
    await BitacoraService.registrar({
      accion: "INICIO_SESION",
      entidad: "Auth",
      descripcion: `Intento de inicio de sesión fallido para ${correoLimpio}`,
      resultado: "FALLO",
      datos: { correo: correoLimpio, motivo: !user ? "correo inexistente" : "contraseña incorrecta" },
      metodo: "POST",
      ruta: "/login",
      ip: contexto.ip,
      userAgent: contexto.userAgent,
    });

    return { error: "Credenciales incorrectas." };
  }

  if (!user.estado) {
    await BitacoraService.registrar({
      accion: "INICIO_SESION",
      entidad: "Auth",
      descripcion: `Acceso bloqueado para ${correoLimpio}: usuario inactivo`,
      resultado: "FALLO",
      datos: { correo: correoLimpio, motivo: "usuario inactivo" },
      metodo: "POST",
      ruta: "/login",
      ip: contexto.ip,
      userAgent: contexto.userAgent,
    });

    return { error: "Tu usuario está desactivado. Contacta al administrador." };
  }

  const nombreCompleto = `${user.nombre} ${user.apellido}`.trim();
  const rol = user.rol.nombre;

  // Cookie firmada: es el canal confiable para atribuir acciones en la bitácora.
  await establecerSesion({ id: user.id, rol, nombre: nombreCompleto });

  await BitacoraService.registrar({
    accion: "INICIO_SESION",
    entidad: "Auth",
    entidadId: user.id,
    descripcion: `${nombreCompleto} inició sesión (${rol})`,
    usuario: { id: user.id, rol, nombre: nombreCompleto },
    metodo: "POST",
    ruta: "/login",
    ip: contexto.ip,
    userAgent: contexto.userAgent,
  });

  // Retornamos 'user.rol.nombre' como un string directo (ej. "Admin", "Cliente")
  return {
    user: {
      id: user.id,
      nombre: nombreCompleto,
      correo: user.correo,
      rol,
    },
  };
}

export async function handleRegister(formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const apellido = formData.get("apellido") as string;
  const correo = formData.get("correo") as string;
  const password = formData.get("password") as string;
  const telefono = formData.get("telefono") as string;

  if (!nombre || !apellido || !correo || !password || !telefono) {
    return { error: "Todos los campos son obligatorios." };
  }

  const existingUser = await findUserByEmail(correo);
  if (existingUser) {
    return { error: "El correo electrónico ya está registrado." };
  }

  const nuevo = await createClientUser({ nombre, apellido, correo, password, telefono });

  if (nuevo?.id) {
    const peticion = await headers();
    const contexto = contextoPeticion(peticion);
    await BitacoraService.registrar({
      accion: "CREO",
      entidad: "Usuario",
      entidadId: nuevo.id,
      descripcion: `Se registró un cliente: ${nombre.trim()} ${apellido.trim()}`,
      datos: { correo: correo.trim().toLowerCase() },
      metodo: "POST",
      ruta: "/login",
      ip: contexto.ip,
      userAgent: contexto.userAgent,
    });
  }

  redirect("/login?registered=true");
}

/**
 * Cierra la sesión del servidor: borra la cookie firmada y deja constancia.
 * El `localStorage` lo limpia el componente cliente por su cuenta.
 */
export async function handleLogout() {
  const sesion = await obtenerSesion();

  if (sesion) {
    const peticion = await headers();
    const contexto = contextoPeticion(peticion);

    await BitacoraService.registrar({
      accion: "CIERRE_SESION",
      entidad: "Auth",
      entidadId: sesion.id,
      descripcion: `${sesion.nombre} cerró sesión`,
      usuario: sesion,
      metodo: "POST",
      ruta: "/logout",
      ip: contexto.ip,
      userAgent: contexto.userAgent,
    });
  }

  await cerrarSesion();

  return { ok: true };
}
