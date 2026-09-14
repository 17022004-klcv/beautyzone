"use client";

import { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";

// Componentes UI Reutilizables
import Button from "@/src/components/ui/Button";
import SearchBar from "@/src/components/ui/SearchBar";
import SearchableSelect from "@/src/components/ui/SearchableSelect";
import Modal from "@/src/components/ui/Modal";

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
  const [loading, setLoading] = useState(false);
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
        // Filtramos solo usuarios activos
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
    // Generar formato HH:mm por defecto
    const horaActual = ahora.toTimeString().split(" ")[0].substring(0, 5);
    // Generar formato YYYY-MM-DD por defecto
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

  // Formatear Badge de Tipo de Registro
  const renderTipoBadge = (tipo: TipoRegistro) => {
    const config: Record<TipoRegistro, { label: string; style: string }> = {
      ENTRADA: {
        label: "Entrada",
        style: "bg-emerald-100 text-emerald-800 border-emerald-300",
      },
      SALIDA_ALMUERZO: {
        label: "Salida Almuerzo",
        style: "bg-amber-100 text-amber-800 border-amber-300",
      },
      ENTRADA_ALMUERZO: {
        label: "Entrada Almuerzo",
        style: "bg-blue-100 text-blue-800 border-blue-300",
      },
      SALIDA: {
        label: "Salida",
        style: "bg-rose-100 text-rose-800 border-rose-300",
      },
    };

    const item = config[tipo] || {
      label: tipo,
      style: "bg-stone-100 text-stone-800 border-stone-300",
    };

    return (
      <span
        className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${item.style}`}
      >
        {item.label}
      </span>
    );
  };

  const handleExport = (format: "excel" | "pdf") => {
    ExportService.exportAsistencias?.(asistencias, format);
    setShowExportMenu(false);
  };

  return (
    <div className="space-y-6 p-6">
      {/* CABECERA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#32130E] flex items-center gap-2">
            <Clock className="w-6 h-6 text-[#572219]" />
            Control de Asistencia
          </h1>
          <p className="text-xs text-[#7A5C55] mt-1">
            Registro y seguimiento de marcaciones de entradas y salidas del
            personal
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* BOTÓN EXPORTAR */}
          <div className="relative">
            <Button
              variant="outline"
              size="md"
              className="gap-2 text-sm font-semibold"
              onClick={() => setShowExportMenu(!showExportMenu)}
            >
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </Button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-[#D8C3B3] rounded-xl shadow-lg z-20 overflow-hidden">
                <button
                  onClick={() => handleExport("excel")}
                  className="w-full px-4 py-2 text-xs font-semibold text-[#572219] hover:bg-[#F5EBE1] flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4 text-green-600" />
                  Excel (.xlsx)
                </button>
                <button
                  onClick={() => handleExport("pdf")}
                  className="w-full px-4 py-2 text-xs font-semibold text-[#572219] hover:bg-[#F5EBE1] flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-red-600" />
                  PDF (.pdf)
                </button>
              </div>
            )}
          </div>

          {/* BOTÓN REGISTRAR MARCA */}
          <Button
            size="md"
            className="gap-2 px-4 py-2.5 text-sm font-semibold"
            onClick={handleOpenModal}
          >
            <Plus className="w-5 h-5" />
            <span>Registrar Acceso</span>
          </Button>
        </div>
      </div>

      {/* BARRA DE FILTROS */}
      <div className="bg-white border border-[#D8C3B3] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-3">
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
            className="w-full px-3 py-2 text-sm bg-white border border-[#D8C3B3] text-[#32130E] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9D4B4C]"
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
        <div className="w-full md:w-48 relative">
          <input
            type="date"
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-[#D8C3B3] text-[#32130E] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9D4B4C]"
          />
        </div>

        {/* Limpiar Filtros */}
        {(search || filtroTipo || filtroFecha) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLimpiarFiltros}
            className="text-xs text-[#7A5C55] gap-1 hover:text-[#32130E]"
          >
            <FilterX className="w-4 h-4" />
            Limpiar
          </Button>
        )}
      </div>

      {/* TABLA DE ASISTENCIAS */}
      <div className="bg-[#FFFFFF] border border-[#D8C3B3] rounded-2xl p-6 shadow-sm min-h-[400px]">
        {loading ? (
          <div className="flex justify-center items-center py-20 text-[#7A5C55] text-sm">
            Cargando registros de asistencia...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#D8C3B3] text-xs font-bold text-[#572219]">
                  <th className="py-3 px-4">Empleado</th>
                  <th className="py-3 px-4">Rol</th>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Hora</th>
                  <th className="py-3 px-4">Tipo de Marca</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5EBE1]">
                {asistencias.map((a) => (
                  <tr key={a.id} className="hover:bg-[#F5EBE1]/40 text-sm">
                    <td className="py-3 px-4 font-semibold text-[#32130E]">
                      {a.empleado
                        ? `${a.empleado.nombre} ${a.empleado.apellido}`
                        : "Empleado Desconocido"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-[#F5EBE1] text-[#572219] px-2 py-0.5 rounded text-xs border border-[#D8C3B3]">
                        {a.empleado?.rol?.nombre || "Sin Rol"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#7A5C55] font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#7A5C55]" />
                        {new Date(a.fecha).toLocaleDateString("es-SV", {
                          timeZone: "UTC",
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#32130E] font-mono font-bold">
                      {a.hora}
                    </td>
                    <td className="py-3 px-4">
                      {renderTipoBadge(a.tipoRegistro)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleEliminar(a.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition"
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {asistencias.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-12 text-xs text-[#7A5C55]"
                    >
                      No se encontraron registros de asistencia con los filtros
                      aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
            <label className="block text-xs font-semibold text-[#572219] mb-1">
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
            <label className="block text-xs font-semibold text-[#572219] mb-1">
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
              className="w-full px-3 py-2.5 border border-[#D8C3B3] rounded-xl text-sm text-[#32130E] bg-white focus:outline-none focus:ring-2 focus:ring-[#9D4B4C]"
            >
              {OPCIONES_TIPO_REGISTRO.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha y Hora (Opcionales / Editables) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#572219] mb-1">
                Fecha
              </label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border border-[#D8C3B3] rounded-xl text-sm text-[#32130E] focus:outline-none focus:ring-2 focus:ring-[#9D4B4C]"
                value={formMarca.fecha}
                onChange={(e) =>
                  setFormMarca({ ...formMarca, fecha: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#572219] mb-1">
                Hora (HH:mm)
              </label>
              <input
                type="time"
                required
                className="w-full px-3 py-2 border border-[#D8C3B3] rounded-xl text-sm text-[#32130E] focus:outline-none focus:ring-2 focus:ring-[#9D4B4C]"
                value={formMarca.hora}
                onChange={(e) =>
                  setFormMarca({ ...formMarca, hora: e.target.value })
                }
              />
            </div>
          </div>

          {/* Acciones */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#F5EBE1]">
            <Button
              type="button"
              variant="outline"
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
