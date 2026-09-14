import { NextResponse } from "next/server";
import { UsuarioService } from "@/src/app/services/usuario.service";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: rawId } = await params;
    const id = Number(rawId);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID de usuario inválido" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const usuarioActualizado = await UsuarioService.actualizarUsuario(id, body);

    return NextResponse.json(usuarioActualizado);
  } catch (error: any) {
    console.error(`❌ Error en PUT /api/usuarios:`, error);
    return NextResponse.json(
      { error: "Error al actualizar usuario", detalles: error?.message },
      { status: 400 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: rawId } = await params;
    const id = Number(rawId);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID de usuario inválido" },
        { status: 400 },
      );
    }

    const usuarioDesactivado = await UsuarioService.cambiarEstadoUsuario(
      id,
      false,
    );

    return NextResponse.json({
      message: "Usuario desactivado exitosamente",
      usuario: usuarioDesactivado,
    });
  } catch (error: any) {
    console.error(`❌ Error en DELETE /api/usuarios:`, error);
    return NextResponse.json(
      { error: "Error al desactivar usuario", detalles: error?.message },
      { status: 400 },
    );
  }
}
