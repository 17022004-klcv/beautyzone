"use client";

import { Hash, Tag, Layers, CalendarClock } from "lucide-react";
import { Categoria, TIPOS_CATEGORIA } from "@/src/app/types/producto";

const ETIQUETA_TIPO: Record<Categoria["tipo"], string> = {
  PRODUCTO: "Producto",
  SERVICIO: "Servicio",
};

function fechaLegible(valor?: string | Date) {
  if (!valor) return "No registrado";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "No registrado";

  return fecha.toLocaleDateString("es-SV", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function DetalleCategoriaModal({
  categoria,
}: {
  categoria: Categoria;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7A5C55]">
          <Hash className="w-3.5 h-3.5" /> Categoría #{categoria.id}
        </span>
        <span
          className={`text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${
            categoria.estado
              ? "bg-[#2E6F40]/10 text-[#2E6F40] border-[#2E6F40]/20"
              : "bg-[#B83A3A]/10 text-[#B83A3A] border-[#B83A3A]/20"
          }`}
        >
          {categoria.estado ? "Activo" : "Inactivo"}
        </span>
      </div>

      <div className="p-3.5 rounded-2xl bg-[#F5EBE1] border border-[#D8C3B3] space-y-1">
        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#7A5C55]">
          <Tag className="w-3 h-3" /> Nombre
        </span>
        <p className="text-sm font-bold text-[#32130E]">{categoria.nombre}</p>
      </div>

      <div className="p-3 rounded-2xl bg-[#F5EBE1] border border-[#D8C3B3] space-y-1">
        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#7A5C55]">
          <Layers className="w-3 h-3" /> Tipo
        </span>
        <p className="text-xs font-bold text-[#32130E]">
          {ETIQUETA_TIPO[categoria.tipo] ?? categoria.tipo}
        </p>
        <p className="text-[10px] text-[#7A5C55]">
          {TIPOS_CATEGORIA.includes(categoria.tipo)
            ? `Clasifica ${
                categoria.tipo === "PRODUCTO" ? "productos" : "servicios"
              } del inventario.`
            : "Tipo sin catalogar."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="p-3 rounded-2xl bg-white/60 border border-[#D8C3B3] space-y-1">
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#7A5C55]">
            <CalendarClock className="w-3 h-3" /> Creada
          </span>
          <p className="text-xs font-bold text-[#32130E]">
            {fechaLegible(categoria.createdAt)}
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-white/60 border border-[#D8C3B3] space-y-1">
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#7A5C55]">
            <CalendarClock className="w-3 h-3" /> Actualizada
          </span>
          <p className="text-xs font-bold text-[#32130E]">
            {fechaLegible(categoria.updatedAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
