import { NextResponse } from "next/server";
import { db } from "@/src/lib/db";
import {
  calcularTotalEfectivo,
  normalizarConteo,
  type ClaveDenominacion,
} from "@/src/lib/cajaDenominaciones";
import { calcularTotales, redondear2 } from "@/src/lib/cajaTotales";
import { UsuarioService } from "@/src/app/services/usuario.service";
import {
  BitacoraService,
  contextoDesdeRequest,
} from "@/src/app/services/bitacora.service";
import type { ConteoDenominaciones } from "@/src/app/types/arqueo";

const CONTEO_VACIO = normalizarConteo(null);

// GET: turnos cerrados con su conteo de efectivo
export async function GET() {
  try {
    const turnos = await db.cajaTurno.findMany({
      where: { estado: "CERRADA" },
      include: {
        cajero: { select: { nombre: true, apellido: true } },
        ventas: {
          where: { estado: "PAGADO" },
          select: { total: true, metodoPago: true },
        },
        arqueoDenominacion: true,
      },
      orderBy: { fechaCierre: "desc" },
    });

    const lista = turnos.map((turno) => {
      const totales = calcularTotales(Number(turno.montoApertura), turno.ventas);
      const arq = turno.arqueoDenominacion;
      const conteo = { ...CONTEO_VACIO } as ConteoDenominaciones;

      if (arq) {
        for (const clave of Object.keys(arq)) {
          if (clave in CONTEO_VACIO) {
            conteo[clave as ClaveDenominacion] = Number(
              (arq as Record<string, unknown>)[clave],
            );
          }
        }
      }

      const totalEfectivoContado = arq ? Number(arq.totalEfectivoContado) : 0;

      // El POS cierra sin contar y deja montoCierreReal = montoCierreEsperado,
      // así que un conteo guardado se reconoce por esto:
      //  - el contado es > 0  -> se contaron billetes/monedas
      //  - el real difiere del esperado -> se contó 0 y todo es faltante
      const conteoRealizado =
        arq !== null &&
        (totalEfectivoContado > 0 ||
          Number(turno.montoCierreReal ?? 0) !== totales.montoEsperado);

      return {
        id: turno.id,
        nombreCaja: turno.nombreCaja,
        cajero: `${turno.cajero.nombre} ${turno.cajero.apellido}`.trim(),
        fechaApertura: turno.fechaApertura.toISOString(),
        fechaCierre: turno.fechaCierre?.toISOString() ?? null,
        totales,
        conteo,
        totalTarjeta: arq ? Number(arq.totalTarjeta) : 0,
        totalTransferencia: arq ? Number(arq.totalTransferencia) : 0,
        totalEfectivoContado,
        diferencia: conteoRealizado ? Number(turno.diferencia ?? 0) : 0,
        estadoConteo: conteoRealizado ? "REALIZADO" : "PENDIENTE",
      };
    });

    return NextResponse.json({ turnos: lista });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error al cargar los arqueos",
      },
      { status: 500 },
    );
  }
}

