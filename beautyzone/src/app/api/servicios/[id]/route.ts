import { NextResponse } from "next/server";
import { ServicioService } from "@/src/app/services/servicio.service";

// PUT: Actualizar un servicio por su ID
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: rawId } = await params;
    const id = Number(rawId);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID de servicio inválido" },
        { status: 400 },
      );
    }

    const body = await request.json();

    // Validar que vengan los campos requeridos mínimos si tu backend los exige
    const updateData: Record<string, any> = {};

    if (body.nombre) updateData.nombre = body.nombre.trim();
    if (body.descripcion !== undefined)
      updateData.descripcion = body.descripcion.trim();
    if (body.idcategoria) updateData.idcategoria = Number(body.idcategoria);
    if (body.precio !== undefined && body.precio !== "")
      updateData.precio = parseFloat(body.precio);
    if (
      body.porcentajeComision !== undefined &&
      body.porcentajeComision !== ""
    ) {
      updateData.porcentajeComision = parseFloat(body.porcentajeComision);
    }
    if (body.imagen !== undefined) updateData.imagen = body.imagen;

    const servicioActualizado = await ServicioService.actualizarServicio(
      id,
      updateData,
    );

    return NextResponse.json(servicioActualizado);
  } catch (error: any) {
    console.error(`❌ Error en PUT /api/servicios:`, error);
    return NextResponse.json(
      {
        error: "Error al actualizar el servicio",
        detalles: error?.message || error,
      },
      { status: 400 },
    );
  }
}

// DELETE: Eliminar (o desactivar) un servicio por su ID
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: rawId } = await params;
    const id = Number(rawId);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID de servicio inválido" },
        { status: 400 },
      );
    }

    const servicioEliminado = await ServicioService.actualizarServicio(id, {
      estado: false,
    });

    return NextResponse.json({
      message: "Servicio eliminado correctamente",
      servicio: servicioEliminado,
    });
  } catch (error: any) {
    console.error(`❌ Error en DELETE /api/servicios:`, error);
    return NextResponse.json(
      {
        error: "Error al eliminar el servicio",
        detalles: error?.message || error,
      },
      { status: 400 },
    );
  }
}
