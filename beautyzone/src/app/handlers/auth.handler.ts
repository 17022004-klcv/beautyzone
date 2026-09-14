"use server";
import {
  findUserByEmail,
  createClientUser,
} from "@/src/app/services/auth.service";
import { redirect } from "next/navigation";

export async function handleLogin(formData: FormData) {
  const correo = formData.get("correo") as string;
  const password = formData.get("password") as string;

  if (!correo || !password) {
    return { error: "Por favor, ingresa tu correo y contraseña." };
  }

  const user = await findUserByEmail(correo);

  if (!user || user.password !== password) {
    return { error: "Credenciales incorrectas." };
  }

  // Retornamos 'user.rol.nombre' como un string directo (ej. "ADMIN", "CLIENTE")
  return {
    user: {
      id: user.id,
      nombre: `${user.nombre} ${user.apellido}`,
      correo: user.correo,
      rol: user.rol.nombre, // <-- AQUÍ EXTRAEMOS EL NOMBRE DEL ROL
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

  await createClientUser({ nombre, apellido, correo, password, telefono });

  redirect("/login?registered=true");
}
