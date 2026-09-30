import { NextResponse } from "next/server";
import { db } from "@/src/lib/db";
import type { OpcionesAgenda } from "@/src/app/types/agenda";

// `Role.nombre` se guarda en title case (ver `prisma/seed.ts`): "Cliente" y
// "Estilista". Comparar en mayúsculas devolvería listas vacías.
const ROL_CLIENTE = "Cliente";
const ROL_ESTILISTA = "Estilista";

export async function GET() {
  try {
    const [clientes, servicios, estilistas] = await Promise.all([
      db.usuario.findMany({
        where: { estado: true, rol: { nombre: ROL_CLIENTE } },
        select: { id: true, nombre: true, apellido: true },
        orderBy: [{ nombre: "asc" }, { apellido: "asc" }],
      }),
      db.servicio.findMany({
        where: { estado: true },
        select: { id: true, nombre: true, precio: true },
        orderBy: { nombre: "asc" },
      }),
      db.usuario.findMany({
        where: { estado: true, rol: { nombre: ROL_ESTILISTA } },
        select: { id: true, nombre: true, apellido: true },
        orderBy: [{ nombre: "asc" }, { apellido: "asc" }],
      }),
    ]);

    // `precio` es Decimal en Prisma: viaja como string y se normaliza a number
    // para que el formulario no tenga que hacer Number() en cada render.
    const respuesta: OpcionesAgenda = {
      clientes,
      servicios: servicios.map((s) => ({
        id: s.id,
        nombre: s.nombre,
        precio: Number(s.precio),
      })),
      estilistas,
    };

    return NextResponse.json(respuesta);
  } catch (error) {
    console.error("Error obteniendo opciones:", error);
    return NextResponse.json({ clientes: [], servicios: [], estilistas: [] });
  }
}
