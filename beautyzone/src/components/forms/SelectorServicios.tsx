"use client";

import { Plus, Trash2, Scissors, UserCheck } from "lucide-react";
import type { DetalleCitaInput, OpcionAgenda } from "@/src/app/types/agenda";

const CLASE_CAMPO =
  "w-full p-2.5 bg-[#F5EBE1] border border-[#D8C3B3] rounded-xl text-xs text-[#32130E] focus:outline-none focus:ring-2 focus:ring-[#9D4B4C]";

interface SelectorServiciosProps {
  detalles: DetalleCitaInput[];
  onChange: (detalles: DetalleCitaInput[]) => void;
  servicios: OpcionAgenda[];
  estilistas: OpcionAgenda[];
  /** Los servicios que ya están en la cita no se ofrecen dos veces. */
  disableAgregar?: boolean;
}

function nombreCompleto(p: OpcionAgenda) {
  return `${p.nombre} ${p.apellido ?? ""}`.trim();
}

export default function SelectorServicios({
  detalles,
  onChange,
  servicios,
  estilistas,
  disableAgregar = false,
}: SelectorServiciosProps) {
  const actualizar = (indice: number, cambios: Partial<DetalleCitaInput>) => {
    onChange(
      detalles.map((d, i) => (i === indice ? { ...d, ...cambios } : d)),
    );
  };

  const quitar = (indice: number) => {
    // La cita no puede quedarse sin servicios: la primera línea no se borra.
    if (detalles.length <= 1) return;
    onChange(detalles.filter((_, i) => i !== indice));
  };

  const agregar = () => {
    const primerServicioLibre =
      servicios.find(
        (s) => !detalles.some((d) => d.idservicio === s.id),
      ) ?? servicios[0];
    const primerEstilista = estilistas[0];

    if (!primerServicioLibre || !primerEstilista) return;

    onChange([
      ...detalles,
      {
        idservicio: primerServicioLibre.id,
        idestilista: primerEstilista.id,
      },
    ]);
  };

  const total = detalles.reduce((acc, d) => {
    const s = servicios.find((x) => x.id === d.idservicio);
    return acc + Number(s?.precio ?? 0);
  }, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-[#32130E]">
          Servicios *
        </label>
        <span className="text-[10px] font-bold text-[#7A5C55] bg-[#F5EBE1] border border-[#D8C3B3] px-2 py-0.5 rounded-full">
          {detalles.length} {detalles.length === 1 ? "servicio" : "servicios"}
        </span>
      </div>

      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
        {detalles.map((detalle, indice) => (
          <div
            key={indice}
            className="p-3 rounded-2xl bg-[#F5EBE1] border border-[#D8C3B3] space-y-2.5"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 shrink-0 rounded-lg bg-[#572219] text-[#F5EBE1] text-[10px] font-bold flex items-center justify-center">
                {indice + 1}
              </span>
              <span className="flex-1 text-[10px] font-bold uppercase tracking-wider text-[#7A5C55]">
                {indice === 0 ? "Servicio principal" : "Servicio adicional"}
              </span>
              {detalles.length > 1 && (
                <button
                  type="button"
                  onClick={() => quitar(indice)}
                  title="Quitar servicio"
                  className="p-1 rounded-lg text-[#9D4B4C] hover:bg-white/70 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div>
              <label className="flex items-center gap-1 text-[10px] font-semibold text-[#7A5C55] mb-1">
                <Scissors className="w-3 h-3" /> Servicio
              </label>
              <select
                required
                value={detalle.idservicio || ""}
                onChange={(e) =>
                  actualizar(indice, { idservicio: Number(e.target.value) })
                }
                className={CLASE_CAMPO}
              >
                <option value="">Seleccionar servicio...</option>
                {servicios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre} (${Number(s.precio).toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1 text-[10px] font-semibold text-[#7A5C55] mb-1">
                <UserCheck className="w-3 h-3" /> Estilista
              </label>
              <select
                required
                value={detalle.idestilista || ""}
                onChange={(e) =>
                  actualizar(indice, { idestilista: Number(e.target.value) })
                }
                className={CLASE_CAMPO}
              >
                <option value="">Seleccionar estilista...</option>
                {estilistas.map((e) => (
                  <option key={e.id} value={e.id}>
                    {nombreCompleto(e)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={agregar}
          disabled={disableAgregar || servicios.length === 0 || estilistas.length === 0}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold text-[#572219] bg-white/70 border border-[#D8C3B3] hover:bg-white hover:shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="w-3.5 h-3.5" />
          Agregar servicio extra
        </button>

        <span className="text-xs font-bold text-[#32130E]">
          Total: ${total.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
