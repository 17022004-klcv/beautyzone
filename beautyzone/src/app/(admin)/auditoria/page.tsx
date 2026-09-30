"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  ScrollText,
  Search,
  FilterX,
  Eye,
  Calendar,
  Globe,
  Monitor,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  User as UserIcon,
  Loader2,
} from "lucide-react";

import Table from "@/src/components/ui/DataTable";
import Modal from "@/src/components/ui/Modal";
import { BitacoraService } from "@/src/app/services/bitacora.client";
import type {
  BitacoraItem,
  BitacoraQuery,
  BitacoraRespuesta,
} from "@/src/app/types/bitacora";

const TAMANOS_PAGINA = [10, 25, 50, 100];

const ETIQUETAS_ACCION: Record<string, string> = {
  INICIO_SESION: "Inicio de sesión",
  CIERRE_SESION: "Cierre de sesión",
  CREO: "Creó",
  ACTUALIZO: "Actualizó",
  ELIMINO: "Eliminó",
  DESACTIVO: "Desactivó",
  REGISTRO: "Registró",
  AGENDO: "Agendó",
  ABRIO_CAJA: "Abrió caja",
  CERRO_CAJA: "Cerró caja",
  ARQUEO: "Arqueó",
  CORRIGIO_ARQUEO: "Corrigió arqueo",
  REGISTRO_VENTA: "Registró venta",
  GUARDO_CIERRE_ADMIN: "Guardó cierre admin",
  AGREGO_GASTO: "Agregó factura",
  ELIMINO_GASTO: "Eliminó factura",
  SUBIO_ARCHIVO: "Subió archivo",
  FALLO_AUTORIZACION: "Autorización fallida",
  GENERO_BACKUP: "Generó respaldo",
  FALLO_BACKUP: "Falló el respaldo",
};

function etiquetaAccion(accion: string): string {
  return ETIQUETAS_ACCION[accion] ?? accion.replace(/_/g, " ").toLowerCase();
}

const COLOR_ENTIDAD: Record<string, string> = {
  Usuario: "bg-[#EDE7FE] text-[#5B21B6] border-[#DDD6FE]",
  Rol: "bg-[#DBEAFE] text-[#1E40AF] border-[#BFDBFE]",
  Auth: "bg-[#FCE7F3] text-[#9D174D] border-[#FBCFE8]",
  Venta: "bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]",
  CajaTurno: "bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]",
  Arqueo: "bg-[#FFEDD5] text-[#9A3412] border-[#FED7AA]",
  CierreAdmin: "bg-[#CFFAFE] text-[#155E75] border-[#A5F3FC]",
  Gasto: "bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]",
  Servicio: "bg-[#E0E7FF] text-[#3730A3] border-[#C7D2FE]",
  Producto: "bg-[#E7E5E4] text-[#44403C] border-[#D6D3D1]",
  Categoria: "bg-[#F5F5F4] text-[#57534E] border-[#E7E5E4]",
  Cita: "bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]",
  Asistencia: "bg-[#E0F2FE] text-[#075985] border-[#BAE6FD]",
  Archivo: "bg-[#F3E8FF] text-[#6B21A8] border-[#E9D5FF]",
  Admin: "bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]",
  Backup: "bg-[#CFFAFE] text-[#155E75] border-[#A5F3FC]",
  BackupConfig: "bg-[#E0E7FF] text-[#3730A3] border-[#C7D2FE]",
};

function colorEntidad(entidad: string): string {
  return (
    COLOR_ENTIDAD[entidad] ?? "bg-[#F5F5F4] text-[#57534E] border-[#E7E5E4]"
  );
}

function fechaHora(iso: string): { fecha: string; hora: string } {
  const d = new Date(iso);
  return {
    fecha: d.toLocaleDateString("es-SV"),
    hora: d.toLocaleTimeString("es-SV", { hour12: false }),
  };
}

