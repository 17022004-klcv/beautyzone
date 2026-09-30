"use client";

import { useState, useEffect } from "react";
import Button from "@/src/components/ui/Button";
import ToggleComision from "@/src/components/ui/ToggleComision";
import { useToast } from "@/src/components/ui/Toast";
import { Categoria } from "@/src/app/types/producto";
import { ServicioItem, type TipoComision } from "@/src/app/types/servicio";
import { valorComision } from "@/src/lib/comision";
import Image from "next/image";
import { Upload, X, Sparkles } from "lucide-react";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  servicioAEditar?: ServicioItem | null;
  modoLectura?: boolean;
}

export default function NuevoServicioForm({
  onClose,
  onSuccess,
  servicioAEditar,
  modoLectura = false,
}: Props) {
  const toast = useToast();

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    nombre: servicioAEditar?.nombre || "",

    idcategoria: servicioAEditar?.idcategoria
      ? String(servicioAEditar.idcategoria)
      : "",

    precio: servicioAEditar?.precio ? String(servicioAEditar.precio) : "",

    porcentajeComision: servicioAEditar
      ? String(valorComision(servicioAEditar))
      : "0",

    tipoComision: (String(
      servicioAEditar?.tipoComision ?? "PORCENTAJE",
    ).toUpperCase() === "MONTO"
      ? "MONTO"
      : "PORCENTAJE") as TipoComision,

    imagen: servicioAEditar?.imagen || "",

    descripcion: servicioAEditar?.descripcion || "",

    estado: servicioAEditar?.estado ?? true,
  });

  useEffect(() => {
    const url = servicioAEditar
      ? "/api/categorias?incluirInactivos=1"
      : "/api/categorias";

    fetch(url)
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
  }, [servicioAEditar]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (modoLectura) return;

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

        setFormData((prev) => ({
          ...prev,
          imagen: result.url,
        }));
      }
    } catch (error) {
      console.error("Error al subir archivo:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (modoLectura) return;

    setLoading(true);

    const isEdit = Boolean(servicioAEditar);

    const url = isEdit
      ? `/api/servicios/${servicioAEditar?.id}`
      : "/api/servicios";

    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const detalle = await res.json().catch(() => null);

        toast.error(
          isEdit ? "No se pudo actualizar" : "No se pudo guardar",
          detalle?.error ?? "Ocurrió un error al guardar el servicio.",
        );
      }
    } catch (error) {
      console.error("Error al guardar servicio:", error);

      toast.error(
        isEdit ? "No se pudo actualizar" : "No se pudo guardar",
        "Revisa tu conexión e intenta otra vez.",
      );
    } finally {
      setLoading(false);
    }
  };

  const categoriaNombre =
    servicioAEditar?.categoria?.nombre ||
    categorias.find(
      (categoria) => categoria.id.toString() === formData.idcategoria,
    )?.nombre ||
    "Sin categoría";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#572219] mb-1">
              Nombre del Servicio
            </label>

            {modoLectura ? (
              <div className="w-full px-3 py-2.5 min-h-[42px] bg-[#F5EBE1]/60 border border-[#D8C3B3] rounded-xl text-sm font-semibold text-[#32130E]">
                {formData.nombre || "Sin nombre"}
              </div>
            ) : (
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-[#D8C3B3] rounded-xl text-sm focus:outline-none focus:border-[#9D4B4C]"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nombre: e.target.value,
                  })
                }
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#572219] mb-1">
              Precio ($)
            </label>

            {modoLectura ? (
              <div className="w-full px-3 py-2.5 min-h-[42px] bg-[#F5EBE1]/60 border border-[#D8C3B3] rounded-xl text-sm font-bold text-[#32130E]">
                ${Number(formData.precio || 0).toFixed(2)}
              </div>
            ) : (
              <input
                type="number"
                step="0.01"
                min="0"
                required
                className="w-full px-3 py-2 border border-[#D8C3B3] rounded-xl text-sm focus:outline-none focus:border-[#9D4B4C]"
                value={formData.precio}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    precio: e.target.value,
                  })
                }
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#572219] mb-1">
              Descripción
            </label>

            {modoLectura ? (
              <div className="w-full min-h-[128px] px-3 py-2.5 bg-[#F5EBE1]/60 border border-[#D8C3B3] rounded-xl text-sm text-[#7A5C55] leading-relaxed">
                {formData.descripcion ||
                  "Este servicio no tiene una descripción registrada."}
              </div>
            ) : (
              <textarea
                rows={5}
                className="w-full px-3 py-2 border border-[#D8C3B3] rounded-xl text-sm focus:outline-none focus:border-[#9D4B4C] resize-none"
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    descripcion: e.target.value,
                  })
                }
              />
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* CATEGORÍA */}
          <div>
            <label className="block text-xs font-semibold text-[#572219] mb-1">
              Categoría
            </label>

            {modoLectura ? (
              <div className="w-full px-3 py-2.5 min-h-[42px] bg-[#F5EBE1]/60 border border-[#D8C3B3] rounded-xl text-sm font-semibold text-[#32130E]">
                {categoriaNombre}
              </div>
            ) : (
              <select
                required
                className="w-full px-3 py-2 border border-[#D8C3B3] rounded-xl text-sm focus:outline-none focus:border-[#9D4B4C]"
                value={formData.idcategoria}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    idcategoria: e.target.value,
                  })
                }
              >
                <option value="">Selecciona una categoría</option>

                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                    {c.estado === false ? " (inactiva)" : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#572219] mb-1">
              {formData.tipoComision === "MONTO"
                ? "Comisión ($)"
                : "Comisión (%)"}
            </label>

            {modoLectura ? (
              <div className="w-full px-3 py-2.5 min-h-[42px] bg-[#F5EBE1]/60 border border-[#D8C3B3] rounded-xl text-sm font-bold text-[#32130E]">
                {formData.tipoComision === "MONTO"
                  ? `$${Number(formData.porcentajeComision || 0).toFixed(2)}`
                  : `${Number(formData.porcentajeComision || 0).toFixed(2)}%`}
              </div>
            ) : (
              <input
                type="number"
                step="0.01"
                min="0"
                required
                className="w-full px-3 py-2 border border-[#D8C3B3] rounded-xl text-sm focus:outline-none focus:border-[#9D4B4C]"
                value={formData.porcentajeComision}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    porcentajeComision: e.target.value,
                  })
                }
              />
            )}
          </div>

          <div className="p-3 rounded-2xl bg-[#F5EBE1] border border-[#D8C3B3]">
            <div className="mb-3">
              <span className="block text-xs font-semibold text-[#572219]">
                ¿Cómo se calcula la comisión?
              </span>

              <span className="text-[10px] text-[#7A5C55]">
                {formData.tipoComision === "MONTO"
                  ? "Monto fijo para el estilista, sin importar el precio."
                  : "Porcentaje del precio del servicio."}
              </span>
            </div>

            {modoLectura ? (
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/70 border border-white">
                <span className="text-xs font-bold text-[#32130E]">
                  {formData.tipoComision === "MONTO"
                    ? "Monto fijo"
                    : "Porcentaje"}
                </span>

                <span className="text-[10px] font-semibold text-[#7A5C55]">
                  {formData.tipoComision === "MONTO"
                    ? "Valor fijo"
                    : "Sobre el precio"}
                </span>
              </div>
            ) : (
              <ToggleComision
                value={formData.tipoComision}
                onChange={(tipo) =>
                  setFormData({
                    ...formData,
                    tipoComision: tipo,
                  })
                }
                disabled={loading || uploading}
              />
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#572219] mb-2">
            Imagen del Servicio
          </label>

          {formData.imagen ? (
            <div className="relative w-full h-[285px] rounded-2xl overflow-hidden border border-[#D8C3B3] bg-[#F5EBE1]">
              <Image
                src={formData.imagen}
                alt={formData.nombre || "Imagen del servicio"}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-contain p-2"
              />

              {!modoLectura && (
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      imagen: "",
                    })
                  }
                  className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-full bg-[#32130E]/90 text-white hover:bg-[#B83A3A] shadow-lg transition-all cursor-pointer"
                  aria-label="Eliminar imagen"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : modoLectura ? (
            <div className="flex flex-col items-center justify-center w-full h-[285px] border border-[#D8C3B3] rounded-2xl bg-[#F5EBE1]/40 text-[#7A5C55]">
              <SparklesIcon />
              <span className="text-xs font-semibold mt-2">Sin imagen</span>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-[285px] border-2 border-dashed border-[#D8C3B3] rounded-2xl bg-[#F5EBE1]/30 hover:bg-[#F5EBE1]/70 hover:border-[#7A5C55] transition-all cursor-pointer">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/80 border border-white shadow-sm mb-3">
                <Upload className="w-6 h-6 text-[#7A5C55]" />
              </div>

              <span className="text-xs font-semibold text-[#572219]">
                {uploading ? "Subiendo imagen..." : "Seleccionar imagen"}
              </span>

              <span className="text-[10px] text-[#7A5C55] mt-1">
                JPG, PNG o WEBP
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

          {modoLectura && (
            <p className="mt-3 text-xs font-semibold text-[#7A5C55]">
              Estado:{" "}
              <span
                className={
                  formData.estado ? "text-[#2E6F40]" : "text-[#B83A3A]"
                }
              >
                {formData.estado ? "Activo" : "Inactivo"}
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-[#32130E]/5">
        {/* ESTADO EN EDICIÓN */}
        {!modoLectura && servicioAEditar && (
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.estado}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  estado: e.target.checked,
                })
              }
              className="w-4 h-4 accent-[#572219] cursor-pointer"
            />

            <span className="text-xs font-semibold text-[#572219]">
              Servicio activo
            </span>
          </label>
        )}

        <div className="flex justify-end gap-2 ml-auto">
          {!modoLectura && (
            <Button type="submit" disabled={loading || uploading}>
              {loading
                ? "Guardando..."
                : servicioAEditar
                  ? "Actualizar Servicio"
                  : "Guardar Servicio"}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}

function SparklesIcon() {
  return (
    <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/80 border border-white shadow-sm">
      <Sparkles className="w-6 h-6 text-[#7A5C55]" />
    </div>
  );
}
