import { NextResponse } from "next/server";
import { db } from "@/src/lib/db";
import {
  BitacoraService,
  contextoDesdeRequest,
} from "@/src/app/services/bitacora.service";

interface Params {
  params: Promise<{ id: string }>;
}

// PUT: Actualizar nombre o estado de un rol
export async function PUT(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const roleId = Number(id);
    const body = await req.json();
    const { nombre, estado } = body;

    if (isNaN(roleId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const rolActualizado = await db.role.update({
      where: { id: roleId },
      data: {
        ...(nombre !== undefined && { nombre: nombre.trim() }),
        ...(estado !== undefined && { estado }),
      },
    });

    await BitacoraService.registrar({
      accion: "ACTUALIZO",
      entidad: "Rol",
      entidadId: roleId,
      descripcion: `Actualizó el rol ${rolActualizado.nombre}`,
      datos: { campos: Object.keys(body), nombre: rolActualizado.nombre, estado: rolActualizado.estado },
      ...contextoDesdeRequest(req, `/api/roles/${roleId}`),
    });

    return NextResponse.json(rolActualizado);
  } catch (error) {
    console.error("Error al actualizar el rol:", error);
    return NextResponse.json(
      { error: "Error al actualizar el rol" },
      { status: 500 },
    );
  }
}

// DELETE: Desactivar (borrado lógico) o eliminar rol
export async function DELETE(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const roleId = Number(id);

    if (isNaN(roleId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Cambiamos el estado a false (desactivación segura)
    const rolDesactivado = await db.role.update({
      where: { id: roleId },
      data: { estado: false },
    });

    await BitacoraService.registrar({
      accion: "DESACTIVO",
      entidad: "Rol",
      entidadId: roleId,
      descripcion: `Desactivó el rol ${rolDesactivado.nombre}`,
      ...contextoDesdeRequest(req, `/api/roles/${roleId}`),
    });

    return NextResponse.json(rolDesactivado);
  } catch (error) {
    console.error("Error al eliminar el rol:", error);
    return NextResponse.json(
      { error: "No se pudo desactivar el rol" },
      { status: 500 },
    );
  }
}
