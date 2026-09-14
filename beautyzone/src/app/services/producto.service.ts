import { db } from "@/src/lib/db"; // Ajusta la ruta a tu cliente de Prisma
import {
  CreateProductoDTO,
  CreateCategoriaDTO,
} from "@/src/app/types/producto";

export class ProductoService {
  // --- PRODUCTOS ---
  static async obtenerProductos() {
    return await db.producto.findMany({
      where: { estado: true },
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

  // --- CATEGORÍAS ---
  static async obtenerCategorias(tipo?: "PRODUCTO" | "SERVICIO") {
    return await db.categoria.findMany({
      where: {
        estado: true,
        ...(tipo ? { tipo } : {}),
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
}
