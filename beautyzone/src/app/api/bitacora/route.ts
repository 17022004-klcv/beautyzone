import { NextResponse } from "next/server";
import { BitacoraService } from "@/src/app/services/bitacora.service";

/**
 * GET /api/bitacora
 *
 * Consulta de solo lectura de la bitácora. Cada entrada tiene:
 *   - actor (usuario o NULL si no se pudo atribuir)
 *   - fecha y hora exactas
 *   - IP, user-agent, método y ruta
 *   - acción, entidad y resultado
 *
 * Acepta filtros por usuario, acción, entidad, resultado, rango de fechas y
 * búsqueda de texto, más paginación.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Number(searchParams.get("page") ?? "1");
    const pageSize = Number(searchParams.get("pageSize") ?? "25");

    const resultado = await BitacoraService.listar({
      idUsuario: searchParams.get("idUsuario")
        ? Number(searchParams.get("idUsuario"))
        : undefined,
      accion: searchParams.get("accion") || undefined,
      entidad: searchParams.get("entidad") || undefined,
      resultado: (searchParams.get("resultado") as "EXITO" | "FALLO") || undefined,
      desde: searchParams.get("desde") || undefined,
      hasta: searchParams.get("hasta") || undefined,
      busqueda: searchParams.get("busqueda") || undefined,
      page: Number.isFinite(page) ? page : 1,
      pageSize: Number.isFinite(pageSize) ? pageSize : 25,
    });

    const filtros = await BitacoraService.obtenerFiltrosDisponibles();

    return NextResponse.json({ ...resultado, filtros });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error al cargar la bitácora",
      },
      { status: 500 },
    );
  }
}
