"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle2,
  Eye,
  Loader2,
  Pencil,
  Plus,
  ShieldCheck,
} from "lucide-react";
import Button from "@/src/components/ui/Button";
import DataTable from "@/src/components/ui/DataTable";
import DialogoPos, {
  type LineaDetalle,
  type TipoDialogo,
} from "@/src/components/ui/DialogoPos";
import ModalDetalleArqueo from "@/src/components/arqueo/ModalDetalleArqueo";
import ModalPasswordAdmin from "@/src/components/arqueo/ModalPasswordAdmin";
import VistaCierreAdmin from "@/src/components/arqueo/VistaCierreAdmin";
import VistaConteo, {
  conteoVacio,
} from "@/src/components/arqueo/VistaConteo";
import VistaReportes from "@/src/components/arqueo/VistaReportes";
import { ArqueoService } from "@/src/app/services/arqueo.service";
import { CierreAdminService as CierreAdminApi } from "@/src/app/services/cierreAdmin.client";
import { calcularTotalEfectivo } from "@/src/lib/cajaDenominaciones";
import type { ArqueoTurno, ConteoDenominaciones } from "@/src/app/types/arqueo";
import type { ResumenCierreAdmin } from "@/src/app/types/cierreAdmin";

type VistaArqueo = "historial" | "reportes" | "conteo" | "cierreAdmin";
type EstadoArqueo = "OK" | "FALTANTE" | "SOBRANTE" | "PENDIENTE";

interface FilaHistorial {
  id: number;
  caja: string;
  recepcionista: string;
  fecha: string;
  facturado: number;
  efectivo: number;
  diferencia: number;
  estado: EstadoArqueo;
  arqueado: boolean;
  turno: ArqueoTurno;
}

const money = (valor: number) => `$${valor.toFixed(2)}`;

function estadoArqueo(turno: ArqueoTurno): EstadoArqueo {
  if (turno.estadoConteo === "PENDIENTE") return "PENDIENTE";
  if (turno.diferencia < 0) return "FALTANTE";
  if (turno.diferencia > 0) return "SOBRANTE";
  return "OK";
}

