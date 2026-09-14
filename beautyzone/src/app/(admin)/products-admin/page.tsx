"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Download, FileSpreadsheet, FileText } from "lucide-react";
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

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "Productos") {
        const res = await fetch("/api/productos");
        if (res.ok) setProductos(await res.json());
      } else {
        const res = await fetch("/api/categorias");
        if (res.ok) setCategorias(await res.json());
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = (format: "excel" | "pdf") => {
    if (activeTab === "Productos") {
      ExportService.exportProductos(productos, format);
    } else {
      ExportService.exportCategorias(categorias, format);
    }
    setShowExportMenu(false);
  };

  return (
    <div className="space-y-6 p-6">
      {/* TÍTULO Y CONTROLES SUPERIORES */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-serif font-bold text-[#32130E]">
          Gestión de {activeTab}
        </h1>

        <div className="flex items-center gap-3">
          {/* BOTÓN MENÚ DESCARGAR */}
          <div className="relative">
            <Button
              variant="outline"
              size="md"
              className="gap-2 text-sm font-semibold"
              onClick={() => setShowExportMenu(!showExportMenu)}
            >
              <Download className="w-4 h-4" />
              <span>Descargar</span>
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

          {/* BOTÓN DINÁMICO (+ AGREGAR) */}
          <Button
            size="md"
            className="gap-2 px-4 py-2.5 text-sm font-semibold"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-5 h-5" />
            <span>
              {activeTab === "Productos"
                ? "Agregar Producto"
                : "Agregar Categoría"}
            </span>
          </Button>
        </div>
      </div>

      {/* COMPONENTE DE FILTRO / TAB (CategoryFilter) */}
      <CategoryFilter
        categories={TABS}
        selectedCategory={activeTab}
        onSelectCategory={setActiveTab}
      />

      {/* CONTENEDOR DE TABLA / CONTENIDO */}
      <div className="bg-[#FFFFFF] border border-[#D8C3B3] rounded-2xl p-6 shadow-sm min-h-[400px]">
        {loading ? (
          <div className="flex justify-center items-center py-20 text-[#7A5C55] text-sm">
            Cargando {activeTab.toLowerCase()}...
          </div>
        ) : activeTab === "Productos" ? (
          // TABLA DE PRODUCTOS
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#D8C3B3] text-xs font-bold text-[#572219]">
                  <th className="py-3 px-4">Nombre</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Precio</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5EBE1]">
                {productos.map((prod) => (
                  <tr key={prod.id} className="hover:bg-[#F5EBE1]/40 text-sm">
                    <td className="py-3 px-4 font-semibold text-[#32130E]">
                      {prod.nombre}
                    </td>
                    <td className="py-3 px-4 text-[#7A5C55]">
                      {prod.categoria?.nombre || "Sin Categoría"}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#572219]">
                      ${Number(prod.precio).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold rounded-md ${
                          prod.stock <= (prod.stockMinimo || 5)
                            ? "bg-red-100 text-red-700"
                            : "bg-stone-100 text-stone-700"
                        }`}
                      >
                        {prod.stock} uds.
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs px-2 py-0.5 rounded-md bg-green-100 text-green-800 font-semibold">
                        Activo
                      </span>
                    </td>
                  </tr>
                ))}
                {productos.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-8 text-xs text-[#7A5C55]"
                    >
                      No hay productos registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          // TABLA DE CATEGORÍAS
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#D8C3B3] text-xs font-bold text-[#572219]">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Nombre</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5EBE1]">
                {categorias.map((cat) => (
                  <tr key={cat.id} className="hover:bg-[#F5EBE1]/40 text-sm">
                    <td className="py-3 px-4 text-[#7A5C55]">#{cat.id}</td>
                    <td className="py-3 px-4 font-semibold text-[#32130E]">
                      {cat.nombre}
                    </td>
                    <td className="py-3 px-4 text-[#7A5C55]">
                      <span className="bg-[#F5EBE1] text-[#572219] px-2 py-0.5 rounded-md text-xs font-medium">
                        {cat.tipo}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs px-2 py-0.5 rounded-md bg-green-100 text-green-800 font-semibold">
                        Activo
                      </span>
                    </td>
                  </tr>
                ))}
                {categorias.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-8 text-xs text-[#7A5C55]"
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

      {/* MODAL DINÁMICO (PRODUCTO O CATEGORÍA SEGÚN PESTAÑA ACTIVA) */}
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
