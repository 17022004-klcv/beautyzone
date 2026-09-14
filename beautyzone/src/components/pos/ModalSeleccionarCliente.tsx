"use client";

import { useState } from "react";
import { Search, UserCheck, UserX } from "lucide-react";
import Button from "@/src/components/ui/Button";

interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string | null;
}

interface ModalClienteProps {
  clientes: Cliente[];
  onSelectCliente: (cliente: Cliente | null) => void;
  onClose: () => void;
}

export default function ModalSeleccionarCliente({
  clientes,
  onSelectCliente,
  onClose,
}: ModalClienteProps) {
  const [query, setQuery] = useState("");

  const clientesFiltrados = clientes.filter(
    (c) =>
      `${c.nombre} ${c.apellido}`.toLowerCase().includes(query.toLowerCase()) ||
      c.correo.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-[#D8C3B3]">
        <div className="flex justify-between items-center border-b border-[#F5EBE1] pb-3 mb-4">
          <h2 className="text-lg font-serif font-bold text-[#32130E]">
            Asociar Cliente a la Venta
          </h2>
          <button onClick={onClose} className="text-[#7A5C55] font-bold">
            ✕
          </button>
        </div>

        {/* Búsqueda */}
        <div className="relative mb-4">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#7A5C55]" />
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#D8C3B3] rounded-xl text-[#32130E] focus:outline-none focus:ring-2 focus:ring-[#9D4B4C]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Cliente Contado por Defecto */}
        <button
          onClick={() => {
            onSelectCliente(null);
            onClose();
          }}
          className="w-full flex items-center justify-between p-3 mb-3 bg-[#F5EBE1]/50 border border-[#D8C3B3] rounded-xl hover:bg-[#F5EBE1] text-left transition-colors"
        >
          <div className="flex items-center gap-2">
            <UserX className="w-4 h-4 text-[#7A5C55]" />
            <span className="text-xs font-bold text-[#32130E]">
              Cliente Contado / General
            </span>
          </div>
          <span className="text-[10px] bg-[#D8C3B3] text-[#32130E] px-2 py-0.5 rounded-full font-semibold">
            Por Defecto
          </span>
        </button>

        {/* Lista de Clientes */}
        <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
          {clientesFiltrados.map((c) => (
            <div
              key={c.id}
              onClick={() => {
                onSelectCliente(c);
                onClose();
              }}
              className="flex items-center justify-between p-3 border border-[#D8C3B3]/60 rounded-xl hover:border-[#572219] hover:bg-white cursor-pointer transition-all"
            >
              <div>
                <p className="text-xs font-bold text-[#32130E]">
                  {c.nombre} {c.apellido}
                </p>
                <p className="text-[11px] text-[#7A5C55]">
                  {c.correo} • {c.telefono || "Sin tel."}
                </p>
              </div>
              <UserCheck className="w-4 h-4 text-[#572219]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
