import { NextResponse } from "next/server";
import {
  ProductoService,
  ErrorOperacion,
} from "@/src/app/services/producto.service";
import {
  BitacoraService,
  contextoDesdeRequest,
} from "@/src/app/services/bitacora.service";
import type { UpdateProductoDTO } from "@/src/app/types/producto";

interface Params {
  params: Promise<{ id: string }>;
}

function idDesdeParams(params: Params["params"]) {
  return params.then(({ id }) => Number(id));
}

// PUT: Actualiza los datos del producto. Solo se tocan los campos enviados.
export async function PUT(request: Request, { params }: Params) {
  try {
    const id = await idDesdeParams(params);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await request.json();

    if (body.nombre !== undefined && !String(body.nombre).trim()) {
      return NextResponse.json(
        { error: "El nombre del producto no puede quedar vacío" },
        { status: 400 },
      );
    }

    if (body.precio !== undefined && Number(body.precio) < 0) {
      return NextResponse.json(
        { error: "El precio no puede ser negativo" },
        { status: 400 },
      );
    }

    if (body.stock !== undefined && Number(body.stock) < 0) {
      return NextResponse.json(
        { error: "El stock no puede ser negativo" },
        { status: 400 },
      );
    }

    if (body.idcategoria !== undefined && !Number(body.idcategoria)) {
      return NextResponse.json(
        { error: "Selecciona una categoría válida" },
        { status: 400 },
      );
    }

    const producto = await ProductoService.actualizarProducto(
      id,
      body as UpdateProductoDTO,
    );

    await BitacoraService.registrar({
      accion: "ACTUALIZO",
      entidad: "Producto",
      entidadId: id,
      descripcion: `Actualizó el producto ${producto.nombre}`,
      datos: {
        campos: Object.keys(body),
        nombre: producto.nombre,
        precio: String(producto.precio),
        stock: producto.stock,
        estado: producto.estado,
      },
      ...contextoDesdeRequest(request, `/api/productos/${id}`),
    });

    return NextResponse.json(producto);
  } catch (error) {
    if (error instanceof ErrorOperacion) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    const mensaje =
      error instanceof Error && error.message.includes("Record to update")
        ? "Producto no encontrado"
        : "Error al actualizar producto";

    console.error("PUT /api/productos/[id] Error:", error);
    return NextResponse.json({ error: mensaje }, { status: 500 });
  }
}

// DELETE: Borrado físico del producto.
export async function DELETE(request: Request, { params }: Params) {
  try {
    const id = await idDesdeParams(params);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const eliminado = await ProductoService.eliminarProducto(id);

    await BitacoraService.registrar({
      accion: "ELIMINO",
      entidad: "Producto",
      entidadId: id,
      descripcion: `Eliminó el producto ${eliminado.nombre}`,
      datos: { nombre: eliminado.nombre, precio: String(eliminado.precio) },
      ...contextoDesdeRequest(request, `/api/productos/${id}`),
    });

    return NextResponse.json({
      message: "Producto eliminado exitosamente",
      producto: eliminado,
    });
  } catch (error) {
    if (error instanceof ErrorOperacion) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    const mensaje =
      error instanceof Error && error.message.includes("Record to delete")
        ? "Producto no encontrado"
        : "Error al eliminar producto";

    console.error("DELETE /api/productos/[id] Error:", error);
    return NextResponse.json({ error: mensaje }, { status: 500 });
  }
}
