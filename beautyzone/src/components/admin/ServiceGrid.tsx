"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  MoreVertical,
  Download,
  Plus,
  FileSpreadsheet,
  FileText,
  Pencil,
  Trash2,
  Sparkles,
} from "lucide-react";
import Button from "@/src/components/ui/Button";
import Modal from "@/src/components/ui/Modal";
import NuevoServicioForm from "@/src/components/forms/NuevoServicioForm";
import { ServicioItem } from "@/src/app/types/servicio";
import { Categoria } from "@/src/app/types/producto";
import { exportToExcel } from "@/src/lib/exportUtils";
import { generatePDFWithTemplate } from "@/src/lib/pdfTemplate";

export default function ServiceGrid() {
  const [servicios, setServicios] = useState<ServicioItem[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [servicioAEditar, setServicioAEditar] = useState<ServicioItem | null>(
    null,
  );
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/categorias")
      .then((res) => res.json())
      .then((data: Categoria[]) => {
        if (Array.isArray(data)) {
          const servCats = data.filter(
            (c) => c.tipo?.toUpperCase() === "SERVICIO",
          );
          setCategorias(servCats.length > 0 ? servCats : data);
        }
      })
      .catch((err) => console.error("Error al cargar categorías:", err));
  }, []);

  const fetchServicios = useCallback(async () => {
    setLoading(true);
    try {
      const query = selectedCategoria
        ? `?categoriaId=${selectedCategoria}`
        : "";
      const res = await fetch(`/api/servicios${query}`);
      if (res.ok) {
        const data = await res.json();
        setServicios(data);
      }
    } catch (error) {
      console.error("Error al obtener servicios:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategoria]);

  useEffect(() => {
    fetchServicios();
  }, [fetchServicios]);

  const handleEdit = (servicio: ServicioItem) => {
    setServicioAEditar(servicio);
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleCreateNew = () => {
    setServicioAEditar(null);
    setIsModalOpen(true);
  };

  const handleDeleteServicio = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este servicio?")) return;

    try {
      const res = await fetch(`/api/servicios/${id}`, { method: "DELETE" });
      if (res.ok) fetchServicios();
    } catch (error) {
      console.error("Error al eliminar servicio:", error);
    } finally {
      setActiveMenuId(null);
    }
  };

  const handleExport = (format: "excel" | "pdf") => {
    if (format === "excel") {
      const data = servicios.map((s) => ({
        ID: s.id,
        Nombre: s.nombre,
        Categoría: s.categoria?.nombre || "Sin Categoría",
        Precio: `$${Number(s.precio).toFixed(2)}`,
        Comisión: `${Number(s.porcentajeComision)}%`,
        Estado: s.estado ? "Activo" : "Inactivo",
      }));
      exportToExcel(data, "Reporte_Servicios");
    } else {
      generatePDFWithTemplate({
        title: "Reporte de Servicios Disponibles",
        subtitle: `Catálogo de tratamientos (${servicios.length} registros)`,
        headers: [
          "ID",
          "Nombre Servicio",
          "Categoría",
          "Precio",
          "% Comisión",
          "Estado",
        ],
        rows: servicios.map((s) => [
          s.id,
          s.nombre,
          s.categoria?.nombre || "N/A",
          `$${Number(s.precio).toFixed(2)}`,
          `${Number(s.porcentajeComision)}%`,
          s.estado ? "Activo" : "Inactivo",
        ]),
        filename: "Reporte_Servicios_BeautyZone",
      });
    }
    setShowExportMenu(false);
  };

  return (
    <div className="space-y-6">
      {/* BARRA SUPERIOR / FILTROS Y ACCIONES */}
      <div className="flex items-center justify-between gap-4 bg-white/40 backdrop-blur-xl border border-white/80 p-3 rounded-2xl shadow-[0_4px_20px_rgba(50,19,14,0.03)]">
        <select
          value={selectedCategoria}
          onChange={(e) => setSelectedCategoria(e.target.value)}
          className="px-4 py-2 border border-white/90 rounded-2xl text-xs font-semibold bg-white/60 text-[#32130E] focus:outline-none focus:bg-white transition-all shadow-2xs cursor-pointer"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-white/90 bg-white/60 hover:bg-white text-[#32130E] shadow-2xs"
              onClick={() => setShowExportMenu(!showExportMenu)}
            >
              <Download className="w-3.5 h-3.5 text-[#32130E]" /> Descargar
            </Button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-white/90 backdrop-blur-2xl border border-white rounded-2xl shadow-[0_12px_30px_rgba(50,19,14,0.08)] z-30 overflow-hidden p-1 space-y-0.5">
                <button
                  onClick={() => handleExport("excel")}
                  className="w-full px-3 py-2 text-xs font-semibold text-[#32130E] hover:bg-[#32130E]/5 rounded-xl transition-colors flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  Excel (.xlsx)
                </button>
                <button
                  onClick={() => handleExport("pdf")}
                  className="w-full px-3 py-2 text-xs font-semibold text-[#32130E] hover:bg-[#32130E]/5 rounded-xl transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-rose-600" />
                  PDF (.pdf)
                </button>
              </div>
            )}
          </div>

          <Button
            onClick={handleCreateNew}
            size="sm"
            className="gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo Servicio</span>
          </Button>
        </div>
      </div>

      {/* REJILLA DE SERVICIOS */}
      {loading ? (
        <div className="bg-white/50 backdrop-blur-xl border border-white/90 rounded-3xl p-12 text-center text-[#7A5C55] text-xs font-semibold shadow-[0_8px_30px_rgba(50,19,14,0.05)]">
          Cargando catálogo de servicios...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {servicios.map((item) => (
            <div
              key={item.id}
              className="bg-white/50 backdrop-blur-xl border border-white/90 rounded-3xl p-4 flex flex-col justify-between shadow-[0_8px_30px_rgba(50,19,14,0.04)] hover:shadow-[0_12px_35px_rgba(50,19,14,0.08)] hover:bg-white/70 transition-all duration-300 relative group"
            >
              <div>
                {/* CONTENEDOR DE IMAGEN CON EFECTO VIDRIO */}
                <div className="relative w-full h-36 bg-[#F5EBE1]/60 rounded-2xl overflow-hidden mb-3.5 border border-white/80 shadow-2xs">
                  {item.imagen ? (
                    <Image
                      src={item.imagen}
                      alt={item.nombre}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#7A5C55]/60 text-xs font-medium gap-1">
                      <Sparkles className="w-5 h-5 stroke-[1.5]" />
                      <span className="text-[10px]">Sin imagen</span>
                    </div>
                  )}

                  {/* BADGE DE CATEGORÍA */}
                  {item.categoria && (
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-white/80 backdrop-blur-md border border-white text-[#32130E] text-[10px] font-extrabold rounded-full shadow-2xs">
                      {item.categoria.nombre}
                    </span>
                  )}
                </div>

                {/* DETALLES DEL SERVICIO */}
                <div className="flex items-start justify-between gap-2 pt-1">
                  <div>
                    <h4 className="font-bold text-[#32130E] text-xs leading-snug line-clamp-1">
                      {item.nombre}
                    </h4>
                    <p className="font-serif font-extrabold text-[#32130E] text-base mt-0.5">
                      ${Number(item.precio).toFixed(2)}
                    </p>
                  </div>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveMenuId(
                          activeMenuId === item.id ? null : item.id,
                        )
                      }
                      className="p-1.5 hover:bg-white/80 rounded-xl text-[#7A5C55] transition-colors border border-transparent hover:border-white/80 shadow-2xs"
                    >
                      <MoreVertical className="w-4 h-4 text-[#32130E]" />
                    </button>

                    {/* MENÚ ACCIONES CON GLASSMORPHISM */}
                    {activeMenuId === item.id && (
                      <div className="absolute right-0 bottom-9 w-36 bg-white/90 backdrop-blur-2xl border border-white rounded-2xl shadow-[0_12px_30px_rgba(50,19,14,0.1)] z-30 p-1 space-y-0.5">
                        <button
                          onClick={() => handleEdit(item)}
                          className="w-full px-3 py-1.5 text-xs font-semibold text-[#32130E] hover:bg-[#32130E]/5 rounded-xl transition-colors flex items-center gap-2"
                        >
                          <Pencil className="w-3.5 h-3.5 text-blue-600" />{" "}
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteServicio(item.id)}
                          className="w-full px-3 py-1.5 text-xs font-semibold text-[#B83A3A] hover:bg-[#B83A3A]/10 rounded-xl transition-colors flex items-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-[#B83A3A]" />{" "}
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* FOOTER DE CADA TARJETA (ESTADO / COMISIÓN) */}
              <div className="mt-3 pt-2.5 border-t border-[#32130E]/10 flex items-center justify-between text-[10px] font-semibold text-[#7A5C55]">
                <span>Comisión: {Number(item.porcentajeComision || 0)}%</span>
                <span
                  className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${
                    item.estado
                      ? "bg-[#2E6F40]/10 border-[#2E6F40]/20 text-[#2E6F40]"
                      : "bg-[#B83A3A]/10 border-[#B83A3A]/20 text-[#B83A3A]"
                  }`}
                >
                  {item.estado ? "Activo" : "Inactivo"}
                </span>
              </div>
            </div>
          ))}

          {servicios.length === 0 && (
            <div className="col-span-full bg-white/40 backdrop-blur-md border border-white/80 rounded-3xl text-center py-12 text-xs text-[#7A5C55] font-semibold shadow-2xs">
              No hay servicios registrados en esta categoría.
            </div>
          )}
        </div>
      )}

      {/* MODAL PARA CREAR / EDITAR */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={servicioAEditar ? "Editar Servicio" : "Nuevo Servicio"}
        subtitle={
          servicioAEditar
            ? "Modifica los datos del servicio seleccionado"
            : "Registra las opciones de atención que ofrecerá el salón"
        }
      >
        <NuevoServicioForm
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchServicios}
          servicioAEditar={servicioAEditar}
        />
      </Modal>
    </div>
  );
}
