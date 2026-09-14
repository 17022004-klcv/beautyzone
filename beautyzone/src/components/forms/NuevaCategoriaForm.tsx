"use client";

import { useState } from "react";
import Button from "@/src/components/ui/Button";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function NuevaCategoriaForm({ onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "PRODUCTO",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Error al crear categoría:", error);
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
          onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
        >
          <option value="PRODUCTO">Producto</option>
          <option value="SERVICIO">Servicio</option>
        </select>
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
          {loading ? "Guardando..." : "Guardar Categoría"}
        </Button>
      </div>
    </form>
  );
}
