import { NextResponse } from "next/server";
import { db } from "@/src/lib/db";

export async function GET() {
  try {
    const [servicios, productos] = await Promise.all([
      db.servicio.findMany({
        where: { estado: true },
        include: { categoria: true },
      }),
      db.producto.findMany({
        where: { estado: true, stock: { gt: 0 } },
        include: { categoria: true },
      }),
    ]);

    const catalogoServicios = servicios.map((s) => ({
      id: s.id,
      tipo: "SERVICIO" as const,
      nombre: s.nombre,
      categoria: s.categoria.nombre,
      precio: Number(s.precio),
    }));

    const catalogoProductos = productos.map((p) => ({
      id: p.id,
      tipo: "PRODUCTO" as const,
      nombre: p.nombre,
      categoria: p.categoria.nombre,
      precio: Number(p.precio),
      stock: p.stock,
    }));

    return NextResponse.json([...catalogoServicios, ...catalogoProductos]);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
