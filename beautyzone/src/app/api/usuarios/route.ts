import { NextResponse } from "next/server";
import { UsuarioService } from "@/src/app/services/usuario.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rolIdParam = searchParams.get("rolId");
    const estadoParam = searchParams.get("estado");

    const filtros: { rolId?: number; estado?: boolean } = {};

    if (rolIdParam) {
      filtros.rolId = Number(rolIdParam);
    }

    if (estadoParam !== null && estadoParam !== "") {
      filtros.estado = estadoParam === "true";
    }

    const usuarios = await UsuarioService.listarUsuarios(filtros);
    return NextResponse.json(usuarios);
  } catch (error: any) {
    console.error("❌ Error en GET /api/usuarios:", error);
    return NextResponse.json(
      { error: "Error interno al obtener usuarios", detalles: error?.message },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.nombre || !body.apellido || !body.correo || !body.idrol) {
      return NextResponse.json(
        { error: "Nombre, apellido, correo y rol son obligatorios." },
        { status: 400 },
      );
    }

    const nuevoUsuario = await UsuarioService.crearUsuario(body);
    return NextResponse.json(nuevoUsuario, { status: 201 });
  } catch (error: any) {
    console.error("❌ Error en POST /api/usuarios:", error);
    return NextResponse.json(
      { error: "Error al crear el usuario", detalles: error?.message },
      { status: 400 },
    );
  }
}
