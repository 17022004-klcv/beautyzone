import { db } from "@/src/lib/db";
import { CreateServicioDTO, UpdateServicioDTO } from "@/src/app/types/servicio";

export class ServicioService {
  static async obtenerServicios(idcategoria?: number) {
    return await db.servicio.findMany({
      where: {
        estado: true,
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
        ...(data.imagen !== undefined && { imagen: data.imagen }),
        ...(data.estado !== undefined && { estado: data.estado }),
      },
    });
  }
}