export default function AuditoriaView() {
  const [datos, setDatos] = useState<BitacoraRespuesta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [busquedaAplicada, setBusquedaAplicada] = useState("");
  const [accion, setAccion] = useState("");
  const [entidad, setEntidad] = useState("");
  const [resultado, setResultado] = useState("");
  const [idUsuario, setIdUsuario] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  // Paginación
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Detalle
  const [seleccionada, setSeleccionada] = useState<BitacoraItem | null>(null);

  // Evita que cada tecla disponga una consulta.
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);

    const query: BitacoraQuery = { page, pageSize };
    if (busquedaAplicada) query.busqueda = busquedaAplicada;
    if (accion) query.accion = accion;
    if (entidad) query.entidad = entidad;
    if (resultado) query.resultado = resultado;
    if (idUsuario) query.idUsuario = idUsuario;
    if (desde) query.desde = desde;
    if (hasta) query.hasta = hasta;

    try {
      setDatos(await BitacoraService.getBitacora(query));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar la bitácora");
    } finally {
      setLoading(false);
    }
  }, [
    page,
    pageSize,
    busquedaAplicada,
    accion,
    entidad,
    resultado,
    idUsuario,
    desde,
    hasta,
  ]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Cada cambio de filtro vuelve a la primera página: si no, se puede quedar
  // Showing a page that no longer has results.
  useEffect(() => {
    setPage(1);
  }, [
    busquedaAplicada,
    accion,
    entidad,
    resultado,
    idUsuario,
    desde,
    hasta,
    pageSize,
  ]);

  const onBusquedaChange = (valor: string) => {
    setBusqueda(valor);
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => {
      setBusquedaAplicada(valor);
    }, 350);
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setBusquedaAplicada("");
    setAccion("");
    setEntidad("");
    setResultado("");
    setIdUsuario("");
    setDesde("");
    setHasta("");
  };

  const hayFiltros =
    !!busquedaAplicada ||
    !!accion ||
    !!entidad ||
    !!resultado ||
    !!idUsuario ||
    !!desde ||
    !!hasta;

  const columnas = [
    {
      header: "Fecha y hora",
      accessorKey: (b: BitacoraItem) => {
        const { fecha, hora } = fechaHora(b.fecha);
        return (
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-[#32130E] whitespace-nowrap">
              {fecha}
            </span>
            <span className="font-mono text-[11px] text-[#7A5C55]">{hora}</span>
          </div>
        );
      },
    },
    {
      header: "Usuario",
      accessorKey: (b: BitacoraItem) =>
        b.usuario ? (
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#32130E] text-[#F5EBE1] flex-shrink-0">
              <UserIcon className="w-3 h-3" />
            </span>
            <span className="font-bold text-[#32130E] whitespace-nowrap">
              {b.usuario.nombre}
            </span>
          </div>
        ) : (
          <span className="text-[11px] italic text-[#A0847B]">
            Sin atribuir
          </span>
        ),
    },
    {
      header: "Acción",
      accessorKey: (b: BitacoraItem) => (
        <span className="font-bold text-[#32130E] whitespace-nowrap">
          {etiquetaAccion(b.accion)}
        </span>
      ),
    },
    {
      header: "Entidad",
      accessorKey: (b: BitacoraItem) => (
        <span
          className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border whitespace-nowrap ${colorEntidad(
            b.entidad,
          )}`}
        >
          {b.entidad}
        </span>
      ),
    },
    {
      header: "Descripción",
      accessorKey: (b: BitacoraItem) => (
        <span className="text-[#6E554F] block max-w-md">{b.descripcion}</span>
      ),
    },
    {
      header: "IP",
      accessorKey: (b: BitacoraItem) => (
        <span className="font-mono text-[11px] text-[#7A5C55] whitespace-nowrap">
          {b.ip ?? "—"}
        </span>
      ),
    },
    {
      header: "Resultado",
      accessorKey: (b: BitacoraItem) =>
        b.resultado === "EXITO" ? (
          <span className="flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full border bg-[#DCFCE7] text-[#166534] border-[#BBF7D0] whitespace-nowrap">
            <ShieldCheck className="w-3 h-3" />
            Éxito
          </span>
        ) : (
          <span className="flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full border bg-[#FEE2E2] text-[#991B1B] border-[#FECACA] whitespace-nowrap">
            <ShieldAlert className="w-3 h-3" />
            Fallo
          </span>
        ),
    },
    {
      header: "",
      accessorKey: (b: BitacoraItem) => (
        <div className="flex items-center justify-end">
          <button
            onClick={() => setSeleccionada(b)}
            className="p-1.5 text-[#7A5C55] hover:text-[#32130E] hover:bg-white/80 rounded-xl transition border border-transparent hover:border-white/80 shadow-2xs cursor-pointer"
            title="Ver detalle"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const entradas = datos?.entradas ?? [];
  const total = datos?.total ?? 0;
  const totalPaginas = datos?.totalPaginas ?? 1;
  const inicio = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const fin = Math.min(page * pageSize, total);

  return (
    <div className="space-y-6 p-6">
      {/* CABECERA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#32130E] flex items-center gap-2.5">
            <ScrollText className="w-6 h-6" />
            Bitácora de Auditoría
          </h1>
          <p className="text-xs font-medium text-[#7A5C55] mt-1">
            Registro de todas las escrituras y accesos al sistema: quién hizo
            qué, cuándo, desde dónde.
          </p>
        </div>
      </div>

      {/* FILTROS */}
      <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/80 shadow-[0_4px_24px_rgba(50,19,14,0.06)] p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <label className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A0847B]">
              Buscar
            </span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A0847B]" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => onBusquedaChange(e.target.value)}
                placeholder="Descripción, acción o entidad..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/80 border border-white text-xs text-[#32130E] placeholder-[#A0847B] focus:outline-none focus:ring-2 focus:ring-[#32130E]/20"
              />
            </div>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A0847B]">
              Acción
            </span>
            <select
              value={accion}
              onChange={(e) => setAccion(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/80 border border-white text-xs text-[#32130E] focus:outline-none focus:ring-2 focus:ring-[#32130E]/20"
            >
              <option value="">Todas</option>
              {datos?.filtros.acciones.map((a) => (
                <option key={a.valor} value={a.valor}>
                  {etiquetaAccion(a.valor)} ({a.conteo})
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A0847B]">
              Entidad
            </span>
            <select
              value={entidad}
              onChange={(e) => setEntidad(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/80 border border-white text-xs text-[#32130E] focus:outline-none focus:ring-2 focus:ring-[#32130E]/20"
            >
              <option value="">Todas</option>
              {datos?.filtros.entidades.map((e) => (
                <option key={e.valor} value={e.valor}>
                  {e.valor} ({e.conteo})
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A0847B]">
              Usuario
            </span>
            <select
              value={idUsuario}
              onChange={(e) => setIdUsuario(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/80 border border-white text-xs text-[#32130E] focus:outline-none focus:ring-2 focus:ring-[#32130E]/20"
            >
              <option value="">Todos</option>
              {datos?.filtros.usuarios.map((u) => (
                <option key={u.id} value={String(u.id)}>
                  {u.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A0847B]">
              Resultado
            </span>
            <select
              value={resultado}
              onChange={(e) => setResultado(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/80 border border-white text-xs text-[#32130E] focus:outline-none focus:ring-2 focus:ring-[#32130E]/20"
            >
              <option value="">Todos</option>
              <option value="EXITO">Éxito</option>
              <option value="FALLO">Fallo</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A0847B]">
              Desde
            </span>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/80 border border-white text-xs text-[#32130E] focus:outline-none focus:ring-2 focus:ring-[#32130E]/20"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A0847B]">
              Hasta
            </span>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/80 border border-white text-xs text-[#32130E] focus:outline-none focus:ring-2 focus:ring-[#32130E]/20"
            />
          </label>
        </div>

        {hayFiltros && (
          <button
            onClick={limpiarFiltros}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 border border-white text-[11px] font-bold text-[#7A5C55] hover:text-[#32130E] hover:bg-white transition cursor-pointer"
          >
            <FilterX className="w-3.5 h-3.5" />
            Limpiar filtros
          </button>
        )}
      </div>

      {/* TABLA */}
      <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/80 shadow-[0_4px_24px_rgba(50,19,14,0.06)] overflow-hidden">
        {error ? (
          <div className="p-8 text-center text-xs font-bold text-[#B83A3A]">
            {error}
          </div>
        ) : (
          <Table columns={columnas} data={entradas} />
        )}

        {/* PAGINACIÓN */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-[#32130E]/10">
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-[#7A5C55] font-medium">
              {total === 0
                ? "Sin registros"
                : `${inicio}–${fin} de ${total} registro${
                    total === 1 ? "" : "s"
                  }`}
            </span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-2 py-1 rounded-lg bg-white/80 border border-white text-[11px] text-[#32130E] focus:outline-none"
            >
              {TAMANOS_PAGINA.map((t) => (
                <option key={t} value={t}>
                  {t} por página
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="p-1.5 rounded-lg bg-white/80 border border-white text-[#7A5C55] hover:text-[#32130E] hover:bg-white transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Anterior"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-bold text-[#32130E] tabular-nums">
              {page} / {totalPaginas}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPaginas, p + 1))}
              disabled={page >= totalPaginas || loading}
              className="p-1.5 rounded-lg bg-white/80 border border-white text-[#7A5C55] hover:text-[#32130E] hover:bg-white transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Siguiente"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#7A5C55]">
          <Loader2 className="w-4 h-4 animate-spin" />
          Cargando registros...
        </div>
      )}

      {/* MODAL DETALLE */}
      <Modal
        isOpen={!!seleccionada}
        onClose={() => setSeleccionada(null)}
        title="Detalle del registro"
        subtitle={seleccionada ? `#${seleccionada.id}` : undefined}
      >
        {seleccionada && (
          <div className="w-full min-w-0">
            <div
              data-simplebar
              data-simplebar-auto-hide="false"
              className="max-h-[70vh] pr-3"
            >
              <div className="space-y-5 pb-2">
                {/* INFORMACIÓN PRINCIPAL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-5">
                  <Campo etiqueta="Fecha y hora">
                    <span className="font-mono text-[#32130E] text-xs break-words">
                      {new Date(seleccionada.fecha).toLocaleString("es-SV", {
                        hour12: false,
                      })}
                    </span>
                  </Campo>

                  <Campo etiqueta="Usuario">
                    <span className="text-xs text-[#7A5C55] break-words">
                      {seleccionada.usuario?.nombre || "No se pudo atribuir"}
                    </span>
                  </Campo>

                  <Campo etiqueta="Acción">
                    <span className="font-semibold text-[#32130E] text-xs">
                      {etiquetaAccion(seleccionada.accion)}
                    </span>
                  </Campo>

                  <Campo etiqueta="Entidad">
                    <span
                      className={`inline-flex max-w-full px-2.5 py-0.5 text-[10px] font-bold rounded-full border break-words ${colorEntidad(
                        seleccionada.entidad,
                      )}`}
                    >
                      {seleccionada.entidad}
                      {seleccionada.entidadId
                        ? ` #${seleccionada.entidadId}`
                        : ""}
                    </span>
                  </Campo>

                  <Campo etiqueta="Resultado">
                    {seleccionada.resultado === "EXITO" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full border bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]">
                        <ShieldCheck className="w-3 h-3" />
                        Éxito
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full border bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]">
                        <ShieldAlert className="w-3 h-3" />
                        Fallo
                      </span>
                    )}
                  </Campo>

                  <Campo etiqueta="IP">
                    <span className="font-mono text-[#7A5C55] text-xs break-all">
                      {seleccionada.ip ?? "—"}
                    </span>
                  </Campo>

                  {/* PETICIÓN */}
                  <div className="sm:col-span-2">
                    <Campo etiqueta="Petición">
                      <span className="font-mono text-[#7A5C55] text-xs break-all">
                        {seleccionada.metodo ?? "—"} {seleccionada.ruta ?? "—"}
                      </span>
                    </Campo>
                  </div>

                  {/* DESCRIPCIÓN */}
                  <div className="sm:col-span-2 xl:col-span-1">
                    <Campo etiqueta="Descripción">
                      <span className="text-[#6E554F] text-xs break-words">
                        {seleccionada.descripcion || "Sin descripción"}
                      </span>
                    </Campo>
                  </div>
                </div>

                {/* NAVEGADOR / DISPOSITIVO */}
                {seleccionada.userAgent && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#A0847B]">
                      Navegador / dispositivo
                    </span>

                    <div className="mt-1 flex items-start gap-2 text-[11px] text-[#7A5C55] bg-white/70 border border-white rounded-xl p-3">
                      <Monitor className="w-3.5 h-3.5 flex-shrink-0 mt-px" />

                      <span className="break-all min-w-0">
                        {seleccionada.userAgent}
                      </span>
                    </div>
                  </div>
                )}

                {/* DATOS REGISTRADOS */}
                {seleccionada.datos ? (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#A0847B]">
                      Datos registrados
                    </span>

                    <pre className="mt-1 text-[11px] leading-relaxed text-[#32130E] bg-white/70 border border-white rounded-xl p-4 whitespace-pre-wrap break-all overflow-x-auto">
                      {JSON.stringify(seleccionada.datos, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <p className="text-[11px] italic text-[#A0847B]">
                    Esta entrada no tiene datos adicionales.
                  </p>
                )}

                {/* AVISO */}
                <div className="pt-1 pb-1">
                  <p className="text-[10px] text-[#A0847B] flex items-start gap-1.5">
                    <Calendar className="w-3 h-3 flex-shrink-0 mt-px" />

                    <span>
                      Los registros de la bitácora no se pueden editar ni
                      eliminar.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Campo({
  etiqueta,
  children,
}: {
  etiqueta: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <span className="text-[10px] font-bold uppercase tracking-wider text-[#A0847B]">
        {etiqueta}
      </span>
      <div className="mt-0.5 text-xs">{children}</div>
    </div>
  );
}
