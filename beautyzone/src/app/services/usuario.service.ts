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
    const pinCaja = UsuarioService.normalizarPinCaja(data.pinCaja);

    if (pinCaja) {
      await UsuarioService.verificarPinCajaDisponible(pinCaja);
    }

    return await db.usuario.create({
      data: {
        idrol: Number(data.idrol),
        nombre: data.nombre.trim(),
        apellido: data.apellido.trim(),
        correo: data.correo.trim().toLowerCase(),
        password: data.password || "123456",
        telefono: data.telefono?.trim() || null,
        pinCaja,
        passwordAdmin: data.passwordAdmin?.trim() || null,
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
    if (data.pinCaja !== undefined) {
      const pinCaja = UsuarioService.normalizarPinCaja(data.pinCaja);
      if (pinCaja) {
        await UsuarioService.verificarPinCajaDisponible(pinCaja, id);
      }
      updateData.pinCaja = pinCaja;
    }
    if (data.passwordAdmin !== undefined) {
      // Vaciar el campo en el formulario lo deja en null, que deshabilita el
      // acceso a las operaciones protegidas en vez de dejarlo abierto.
      updateData.passwordAdmin = data.passwordAdmin.trim() || null;
    }
    if (data.estado !== undefined) updateData.estado = data.estado;

    return await db.usuario.update({
      where: { id },
      data: updateData,
      include: {
        rol: true,
      },
    });
  }

  // --- PIN DE CAJA ---
  // La columna es VARCHAR(6) y @unique: PINs vacíos se guardan como NULL
  // (Postgres no colisiona NULLs en índices únicos) y no se pueden repetir.

  private static normalizarPinCaja(pinCaja?: string): string | null {
    if (!pinCaja) return null;
    const pin = pinCaja.trim();
    if (!pin) return null;
    if (pin.length > 6) {
      throw new Error("El PIN de caja no puede tener más de 6 caracteres.");
    }
    if (!/^\d+$/.test(pin)) {
      throw new Error("El PIN de caja solo admite números.");
    }
    return pin;
  }

  private static async verificarPinCajaDisponible(
    pinCaja: string,
    excluirId?: number,
  ) {
    const existente = await db.usuario.findFirst({
      where: {
        pinCaja,
        ...(excluirId ? { id: { not: excluirId } } : {}),
      },
      select: { id: true, nombre: true, apellido: true },
    });

    if (existente) {
      throw new Error(
        `El PIN ${pinCaja} ya está asignado a ${existente.nombre} ${existente.apellido}.`,
      );
    }
  }

  /**
   * Autoriza una operación sensible (editar un arqueo, cierre administrativo).
   *
   * Acepta la `passwordAdmin` de cualquier usuario activo con rol Admin. Se
   * guardan en texto plano como el resto de contraseñas del proyecto, así que
   * la comparación es directa y no hay nada que hashear ni migrar.
   *
   * Si ningún Admin tiene contraseña asignada devuelve `sinConfigurar` para que
   * la interfaz lo diga en vez deromptar una contraseña vacía.
   */
  static async verificarPasswordAdmin(password: string) {
    const admins = await db.usuario.findMany({
      where: { rol: { nombre: "Admin" }, estado: true },
      select: { id: true, nombre: true, apellido: true, passwordAdmin: true },
    });

    const conPassword = admins.filter((a) => (a.passwordAdmin ?? "").length > 0);

    if (conPassword.length === 0) {
      return { ok: false, motivo: "sinConfigurar" } as const;
    }

    const coincide = conPassword.find((a) => a.passwordAdmin === password.trim());

    if (!coincide) {
      return { ok: false, motivo: "incorrecta" } as const;
    }

    return {
      ok: true,
      admin: {
        id: coincide.id,
        nombre: `${coincide.nombre} ${coincide.apellido}`.trim(),
      },
    } as const;
  }

  /** ¿Hay alguna contraseña de administrador configurada? */
  static async hayPasswordAdminConfigurada() {
    const conteo = await db.usuario.count({
      where: {
        rol: { nombre: "Admin" },
        estado: true,
        passwordAdmin: { not: null },
      },
    });
    return conteo > 0;
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
