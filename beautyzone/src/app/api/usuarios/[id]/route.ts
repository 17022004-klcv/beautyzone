import { NextResponse } from "next/server";
import { UsuarioService } from "@/src/app/services/usuario.service";
import {
  BitacoraService,
  contextoDesdeRequest,
} from "@/src/app/services/bitacora.service";

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

    await BitacoraService.registrar({
      accion: "ACTUALIZO",
      entidad: "Usuario",
      entidadId: id,
      descripcion: `Actualizó al usuario ${usuarioActualizado.nombre} ${usuarioActualizado.apellido} (${usuarioActualizado.correo})`,
      datos: {
        campos: Object.keys(body).filter((c) => c !== "password" && c !== "passwordAdmin"),
        correo: usuarioActualizado.correo,
        idRol: usuarioActualizado.idrol,
        estado: usuarioActualizado.estado,
        cambioPassword: Boolean(body.password),
        cambioPasswordAdmin: body.passwordAdmin === "" ? "eliminada" : Boolean(body.passwordAdmin),
      },
      ...contextoDesdeRequest(request, `/api/usuarios/${id}`),
    });

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

    await BitacoraService.registrar({
      accion: "DESACTIVO",
      entidad: "Usuario",
      entidadId: id,
      descripcion: `Desactivó al usuario ${usuarioDesactivado.nombre} ${usuarioDesactivado.apellido} (${usuarioDesactivado.correo})`,
      ...contextoDesdeRequest(request, `/api/usuarios/${id}`),
    });

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
