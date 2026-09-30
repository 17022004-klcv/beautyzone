import { NextResponse } from "next/server";
import { ServicioService } from "@/src/app/services/servicio.service";
import {
  BitacoraService,
  contextoDesdeRequest,
} from "@/src/app/services/bitacora.service";
import { TIPOS_COMISION, type TipoComision } from "@/src/app/types/servicio";

// GET: Ficha completa de un servicio para la pantalla de detalle.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: rawId } = await params;
    const id = Number(rawId);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const servicio = await ServicioService.obtenerServicioPorId(id);

    if (!servicio) {
      return NextResponse.json(
        { error: "Servicio no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(servicio);
  } catch (error) {
    console.error("GET /api/servicios/[id] Error:", error);
    return NextResponse.json(
      { error: "Error al obtener el servicio" },
      { status: 500 },
    );
  }
}

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
    if (body.tipoComision !== undefined) {
      const tipo = String(body.tipoComision).toUpperCase();

      if (!TIPOS_COMISION.includes(tipo as TipoComision)) {
        return NextResponse.json(
          { error: "El tipo de comisión indicado no es válido" },
          { status: 400 },
        );
      }

      updateData.tipoComision = tipo;
    }
    if (body.imagen !== undefined) updateData.imagen = body.imagen;
    if (body.estado !== undefined) updateData.estado = Boolean(body.estado);

    const servicioActualizado = await ServicioService.actualizarServicio(
      id,
      updateData,
    );

    await BitacoraService.registrar({
      accion: "ACTUALIZO",
      entidad: "Servicio",
      entidadId: id,
      descripcion: `Actualizó el servicio ${servicioActualizado.nombre}`,
      datos: {
        campos: Object.keys(updateData),
        estado: servicioActualizado.estado,
        tipoComision: servicioActualizado.tipoComision,
      },
      ...contextoDesdeRequest(request, `/api/servicios/${id}`),
    });

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

    await BitacoraService.registrar({
      accion: "DESACTIVO",
      entidad: "Servicio",
      entidadId: id,
      descripcion: `Desactivó el servicio ${servicioEliminado.nombre}`,
      ...contextoDesdeRequest(request, `/api/servicios/${id}`),
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
