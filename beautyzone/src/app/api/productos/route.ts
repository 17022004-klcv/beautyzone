import { NextResponse } from "next/server";
import { ProductoService } from "@/src/app/services/producto.service";

export async function GET() {
  try {
    const productos = await ProductoService.obtenerProductos();
    return NextResponse.json(productos);
  } catch (error) {
    console.error("GET /api/productos Error:", error);
    return NextResponse.json(
      { error: "Error al obtener productos" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.nombre || !body.precio || !body.idcategoria) {
      return NextResponse.json(
        { error: "Campos requeridos faltantes" },
        { status: 400 },
      );
    }
    const nuevoProducto = await ProductoService.crearProducto(body);
    return NextResponse.json(nuevoProducto, { status: 201 });
  } catch (error) {
    console.error("POST /api/productos Error:", error);
    return NextResponse.json(
      { error: "Error al crear producto" },
      { status: 500 },
    );
  }
}
