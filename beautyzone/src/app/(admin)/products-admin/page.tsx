"use client";

import { useState, useEffect, useCallback } from "react";
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

  // Cargar datos (Productos y Categorías)
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

  // Manejador para cambiar estado/toggle si aplica
  const toggleEstadoProducto = async (prod: Producto) => {
    // Lógica para cambiar estado si dispones del endpoint
    console.log("Cambiar estado de producto:", prod);
  };

  const toggleEstadoCategoria = async (cat: Categoria) => {
    // Lógica para cambiar estado si dispones del endpoint
    console.log("Cambiar estado de categoría:", cat);
  };

  const handleExport = (format: "excel" | "pdf") => {
    if (activeTab === "Productos") {
      ExportService.exportProductos?.(productos, format);
    } else {
      ExportService.exportCategorias?.(categorias, format);
    }
    setShowExportMenu(false);
  };

  return (
    <div className="space-y-6 p-6">
      {/* TÍTULO SIN FONDO Y CONTROLES SUPERIORES */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#32130E]">
            Gestión de {activeTab}
          </h1>
          <p className="text-xs font-medium text-[#7A5C55] mt-1">
            Administra el catálogo de productos y sus clasificaciones
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* MENÚ DESCARGAR */}
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

          {/* BOTÓN DINÁMICO */}
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

      {/* COMPONENTE DE FILTRO / TAB */}
      <CategoryFilter
        categories={TABS}
        selectedCategory={activeTab}
        onSelectCategory={setActiveTab}
      />

      {/* CONTENEDOR DE TABLA CON GLASSMORPHISM (IGUAL A USUARIOS) */}
      <div className="bg-white/50 backdrop-blur-xl border border-white/90 rounded-3xl p-6 shadow-[0_8px_30px_rgba(50,19,14,0.04)] min-h-[400px]">
        {loading ? (
          <div className="flex justify-center items-center py-20 text-[#7A5C55] text-xs font-semibold">
            Cargando {activeTab.toLowerCase()}...
          </div>
        ) : activeTab === "Productos" ? (
          /* TABLA DE PRODUCTOS */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#32130E]/10 text-xs font-bold text-[#32130E]">
                  <th className="py-3 px-4">Nombre</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Precio</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#32130E]/5">
                {productos.map((p) => {
                  const isLow = p.stock <= (p.stockMinimo || 5);
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-white/60 transition-colors text-xs font-medium"
                    >
                      <td className="py-3.5 px-4 font-bold text-[#32130E]">
                        {p.nombre}
                      </td>
                      <td className="py-3.5 px-4 text-[#7A5C55]">
                        {p.categoria?.nombre || "Sin Categoría"}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#32130E]">
                        ${Number(p.precio).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                            isLow
                              ? "bg-[#B83A3A]/10 border-[#B83A3A]/20 text-[#B83A3A]"
                              : "bg-white/80 border-white text-[#32130E]"
                          }`}
                        >
                          {p.stock} uds.
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider bg-[#2E6F40]/10 border-[#2E6F40]/20 text-[#2E6F40]">
                          Activo
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          onClick={() => {
                            /* Función editar */
                          }}
                          className="p-1.5 text-[#32130E] hover:bg-white/80 rounded-xl transition border border-transparent hover:border-white/80 shadow-2xs"
                          title="Editar"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggleEstadoProducto(p)}
                          className="p-1.5 rounded-xl transition border border-transparent hover:border-white/80 shadow-2xs text-[#B83A3A] hover:bg-[#B83A3A]/10"
                          title="Desactivar"
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {productos.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-12 text-xs text-[#7A5C55] font-semibold"
                    >
                      No hay productos registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* TABLA DE CATEGORÍAS */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#32130E]/10 text-xs font-bold text-[#32130E]">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Nombre de la Categoría</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#32130E]/5">
                {categorias.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-white/60 transition-colors text-xs font-medium"
                  >
                    <td className="py-3.5 px-4 text-[#7A5C55]">#{c.id}</td>
                    <td className="py-3.5 px-4 font-bold text-[#32130E]">
                      {c.nombre}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-white/80 text-[#32130E] px-2.5 py-1 rounded-full text-[10px] font-bold border border-white shadow-2xs">
                        {c.tipo}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider bg-[#2E6F40]/10 border-[#2E6F40]/20 text-[#2E6F40]">
                        Activo
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => {
                          /* Función editar */
                        }}
                        className="p-1.5 text-[#32130E] hover:bg-white/80 rounded-xl transition border border-transparent hover:border-white/80 shadow-2xs"
                        title="Editar"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleEstadoCategoria(c)}
                        className="p-1.5 rounded-xl transition border border-transparent hover:border-white/80 shadow-2xs text-[#B83A3A] hover:bg-[#B83A3A]/10"
                        title="Desactivar"
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {categorias.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-12 text-xs text-[#7A5C55] font-semibold"
                    >
                      No hay categorías registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL CON VIDRIO */}
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
