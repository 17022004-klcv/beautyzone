"use client";

import { User, Clock, CalendarIcon, Scissors, StickyNote, Hash } from "lucide-react";
import { ESTADOS_CITA, type CitaDetalle, type EstadoCita } from "@/src/app/types/agenda";

/**
 * Paleta por estado. Solo usa tonos del sistema de BeautyZone: el marrón de
 * marca, el ocre de aviso y el rojo de error. Nada de verde ni azul.
 */
const ESTILO_ESTADO: Record<string, string> = {
  PENDIENTE: "bg-[#F5EBE1] text-[#C07D2B] border-[#C07D2B]",
  CONFIRMADA: "bg-[#572219] text-[#F5EBE1] border-[#572219]",
  EN_PROCESO: "bg-[#9D4B4C] text-white border-[#9D4B4C]",
  FINALIZADA: "bg-[#7A5C55] text-[#F5EBE1] border-[#7A5C55]",
  CANCELADA: "bg-[#FBF0F0] text-[#B83A3A] border-[#B83A3A] line-through",
};

export function estadoEnCss(estado: string) {
  return (
    ESTILO_ESTADO[estado] ??
    "bg-[#F5EBE1] text-[#7A5C55] border-[#D8C3B3]"
  );
}

export function EtiquetaEstado({ estado }: { estado: string }) {
  return (
    <span
      className={`inline-flex items-center text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${estadoEnCss(estado)}`}
    >
      {(estado as EstadoCita) in ESTILO_ESTADO
        ? estado.replace(/_/g, " ")
        : estado || "Sin estado"}
    </span>
  );
}

export default function DetalleCitaModal({ cita }: { cita: CitaDetalle }) {
  const fechaLegible = new Date(`${cita.fecha}T12:00:00`).toLocaleDateString(
    "es-ES",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" },
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7A5C55]">
          <Hash className="w-3.5 h-3.5" /> Cita #{cita.id}
        </span>
        <EtiquetaEstado estado={cita.estado} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="p-3 rounded-2xl bg-[#F5EBE1] border border-[#D8C3B3] space-y-1">
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#7A5C55]">
            <User className="w-3 h-3" /> Cliente
          </span>
          <p className="text-xs font-bold text-[#32130E]">{cita.cliente}</p>
        </div>

        <div className="p-3 rounded-2xl bg-[#F5EBE1] border border-[#D8C3B3] space-y-1">
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#7A5C55]">
            <CalendarIcon className="w-3 h-3" /> Fecha
          </span>
          <p className="text-xs font-bold text-[#32130E] capitalize">
            {fechaLegible}
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-[#F5EBE1] border border-[#D8C3B3] space-y-1">
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#7A5C55]">
            <Clock className="w-3 h-3" /> Hora
          </span>
          <p className="text-xs font-bold text-[#32130E]">{cita.hora} hs</p>
        </div>
      </div>

      <div>
        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#7A5C55] mb-2">
          <Scissors className="w-3 h-3" /> Servicios
        </span>
        <div className="space-y-2">
          {cita.detalles.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/70 border border-[#D8C3B3]"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#32130E]">{d.servicio}</p>
                <p className="text-[11px] text-[#7A5C55]">
                  Estilista: {d.estilista}
                </p>
              </div>
              <span className="text-xs font-bold text-[#32130E] shrink-0">
                ${d.precioHistorico.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-[#D8C3B3]">
          <span className="text-xs font-bold text-[#7A5C55]">Total</span>
          <span className="text-base font-bold text-[#32130E]">
            ${cita.total.toFixed(2)}
          </span>
        </div>
      </div>

      {cita.notas && (
        <div>
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#7A5C55] mb-1.5">
            <StickyNote className="w-3 h-3" /> Notas
          </span>
          <p className="text-xs text-[#7A5C55] p-3 rounded-2xl bg-white/70 border border-[#D8C3B3] whitespace-pre-wrap">
            {cita.notas}
          </p>
        </div>
      )}

      {cita.estado === "CANCELADA" && (
        <p className="text-[11px] text-[#B83A3A] font-semibold text-center">
          Esta cita fue cancelada.
        </p>
      )}

      <p className="text-[10px] text-[#7A5C55] text-center pt-1 border-t border-[#D8C3B3]">
        Estados posibles: {ESTADOS_CITA.map((e) => e.replace(/_/g, " ")).join(" · ")}
      </p>
    </div>
  );
}
