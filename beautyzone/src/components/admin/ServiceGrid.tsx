"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import {
  Download,
  Plus,
  FileSpreadsheet,
  FileText,
  Pencil,
  Trash2,
  Sparkles,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Button from "@/src/components/ui/Button";
import Modal from "@/src/components/ui/Modal";
import NuevoServicioForm from "@/src/components/forms/NuevoServicioForm";
import SearchBar from "@/src/components/ui/SearchBar"; // Ajusta la ruta si es diferente
import SearchableSelect from "@/src/components/ui/SearchableSelect"; // Ajusta la ruta si es diferente
import { ServicioItem } from "@/src/app/types/servicio";
import { Categoria } from "@/src/app/types/producto";
import { exportToExcel } from "@/src/lib/exportUtils";
import { generatePDFWithTemplate } from "@/src/lib/pdfTemplate";

const ITEMS_PER_PAGE = 8; // 2 filas de 4 columnas

export default function ServiceGrid() {
  const [servicios, setServicios] = useState<ServicioItem[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [servicioAEditar, setServicioAEditar] = useState<ServicioItem | null>(
    null,
  );
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  // Cargar Categorías
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

  // Cargar Servicios
  const fetchServicios = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/servicios");
      if (res.ok) {
        const data = await res.json();
        setServicios(data);
      }
    } catch (error) {
      console.error("Error al obtener servicios:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServicios();
  }, [fetchServicios]);

  // Filtrado por Categoría y por Buscador
  const filteredServicios = useMemo(() => {
    return servicios.filter((item) => {
      const matchesCategory = selectedCategoria
        ? item.categoria?.toString() === selectedCategoria ||
          item.categoria?.id?.toString() === selectedCategoria
        : true;

      const matchesSearch = item.nombre
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [servicios, selectedCategoria, searchQuery]);

  // Resetear a la primera página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategoria, searchQuery]);

  // Paginación
  const totalPages = Math.ceil(filteredServicios.length / ITEMS_PER_PAGE) || 1;
  const paginatedServicios = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredServicios.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredServicios, currentPage]);

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
      const data = filteredServicios.map((s) => ({
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
        subtitle: `Catálogo de tratamientos (${filteredServicios.length} registros)`,
        headers: [
          "ID",
          "Nombre Servicio",
          "Categoría",
          "Precio",
          "% Comisión",
          "Estado",
        ],
        rows: filteredServicios.map((s) => [
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

  // Opciones formateadas para SearchableSelect
  const categoriaOptions = [
    { label: "Todas las categorías", value: "" },
    ...categorias.map((c) => ({ label: c.nombre, value: c.id.toString() })),
  ];

  return (
    <div className="space-y-6">
      {/* BARRA SUPERIOR: FILTROS Y ACCIONES */}
      <div className="relative z-20 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* BUSCADOR Y FILTRO DE CATEGORÍA CON MARGEN Y ESPACIADO SEPARADO */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="w-full sm:w-64 ">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Buscar servicio..."
            />
          </div>
          <div className="w-full sm:w-60">
            <SearchableSelect
              options={categoriaOptions}
              placeholder="Todas las categorías"
              onSelect={(val) => setSelectedCategoria(val)}
            />
          </div>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="flex items-center justify-end gap-2">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="flex flex-col animate-pulse">
              <div className="relative w-full h-52 bg-white/60 rounded-[1.25rem] rounded-br-none overflow-hidden">
                <div
                  className="absolute -bottom-[6px] -right-[6px] w-[5.5rem] h-[5.5rem] bg-[#F0ECEA] rounded-tl-[50%] flex items-center justify-center
                  before:content-[''] before:absolute before:bottom-[6px] before:-left-[20px] before:w-[20px] before:h-[20px] before:bg-transparent before:rounded-br-[20px] before:shadow-[5px_5px_0_5px_#F0ECEA]
                  after:content-[''] after:absolute after:-top-[20px] after:right-[6px] after:w-[20px] after:h-[20px] after:bg-transparent after:rounded-br-[20px] after:shadow-[5px_5px_0_5px_#F0ECEA]"
                >
                  <div className="w-12 h-12 bg-black/10 rounded-full" />
                </div>
              </div>
              <div className="pt-3 px-1.5 space-y-2">
                <div className="h-4 bg-black/10 rounded w-3/4" />
                <div className="flex gap-2 pt-1">
                  <div className="h-4 bg-black/10 rounded w-16" />
                  <div className="h-4 bg-black/10 rounded w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {paginatedServicios.map((item) => (
            <div key={item.id} className="group flex flex-col">
              {/* CONTENEDOR DE IMAGEN CON ESQUINA RECORTADA */}
              <div className="relative w-full h-52 bg-white rounded-[1.25rem] rounded-br-none overflow-hidden shadow-2xs">
                {/* Imagen */}
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                  {item.imagen ? (
                    <Image
                      src={item.imagen}
                      alt={item.nombre}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#F5EBE1] flex flex-col items-center justify-center text-[#7A5C55]/60 text-xs font-medium gap-1">
                      <Sparkles className="w-6 h-6 stroke-[1.5]" />
                      <span className="text-[10px]">Sin imagen</span>
                    </div>
                  )}
                </div>

                {/* BOTÓN CÓNCAVO EN ESQUINA INFERIOR DERECHA */}
                <div
                  className="absolute -bottom-[6px] -right-[6px] w-[5.5rem] h-[5.5rem] bg-[#F0ECEA] rounded-tl-[50%] flex items-center justify-center
                  before:content-[''] before:absolute before:bottom-[6px] before:-left-[20px] before:w-[20px] before:h-[20px] before:bg-transparent before:rounded-br-[20px] before:shadow-[5px_5px_0_5px_#F0ECEA]
                  after:content-[''] after:absolute after:-top-[20px] after:right-[6px] after:w-[20px] after:h-[20px] after:bg-transparent after:rounded-br-[20px] after:shadow-[5px_5px_0_5px_#F0ECEA]"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setActiveMenuId(activeMenuId === item.id ? null : item.id)
                    }
                    className="w-12 h-12 bg-[#32130E] group-hover:bg-[#7A5C55] rounded-full flex items-center justify-center transition-all duration-300 shadow-md transform group-hover:scale-110"
                  >
                    <ArrowUpRight className="w-5 h-5 text-white" />
                  </button>

                  {/* MENÚ DE ACCIONES */}
                  {activeMenuId === item.id && (
                    <div className="absolute right-2 bottom-16 w-36 bg-white/95 backdrop-blur-2xl border border-white rounded-2xl shadow-[0_12px_30px_rgba(50,19,14,0.15)] z-30 p-1 space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
                      <button
                        onClick={() => handleEdit(item)}
                        className="w-full px-3 py-1.5 text-xs font-semibold text-[#32130E] hover:bg-[#32130E]/5 rounded-xl transition-colors flex items-center gap-2"
                      >
                        <Pencil className="w-3.5 h-3.5 text-blue-600" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteServicio(item.id)}
                        className="w-full px-3 py-1.5 text-xs font-semibold text-[#B83A3A] hover:bg-[#B83A3A]/10 rounded-xl transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-[#B83A3A]" />
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* DETALLES Y TAGS DEBAJO DE LA TARJETA */}
              <div className="pt-3 px-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-[#32130E] text-base leading-snug capitalize">
                      {item.nombre}
                    </h3>
                    <span className="font-serif font-extrabold text-[#32130E] text-base">
                      ${Number(item.precio).toFixed(2)}
                    </span>
                  </div>

                  {/* LISTA DE TAGS */}
                  <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
                    {item.categoria && (
                      <span className="px-2.5 py-1 bg-[#d3b19a]/40 text-[#542d18] text-[10px] font-bold uppercase rounded-md">
                        {item.categoria.nombre}
                      </span>
                    )}

                    <span className="px-2.5 py-1 bg-[#70b3b1]/30 text-[#1f4948] text-[10px] font-bold uppercase rounded-md">
                      Comisión: {Number(item.porcentajeComision || 0)}%
                    </span>

                    <span
                      className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md ${
                        item.estado
                          ? "bg-[#2E6F40]/15 text-[#2E6F40]"
                          : "bg-[#B83A3A]/15 text-[#B83A3A]"
                      }`}
                    >
                      {item.estado ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredServicios.length === 0 && (
            <div className="col-span-full bg-white/40 backdrop-blur-md border border-white/80 rounded-3xl text-center py-12 text-xs text-[#7A5C55] font-semibold shadow-2xs">
              No se encontraron servicios registrados con los filtros aplicados.
            </div>
          )}
        </div>
      )}

      {/* FOOTER / CONTROLES DE PAGINACIÓN */}
      {!loading && filteredServicios.length > 0 && (
        <div className="flex items-center justify-between pt-2 border-t border-black/5">
          <p className="text-xs text-[#7A5C55] font-semibold">
            Mostrando{" "}
            {Math.min(
              (currentPage - 1) * ITEMS_PER_PAGE + 1,
              filteredServicios.length,
            )}{" "}
            a {Math.min(currentPage * ITEMS_PER_PAGE, filteredServicios.length)}{" "}
            de {filteredServicios.length} servicios
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 border border-white/90 rounded-xl bg-white/60 text-[#32130E] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-all shadow-2xs cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold text-[#32130E] px-2">
              Página {currentPage} de {totalPages}
            </span>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="p-2 border border-white/90 rounded-xl bg-white/60 text-[#32130E] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-all shadow-2xs cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
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
