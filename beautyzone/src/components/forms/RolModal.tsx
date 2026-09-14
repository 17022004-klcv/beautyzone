"use client";

import { useState, useEffect } from "react";
import { RoleItem } from "@/src/app/types/usuario";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (nombre: string, id?: number) => Promise<void>;
  rol?: RoleItem | null;
}

export function RolModal({ isOpen, onClose, onSave, rol }: Props) {
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    if (rol) {
      setNombre(rol.nombre);
    } else {
      setNombre("");
    }
  }, [rol]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    await onSave(nombre, rol?.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
        <div className="px-6 py-4 bg-indigo-600 text-white flex justify-between items-center">
          <h3 className="font-semibold text-lg">
            {rol ? "Editar Rol" : "Nuevo Rol"}
          </h3>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white font-bold text-xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
              Nombre del Rol
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Estilista, Admin, Cajero"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm text-gray-800"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition font-medium shadow-sm"
            >
              Guardar Rol
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
