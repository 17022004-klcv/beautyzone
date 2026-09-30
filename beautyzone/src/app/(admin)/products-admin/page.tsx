"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Download,
  FileSpreadsheet,
  FileText,
  Edit,
  Power,
  Eye,
  Trash2,
} from "lucide-react";
import Button from "@/src/components/ui/Button";
import Modal from "@/src/components/ui/Modal";
import CategoryFilter from "@/src/components/ui/CategoryFilter";
import DataTable from "@/src/components/ui/DataTable";
import SearchBar from "@/src/components/ui/SearchBar";
import SearchableSelect from "@/src/components/ui/SearchableSelect";
import { useToast } from "@/src/components/ui/Toast";
import { Producto, Categoria } from "@/src/app/types/producto";
import { ExportService } from "@/src/app/services/export.service";
import { showConfirm } from "@/src/lib/sweetalert";
import { useTippy } from "@/src/app/hooks/useTippy";
import NuevoProductoForm from "@/src/components/forms/NuevoProductoForm";
import NuevaCategoriaForm from "@/src/components/forms/NuevaCategoriaForm";
import EditarProductoForm from "@/src/components/forms/EditarProductoForm";
import EditarCategoriaForm from "@/src/components/forms/EditarCategoriaForm";
import DetalleProductoModal from "@/src/components/admin/DetalleProductoModal";
import DetalleCategoriaModal from "@/src/components/admin/DetalleCategoriaModal";

const TABS = ["Productos", "Categorías"];

const CLASE_BOTON_ACCION =
  "p-1.5 rounded-xl transition border border-transparent hover:border-white/80 shadow-2xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";