// POST: registrar el conteo físico de un turno ya cerrado
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      idcajaTurno,
      denominaciones,
      totalTarjeta,
      totalTransferencia,
      passwordAdmin,
    } = body;

    if (!idcajaTurno) {
      return NextResponse.json(
        { error: "Falta el turno de caja a arquear" },
        { status: 400 },
      );
    }

    // El total contado se recalcula aquí desde los billetes: el cliente nunca
    // puede inyectar el monto que dice haber contado. Un total de 0 también es
    // válido (cajón vacío = faltante total) y se archiva igual: el dialogo de
    // confirmacion muestra el total antes de guardar y el guardado es un
    // upsert, asi que un error se corrige recontando.
    const conteo = normalizarConteo(denominaciones);
    const totalEfectivoContado = calcularTotalEfectivo(conteo);

    const tarjeta = Number(totalTarjeta ?? 0) || 0;
    const transferencia = Number(totalTransferencia ?? 0) || 0;

    if (tarjeta < 0 || transferencia < 0) {
      return NextResponse.json(
        {
          error: "Los totales de tarjeta y transferencia no pueden ser negativos.",
        },
        { status: 400 },
      );
    }

    const turno = await db.cajaTurno.findUnique({
      where: { id: Number(idcajaTurno) },
      include: {
        ventas: {
          where: { estado: "PAGADO" },
          select: { total: true, metodoPago: true },
        },
      },
    });

    if (!turno || turno.estado !== "CERRADA") {
      return NextResponse.json(
        { error: "El turno de caja no existe o sigue abierto." },
        { status: 400 },
      );
    }

    const totales = calcularTotales(Number(turno.montoApertura), turno.ventas);
    const diferencia = redondear2(totalEfectivoContado - totales.montoEsperado);

    // Corregir un arqueo ya archivado es una operación sensible: el primer
    // conteo de un turno lo hace quien cerró la caja, pero para sobrescribirlo
    // hace falta la contraseña de administrador. La app no tiene sesión, así que
    // se revalida acá y no en el cliente.
    const yaArqueado = await db.arqueoDenominacion.findUnique({
      where: { idcajaTurno: turno.id },
      select: { totalEfectivoContado: true },
    });

    const conteoPrevio = yaArqueado ? Number(yaArqueado.totalEfectivoContado) : 0;
    const correcting =
      yaArqueado !== null &&
      (conteoPrevio > 0 ||
        Number(turno.montoCierreReal ?? 0) !== totales.montoEsperado);

    let adminAutorizado: { id: number; nombre: string } | undefined;

    if (correcting) {
      const autorizacion = await UsuarioService.verificarPasswordAdmin(
        typeof passwordAdmin === "string" ? passwordAdmin : "",
      );

      if (!autorizacion.ok) {
        return NextResponse.json(
          {
            error:
              autorizacion.motivo === "sinConfigurar"
                ? "Este arqueo ya fue guardado. Para corregirlo hace falta la contrase��a de administrador, y ningǧn administrador tiene una asignada. Configǧrala en Usuarios."
                : "La contrase��a de administrador no es correcta.",
          },
          { status: autorizacion.motivo === "sinConfigurar" ? 409 : 401 },
        );
      }

      adminAutorizado = autorizacion.admin;
    }

    await db.$transaction(async (tx) => {
      await tx.arqueoDenominacion.upsert({
        where: { idcajaTurno: turno.id },
        create: {
          idcajaTurno: turno.id,
          ...conteo,
          totalTarjeta: tarjeta,
          totalTransferencia: transferencia,
          totalEfectivoContado,
        },
        update: {
          ...conteo,
          totalTarjeta: tarjeta,
          totalTransferencia: transferencia,
          totalEfectivoContado,
        },
      });

      await tx.cajaTurno.update({
        where: { id: turno.id },
        data: { montoCierreReal: totalEfectivoContado, diferencia },
      });
    });

    await BitacoraService.registrar({
      accion: correcting ? "CORRIGIO_ARQUEO" : "ARQUEO",
      entidad: "Arqueo",
      entidadId: turno.id,
      descripcion: correcting
        ? `Corrigió el arqueo de ${turno.nombreCaja}: contado ${totalEfectivoContado}, diferencia ${diferencia}`
        : `Registró el arqueo de ${turno.nombreCaja}: contado ${totalEfectivoContado}, diferencia ${diferencia}`,
      // Cuando se corrige, quien autoriza es el admin de la contraseña, no la
      // sesión del navegador.
      usuario: adminAutorizado
        ? { id: adminAutorizado.id, rol: "Admin", nombre: adminAutorizado.nombre }
        : undefined,
      datos: {
        idCajaTurno: turno.id,
        nombreCaja: turno.nombreCaja,
        montoEsperado: totales.montoEsperado,
        totalEfectivoContado,
        totalTarjeta: tarjeta,
        totalTransferencia: transferencia,
        diferencia,
        denominaciones: conteo,
        correccion: correcting,
      },
      ...contextoDesdeRequest(request, "/api/arqueo"),
    });

    return NextResponse.json({
      message: "Conteo de efectivo guardado",
      resumen: {
        idcajaTurno: turno.id,
        montoEsperado: totales.montoEsperado,
        totalEfectivoContado,
        totalTarjeta: tarjeta,
        totalTransferencia: transferencia,
        diferencia,
        estadoConteo: "REALIZADO",
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error al guardar el conteo",
      },
      { status: 500 },
    );
  }
}
