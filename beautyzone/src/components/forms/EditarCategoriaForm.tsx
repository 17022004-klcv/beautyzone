"use client";

import { useState } from "react";
import Button from "@/src/components/ui/Button";
import { useToast } from "@/src/components/ui/Toast";
import { Categoria, TIPOS_CATEGORIA } from "@/src/app/types/producto";

interface Props {
  categoria: Categoria;
  onClose: () => void;
  onSuccess: () => void;
}

const ETIQUETA_TIPO: Record<Categoria["tipo"], string> = {
  PRODUCTO: "Producto",
  SERVICIO: "Servicio",
};

export default function EditarCategoriaForm({
  categoria,
  onClose,
  onSuccess,
}: Props) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: categoria.nombre,
    tipo: categoria.tipo,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/categorias/${categoria.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const detalle = await res.json().catch(() => null);
        toast.error(
          "No se pudo actualizar",
          detalle?.error ?? "Ocurrió un error al guardar la categoría.",
        );
        return;
      }

      toast.exito("Categoría actualizada", `${formData.nombre} se guardó.`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al actualizar categoría:", error);
      toast.error(
        "No se pudo actualizar",
        "Revisa tu conexión e intenta otra vez.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-[#572219] mb-1">
          Nombre de la Categoría
        </label>
        <input
          type="text"
          required
          className="w-full px-3 py-2 border border-[#D8C3B3] rounded-xl text-sm focus:outline-none focus:border-[#9D4B4C]"
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#572219] mb-1">
          Tipo
        </label>
        <select
          className="w-full px-3 py-2 border border-[#D8C3B3] rounded-xl text-sm focus:outline-none focus:border-[#9D4B4C]"
          value={formData.tipo}
          onChange={(e) =>
            setFormData({ ...formData, tipo: e.target.value as Categoria["tipo"] })
          }
        >
          {TIPOS_CATEGORIA.map((tipo) => (
            <option key={tipo} value={tipo}>
              {ETIQUETA_TIPO[tipo]}
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-[10px] text-[#7A5C55]">
          Cambiar el tipo reclasifica la categoría. Los productos y servicios
          que ya la usan no se mueven.
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>
    </form>
  );
}
