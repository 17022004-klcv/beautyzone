"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Download,
  Plus,
  FileSpreadsheet,
  FileText,
  Sparkles,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import Button from "@/src/components/ui/Button";
import SearchBar from "@/src/components/ui/SearchBar";
import SearchableSelect from "@/src/components/ui/SearchableSelect";
import NuevoServicioForm from "@/src/components/forms/NuevoServicioForm";

import { ServicioItem } from "@/src/app/types/servicio";
import { Categoria } from "@/src/app/types/producto";
import { exportToExcel } from "@/src/lib/exportUtils";
import { generatePDFWithTemplate } from "@/src/lib/pdfTemplate";
import { formatoComision, valorComision } from "@/src/lib/comision";

const ITEMS_PER_PAGE = 8;
const RUTA_SERVICIOS = "/services-admin";

export default function ServiceGrid() {
  const router = useRouter();

  const [servicios, setServicios] = useState<ServicioItem[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Servicio seleccionado para mostrar la ficha
  const [servicioSeleccionado, setServicioSeleccionado] =
    useState<ServicioItem | null>(null);

  // ==========================================================
  // CARGAR CATEGORÍAS
  // ==========================================================
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

  // ==========================================================
  // CARGAR SERVICIOS
  // ==========================================================
  const fetchServicios = useCallback(async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/servicios?incluirInactivos=1");

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

  // ==========================================================
  // FILTRADO
  // ==========================================================
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

  // ==========================================================
  // RESETEAR PÁGINA
  // ==========================================================
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategoria, searchQuery]);

  // ==========================================================
  // PAGINACIÓN
  // ==========================================================
  const totalPages = Math.ceil(filteredServicios.length / ITEMS_PER_PAGE) || 1;

  const paginatedServicios = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;

    return filteredServicios.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredServicios, currentPage]);

  // ==========================================================
  // VER FICHA
  // ==========================================================
  const handleVerFicha = (servicio: ServicioItem) => {
    setServicioSeleccionado(servicio);
  };

  // ==========================================================
  // EDITAR
  // ==========================================================
  const handleEditar = (evento: React.MouseEvent, servicio: ServicioItem) => {
    evento.stopPropagation();

    router.push(`${RUTA_SERVICIOS}/${servicio.id}/editar`);
  };

  // ==========================================================
  // EXPORTAR
  // ==========================================================
  const handleExport = (format: "excel" | "pdf") => {
    if (format === "excel") {
      const data = filteredServicios.map((s) => ({
        ID: s.id,
        Nombre: s.nombre,
        Categoría: s.categoria?.nombre || "Sin Categoría",
        Precio: `$${Number(s.precio).toFixed(2)}`,
        Comisión: formatoComision(valorComision(s), s.tipoComision),
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
          "Comisión",
          "Estado",
        ],
        rows: filteredServicios.map((s) => [
          s.id,
          s.nombre,
          s.categoria?.nombre || "N/A",
          `$${Number(s.precio).toFixed(2)}`,
          formatoComision(valorComision(s), s.tipoComision),
          s.estado ? "Activo" : "Inactivo",
        ]),
        filename: "Reporte_Servicios_BeautyZone",
      });
    }

    setShowExportMenu(false);
  };

  // ==========================================================
  // OPCIONES DEL FILTRO
  // ==========================================================
  const categoriaOptions = [
    {
      label: "Todas las categorías",
      value: "",
    },
    ...categorias.map((c) => ({
      label: c.nombre,
      value: c.id.toString(),
    })),
  ];

  return (
    <>
      <div className="space-y-6">
        {/* =====================================================
            BARRA SUPERIOR
        ===================================================== */}
        <div className="relative z-20 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="w-full sm:w-64">
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

          {/* BOTONES */}
          <div className="flex items-center justify-end gap-2">
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-white/90 bg-white/60 hover:bg-white text-[#32130E] shadow-2xs"
                onClick={() => setShowExportMenu(!showExportMenu)}
              >
                <Download className="w-3.5 h-3.5 text-[#32130E]" />
                Descargar
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
              onClick={() => router.push(`${RUTA_SERVICIOS}/nuevo`)}
              size="sm"
              className="gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo Servicio</span>
            </Button>
          </div>
        </div>

        {/* =====================================================
            GRID
        ===================================================== */}
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
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => handleVerFicha(item)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleVerFicha(item);
                  }
                }}
                className="group flex flex-col text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9D4B4C] rounded-[1.25rem]"
              >
                {/* IMAGEN */}
                <div className="relative w-full h-52 bg-white rounded-[1.25rem] rounded-br-none overflow-hidden shadow-2xs">
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

                  {/* BOTÓN EDITAR */}
                  <div
                    className="absolute -bottom-[6px] -right-[6px] w-[5.5rem] h-[5.5rem] bg-[#F0ECEA] rounded-tl-[50%] flex items-center justify-center
                    before:content-[''] before:absolute before:bottom-[6px] before:-left-[20px] before:w-[20px] before:h-[20px] before:bg-transparent before:rounded-br-[20px] before:shadow-[5px_5px_0_5px_#F0ECEA]
                    after:content-[''] after:absolute after:-top-[20px] after:right-[6px] after:w-[20px] after:h-[20px] after:bg-transparent after:rounded-br-[20px] after:shadow-[5px_5px_0_5px_#F0ECEA]"
                  >
                    <button
                      type="button"
                      onClick={(e) => handleEditar(e, item)}
                      title="Editar servicio"
                      aria-label={`Editar ${item.nombre}`}
                      className="w-12 h-12 bg-[#32130E] group-hover:bg-[#7A5C55] rounded-full flex items-center justify-center transition-all duration-300 shadow-md transform group-hover:scale-110 cursor-pointer"
                    >
                      <ArrowUpRight className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>

                {/* DETALLES */}
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

                    <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
                      {item.categoria && (
                        <span className="px-2.5 py-1 bg-[#d3b19a]/40 text-[#542d18] text-[10px] font-bold uppercase rounded-md">
                          {item.categoria.nombre}
                        </span>
                      )}

                      <span className="px-2.5 py-1 bg-[#70b3b1]/30 text-[#1f4948] text-[10px] font-bold uppercase rounded-md">
                        Comisión:{" "}
                        {formatoComision(
                          valorComision(item),
                          item.tipoComision,
                        )}
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
                No se encontraron servicios registrados con los filtros
                aplicados.
              </div>
            )}
          </div>
        )}

        {/* =====================================================
            PAGINACIÓN
        ===================================================== */}
        {!loading && filteredServicios.length > 0 && (
          <div className="flex items-center justify-between pt-2 border-t border-black/5">
            <p className="text-xs text-[#7A5C55] font-semibold">
              Mostrando{" "}
              {Math.min(
                (currentPage - 1) * ITEMS_PER_PAGE + 1,
                filteredServicios.length,
              )}{" "}
              a{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredServicios.length)}{" "}
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
      </div>

      {/* =======================================================
          MODAL / FICHA DEL SERVICIO
      ======================================================= */}
      {servicioSeleccionado && (
        <div
          className="fixed inset-y-0 right-0 left-[var(--sidebar-width)] z-[60] flex items-center justify-center p-4 sm:p-6 bg-[#32130E]/25 backdrop-blur-sm"
          onClick={() => setServicioSeleccionado(null)}
        >
          <div
            className="w-full max-w-5xl max-h-[calc(100vh-2rem)] overflow-hidden bg-white/90 backdrop-blur-2xl border border-white rounded-[2rem] shadow-[0_20px_60px_rgba(50,19,14,0.18)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ENCABEZADO */}
            <div className="px-6 py-5 border-b border-[#32130E]/10 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#32130E]">
                  Información del servicio
                </h2>

                <p className="text-xs text-[#7A5C55] font-medium mt-1">
                  Detalles del servicio seleccionado
                </p>
              </div>

              <button
                type="button"
                onClick={() => setServicioSeleccionado(null)}
                className="p-2 rounded-xl text-[#7A5C55] hover:text-[#32130E] hover:bg-[#32130E]/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* FORMULARIO EN MODO SOLO LECTURA */}
            <div className="p-6 overflow-hidden">
              <NuevoServicioForm
                servicioAEditar={servicioSeleccionado}
                modoLectura
                onClose={() => setServicioSeleccionado(null)}
                onSuccess={fetchServicios}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
