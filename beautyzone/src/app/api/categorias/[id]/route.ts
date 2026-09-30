import { NextResponse } from "next/server";
import {
  ProductoService,
  ErrorOperacion,
} from "@/src/app/services/producto.service";
import {
  BitacoraService,
  contextoDesdeRequest,
} from "@/src/app/services/bitacora.service";
import { TIPOS_CATEGORIA } from "@/src/app/types/producto";
import type { UpdateCategoriaDTO } from "@/src/app/types/producto";

interface Params {
  params: Promise<{ id: string }>;
}

// PUT: Actualiza los datos de la categoría. Solo se tocan los campos enviados.
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id: rawId } = await params;
    const id = Number(rawId);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await request.json();

    if (body.nombre !== undefined && !String(body.nombre).trim()) {
      return NextResponse.json(
        { error: "El nombre de la categoría no puede quedar vacío" },
        { status: 400 },
      );
    }

    if (body.tipo !== undefined && !TIPOS_CATEGORIA.includes(body.tipo)) {
      return NextResponse.json(
        { error: "El tipo indicado no es válido" },
        { status: 400 },
      );
    }

    const categoria = await ProductoService.actualizarCategoria(
      id,
      body as UpdateCategoriaDTO,
    );

    await BitacoraService.registrar({
      accion: "ACTUALIZO",
      entidad: "Categoria",
      entidadId: id,
      descripcion: `Actualizó la categoría ${categoria.nombre}`,
      datos: {
        campos: Object.keys(body),
        nombre: categoria.nombre,
        tipo: categoria.tipo,
        estado: categoria.estado,
      },
      ...contextoDesdeRequest(request, `/api/categorias/${id}`),
    });

    return NextResponse.json(categoria);
  } catch (error) {
    if (error instanceof ErrorOperacion) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    const mensaje =
      error instanceof Error && error.message.includes("Record to update")
        ? "Categoría no encontrada"
        : "Error al actualizar categoría";

    console.error("PUT /api/categorias/[id] Error:", error);
    return NextResponse.json({ error: mensaje }, { status: 500 });
  }
}

// DELETE: Borrado físico de la categoría.
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id: rawId } = await params;
    const id = Number(rawId);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const eliminada = await ProductoService.eliminarCategoria(id);

    await BitacoraService.registrar({
      accion: "ELIMINO",
      entidad: "Categoria",
      entidadId: id,
      descripcion: `Eliminó la categoría ${eliminada.nombre}`,
      datos: { nombre: eliminada.nombre, tipo: eliminada.tipo },
      ...contextoDesdeRequest(request, `/api/categorias/${id}`),
    });

    return NextResponse.json({
      message: "Categoría eliminada exitosamente",
      categoria: eliminada,
    });
  } catch (error) {
    if (error instanceof ErrorOperacion) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    const mensaje =
      error instanceof Error && error.message.includes("Record to delete")
        ? "Categoría no encontrada"
        : "Error al eliminar categoría";

    console.error("DELETE /api/categorias/[id] Error:", error);
    return NextResponse.json({ error: mensaje }, { status: 500 });
  }
}
