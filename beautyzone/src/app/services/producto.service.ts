import { db } from "@/src/lib/db"; // Ajusta la ruta a tu cliente de Prisma
import {
  CreateProductoDTO,
  CreateCategoriaDTO,
  UpdateProductoDTO,
  UpdateCategoriaDTO,
} from "@/src/app/types/producto";

export class ErrorOperacion extends Error {
  constructor(
    public readonly status: number,
    mensaje: string,
  ) {
    super(mensaje);
    this.name = "ErrorOperacion";
  }
}

export class ProductoService {
  // --- PRODUCTOS ---
  static async obtenerProductos(incluirInactivos = false) {
    return await db.producto.findMany({
      where: incluirInactivos ? {} : { estado: true },
      include: {
        categoria: {
          select: { id: true, nombre: true },
        },
      },
      orderBy: { nombre: "asc" },
    });
  }

  static async crearProducto(data: CreateProductoDTO) {
    return await db.producto.create({
      data: {
        idcategoria: Number(data.idcategoria),
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        precio: data.precio,
        stock: Number(data.stock),
        stockMinimo: data.stockMinimo ? Number(data.stockMinimo) : 5,
      },
    });
  }

  static async actualizarProducto(id: number, data: UpdateProductoDTO) {
    return await db.producto.update({
      where: { id },
      data: {
        ...(data.idcategoria !== undefined
          ? { idcategoria: Number(data.idcategoria) }
          : {}),
        ...(data.nombre !== undefined ? { nombre: data.nombre } : {}),
        ...(data.descripcion !== undefined
          ? { descripcion: data.descripcion || null }
          : {}),
        ...(data.precio !== undefined ? { precio: data.precio } : {}),
        ...(data.stock !== undefined ? { stock: Number(data.stock) } : {}),
        ...(data.stockMinimo !== undefined
          ? {
              stockMinimo:
                data.stockMinimo === "" || data.stockMinimo === null
                  ? 5
                  : Number(data.stockMinimo),
            }
          : {}),
        ...(data.estado !== undefined ? { estado: Boolean(data.estado) } : {}),
      },
      include: {
        categoria: {
          select: { id: true, nombre: true },
        },
      },
    });
  }

  static async eliminarProducto(id: number) {
    const usos = await db.detalleVenta.count({
      where: { idproducto: id },
    });

    if (usos > 0) {
      throw new ErrorOperacion(
        409,
        `Este producto aparece en ${usos} venta(s) registrada(s). Desactívalo en lugar de eliminarlo para no romper el historial de caja.`,
      );
    }

    return await db.producto.delete({ where: { id } });
  }

  // --- CATEGORÍAS ---
  static async obtenerCategorias(
    tipo?: "PRODUCTO" | "SERVICIO",
    incluirInactivos = false,
  ) {
    return await db.categoria.findMany({
      where: {
        ...(tipo ? { tipo } : {}),
        ...(incluirInactivos ? {} : { estado: true }),
      },
      orderBy: { nombre: "asc" },
    });
  }

  static async crearCategoria(data: CreateCategoriaDTO) {
    return await db.categoria.create({
      data: {
        nombre: data.nombre,
        tipo: data.tipo,
      },
    });
  }

  static async actualizarCategoria(id: number, data: UpdateCategoriaDTO) {
    return await db.categoria.update({
      where: { id },
      data: {
        ...(data.nombre !== undefined ? { nombre: data.nombre } : {}),
        ...(data.tipo !== undefined ? { tipo: data.tipo } : {}),
        ...(data.estado !== undefined ? { estado: Boolean(data.estado) } : {}),
      },
    });
  }

  static async eliminarCategoria(id: number) {
    const [productos, servicios] = await Promise.all([
      db.producto.count({ where: { idcategoria: id } }),
      db.servicio.count({ where: { idcategoria: id } }),
    ]);

    if (productos > 0 || servicios > 0) {
      const detalle = [
        productos > 0 ? `${productos} producto(s)` : null,
        servicios > 0 ? `${servicios} servicio(s)` : null,
      ]
        .filter(Boolean)
        .join(" y ");

      throw new ErrorOperacion(
        409,
        `Esta categoría tiene ${detalle} asociado(s). Desactívala o muévelos de categoría antes de eliminarla.`,
      );
    }

    return await db.categoria.delete({ where: { id } });
  }
}
