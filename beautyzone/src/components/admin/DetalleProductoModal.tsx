"use client";

import {
  Hash,
  Package,
  Tag,
  Coins,
  Boxes,
  TriangleAlert,
  StickyNote,
} from "lucide-react";
import { Producto } from "@/src/app/types/producto";

export default function DetalleProductoModal({
  producto,
}: {
  producto: Producto;
}) {
  const precio = Number(producto.precio);
  const stockBajo = producto.stock <= (producto.stockMinimo ?? 5);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7A5C55]">
          <Hash className="w-3.5 h-3.5" /> Producto #{producto.id}
        </span>
        <span
          className={`text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${
            producto.estado
              ? "bg-[#2E6F40]/10 text-[#2E6F40] border-[#2E6F40]/20"
              : "bg-[#B83A3A]/10 text-[#B83A3A] border-[#B83A3A]/20"
          }`}
        >
          {producto.estado ? "Activo" : "Inactivo"}
        </span>
      </div>

      <div className="p-3.5 rounded-2xl bg-[#F5EBE1] border border-[#D8C3B3] space-y-1">
        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#7A5C55]">
          <Package className="w-3 h-3" /> Nombre
        </span>
        <p className="text-sm font-bold text-[#32130E]">{producto.nombre}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="p-3 rounded-2xl bg-[#F5EBE1] border border-[#D8C3B3] space-y-1">
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#7A5C55]">
            <Tag className="w-3 h-3" /> Categoría
          </span>
          <p className="text-xs font-bold text-[#32130E]">
            {producto.categoria?.nombre || "Sin Categoría"}
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-[#F5EBE1] border border-[#D8C3B3] space-y-1">
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#7A5C55]">
            <Coins className="w-3 h-3" /> Precio
          </span>
          <p className="text-xs font-bold text-[#32130E]">
            ${precio.toFixed(2)}
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-[#F5EBE1] border border-[#D8C3B3] space-y-1">
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#7A5C55]">
            <Boxes className="w-3 h-3" /> Stock
          </span>
          <p className="text-xs font-bold text-[#32130E]">
            {producto.stock} uds.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="p-3 rounded-2xl bg-white/60 border border-[#D8C3B3] space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A5C55]">
            Stock mínimo
          </span>
          <p className="text-xs font-bold text-[#32130E]">
            {producto.stockMinimo ?? "N/A"} uds.
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-white/60 border border-[#D8C3B3] space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A5C55]">
            Valor en inventario
          </span>
          <p className="text-xs font-bold text-[#32130E]">
            ${(precio * producto.stock).toFixed(2)}
          </p>
        </div>
      </div>

      {stockBajo && (
        <p className="flex items-start gap-2 p-3 rounded-2xl bg-[#FBF0F0] border border-[#B83A3A]/20 text-[10px] font-semibold text-[#B83A3A]">
          <TriangleAlert className="w-3.5 h-3.5 shrink-0 mt-px" />
          El stock está en o por debajo del mínimo ({producto.stockMinimo ?? 5}{" "}
          uds.). Considera reponer antes de que se agote.
        </p>
      )}

      <div className="p-3 rounded-2xl bg-white/60 border border-[#D8C3B3] space-y-1">
        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#7A5C55]">
          <StickyNote className="w-3 h-3" /> Descripción
        </span>
        <p className="text-xs text-[#572219] whitespace-pre-line">
          {producto.descripcion || "Sin descripción registrada."}
        </p>
      </div>
    </div>
  );
}
