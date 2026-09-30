"use client";

import { useMemo } from "react";
import {
  BILLETES,
  ETIQUETA_DENOMINACION,
  MONEDAS,
  VALOR_DENOMINACIONES,
  type ClaveDenominacion,
} from "@/src/lib/cajaDenominaciones";
import type { ConteoDenominaciones } from "@/src/app/types/arqueo";
import { Banknote, Coins, Eraser } from "lucide-react";
import Button from "@/src/components/ui/Button";

const money = (valor: number) => `$${valor.toFixed(2)}`;

interface ConteoDenominacionesInputProps {
  conteo: ConteoDenominaciones;
  onCambio: (clave: ClaveDenominacion, valor: string) => void;
  onLimpiar?: () => void;
  disabled?: boolean;
}

/**
 * Grid de conteo por denominación. Es el mismo control para el arqueo de una
 * caja y para el conteo final del cierre administrativo; el que lo usa decide
 * qué hay debajo (totales, diferencia, botón de guardar).
 */
export default function ConteoDenominacionesInput({
  conteo,
  onCambio,
  onLimpiar,
  disabled = false,
}: ConteoDenominacionesInputProps) {
  const hayAlgo = useMemo(
    () => Object.values(conteo).some((v) => v > 0),
    [conteo],
  );

  const subtotal = (claves: ClaveDenominacion[]) =>
    claves.reduce((acc, c) => acc + conteo[c] * VALOR_DENOMINACIONES[c], 0);

  return (
    <div className="space-y-3">
      {/* Billetes a la izquierda, monedas a la derecha */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Bloque
          titulo="Billetes"
          icono={<Banknote className="w-3 h-3" />}
          claves={BILLETES}
          conteo={conteo}
          onCambio={onCambio}
          disabled={disabled}
          subtotal={subtotal(BILLETES)}
        />

        <Bloque
          titulo="Monedas"
          icono={<Coins className="w-3 h-3" />}
          claves={MONEDAS}
          conteo={conteo}
          onCambio={onCambio}
          disabled={disabled}
          subtotal={subtotal(MONEDAS)}
        />
      </div>

      {onLimpiar && (
        <Button
          type="button"
          variant="ghost"
          onClick={onLimpiar}
          disabled={disabled || !hayAlgo}
          className="w-full"
        >
          <Eraser className="w-3.5 h-3.5" />
          Limpiar conteo
        </Button>
      )}
    </div>
  );
}

function Bloque({
  titulo,
  icono,
  claves,
  conteo,
  onCambio,
  disabled,
  subtotal,
}: {
  titulo: string;
  icono: React.ReactNode;
  claves: ClaveDenominacion[];
  conteo: ConteoDenominaciones;
  onCambio: (clave: ClaveDenominacion, valor: string) => void;
  disabled: boolean;
  subtotal: number;
}) {
  return (
    <section className="space-y-1">
      <div className="flex items-center justify-between px-0.5">
        <h4 className="flex items-center gap-1.5 text-[9px] font-bold tracking-wider text-[#7A5C55] uppercase">
          {icono}
          {titulo}
        </h4>
        <span className="font-mono text-[11px] font-bold text-[#32130E]">
          {money(subtotal)}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-1.5 rounded-xl border border-[#EADBCF] bg-[#F6F2EF]/60 p-1.5">
        {claves.map((clave) => (
          <label
            key={clave}
            className="flex items-center gap-2 rounded-lg border border-[#EADBCF] bg-white/80 px-2 py-1 transition focus-within:border-[#9D4B4C] focus-within:ring-2 focus-within:ring-[#9D4B4C]/15"
          >
            <span className="w-10 shrink-0 font-mono text-[10px] font-bold text-[#32130E]">
              {ETIQUETA_DENOMINACION[clave]}
            </span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              value={conteo[clave]}
              disabled={disabled}
              onChange={(e) => onCambio(clave, e.target.value)}
              className="w-full min-w-0 bg-transparent text-right font-mono text-xs font-bold text-[#32130E] outline-none disabled:opacity-50"
            />
          </label>
        ))}
      </div>
    </section>
  );
}
