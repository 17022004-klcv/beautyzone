"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

import {
  Clock,
  Plus,
  Download,
  FileSpreadsheet,
  FileText,
  Trash2,
  Calendar,
  FilterX,
  UserCheck,
  QrCode,
} from "lucide-react";

// Componentes UI Reutilizables
import Button from "@/src/components/ui/Button";
import SearchBar from "@/src/components/ui/SearchBar";
import SearchableSelect from "@/src/components/ui/SearchableSelect";
import Modal from "@/src/components/ui/Modal";
import Table from "@/src/components/ui/DataTable";

// Tipos y Servicios
import {
  AsistenciaItem,
  TipoRegistro,
  RegistrarAsistenciaDTO,
} from "@/src/app/types/asistencia";
import { UsuarioItem } from "@/src/app/types/usuario";
import { AsistenciaService } from "@/src/app/services/asistencia.service";
import { ExportService } from "@/src/app/services/export.service";

const OPCIONES_TIPO_REGISTRO: { label: string; value: TipoRegistro }[] = [
  { label: "Entrada", value: "ENTRADA" },
  { label: "Salida a Almuerzo", value: "SALIDA_ALMUERZO" },
  { label: "Entrada de Almuerzo", value: "ENTRADA_ALMUERZO" },
  { label: "Salida", value: "SALIDA" },
];

