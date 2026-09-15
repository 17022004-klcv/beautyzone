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
      <div className="flex items-center justify-between gap-4">
        <select
          value={selectedCategoria}
          onChange={(e) => setSelectedCategoria(e.target.value)}
          className="px-4 py-2 border border-[#D8C3B3] rounded-xl text-xs font-medium bg-[#FFFFFF] text-[#32130E] focus:outline-none"
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
              className="gap-1.5"
              onClick={() => setShowExportMenu(!showExportMenu)}
            >
              <Download className="w-3.5 h-3.5" /> Descargar
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

          <Button onClick={handleCreateNew} size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#7A5C55] text-xs">
          Cargando catálogo de servicios...
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {servicios.map((item) => (
            <div
              key={item.id}
              className="bg-[#FFFFFF] border border-[#D8C3B3] rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-all relative"
            >
              <div className="relative w-full h-32 bg-[#F5EBE1] rounded-xl overflow-hidden mb-3">
                {item.imagen ? (
                  <Image
                    src={item.imagen}
                    alt={item.nombre}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#7A5C55] text-xs font-medium">
                    Sin Imagen
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <p className="font-semibold text-[#32130E] text-xs line-clamp-1">
                    {item.nombre}
                  </p>
                  <p className="font-serif font-bold text-[#572219] text-sm">
                    ${Number(item.precio).toFixed(2)}
                  </p>
                </div>

                <div className="relative">
                  <button
                    onClick={() =>
                      setActiveMenuId(activeMenuId === item.id ? null : item.id)
                    }
                    className="p-1 hover:bg-[#F5EBE1] rounded-lg text-[#7A5C55] transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* MENÚ DESPLEGABLE CON EDITAR Y ELIMINAR */}
                  {activeMenuId === item.id && (
                    <div className="absolute right-0 bottom-8 w-32 bg-white border border-[#D8C3B3] rounded-xl shadow-lg z-30 overflow-hidden divide-y divide-[#F5EBE1]">
                      <button
                        onClick={() => handleEdit(item)}
                        className="w-full px-3 py-2 text-xs font-semibold text-[#572219] hover:bg-[#F5EBE1] flex items-center gap-2"
                      >
                        <Pencil className="w-3.5 h-3.5 text-blue-600" /> Editar
                      </button>
                      <button
                        onClick={() => handleDeleteServicio(item.id)}
                        className="w-full px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {servicios.length === 0 && (
            <div className="col-span-full text-center py-12 text-xs text-[#7A5C55]">
              No hay servicios registrados en esta categoría.
            </div>
          )}
        </div>
      )}

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
