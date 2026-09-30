"use client";

import {
  Hash,
  Mail,
  Phone,
  ShieldCheck,
  User,
  CalendarClock,
} from "lucide-react";
import { UsuarioItem } from "@/src/app/types/usuario";

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

export default function DetalleUsuarioModal({
  usuario,
}: {
  usuario: UsuarioItem;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7A5C55]">
          <Hash className="w-3.5 h-3.5" /> Usuario #{usuario.id}
        </span>
        <span
          className={`text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${
            usuario.estado
              ? "bg-[#2E6F40]/10 text-[#2E6F40] border-[#2E6F40]/20"
              : "bg-[#B83A3A]/10 text-[#B83A3A] border-[#B83A3A]/20"
          }`}
        >
          {usuario.estado ? "Activo" : "Inactivo"}
        </span>
      </div>

      <div className="p-3.5 rounded-2xl bg-[#F5EBE1] border border-[#D8C3B3] space-y-1">
        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#7A5C55]">
          <User className="w-3 h-3" /> Nombre completo
        </span>
        <p className="text-sm font-bold text-[#32130E]">
          {usuario.nombre} {usuario.apellido}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-2xl bg-white/70 border border-[#D8C3B3] space-y-1">
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#7A5C55]">
            <Mail className="w-3 h-3" /> Correo
          </span>
          <p className="text-xs font-semibold text-[#32130E] break-words">
            {usuario.correo}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/70 border border-[#D8C3B3] space-y-1">
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#7A5C55]">
            <Phone className="w-3 h-3" /> Teléfono
          </span>
          <p className="text-xs font-semibold text-[#32130E]">
            {usuario.telefono || "N/A"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-2xl bg-white/70 border border-[#D8C3B3] space-y-1">
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#7A5C55]">
            <ShieldCheck className="w-3 h-3" /> Rol
          </span>
          <p className="text-xs font-bold text-[#32130E]">
            {usuario.rol?.nombre || "Sin Rol"}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/70 border border-[#D8C3B3] space-y-1">
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#7A5C55]">
            <CalendarClock className="w-3 h-3" /> Registrado
          </span>
          <p className="text-xs font-semibold text-[#32130E]">
            {fechaLegible(usuario.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
