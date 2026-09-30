"use client";

import { Hash, ShieldCheck, CalendarClock, Users } from "lucide-react";
import { RoleItem } from "@/src/app/types/usuario";

function fechaLegible(valor?: Date | string) {
  if (!valor) return "No registrado";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "No registrado";

  return fecha.toLocaleDateString("es-SV", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function DetalleRolModal({ rol }: { rol: RoleItem }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7A5C55]">
          <Hash className="w-3.5 h-3.5" /> Rol #{rol.id}
        </span>
        <span
          className={`text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${
            rol.estado
              ? "bg-[#2E6F40]/10 text-[#2E6F40] border-[#2E6F40]/20"
              : "bg-[#B83A3A]/10 text-[#B83A3A] border-[#B83A3A]/20"
          }`}
        >
          {rol.estado ? "Activo" : "Inactivo"}
        </span>
      </div>

      <div className="p-3.5 rounded-2xl bg-[#F5EBE1] border border-[#D8C3B3] space-y-1">
        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#7A5C55]">
          <ShieldCheck className="w-3 h-3" /> Nombre del rol
        </span>
        <p className="text-sm font-bold text-[#32130E]">{rol.nombre}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-2xl bg-white/70 border border-[#D8C3B3] space-y-1">
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#7A5C55]">
            <Users className="w-3 h-3" /> Asignación
          </span>
          <p className="text-xs font-semibold text-[#32130E]">
            Controla el acceso al sistema
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/70 border border-[#D8C3B3] space-y-1">
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#7A5C55]">
            <CalendarClock className="w-3 h-3" /> Registrado
          </span>
          <p className="text-xs font-semibold text-[#32130E]">
            {fechaLegible(rol.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
