import { NextResponse } from "next/server";
import { db } from "@/src/lib/db";
import {
  BitacoraService,
  contextoDesdeRequest,
} from "@/src/app/services/bitacora.service";

// GET: Obtener todos los roles
export async function GET() {
  try {
    const roles = await db.role.findMany({
      orderBy: { id: "asc" },
    });
    return NextResponse.json(roles);
  } catch (error) {
    console.error("Error al obtener roles:", error);
    return NextResponse.json(
      { error: "Error al obtener la lista de roles" },
      { status: 500 },
    );
  }
}

// POST: Crear un nuevo rol
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nombre } = body;

    if (!nombre || nombre.trim() === "") {
      return NextResponse.json(
        { error: "El nombre del rol es requerido" },
        { status: 400 },
      );
    }

    const nuevoRol = await db.role.create({
      data: {
        nombre: nombre.trim(),
        estado: true,
      },
    });

    await BitacoraService.registrar({
      accion: "CREO",
      entidad: "Rol",
      entidadId: nuevoRol.id,
      descripcion: `Creó el rol ${nuevoRol.nombre}`,
      datos: { nombre: nuevoRol.nombre },
      ...contextoDesdeRequest(req, "/api/roles"),
    });

    return NextResponse.json(nuevoRol, { status: 201 });
  } catch (error) {
    console.error("Error al crear el rol:", error);
    return NextResponse.json(
      { error: "No se pudo crear el rol" },
      { status: 500 },
    );
  }
}
