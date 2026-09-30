import { NextResponse } from "next/server";
import { ProductoService } from "@/src/app/services/producto.service";
import {
  BitacoraService,
  contextoDesdeRequest,
} from "@/src/app/services/bitacora.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get("tipo") as "PRODUCTO" | "SERVICIO" | null;
    const incluirInactivos = searchParams.get("incluirInactivos") === "1";

    const categorias = await ProductoService.obtenerCategorias(
      tipo || undefined,
      incluirInactivos,
    );
    return NextResponse.json(categorias);
  } catch (error) {
    console.error("GET /api/categorias Error:", error);
    return NextResponse.json(
      { error: "Error al obtener categorías" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.nombre || !body.tipo) {
      return NextResponse.json(
        { error: "Nombre y tipo son requeridos" },
        { status: 400 },
      );
    }
    const nuevaCategoria = await ProductoService.crearCategoria(body);

    await BitacoraService.registrar({
      accion: "CREO",
      entidad: "Categoria",
      entidadId: nuevaCategoria.id,
      descripcion: `Creó la categoría ${nuevaCategoria.nombre}`,
      datos: { nombre: nuevaCategoria.nombre, tipo: nuevaCategoria.tipo },
      ...contextoDesdeRequest(request, "/api/categorias"),
    });

    return NextResponse.json(nuevaCategoria, { status: 201 });
  } catch (error) {
    console.error("POST /api/categorias Error:", error);
    return NextResponse.json(
      { error: "Error al crear categoría" },
      { status: 500 },
    );
  }
}
