"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Download,
  FileSpreadsheet,
  FileText,
  Edit,
  Power,
} from "lucide-react";
import Button from "@/src/components/ui/Button";
import Modal from "@/src/components/ui/Modal";
import CategoryFilter from "@/src/components/ui/CategoryFilter";
import DataTable from "@/src/components/ui/DataTable";
import SearchBar from "@/src/components/ui/SearchBar";
import SearchableSelect from "@/src/components/ui/SearchableSelect";
import { Producto, Categoria } from "@/src/app/types/producto";
import { ExportService } from "@/src/app/services/export.service";
import NuevoProductoForm from "@/src/components/forms/NuevoProductoForm";
import NuevaCategoriaForm from "@/src/components/forms/NuevaCategoriaForm";

const TABS = ["Productos", "Categorías"];

export default function ProductosView() {
  const [activeTab, setActiveTab] = useState("Productos");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Estados para filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoriaFilter, setSelectedCategoriaFilter] =
    useState("TODAS");
  const [selectedTipoFilter, setSelectedTipoFilter] = useState("TODOS");
  const [selectedEstadoFilter, setSelectedEstadoFilter] = useState("TODOS");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [resProd, resCat] = await Promise.all([
        fetch("/api/productos"),
        fetch("/api/categorias"),
      ]);

      if (resProd.ok) {
        const dataProd = await resProd.json();
        setProductos(dataProd);
      }

      if (resCat.ok) {
        const dataCat = await resCat.json();
        setCategorias(dataCat);
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Limpiar filtros al cambiar de pestaña
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchQuery("");
    setSelectedCategoriaFilter("TODAS");
    setSelectedTipoFilter("TODOS");
    setSelectedEstadoFilter("TODOS");
  };

  const toggleEstadoProducto = async (prod: Producto) => {
    console.log("Cambiar estado de producto:", prod);
  };

  const toggleEstadoCategoria = async (cat: Categoria) => {
    console.log("Cambiar estado de categoría:", cat);
  };

  const handleExport = (format: "excel" | "pdf") => {
    if (activeTab === "Productos") {
      ExportService.exportProductos?.(filteredProductos, format);
    } else {
      ExportService.exportCategorias?.(filteredCategorias, format);
    }
    setShowExportMenu(false);
  };

  // Opciones para SearchableSelect (Solo de tipo PRODUCTO)
  const categoriaSelectOptions = useMemo(() => {
    const opts = categorias
      .filter((cat) => cat.tipo === "PRODUCTO")
      .map((cat) => ({
        label: cat.nombre,
        value: String(cat.id),
      }));

    return [{ label: "Todas las categorías", value: "TODAS" }, ...opts];
  }, [categorias]);

  const tipoSelectOptions = [
    { label: "Todos los tipos", value: "TODOS" },
    { label: "Producto", value: "PRODUCTO" },
    { label: "Servicio", value: "SERVICIO" },
  ];

  const estadoSelectOptions = [
    { label: "Todos los estados", value: "TODOS" },
    { label: "Activos", value: "ACTIVO" },
    { label: "Inactivos", value: "INACTIVO" },
  ];

  // Filtrado de Productos
  const filteredProductos = useMemo(() => {
    return productos.filter((prod) => {
      const matchSearch =
        prod.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.categoria?.nombre
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchCategory =
        selectedCategoriaFilter === "TODAS" ||
        String(prod.idcategoria) === selectedCategoriaFilter;

      const prodEstadoStr = prod.estado ? "ACTIVO" : "INACTIVO";
      const matchEstado =
        selectedEstadoFilter === "TODOS" ||
        prodEstadoStr === selectedEstadoFilter;

      return matchSearch && matchCategory && matchEstado;
    });
  }, [productos, searchQuery, selectedCategoriaFilter, selectedEstadoFilter]);

  // Filtrado de Categorías
  const filteredCategorias = useMemo(() => {
    return categorias.filter((cat) => {
      const matchSearch = cat.nombre
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchTipo =
        selectedTipoFilter === "TODOS" ||
        cat.tipo.toUpperCase() === selectedTipoFilter.toUpperCase();

      const catEstadoStr = cat.estado ? "ACTIVO" : "INACTIVO";
      const matchEstado =
        selectedEstadoFilter === "TODOS" ||
        catEstadoStr === selectedEstadoFilter;

      return matchSearch && matchTipo && matchEstado;
    });
  }, [categorias, searchQuery, selectedTipoFilter, selectedEstadoFilter]);

  // Definición de columnas para Productos
  const productoColumns = useMemo(
    () => [
      {
        header: "Nombre",
        accessorKey: (p: Producto) => (
          <span className="font-bold text-[#32130E]">{p.nombre}</span>
        ),
      },
      {
        header: "Categoría",
        accessorKey: (p: Producto) => (
          <span className="text-[#7A5C55]">
            {p.categoria?.nombre || "Sin Categoría"}
          </span>
        ),
      },
      {
        header: "Precio",
        accessorKey: (p: Producto) => (
          <span className="font-bold text-[#32130E]">
            ${Number(p.precio).toFixed(2)}
          </span>
        ),
      },
      {
        header: "Stock",
        accessorKey: (p: Producto) => {
          const isLow = p.stock <= (p.stockMinimo || 5);
          return (
            <span
              className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                isLow
                  ? "bg-[#B83A3A]/10 border-[#B83A3A]/20 text-[#B83A3A]"
                  : "bg-white/80 border-white text-[#32130E]"
              }`}
            >
              {p.stock} uds.
            </span>
          );
        },
      },
      {
        header: "Estado",
        accessorKey: (p: Producto) => (
          <span
            className={`text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${
              p.estado
                ? "bg-[#2E6F40]/10 border-[#2E6F40]/20 text-[#2E6F40]"
                : "bg-[#B83A3A]/10 border-[#B83A3A]/20 text-[#B83A3A]"
            }`}
          >
            {p.estado ? "Activo" : "Inactivo"}
          </span>
        ),
      },
      {
        header: "Acciones",
        accessorKey: (p: Producto) => (
          <div className="flex justify-end space-x-1">
            <button
              onClick={() => {}}
              className="p-1.5 text-[#32130E] hover:bg-white/80 rounded-xl transition border border-transparent hover:border-white/80 shadow-2xs cursor-pointer"
              title="Editar"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => toggleEstadoProducto(p)}
              className="p-1.5 rounded-xl transition border border-transparent hover:border-white/80 shadow-2xs text-[#B83A3A] hover:bg-[#B83A3A]/10 cursor-pointer"
              title={p.estado ? "Desactivar" : "Activar"}
            >
              <Power className="w-3.5 h-3.5" />
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  // Definición de columnas para Categorías
  const categoriaColumns = useMemo(
    () => [
      {
        header: "ID",
        accessorKey: (c: Categoria) => (
          <span className="text-[#7A5C55]">#{c.id}</span>
        ),
      },
      {
        header: "Nombre de la Categoría",
        accessorKey: (c: Categoria) => (
          <span className="font-bold text-[#32130E]">{c.nombre}</span>
        ),
      },
      {
        header: "Tipo",
        accessorKey: (c: Categoria) => (
          <span className="bg-white/80 text-[#32130E] px-2.5 py-1 rounded-full text-[10px] font-bold border border-white shadow-2xs uppercase">
            {c.tipo}
          </span>
        ),
      },
      {
        header: "Estado",
        accessorKey: (c: Categoria) => (
          <span
            className={`text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${
              c.estado
                ? "bg-[#2E6F40]/10 border-[#2E6F40]/20 text-[#2E6F40]"
                : "bg-[#B83A3A]/10 border-[#B83A3A]/20 text-[#B83A3A]"
            }`}
          >
            {c.estado ? "Activo" : "Inactivo"}
          </span>
        ),
      },
      {
        header: "Acciones",
        accessorKey: (c: Categoria) => (
          <div className="flex justify-end space-x-1">
            <button
              onClick={() => {}}
              className="p-1.5 text-[#32130E] hover:bg-white/80 rounded-xl transition border border-transparent hover:border-white/80 shadow-2xs cursor-pointer"
              title="Editar"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => toggleEstadoCategoria(c)}
              className="p-1.5 rounded-xl transition border border-transparent hover:border-white/80 shadow-2xs text-[#B83A3A] hover:bg-[#B83A3A]/10 cursor-pointer"
              title={c.estado ? "Desactivar" : "Activar"}
            >
              <Power className="w-3.5 h-3.5" />
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6 p-6">
      {/* CABECERA */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-[#32130E]">
          Gestión de {activeTab}
        </h1>
        <p className="text-xs font-medium text-[#7A5C55] mt-1">
          Administra el catálogo de productos y sus clasificaciones
        </p>
      </div>

      {/* PESTAÑAS (PRODUCTOS / CATEGORÍAS) */}
      <CategoryFilter
        categories={TABS}
        selectedCategory={activeTab}
        onSelectCategory={handleTabChange}
      />

      {/* FILTROS Y BOTONES PRINCIPALES */}
      <div className="relative z-20 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 w-full">
        {/* Lado izquierdo: Buscador y Selects */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="w-full sm:w-64">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={`Buscar ${activeTab.toLowerCase()}...`}
            />
          </div>

          {/* Filtro por Categoría (Pestaña Productos) */}
          {activeTab === "Productos" && (
            <div className="w-full sm:w-56">
              <SearchableSelect
                options={categoriaSelectOptions}
                placeholder="Todas las categorías"
                onSelect={(val) => setSelectedCategoriaFilter(val)}
              />
            </div>
          )}

          {/* Filtro por Tipo (Pestaña Categorías) */}
          {activeTab === "Categorías" && (
            <div className="w-full sm:w-52">
              <SearchableSelect
                options={tipoSelectOptions}
                placeholder="Todos los tipos"
                onSelect={(val) => setSelectedTipoFilter(val)}
              />
            </div>
          )}

          {/* Filtro por Estado */}
          <div className="w-full sm:w-48">
            <SearchableSelect
              options={estadoSelectOptions}
              placeholder="Todos los estados"
              onSelect={(val) => setSelectedEstadoFilter(val)}
            />
          </div>
        </div>

        {/* Lado derecho: Botones de Acción (Descargar / Agregar) */}
        <div className="flex items-center gap-3 sm:ml-auto">
          <div className="relative">
            <Button
              variant="outline"
              size="md"
              className="gap-2 text-xs font-semibold border-white/90 bg-white/60 hover:bg-white text-[#32130E] shadow-2xs"
              onClick={() => setShowExportMenu(!showExportMenu)}
            >
              <Download className="w-4 h-4 text-[#32130E]" />
              <span>Descargar</span>
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

          <Button
            size="md"
            className="gap-2 px-4 py-2 text-xs font-semibold shadow-sm"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            <span>
              {activeTab === "Productos"
                ? "Agregar Producto"
                : "Agregar Categoría"}
            </span>
          </Button>
        </div>
      </div>

      {/* TABLA DE DATOS */}
      {loading ? (
        <div className="bg-white/50 backdrop-blur-xl border border-white/90 rounded-3xl p-6 shadow-[0_8px_30px_rgba(50,19,14,0.04)] animate-pulse space-y-4">
          <div className="h-8 bg-[#32130E]/5 rounded-xl w-full" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-white/60 rounded-xl w-full" />
          ))}
        </div>
      ) : activeTab === "Productos" ? (
        <DataTable
          columns={productoColumns}
          data={filteredProductos}
          pageSize={5}
        />
      ) : (
        <DataTable
          columns={categoriaColumns}
          data={filteredCategorias}
          pageSize={5}
        />
      )}

      {/* MODAL CREAR */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={activeTab === "Productos" ? "Nuevo Producto" : "Nueva Categoría"}
        subtitle={
          activeTab === "Productos"
            ? "Ingresa los detalles del producto para el inventario"
            : "Crea una categoría para clasificar productos o servicios"
        }
      >
        {activeTab === "Productos" ? (
          <NuevoProductoForm
            onClose={() => setIsModalOpen(false)}
            onSuccess={fetchData}
          />
        ) : (
          <NuevaCategoriaForm
            onClose={() => setIsModalOpen(false)}
            onSuccess={fetchData}
          />
        )}
      </Modal>
    </div>
  );
}