export default function AsistenciasView() {
  const [asistencias, setAsistencias] = useState<AsistenciaItem[]>([]);
  const [empleados, setEmpleados] = useState<UsuarioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Estados para Filtros
  const [search, setSearch] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");

  // Estado del Formulario para Marcar Asistencia
  const [formMarca, setFormMarca] = useState<RegistrarAsistenciaDTO>({
    idempleado: 0,
    tipoRegistro: "ENTRADA",
    fecha: "",
    hora: "",
  });

  // Cargar asistencias con filtros
  const fetchAsistencias = useCallback(async () => {
    setLoading(true);
    try {
      const data = await AsistenciaService.getAsistencias({
        search,
        tipo: filtroTipo,
        fecha: filtroFecha,
      });
      setAsistencias(data);
    } catch (error) {
      console.error("Error al cargar asistencias:", error);
    } finally {
      setLoading(false);
    }
  }, [search, filtroTipo, filtroFecha]);

  // Cargar lista de empleados para el modal
  const fetchEmpleados = async () => {
    try {
      const res = await fetch("/api/usuarios");
      if (res.ok) {
        const data: UsuarioItem[] = await res.json();
        setEmpleados(data.filter((u) => u.estado));
      }
    } catch (error) {
      console.error("Error al cargar empleados:", error);
    }
  };

  useEffect(() => {
    fetchAsistencias();
  }, [fetchAsistencias]);

  useEffect(() => {
    fetchEmpleados();
  }, []);

  // Abrir Modal de Marcar Asistencia
  const handleOpenModal = () => {
    const ahora = new Date();
    const horaActual = ahora.toTimeString().split(" ")[0].substring(0, 5);
    const fechaActual = ahora.toISOString().split("T")[0];

    setFormMarca({
      idempleado: empleados[0]?.id || 0,
      tipoRegistro: "ENTRADA",
      fecha: fechaActual,
      hora: horaActual,
    });
    setIsModalOpen(true);
  };

  // Enviar formulario de marca
  const handleSubmitMarca = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMarca.idempleado || formMarca.idempleado === 0) {
      alert("Por favor selecciona un empleado");
      return;
    }

    try {
      await AsistenciaService.registrarAsistencia(formMarca);
      setIsModalOpen(false);
      fetchAsistencias();
    } catch (error: any) {
      alert(error.message || "Error al registrar asistencia");
    }
  };

  // Eliminar marca de asistencia
  const handleEliminar = async (id: number) => {
    if (
      confirm(
        "¿Estás seguro de que deseas eliminar este registro de asistencia?",
      )
    ) {
      try {
        await AsistenciaService.eliminarAsistencia(id);
        fetchAsistencias();
      } catch (error) {
        alert("Error al eliminar la asistencia");
      }
    }
  };

  // Limpiar Filtros
  const handleLimpiarFiltros = () => {
    setSearch("");
    setFiltroTipo("");
    setFiltroFecha("");
  };

  // Formatear Badge de Tipo de Registro estilo Glassmorphism
  const renderTipoBadge = (tipo: TipoRegistro) => {
    const config: Record<TipoRegistro, { label: string; style: string }> = {
      ENTRADA: {
        label: "Entrada",
        style: "bg-[#2E6F40]/10 border-[#2E6F40]/20 text-[#2E6F40]",
      },
      SALIDA_ALMUERZO: {
        label: "Salida Almuerzo",
        style: "bg-amber-500/10 border-amber-500/20 text-amber-800",
      },
      ENTRADA_ALMUERZO: {
        label: "Entrada Almuerzo",
        style: "bg-sky-500/10 border-sky-500/20 text-sky-800",
      },
      SALIDA: {
        label: "Salida",
        style: "bg-[#B83A3A]/10 border-[#B83A3A]/20 text-[#B83A3A]",
      },
    };

    const item = config[tipo] || {
      label: tipo,
      style: "bg-stone-500/10 border-stone-500/20 text-[#32130E]",
    };

    return (
      <span
        className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full border uppercase tracking-wider ${item.style}`}
      >
        {item.label}
      </span>
    );
  };

  const handleExport = (format: "excel" | "pdf") => {
    ExportService.exportAsistencias?.(asistencias, format);
    setShowExportMenu(false);
  };

  // Definición de columnas para DataTable
  const columns = [
    {
      header: "Empleado",
      accessorKey: (a: AsistenciaItem) => (
        <span className="font-bold text-[#32130E]">
          {a.empleado
            ? `${a.empleado.nombre} ${a.empleado.apellido}`
            : "Empleado Desconocido"}
        </span>
      ),
    },
    {
      header: "Rol",
      accessorKey: (a: AsistenciaItem) => (
        <span className="bg-white/80 text-[#32130E] px-2.5 py-1 rounded-full text-[10px] font-bold border border-white shadow-2xs">
          {a.empleado?.rol?.nombre || "Sin Rol"}
        </span>
      ),
    },
    {
      header: "Fecha",
      accessorKey: (a: AsistenciaItem) => (
        <div className="flex items-center gap-1.5 text-[#7A5C55]">
          <Calendar className="w-3.5 h-3.5 text-[#7A5C55]" />
          {new Date(a.fecha).toLocaleDateString("es-SV", {
            timeZone: "UTC",
          })}
        </div>
      ),
    },
    {
      header: "Hora",
      accessorKey: (a: AsistenciaItem) => (
        <span className="text-[#32130E] font-mono font-bold">{a.hora}</span>
      ),
    },
    {
      header: "Tipo de Marca",
      accessorKey: (a: AsistenciaItem) => renderTipoBadge(a.tipoRegistro),
    },
    {
      header: "Acciones",
      accessorKey: (a: AsistenciaItem) => (
        <div className="flex items-center justify-end">
          <button
            onClick={() => handleEliminar(a.id)}
            className="p-1.5 text-[#B83A3A] hover:bg-[#B83A3A]/10 rounded-xl transition border border-transparent hover:border-white/80 shadow-2xs cursor-pointer"
            title="Eliminar registro"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* CABECERA SIN TARJETA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#32130E] flex items-center gap-2.5">
            Control de Asistencia
          </h1>
          <p className="text-xs font-medium text-[#7A5C55] mt-1">
            Registro y seguimiento de marcaciones de entradas y salidas del
            personal
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* BOTÓN ABRIR PANTALLA DE MARCAJE (KIOSCO) */}
          <Link href="/kiosco">
            <Button
              variant="outline"
              size="md"
              className="gap-2 text-xs font-semibold border-white/90 bg-white/60 hover:bg-white text-[#32130E] shadow-2xs"
            >
              <QrCode className="w-4 h-4 text-[#32130E]" />
              <span>Abrir Marcaje</span>
            </Button>
          </Link>

          {/* BOTÓN EXPORTAR */}
          <div className="relative">
            <Button
              variant="outline"
              size="md"
              className="gap-2 text-xs font-semibold border-white/90 bg-white/60 hover:bg-white text-[#32130E] shadow-2xs"
              onClick={() => setShowExportMenu(!showExportMenu)}
            >
              <Download className="w-4 h-4 text-[#32130E]" />
              <span>Exportar</span>
            </Button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-white/90 backdrop-blur-2xl border border-white rounded-2xl shadow-[0_12px_30px_rgba(50,19,14,0.08)] z-30 overflow-hidden p-1 space-y-0.5">
                <button
                  onClick={() => handleExport("excel")}
                  className="w-full px-3 py-2 text-xs font-semibold text-[#32130E] hover:bg-[#32130E]/5 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  Excel (.xlsx)
                </button>
                <button
                  onClick={() => handleExport("pdf")}
                  className="w-full px-3 py-2 text-xs font-semibold text-[#32130E] hover:bg-[#32130E]/5 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-rose-600" />
                  PDF (.pdf)
                </button>
              </div>
            )}
          </div>

          {/* BOTÓN REGISTRAR MARCA MANUAL */}
          <Button
            size="md"
            className="gap-2 px-4 py-2 text-xs font-semibold shadow-sm"
            onClick={handleOpenModal}
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Acceso</span>
          </Button>
        </div>
      </div>

      {/* BARRA DE FILTROS GLASSMORPHISM */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        {/* Buscador de Nombre */}
        <div className="w-full md:w-72">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Buscar por empleado..."
          />
        </div>

        {/* Filtro Tipo de Registro */}
        <div className="w-full md:w-56">
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="w-full px-3 py-2 text-xs font-medium bg-white/60 border border-white/80 text-[#32130E] rounded-2xl focus:outline-none focus:bg-white transition-all shadow-2xs cursor-pointer"
          >
            <option value="">Todos los registros</option>
            {OPCIONES_TIPO_REGISTRO.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro Fecha */}
        <div className="w-full md:w-48">
          <input
            type="date"
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
            className="w-full px-3 py-2 text-xs font-medium bg-white/60 border border-white/80 text-[#32130E] rounded-2xl focus:outline-none focus:bg-white transition-all shadow-2xs cursor-pointer"
          />
        </div>

        {/* Limpiar Filtros */}
        {(search || filtroTipo || filtroFecha) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLimpiarFiltros}
            className="text-xs font-semibold text-[#7A5C55] gap-1 hover:text-[#32130E] hover:bg-white/50 rounded-2xl"
          >
            <FilterX className="w-3.5 h-3.5" />
            Limpiar
          </Button>
        )}
      </div>

      {/* TABLA DE ASISTENCIAS CON GLASSMORPHISM / SKELETON */}
      <div className=" min-h-[400px]">
        {loading ? (
          <div className="bg-white/50 backdrop-blur-xl border border-white/90 rounded-3xl p-6 shadow-[0_8px_30px_rgba(50,19,14,0.04)] animate-pulse space-y-4">
            <div className="h-8 bg-[#32130E]/5 rounded-xl w-full" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-white/60 rounded-xl w-full" />
            ))}
          </div>
        ) : (
          <Table columns={columns} data={asistencias} />
        )}
      </div>

      {/* MODAL REGISTRAR ACCESO */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Asistencia"
        subtitle="Selecciona el empleado y el tipo de marca a realizar"
      >
        <form onSubmit={handleSubmitMarca} className="space-y-4 pt-2">
          {/* Seleccionar Empleado con SearchableSelect */}
          <div>
            <label className="block text-xs font-semibold text-[#32130E] mb-1">
              Empleado
            </label>
            <SearchableSelect
              options={empleados.map((emp) => ({
                label: `${emp.nombre} ${emp.apellido} (${emp.rol?.nombre || "Sin Rol"})`,
                value: String(emp.id),
              }))}
              placeholder="Buscar y seleccionar empleado..."
              onSelect={(val) =>
                setFormMarca({ ...formMarca, idempleado: Number(val) })
              }
            />
          </div>

          {/* Tipo de Registro */}
          <div>
            <label className="block text-xs font-semibold text-[#32130E] mb-1">
              Tipo de Registro
            </label>
            <select
              value={formMarca.tipoRegistro}
              onChange={(e) =>
                setFormMarca({
                  ...formMarca,
                  tipoRegistro: e.target.value as TipoRegistro,
                })
              }
              className="w-full px-3 py-2 border border-white/80 rounded-2xl text-xs text-[#32130E] bg-white/60 focus:outline-none focus:bg-white transition-all shadow-2xs cursor-pointer"
            >
              {OPCIONES_TIPO_REGISTRO.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#32130E] mb-1">
                Fecha
              </label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border border-white/80 rounded-2xl text-xs text-[#32130E] bg-white/60 focus:outline-none focus:bg-white transition-all shadow-2xs"
                value={formMarca.fecha}
                onChange={(e) =>
                  setFormMarca({ ...formMarca, fecha: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#32130E] mb-1">
                Hora (HH:mm)
              </label>
              <input
                type="time"
                required
                className="w-full px-3 py-2 border border-white/80 rounded-2xl text-xs text-[#32130E] bg-white/60 focus:outline-none focus:bg-white transition-all shadow-2xs"
                value={formMarca.hora}
                onChange={(e) =>
                  setFormMarca({ ...formMarca, hora: e.target.value })
                }
              />
            </div>
          </div>

          {/* Acciones */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#32130E]/10">
            <Button
              type="button"
              variant="outline"
              className="border-white/80 bg-white/60 text-[#32130E]"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="gap-2">
              <UserCheck className="w-4 h-4" />
              Guardar Marca
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
