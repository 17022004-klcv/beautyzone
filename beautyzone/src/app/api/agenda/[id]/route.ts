import { NextResponse } from "next/server";
import { db } from "@/src/lib/db";
import { getCitaPorId } from "@/src/app/services/agenda.service";
import {
  BitacoraService,
  contextoDesdeRequest,
} from "@/src/app/services/bitacora.service";
import { ESTADOS_CITA, type DetalleCitaInput } from "@/src/app/types/agenda";

interface Params {
  params: Promise<{ id: string }>;
}

// GET: Ficha completa de una cita (cliente, servicios, estilistas, estado).
export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const citaId = Number(id);

    if (isNaN(citaId) || citaId <= 0) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const cita = await getCitaPorId(citaId);
    if (!cita) {
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });
    }

    return NextResponse.json(cita);
  } catch (error) {
    console.error("Error al obtener la cita:", error);
    return NextResponse.json(
      { error: "Error interno al obtener la cita" },
      { status: 500 },
    );
  }
}

// PUT: Actualiza los datos de la cita. Solo se tocan los campos enviados.
export async function PUT(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const citaId = Number(id);

    if (isNaN(citaId) || citaId <= 0) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await req.json();
    const antes = await getCitaPorId(citaId);
    if (!antes) {
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });
    }

    const cambios: Record<string, unknown> = {};

    if (body.estado !== undefined) {
      if (!ESTADOS_CITA.includes(body.estado)) {
        return NextResponse.json(
          { error: "El estado indicado no es válido" },
          { status: 400 },
        );
      }
      cambios.estado = body.estado;
    }

    if (body.fecha !== undefined) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(body.fecha)) {
        return NextResponse.json(
          { error: "La fecha no tiene el formato esperado" },
          { status: 400 },
        );
      }
      cambios.fecha = new Date(`${body.fecha}T00:00:00.000Z`);
    }

    if (body.horaInicio !== undefined) {
      cambios.horaInicio = body.horaInicio;
    }

    if (body.notas !== undefined) {
      cambios.notas = body.notas || null;
    }

    if (body.idcliente !== undefined) {
      const cliente = await db.usuario.findFirst({
        where: { id: Number(body.idcliente), estado: true },
        select: { id: true },
      });
      if (!cliente) {
        return NextResponse.json(
          { error: "El cliente seleccionado no existe" },
          { status: 404 },
        );
      }
      cambios.idcliente = Number(body.idcliente);
    }

    let detallesNuevos: DetalleCitaInput[] | null = null;
    if (Array.isArray(body.detalles)) {
      const validos: DetalleCitaInput[] = body.detalles.filter(
        (d: DetalleCitaInput) => d && Number(d.idservicio) > 0,
      );
      if (validos.length === 0) {
        return NextResponse.json(
          { error: "La cita debe tener al menos un servicio" },
          { status: 400 },
        );
      }
      detallesNuevos = validos;
    }

    // Los servicios se reemplazan por completo: se borra lo anterior y se
    // vuelve a capturar el precio vigente de cada uno.
    const serviciosReemplazables = detallesNuevos;
    const actualizada = await db.$transaction(async (tx) => {
      if (serviciosReemplazables) {
        const ids = [
          ...new Set(serviciosReemplazables.map((d) => Number(d.idservicio))),
        ];
        const servicios = await tx.servicio.findMany({
          where: { id: { in: ids } },
          select: { id: true, precio: true },
        });
        if (servicios.length !== ids.length) {
          throw new Error("SERVICIO_INEXISTENTE");
        }
        const precioPorId = new Map(servicios.map((s) => [s.id, s.precio]));

        await tx.detalleCita.deleteMany({ where: { idcita: citaId } });
        await tx.detalleCita.createMany({
          data: serviciosReemplazables.map((d) => ({
            idcita: citaId,
            idservicio: Number(d.idservicio),
            idestilista: Number(d.idestilista) || Number(d.idservicio),
            precioHistorico: precioPorId.get(Number(d.idservicio)) ?? 0,
          })),
        });
      }

      return tx.cita.update({ where: { id: citaId }, data: cambios });
    });

    const despues = await getCitaPorId(actualizada.id);

    await BitacoraService.registrar({
      accion: "ACTUALIZO",
      entidad: "Cita",
      entidadId: citaId,
      descripcion: `Actualizó la cita #${citaId}${
        cambios.estado ? ` al estado ${cambios.estado}` : ""
      }`,
      datos: {
        antes: {
          estado: antes.estado,
          fecha: antes.fecha,
          horaInicio: antes.hora,
          clienteId: antes.clienteId,
          notas: antes.notas,
          servicios: antes.detalles.map((d) => ({
            idservicio: d.idservicio,
            idestilista: d.idestilista,
          })),
        },
        despues: {
          estado: despues?.estado,
          fecha: despues?.fecha,
          horaInicio: despues?.hora,
          clienteId: despues?.clienteId,
          notas: despues?.notas,
          servicios: despues?.detalles.map((d) => ({
            idservicio: d.idservicio,
            idestilista: d.idestilista,
          })),
        },
      },
      ...contextoDesdeRequest(req, `/api/agenda/${citaId}`),
    });

    return NextResponse.json(despues);
  } catch (error) {
    if (error instanceof Error && error.message === "SERVICIO_INEXISTENTE") {
      return NextResponse.json(
        { error: "Uno de los servicios seleccionados no existe" },
        { status: 404 },
      );
    }
    console.error("Error al actualizar la cita:", error);
    return NextResponse.json(
      { error: "Error interno al actualizar la cita" },
      { status: 500 },
    );
  }
}
