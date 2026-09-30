"use client";

import { useEffect, useState } from "react";
import Button from "@/src/components/ui/Button";
import { useToast } from "@/src/components/ui/Toast";
import { Categoria, Producto } from "@/src/app/types/producto";

interface Props {
  producto: Producto;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditarProductoForm({
  producto,
  onClose,
  onSuccess,
}: Props) {
  const toast = useToast();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: producto.nombre,
    idcategoria: String(producto.idcategoria),
    precio: Number(producto.precio).toFixed(2),
    stock: String(producto.stock),
    stockMinimo: String(producto.stockMinimo ?? 5),
    descripcion: producto.descripcion || "",
  });

  useEffect(() => {
    fetch("/api/categorias?tipo=PRODUCTO&incluirInactivos=1")
      .then((res) => res.json())
      .then((data) => setCategorias(data))
      .catch((err) => console.error("Error al cargar categorías:", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/productos/${producto.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const detalle = await res.json().catch(() => null);
        toast.error(
          "No se pudo actualizar",
          detalle?.error ?? "Ocurrió un error al guardar el producto.",
        );
        return;
      }

      toast.exito("Producto actualizado", `${formData.nombre} se guardó.`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      toast.error("No se pudo actualizar", "Revisa tu conexión e intenta otra vez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-[#572219] mb-1">
          Nombre del Producto
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

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-[#572219] mb-1">
            Precio ($)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
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
            Stock
          </label>
          <input
            type="number"
            min="0"
            required
            className="w-full px-3 py-2 border border-[#D8C3B3] rounded-xl text-sm focus:outline-none focus:border-[#9D4B4C]"
            value={formData.stock}
            onChange={(e) =>
              setFormData({ ...formData, stock: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#572219] mb-1">
            Stock Mín.
          </label>
          <input
            type="number"
            min="0"
            className="w-full px-3 py-2 border border-[#D8C3B3] rounded-xl text-sm focus:outline-none focus:border-[#9D4B4C]"
            value={formData.stockMinimo}
            onChange={(e) =>
              setFormData({ ...formData, stockMinimo: e.target.value })
            }
          />
        </div>
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
