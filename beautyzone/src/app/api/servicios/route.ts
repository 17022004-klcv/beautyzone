import { NextResponse } from "next/server";
import { ServicioService } from "@/src/app/services/servicio.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const catId = searchParams.get("categoriaId");

    const servicios = await ServicioService.obtenerServicios(
      catId ? Number(catId) : undefined,
    );
    return NextResponse.json(servicios);
  } catch (error) {
    console.error("GET /api/servicios Error:", error);
    return NextResponse.json(
      { error: "Error al obtener servicios" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const idcategoriaNum = Number(body.idcategoria);
    const precioNum = parseFloat(body.precio);
    const porcentajeComisionNum = body.porcentajeComision
      ? parseFloat(body.porcentajeComision)
      : 0;

    if (!body.nombre || isNaN(precioNum) || isNaN(idcategoriaNum)) {
      return NextResponse.json(
        { error: "Nombre, precio y categoría son obligatorios" },
        { status: 400 },
      );
    }

    const nuevoServicio = await ServicioService.crearServicio({
      idcategoria: idcategoriaNum,
      nombre: body.nombre.trim(),
      descripcion: body.descripcion ? body.descripcion.trim() : null,
      precio: precioNum,
      porcentajeComision: isNaN(porcentajeComisionNum)
        ? 0
        : porcentajeComisionNum,
      imagen: body.imagen || null,
    });

    return NextResponse.json(nuevoServicio, { status: 201 });
  } catch (error: any) {
    console.error("❌ Error interno en POST /api/servicios:", error);

    return NextResponse.json(
      {
        error: "Error interno al guardar el servicio",
        detalles: error?.message || error,
      },
      { status: 500 },
    );
  }
}
