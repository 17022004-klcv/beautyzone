"use client";

import { useState, useEffect } from "react";
import Button from "@/src/components/ui/Button";
import { Categoria } from "@/src/app/types/producto";
import { ServicioItem } from "@/src/app/types/servicio";
import Image from "next/image";
import { Upload, X } from "lucide-react";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  servicioAEditar?: ServicioItem | null;
}

export default function NuevoServicioForm({
  onClose,
  onSuccess,
  servicioAEditar,
}: Props) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    nombre: servicioAEditar?.nombre || "",
    idcategoria: servicioAEditar?.idcategoria
      ? String(servicioAEditar.idcategoria)
      : "",
    precio: servicioAEditar?.precio ? String(servicioAEditar.precio) : "",
    porcentajeComision: servicioAEditar?.porcentajeComision
      ? String(servicioAEditar.porcentajeComision)
      : "0",
    imagen: servicioAEditar?.imagen || "",
    descripcion: servicioAEditar?.descripcion || "",
  });

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
      .catch((err) => console.error("Error al obtener categorías:", err));
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });

      if (res.ok) {
        const result = await res.json();
        setFormData((prev) => ({ ...prev, imagen: result.url }));
      }
    } catch (error) {
      console.error("Error al subir archivo:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const isEdit = Boolean(servicioAEditar);
    const url = isEdit
      ? `/api/servicios/${servicioAEditar?.id}`
      : "/api/servicios";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Error al guardar servicio:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* NOMBRE Y CATEGORÍA A LA PAR EN DOS COLUMNAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-[#572219] mb-1">
            Nombre del Servicio
          </label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 border border-[#D8C3B3] rounded-xl text-sm focus:outline-none focus:border-[#9D4B4C]"
            value={formData.nombre}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#572219] mb-1">
            Categoría
          </label>
          <select
            required
            className="w-full px-3 py-2 border border-[#D8C3B3] rounded-xl text-sm focus:outline-none focus:border-[#9D4B4C]"
            value={formData.idcategoria}
            onChange={(e) =>
              setFormData({ ...formData, idcategoria: e.target.value })
            }
          >
            <option value="">Selecciona una categoría</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-[#572219] mb-1">
            Precio ($)
          </label>
          <input
            type="number"
            step="0.01"
            required
            className="w-full px-3 py-2 border border-[#D8C3B3] rounded-xl text-sm focus:outline-none focus:border-[#9D4B4C]"
            value={formData.precio}
            onChange={(e) =>
              setFormData({ ...formData, precio: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#572219] mb-1">
            % Comisión
          </label>
          <input
            type="number"
            step="0.01"
            className="w-full px-3 py-2 border border-[#D8C3B3] rounded-xl text-sm focus:outline-none focus:border-[#9D4B4C]"
            value={formData.porcentajeComision}
            onChange={(e) =>
              setFormData({ ...formData, porcentajeComision: e.target.value })
            }
          />
        </div>
      </div>

      {/* SECCIÓN CARGA DE IMAGEN CON EXPLORADOR */}
      <div>
        <label className="block text-xs font-semibold text-[#572219] mb-1">
          Imagen del Servicio
        </label>

        {formData.imagen ? (
          <div className="relative w-full h-32 border border-[#D8C3B3] rounded-xl overflow-hidden group">
            <Image
              src={formData.imagen}
              alt="Preview"
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => setFormData({ ...formData, imagen: "" })}
              className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-md transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-[#D8C3B3] rounded-xl cursor-pointer hover:bg-[#F5EBE1]/50 transition-all">
            <Upload className="w-6 h-6 text-[#7A5C55] mb-1" />
            <span className="text-xs text-[#7A5C55] font-medium">
              {uploading ? "Subiendo..." : "Haz clic para seleccionar imagen"}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={uploading}
            />
          </label>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#572219] mb-1">
          Descripción (Opcional)
        </label>
        <textarea
          rows={2}
          className="w-full px-3 py-2 border border-[#D8C3B3] rounded-xl text-sm focus:outline-none focus:border-[#9D4B4C]"
          value={formData.descripcion}
          onChange={(e) =>
            setFormData({ ...formData, descripcion: e.target.value })
          }
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={loading || uploading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading || uploading}>
          {loading
            ? "Guardando..."
            : servicioAEditar
              ? "Actualizar Servicio"
              : "Guardar Servicio"}
        </Button>
      </div>
    </form>
  );
}
