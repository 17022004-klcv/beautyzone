import { NextResponse } from "next/server";
import { ProductoService } from "@/src/app/services/producto.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get("tipo") as "PRODUCTO" | "SERVICIO" | null;

    const categorias = await ProductoService.obtenerCategorias(
      tipo || undefined,
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
    return NextResponse.json(nuevaCategoria, { status: 201 });
  } catch (error) {
    console.error("POST /api/categorias Error:", error);
    return NextResponse.json(
      { error: "Error al crear categoría" },
      { status: 500 },
    );
  }
}
