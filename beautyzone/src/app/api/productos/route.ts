import { NextResponse } from "next/server";
import { ProductoService } from "@/src/app/services/producto.service";
import {
  BitacoraService,
  contextoDesdeRequest,
} from "@/src/app/services/bitacora.service";

export async function GET(request: Request) {
  try {
    const incluirInactivos =
      new URL(request.url).searchParams.get("incluirInactivos") === "1";

    const productos = await ProductoService.obtenerProductos(incluirInactivos);
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

    await BitacoraService.registrar({
      accion: "CREO",
      entidad: "Producto",
      entidadId: nuevoProducto.id,
      descripcion: `Creó el producto ${nuevoProducto.nombre}`,
      datos: {
        nombre: nuevoProducto.nombre,
        precio: String(nuevoProducto.precio),
        stock: nuevoProducto.stock,
        idCategoria: nuevoProducto.idcategoria,
      },
      ...contextoDesdeRequest(request, "/api/productos"),
    });

    return NextResponse.json(nuevoProducto, { status: 201 });
  } catch (error) {
    console.error("POST /api/productos Error:", error);
    return NextResponse.json(
      { error: "Error al crear producto" },
      { status: 500 },
    );
  }
}
