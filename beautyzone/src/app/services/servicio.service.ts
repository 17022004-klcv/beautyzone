import { db } from "@/src/lib/db";
import {
  CreateServicioDTO,
  UpdateServicioDTO,
  TIPOS_COMISION,
  type TipoComision,
} from "@/src/app/types/servicio";

const PORCENTAJE_POR_DEFECTO: TipoComision = "PORCENTAJE";

/** Acepta cualquier casing y cae en PORCENTAJE si el valor no es válido. */
function normalizarTipoComision(tipo?: string | null): TipoComision {
  const valor = String(tipo ?? "").toUpperCase();
  return TIPOS_COMISION.includes(valor as TipoComision)
    ? (valor as TipoComision)
    : PORCENTAJE_POR_DEFECTO;
}

export class ServicioService {
  static async obtenerServicios(idcategoria?: number, incluirInactivos = false) {
    return await db.servicio.findMany({
      where: {
        ...(incluirInactivos ? {} : { estado: true }),
        ...(idcategoria ? { idcategoria } : {}),
      },
      include: {
        categoria: {
          select: { id: true, nombre: true },
        },
      },
      orderBy: { nombre: "asc" },
    });
  }

  /** Ficha puntual. No filtra por estado: la página de detalle debe poder
   *  abrir un servicio desactivado para volverlo a activar. */
  static async obtenerServicioPorId(id: number) {
    return await db.servicio.findUnique({
      where: { id },
      include: {
        categoria: {
          select: { id: true, nombre: true },
        },
      },
    });
  }

  static async crearServicio(data: CreateServicioDTO) {
    return await db.servicio.create({
      data: {
        idcategoria: Number(data.idcategoria),
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        precio: data.precio,
        porcentajeComision: data.porcentajeComision
          ? Number(data.porcentajeComision)
          : 0,
        tipoComision: normalizarTipoComision(data.tipoComision),
        imagen: data.imagen || null,
      },
    });
  }

  static async actualizarServicio(id: number, data: UpdateServicioDTO) {
    return await db.servicio.update({
      where: { id },
      data: {
        ...(data.idcategoria && { idcategoria: Number(data.idcategoria) }),
        ...(data.nombre && { nombre: data.nombre }),
        ...(data.descripcion !== undefined && {
          descripcion: data.descripcion,
        }),
        ...(data.precio !== undefined && { precio: data.precio }),
        ...(data.porcentajeComision !== undefined && {
          porcentajeComision: Number(data.porcentajeComision),
        }),
        ...(data.tipoComision !== undefined && {
          tipoComision: normalizarTipoComision(data.tipoComision),
        }),
        ...(data.imagen !== undefined && { imagen: data.imagen }),
        ...(data.estado !== undefined && { estado: data.estado }),
      },
      include: {
        categoria: {
          select: { id: true, nombre: true },
        },
      },
    });
  }
}