export default function ProductosView() {
  const toast = useToast();
  useTippy();

  const [activeTab, setActiveTab] = useState("Productos");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const [productoDetalle, setProductoDetalle] = useState<Producto | null>(null);
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null);
  const [categoriaDetalle, setCategoriaDetalle] = useState<Categoria | null>(null);
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null);

  // Estados para filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoriaFilter, setSelectedCategoriaFilter] =
    useState("TODAS");
  const [selectedTipoFilter, setSelectedTipoFilter] = useState("TODOS");
  const [selectedEstadoFilter, setSelectedEstadoFilter] = useState("TODOS");

  const fetchData = useCallback(async () => {
    try {
      const [resProd, resCat] = await Promise.all([
        fetch("/api/productos?incluirInactivos=1"),
        fetch("/api/categorias?incluirInactivos=1"),
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
      toast.error(
        "No se pudieron cargar los datos",
        "Revisa que el servidor esté disponible.",
      );
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const recargar = useCallback(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const temporizador = setTimeout(fetchData, 0);
    return () => clearTimeout(temporizador);
  }, [fetchData]);

  // Limpiar filtros al cambiar de pestaña
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchQuery("");
    setSelectedCategoriaFilter("TODAS");
    setSelectedTipoFilter("TODOS");
    setSelectedEstadoFilter("TODOS");
  };

  const leerError = async (res: Response, porDefecto: string) => {
    const detalle = await res.json().catch(() => null);
    return detalle?.error ?? porDefecto;
  };

  const toggleEstadoProducto = useCallback(
    async (prod: Producto) => {
      const activar = !prod.estado;

      const res = await fetch(`/api/productos/${prod.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: activar }),
      });

      if (!res.ok) {
        toast.error(
          "No se pudo cambiar el estado",
          await leerError(res, "Ocurrió un error al actualizar el producto."),
        );
        return;
      }

      toast.exito(
        activar ? "Producto activado" : "Producto desactivado",
        `${prod.nombre} ahora está ${activar ? "disponible" : "fuera del inventario"}.`,
      );
      recargar();
    },
    [recargar, toast],
  );

  const toggleEstadoCategoria = useCallback(
    async (cat: Categoria) => {
      const activar = !cat.estado;

      const res = await fetch(`/api/categorias/${cat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: activar }),
      });

      if (!res.ok) {
        toast.error(
          "No se pudo cambiar el estado",
          await leerError(res, "Ocurrió un error al actualizar la categoría."),
        );
        return;
      }

      toast.exito(
        activar ? "Categoría activada" : "Categoría desactivada",
        `${cat.nombre} ahora está ${activar ? "disponible" : "oculta"}.`,
      );
      recargar();
    },
    [recargar, toast],
  );

  const eliminarProducto = useCallback(
    async (prod: Producto) => {
      const confirmado = await showConfirm(
        "¿Eliminar el producto?",
        `"${prod.nombre}" se elimina de forma permanente. Si ya aparece en alguna venta no se podrá borrar: desactívalo para conservar el historial.`,
      );

      if (!confirmado) return;

      const res = await fetch(`/api/productos/${prod.id}`, { method: "DELETE" });

      if (!res.ok) {
        toast.error(
          "No se pudo eliminar",
          await leerError(res, "Ocurrió un error al eliminar el producto."),
        );
        return;
      }

      toast.exito("Producto eliminado", `${prod.nombre} ya no está en el inventario.`);
      recargar();
    },
    [recargar, toast],
  );

  const eliminarCategoria = useCallback(
    async (cat: Categoria) => {
      const confirmado = await showConfirm(
        "¿Eliminar la categoría?",
        `"${cat.nombre}" se elimina de forma permanente. No se puede borrar si tiene productos o servicios asociados.`,
      );

      if (!confirmado) return;

      const res = await fetch(`/api/categorias/${cat.id}`, { method: "DELETE" });

      if (!res.ok) {
        toast.error(
          "No se pudo eliminar",
          await leerError(res, "Ocurrió un error al eliminar la categoría."),
        );
        return;
      }

      toast.exito("Categoría eliminada", `${cat.nombre} ya no existe.`);
      recargar();
    },
    [recargar, toast],
  );

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
              onClick={() => setProductoDetalle(p)}
              data-tippy-content="Ver ficha del producto"
              aria-label={`Ver ficha de ${p.nombre}`}
              className={`${CLASE_BOTON_ACCION} text-[#32130E] hover:bg-white/80`}
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setProductoEditando(p)}
              data-tippy-content="Editar producto"
              aria-label={`Editar ${p.nombre}`}
              className={`${CLASE_BOTON_ACCION} text-[#32130E] hover:bg-white/80`}
            >
              <Edit className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => ExportService.exportarProducto(p)}
              data-tippy-content="Descargar ficha (PDF)"
              aria-label={`Descargar ficha de ${p.nombre}`}
              className={`${CLASE_BOTON_ACCION} text-[#7A5C55] hover:bg-white/80`}
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => toggleEstadoProducto(p)}
              data-tippy-content={p.estado ? "Desactivar producto" : "Activar producto"}
              aria-label={
                p.estado ? `Desactivar ${p.nombre}` : `Activar ${p.nombre}`
              }
              className={`${CLASE_BOTON_ACCION} text-[#B83A3A] hover:bg-[#B83A3A]/10`}
            >
              <Power className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => eliminarProducto(p)}
              data-tippy-content="Eliminar producto"
              aria-label={`Eliminar ${p.nombre}`}
              className={`${CLASE_BOTON_ACCION} text-[#B83A3A] hover:bg-[#B83A3A]/10`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ),
      },
    ],
    [toggleEstadoProducto, eliminarProducto],
  );

  // Definición de columnas para Categorías
  const categoriaColumns = useMemo(
    () => [
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
              onClick={() => setCategoriaDetalle(c)}
              data-tippy-content="Ver ficha de la categoría"
              aria-label={`Ver ficha de ${c.nombre}`}
              className={`${CLASE_BOTON_ACCION} text-[#32130E] hover:bg-white/80`}
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setCategoriaEditando(c)}
              data-tippy-content="Editar categoría"
              aria-label={`Editar ${c.nombre}`}
              className={`${CLASE_BOTON_ACCION} text-[#32130E] hover:bg-white/80`}
            >
              <Edit className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => ExportService.exportarCategoria(c)}
              data-tippy-content="Descargar ficha (PDF)"
              aria-label={`Descargar ficha de ${c.nombre}`}
              className={`${CLASE_BOTON_ACCION} text-[#7A5C55] hover:bg-white/80`}
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => toggleEstadoCategoria(c)}
              data-tippy-content={c.estado ? "Desactivar categoría" : "Activar categoría"}
              aria-label={c.estado ? `Desactivar ${c.nombre}` : `Activar ${c.nombre}`}
              className={`${CLASE_BOTON_ACCION} text-[#B83A3A] hover:bg-[#B83A3A]/10`}
            >
              <Power className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => eliminarCategoria(c)}
              data-tippy-content="Eliminar categoría"
              aria-label={`Eliminar ${c.nombre}`}
              className={`${CLASE_BOTON_ACCION} text-[#B83A3A] hover:bg-[#B83A3A]/10`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ),
      },
    ],
    [toggleEstadoCategoria, eliminarCategoria],
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
            onSuccess={recargar}
          />
        ) : (
          <NuevaCategoriaForm
            onClose={() => setIsModalOpen(false)}
            onSuccess={recargar}
          />
        )}
      </Modal>

      {/* MODAL DETALLE PRODUCTO */}
      <Modal
        isOpen={!!productoDetalle}
        onClose={() => setProductoDetalle(null)}
        title={productoDetalle?.nombre ?? "Detalle del Producto"}
        subtitle="Ficha de inventario"
        maxWidth="lg"
      >
        {productoDetalle && <DetalleProductoModal producto={productoDetalle} />}
      </Modal>

      {/* MODAL EDITAR PRODUCTO */}
      <Modal
        isOpen={!!productoEditando}
        onClose={() => setProductoEditando(null)}
        title="Editar Producto"
        subtitle="Los cambios quedan registrados en la auditoría"
        maxWidth="lg"
      >
        {productoEditando && (
          <EditarProductoForm
            producto={productoEditando}
            onClose={() => setProductoEditando(null)}
            onSuccess={recargar}
          />
        )}
      </Modal>

      {/* MODAL DETALLE CATEGORÍA */}
      <Modal
        isOpen={!!categoriaDetalle}
        onClose={() => setCategoriaDetalle(null)}
        title={categoriaDetalle?.nombre ?? "Detalle de la Categoría"}
        subtitle="Ficha de clasificación"
        maxWidth="lg"
      >
        {categoriaDetalle && (
          <DetalleCategoriaModal categoria={categoriaDetalle} />
        )}
      </Modal>

      {/* MODAL EDITAR CATEGORÍA */}
      <Modal
        isOpen={!!categoriaEditando}
        onClose={() => setCategoriaEditando(null)}
        title="Editar Categoría"
        subtitle="Los cambios quedan registrados en la auditoría"
      >
        {categoriaEditando && (
          <EditarCategoriaForm
            categoria={categoriaEditando}
            onClose={() => setCategoriaEditando(null)}
            onSuccess={recargar}
          />
        )}
      </Modal>
    </div>
  );
}
