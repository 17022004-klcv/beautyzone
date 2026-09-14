import { NextResponse } from "next/server";
import { db } from "@/src/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

// GET: Obtener datos del perfil del usuario
export async function GET(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const userId = Number(id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "ID de usuario inválido" },
        { status: 400 },
      );
    }

    const usuario = await db.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        correo: true,
        telefono: true,
        estado: true,
        createdAt: true,
        rol: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(usuario);
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    return NextResponse.json(
      { error: "Error al obtener datos del perfil" },
      { status: 500 },
    );
  }
}

// PUT: Actualizar datos personales y/o contraseña
export async function PUT(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const userId = Number(id);
    const body = await req.json();

    const {
      nombre,
      apellido,
      correo,
      telefono,
      passwordActual,
      nuevaPassword,
    } = body;

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "ID de usuario inválido" },
        { status: 400 },
      );
    }

    // 1. Obtener usuario actual para validar contraseña previa (si intenta cambiarla)
    const usuarioActual = await db.usuario.findUnique({
      where: { id: userId },
    });

    if (!usuarioActual) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    // 2. Si se proporciona contraseña nueva, validar la contraseña actual
    let passwordFinal = usuarioActual.password;
    if (nuevaPassword && nuevaPassword.trim() !== "") {
      if (!passwordActual || passwordActual !== usuarioActual.password) {
        return NextResponse.json(
          { error: "La contraseña actual es incorrecta" },
          { status: 400 },
        );
      }
      passwordFinal = nuevaPassword;
    }

    // 3. Validar duplicidad de correo si cambió su correo
    if (correo && correo !== usuarioActual.correo) {
      const existeCorreo = await db.usuario.findUnique({
        where: { correo },
      });
      if (existeCorreo) {
        return NextResponse.json(
          {
            error: "El correo electrónico ya está registrado por otro usuario",
          },
          { status: 400 },
        );
      }
    }

    // 4. Actualizar usuario
    const usuarioActualizado = await db.usuario.update({
      where: { id: userId },
      data: {
        nombre: nombre?.trim() ?? usuarioActual.nombre,
        apellido: apellido?.trim() ?? usuarioActual.apellido,
        correo: correo?.trim() ?? usuarioActual.correo,
        telefono: telefono?.trim() ?? usuarioActual.telefono,
        password: passwordFinal,
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        correo: true,
        telefono: true,
        estado: true,
        rol: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    return NextResponse.json(usuarioActualizado);
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar la información del perfil" },
      { status: 500 },
    );
  }
}
