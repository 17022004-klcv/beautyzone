"use client";

import { Percent, Banknote } from "lucide-react";
import {
  TIPOS_COMISION,
  type TipoComision,
} from "@/src/app/types/servicio";

interface Props {
  value: TipoComision;
  onChange: (tipo: TipoComision) => void;
  disabled?: boolean;
  className?: string;
}

const OPCIONES: { valor: TipoComision; etiqueta: string; Icono: typeof Percent }[] =
  [
    { valor: "PORCENTAJE", etiqueta: "Por %", Icono: Percent },
    { valor: "MONTO", etiqueta: "Por monto", Icono: Banknote },
  ];

export default function ToggleComision({
  value,
  onChange,
  disabled,
  className = "",
}: Props) {
  const activo = TIPOS_COMISION.includes(value) ? value : "PORCENTAJE";

  return (
    <div
      role="radiogroup"
      aria-label="Tipo de comisión"
      className={`inline-flex items-center gap-1 p-1 rounded-xl bg-[#F5EBE1] border border-[#D8C3B3] ${className}`}
    >
      {OPCIONES.map(({ valor, etiqueta, Icono }) => {
        const seleccionado = valor === activo;

        return (
          <button
            key={valor}
            type="button"
            role="radio"
            aria-checked={seleccionado}
            disabled={disabled}
            onClick={() => onChange(valor)}
            title={
              valor === "PORCENTAJE"
                ? "La comisión se calcula sobre el precio del servicio"
                : "La comisión es un monto fijo, sin importar el precio"
            }
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              seleccionado
                ? "bg-[#572219] text-[#F5EBE1] shadow-2xs"
                : "text-[#7A5C55] hover:text-[#32130E]"
            }`}
          >
            <Icono className="w-3.5 h-3.5" />
            {etiqueta}
          </button>
        );
      })}
    </div>
  );
}
