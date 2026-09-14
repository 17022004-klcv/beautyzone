import { db } from "@/src/lib/db";
import { CreateUsuarioDTO, UpdateUsuarioDTO } from "@/src/app/types/usuario";

export class UsuarioService {
  // --- USUARIOS ---

  static async listarUsuarios(filtros?: { rolId?: number; estado?: boolean }) {
    const where: any = {};

    if (filtros?.rolId) {
      where.idrol = filtros.rolId;
    }

    if (filtros?.estado !== undefined) {
      where.estado = filtros.estado;
    }

    return await db.usuario.findMany({
      where,
      include: {
        rol: true,
      },
      orderBy: {
        id: "desc",
      },
    });
  }

  static async obtenerUsuarioPorId(id: number) {
    return await db.usuario.findUnique({
      where: { id },
      include: { rol: true },
    });
  }

  static async crearUsuario(data: CreateUsuarioDTO) {
    return await db.usuario.create({
      data: {
        idrol: Number(data.idrol),
        nombre: data.nombre.trim(),
        apellido: data.apellido.trim(),
        correo: data.correo.trim().toLowerCase(),
        password: data.password || "123456",
        telefono: data.telefono?.trim() || null,
        estado: data.estado !== undefined ? data.estado : true,
      },
      include: {
        rol: true,
      },
    });
  }

  static async actualizarUsuario(id: number, data: UpdateUsuarioDTO) {
    const updateData: any = {};

    if (data.idrol) updateData.idrol = Number(data.idrol);
    if (data.nombre) updateData.nombre = data.nombre.trim();
    if (data.apellido) updateData.apellido = data.apellido.trim();
    if (data.correo) updateData.correo = data.correo.trim().toLowerCase();
    if (data.password) updateData.password = data.password;
    if (data.telefono !== undefined)
      updateData.telefono = data.telefono ? data.telefono.trim() : null;
    if (data.estado !== undefined) updateData.estado = data.estado;

    return await db.usuario.update({
      where: { id },
      data: updateData,
      include: {
        rol: true,
      },
    });
  }

  static async cambiarEstadoUsuario(id: number, estado: boolean) {
    return await db.usuario.update({
      where: { id },
      data: { estado },
    });
  }

  // --- ROLES ---

  static async listarRoles() {
    return await db.role.findMany({
      orderBy: { id: "asc" },
    });
  }

  static async crearRol(nombre: string) {
    return await db.role.create({
      data: {
        nombre: nombre.trim(),
        estado: true,
      },
    });
  }

  static async actualizarRol(id: number, nombre: string, estado?: boolean) {
    return await db.role.update({
      where: { id },
      data: {
        nombre: nombre.trim(),
        ...(estado !== undefined && { estado }),
      },
    });
  }
}