export default function ArqueoPage() {
  const [vista, setVista] = useState<VistaArqueo>("historial");
  const [turnos, setTurnos] = useState<ArqueoTurno[]>([]);
  const [cargando, setCargando] = useState(true);

  // Conteo por turno
  const [turnoId, setTurnoId] = useState<number | null>(null);
  const [conteo, setConteo] = useState<ConteoDenominaciones>(conteoVacio);
  const [tarjeta, setTarjeta] = useState("");
  const [transferencia, setTransferencia] = useState("");
  const [guardando, setGuardando] = useState(false);

  // Autorización del PIN de administrador
  const [pinAdmin, setPinAdmin] = useState<string | null>(null);
  const [pidiendoPassword, setPidiendoPassword] = useState(false);
  const [motivoPassword, setMotivoPassword] = useState(
    "Ingresa el PIN de administrador para continuar.",
  );
  const [accionPendiente, setAccionPendiente] = useState<
    ((pin: string) => void | Promise<void>) | null
  >(null);

  // Detalle (solo lectura)
  const [detalle, setDetalle] = useState<FilaHistorial | null>(null);

  // Cierre administrativo
  const [cierreAdmin, setCierreAdmin] = useState<ResumenCierreAdmin | null>(
    null,
  );
  const [cargandoCierre, setCargandoCierre] = useState(false);

  const [dialogo, setDialogo] = useState<{
    abierto: boolean;
    tipo: TipoDialogo;
    titulo: string;
    mensaje?: string;
    detalle?: LineaDetalle[];
  }>({ abierto: false, tipo: "exito", titulo: "" });

  const mostrar = (
    tipo: TipoDialogo,
    titulo: string,
    mensaje?: string,
    detalle?: LineaDetalle[],
  ) => setDialogo({ abierto: true, tipo, titulo, mensaje, detalle });

  const cargarTurnos = useCallback(async () => {
    try {
      setTurnos(await ArqueoService.listarTurnos());
    } catch (err: unknown) {
      mostrar(
        "error",
        "No se pudieron cargar los turnos",
        err instanceof Error ? err.message : "Intenta de nuevo en un momento.",
      );
    } finally {
      setCargando(false);
    }
  }, []);

  const cargarCierreAdmin = useCallback(async () => {
    setCargandoCierre(true);
    try {
      setCierreAdmin(await CierreAdminApi.listarResumen());
    } catch (err: unknown) {
      mostrar(
        "error",
        "No se pudo cargar el cierre administrativo",
        err instanceof Error ? err.message : "Intenta de nuevo en un momento.",
      );
    } finally {
      setCargandoCierre(false);
    }
  }, []);

  useEffect(() => {
    void cargarTurnos();
  }, [cargarTurnos]);

  const turnoActivo = useMemo(
    () => turnos.find((t) => t.id === turnoId) ?? null,
    [turnos, turnoId],
  );

  const totalContado = useMemo(() => calcularTotalEfectivo(conteo), [conteo]);

  // -------------------------------------------------------------------
  // Autorización con PIN de administrador
  // -------------------------------------------------------------------
  const pedirPassword = (
    motivo: string,
    accion: (pin: string) => void | Promise<void>,
  ) => {
    setMotivoPassword(motivo);
    setAccionPendiente(() => accion);
    setPidiendoPassword(true);
  };

  const ejecutarConPassword = (pin: string) => {
    setPidiendoPassword(false);
    setPinAdmin(pin);
    const accion = accionPendiente;
    setAccionPendiente(null);
    if (accion) void accion(pin);
  };

  const cerrarModalPassword = () => {
    setPidiendoPassword(false);
    setAccionPendiente(null);
  };

  // -------------------------------------------------------------------
  // Acciones
  // -------------------------------------------------------------------
  const guardarConteo = useCallback(
    async (pin: string | null) => {
      if (!turnoActivo) return;

      setGuardando(true);
      try {
        const respuesta = await ArqueoService.registrarConteo(
          turnoActivo.id,
          conteo,
          Number(tarjeta) || 0,
          Number(transferencia) || 0,
          pin ?? undefined,
        );

        await cargarTurnos();
        mostrar("exito", "Arqueo guardado", undefined, [
          { etiqueta: "Esperado", valor: money(respuesta.montoEsperado) },
          {
            etiqueta: "Contado",
            valor: money(respuesta.totalEfectivoContado),
            destacado: true,
          },
          {
            etiqueta: "Diferencia",
            valor: `${respuesta.diferencia > 0 ? "+" : ""}${money(respuesta.diferencia)}`,
          },
        ]);
        setVista("historial");
      } catch (err: unknown) {
        mostrar(
          "error",
          "No se pudo guardar el conteo",
          err instanceof Error ? err.message : "Intenta de nuevo.",
        );
      } finally {
        setGuardando(false);
      }
    },
    [turnoActivo, conteo, tarjeta, transferencia, cargarTurnos],
  );

  /** Pide el PIN solo si el arqueo ya fue archivado. */
  const confirmarGuardar = useCallback(() => {
    if (turnoActivo?.estadoConteo === "REALIZADO") {
      pedirPassword(
        "Confirma tu PIN de administrador para corregir este arqueo ya guardado.",
        (pin) => guardarConteo(pin),
      );
      return;
    }
    void guardarConteo(null);
  }, [turnoActivo, guardarConteo]);

  const abrirConteo = useCallback((turno: ArqueoTurno) => {
    setTurnoId(turno.id);
    setConteo({ ...turno.conteo });
    setTarjeta(String(turno.totalTarjeta || 0));
    setTransferencia(String(turno.totalTransferencia || 0));
    setVista("conteo");
  }, []);

  /** Editar un arqueo guardado pide el PIN de administrador. */
  const editarConteo = useCallback(
    (turno: ArqueoTurno) => {
      pedirPassword(
        "Confirma tu PIN de administrador para corregir este arqueo ya guardado.",
        () => abrirConteo(turno),
      );
    },
    [abrirConteo],
  );

  /** Entrar al cierre administrativo pide el PIN de administrador. */
  const abrirCierreAdmin = useCallback(() => {
    pedirPassword(
      "Ingresa el PIN de administrador para abrir el cierre administrativo del día.",
      () => {
        setVista("cierreAdmin");
        void cargarCierreAdmin();
      },
    );
  }, [cargarCierreAdmin]);

  // -------------------------------------------------------------------
  // Datos derivados
  // -------------------------------------------------------------------
  const historial = useMemo<FilaHistorial[]>(
    () =>
      turnos.map((t) => ({
        id: t.id,
        caja: t.nombreCaja,
        recepcionista: t.cajero,
        fecha: t.fechaCierre
          ? new Date(t.fechaCierre).toLocaleString("es-SV")
          : "—",
        facturado: t.totales.totalVendido,
        efectivo: t.totales.montoEsperado,
        diferencia: t.diferencia,
        estado: estadoArqueo(t),
        arqueado: t.estadoConteo === "REALIZADO",
        turno: t,
      })),
    [turnos],
  );

  // -------------------------------------------------------------------
  // Columnas de la tabla
  // -------------------------------------------------------------------
  const columnas = useMemo(
    () => [
      {
        header: "Caja",
        accessorKey: (fila: FilaHistorial) => (
          <span className="font-semibold text-[#32130E]">{fila.caja}</span>
        ),
      },
      {
        header: "Recepcionista",
        accessorKey: (fila: FilaHistorial) => (
          <span className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-[#32130E] text-[10px] font-bold text-white">
              {fila.recepcionista.charAt(0)}
            </span>
            <span className="text-[#7A5C55]">{fila.recepcionista}</span>
          </span>
        ),
      },
      {
        header: "Fecha & Hora",
        accessorKey: (fila: FilaHistorial) => (
          <span className="font-mono text-[#7A5C55]">{fila.fecha}</span>
        ),
      },
      {
        header: "Facturado",
        accessorKey: (fila: FilaHistorial) => (
          <span className="block text-right font-mono font-semibold text-[#32130E]">
            {money(fila.facturado)}
          </span>
        ),
      },
      {
        header: "Efectivo",
        accessorKey: (fila: FilaHistorial) => (
          <span className="block text-right font-mono font-semibold text-[#32130E]">
            {money(fila.efectivo)}
          </span>
        ),
      },
      {
        header: "Diferencia",
        accessorKey: (fila: FilaHistorial) => (
          <span
            className={`block text-right font-mono font-bold ${
              !fila.arqueado
                ? "text-[#D8C3B3]"
                : fila.diferencia < 0
                  ? "text-[#B83A3A]"
                  : fila.diferencia > 0
                    ? "text-[#1D4E89]"
                    : "text-[#2E6F40]"
            }`}
          >
            {fila.arqueado
              ? `${fila.diferencia > 0 ? "+" : ""}${money(fila.diferencia)}`
              : "—"}
          </span>
        ),
      },
      {
        header: "Estado",
        accessorKey: (fila: FilaHistorial) => <Badge estado={fila.estado} />,
      },
      {
        header: "Acciones",
        accessorKey: (fila: FilaHistorial) => (
          <div className="flex flex-wrap gap-1.5">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDetalle(fila)}
              title="Ver el desglose de billetes y monedas"
            >
              <Eye className="w-3.5 h-3.5" />
              Ver
            </Button>

            {fila.arqueado ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => editarConteo(fila.turno)}
                title="Corregir un arqueo guardado pide el PIN de administrador"
              >
                <Pencil className="w-3.5 h-3.5" />
                Editar
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => abrirConteo(fila.turno)}
                title="Contar el efectivo de esta caja"
              >
                <Plus className="w-3.5 h-3.5" />
                Hacer arqueo
              </Button>
            )}
          </div>
        ),
      },
    ],
    [abrirConteo, editarConteo],
  );

  return (
    <div className="min-h-screen p-8">
      {vista === "historial" && (
        <div className="space-y-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="font-serif text-2xl font-bold text-[#32130E]">
                Arqueos de caja
              </h1>
              <p className="text-xs font-medium text-[#7A5C55]">
                Historial general de turnos, cierres de caja y descalces de
                saldo.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setVista("reportes")}>
                <BarChart3 className="w-3.5 h-3.5" />
                Reportes
              </Button>
              <Button onClick={abrirCierreAdmin}>
                <ShieldCheck className="w-3.5 h-3.5" />
                Cierre administrativo
              </Button>
            </div>
          </div>

          {cargando ? (
            <div className="grid min-h-64 place-items-center">
              <Loader2 className="w-5 h-5 animate-spin text-[#7A5C55]" />
            </div>
          ) : (
            <DataTable columns={columnas} data={historial} pageSize={10} />
          )}
        </div>
      )}

      {vista === "reportes" && (
        <VistaReportes turnos={turnos} onVolver={() => setVista("historial")} />
      )}

      {vista === "conteo" && turnoActivo && (
        <VistaConteo
          turno={turnoActivo}
          conteo={conteo}
          totalContado={totalContado}
          tarjeta={tarjeta}
          transferencia={transferencia}
          guardando={guardando}
          onCambioConteo={(clave, valor) =>
            setConteo((prev) => ({
              ...prev,
              [clave]: Math.max(0, Math.trunc(Number(valor) || 0)),
            }))
          }
          onLimpiarConteo={() => setConteo(conteoVacio())}
          onCambioTarjeta={setTarjeta}
          onCambioTransferencia={setTransferencia}
          onGuardar={confirmarGuardar}
          onVolver={() => setVista("historial")}
        />
      )}

      {vista === "cierreAdmin" && pinAdmin && (
        <VistaCierreAdmin
          resumen={cierreAdmin}
          cargando={cargandoCierre}
          pin={pinAdmin}
          onPedirPin={pedirPassword}
          onVolver={() => setVista("historial")}
          onRecargar={cargarCierreAdmin}
        />
      )}

      {detalle && (
        <ModalDetalleArqueo
          abierto
          onCerrar={() => setDetalle(null)}
          conteo={detalle.turno.conteo}
          totalContado={detalle.turno.totalEfectivoContado}
          totalTarjeta={detalle.turno.totalTarjeta}
          totalTransferencia={detalle.turno.totalTransferencia}
          montoEsperado={detalle.turno.totales.montoEsperado}
          diferencia={detalle.turno.diferencia}
          nombreCaja={detalle.caja}
          cajero={detalle.recepcionista}
          fechaCierre={detalle.turno.fechaCierre}
          estadoConteo={detalle.turno.estadoConteo}
        />
      )}

      <ModalPasswordAdmin
        abierto={pidiendoPassword}
        titulo="PIN de administrador"
        descripcion={motivoPassword}
        onAutorizado={ejecutarConPassword}
        onCerrar={cerrarModalPassword}
      />

      <DialogoPos
        abierto={dialogo.abierto}
        tipo={dialogo.tipo}
        titulo={dialogo.titulo}
        mensaje={dialogo.mensaje}
        detalle={dialogo.detalle}
        onCerrar={() => setDialogo((d) => ({ ...d, abierto: false }))}
      />
    </div>
  );
}

const ESTILOS_BADGE = {
  OK: "border-[#2E6F40]/25 bg-[#E7F0E9] text-[#2E6F40]",
  FALTANTE: "border-[#B83A3A]/25 bg-[#F8E9E9] text-[#B83A3A]",
  SOBRANTE: "border-[#1D4E89]/25 bg-[#E4EDF6] text-[#1D4E89]",
  PENDIENTE: "border-[#C07D2B]/25 bg-[#FBF1E1] text-[#C07D2B]",
} as const;

const ICONOS_BADGE = {
  OK: CheckCircle2,
  FALTANTE: AlertTriangle,
  SOBRANTE: AlertTriangle,
  PENDIENTE: Calendar,
} as const;

function Badge({ estado }: { estado: EstadoArqueo }) {
  const Icono = ICONOS_BADGE[estado];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${ESTILOS_BADGE[estado]}`}
    >
      <Icono className="w-3 h-3" />
      {estado}
    </span>
  );
}
