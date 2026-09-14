import { NextResponse } from "next/server";
import { db } from "@/src/lib/db";

export async function GET() {
  try {
    const [clientes, servicios, estilistas] = await Promise.all([
      db.usuario.findMany({
        where: { estado: true },
        select: { id: true, nombre: true, apellido: true },
      }),
      db.servicio.findMany({
        where: { estado: true },
        select: { id: true, nombre: true, precio: true },
      }),
      db.usuario.findMany({
        where: { estado: true },
        select: { id: true, nombre: true, apellido: true },
      }),
    ]);

    return NextResponse.json({ clientes, servicios, estilistas });
  } catch (error) {
    console.error("Error obteniendo opciones:", error);
    return NextResponse.json({ clientes: [], servicios: [], estilistas: [] });
  }
}
