import { db } from "@/src/lib/db";

export async function findUserByEmail(correo: string) {
  return await db.usuario.findUnique({
    where: { correo },
    include: { rol: true },
  });
}

export async function createClientUser(data: {
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
  telefono: string;
}) {
  // Busca el rol "Cliente" previamente registrado por el seed
  const rolCliente = await db.role.findFirst({
    where: { nombre: "Cliente" },
  });

  return await db.usuario.create({
    data: {
      nombre: data.nombre,
      apellido: data.apellido,
      correo: data.correo,
      password: data.password,
      telefono: data.telefono,
      estado: true,
      rol: {
        connect: {
          id: rolCliente ? rolCliente.id : 2,
        },
      },
    },
  });
}
