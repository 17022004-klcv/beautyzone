import { NextResponse } from "next/server";
import { db } from "@/src/lib/db";

// GET: Obtener asistencias con filtros (Buscador por nombre, filtro tipo y filtro fecha)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const tipo = searchParams.get("tipo") || "";
    const fecha = searchParams.get("fecha") || "";

    // Construir filtro dinámico de Prisma
    const whereCondition: any = {};

    // 1. Filtro por Búsqueda de Nombre o Apellido del Empleado
    if (search.trim() !== "") {
      whereCondition.empleado = {
        OR: [
          { nombre: { contains: search, mode: "insensitive" } },
          { apellido: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    // 2. Filtro por Tipo de Registro (ENTRADA, SALIDA_ALMUERZO, ENTRADA_ALMUERZO, SALIDA)
    if (tipo.trim() !== "") {
      whereCondition.tipoRegistro = tipo;
    }

    // 3. Filtro por Fecha (Formato YYYY-MM-DD)
    if (fecha.trim() !== "") {
      const fechaObjeto = new Date(fecha);
      if (!isNaN(fechaObjeto.getTime())) {
        whereCondition.fecha = fechaObjeto;
      }
    }

    const asistencias = await db.asistencia.findMany({
      where: whereCondition,
      include: {
        empleado: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            correo: true,
            rol: {
              select: {
                nombre: true,
              },
            },
          },
        },
      },
      orderBy: [{ fecha: "desc" }, { id: "desc" }],
    });

    return NextResponse.json(asistencias);
  } catch (error) {
    console.error("Error al obtener asistencias:", error);
    return NextResponse.json(
      { error: "Error al obtener los registros de asistencia" },
      { status: 500 },
    );
  }
}

// POST: Registrar nueva asistencia
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { idempleado, tipoRegistro, fecha, hora } = body;

    if (!idempleado || !tipoRegistro) {
      return NextResponse.json(
        { error: "El empleado y el tipo de registro son obligatorios" },
        { status: 400 },
      );
    }

    // Obtener la hora y fecha local si no vienen en el body
    const ahora = new Date();

    // Fecha en formato Date sin horas (solo año-mes-día)
    const fechaFinal = fecha
      ? new Date(fecha)
      : new Date(ahora.toISOString().split("T")[0]);

    // Hora en formato HH:mm
    const horaFinal =
      hora ||
      ahora.toLocaleTimeString("es-SV", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

    const nuevaAsistencia = await db.asistencia.create({
      data: {
        idempleado: Number(idempleado),
        tipoRegistro: tipoRegistro,
        fecha: fechaFinal,
        hora: horaFinal,
      },
      include: {
        empleado: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
      },
    });

    return NextResponse.json(nuevaAsistencia, { status: 201 });
  } catch (error) {
    console.error("Error al registrar asistencia:", error);
    return NextResponse.json(
      { error: "No se pudo registrar la asistencia" },
      { status: 500 },
    );
  }
}
