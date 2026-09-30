"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import Button from "@/src/components/ui/Button";
import ConteoDenominacionesInput from "@/src/components/arqueo/ConteoDenominacionesInput";
import { BotonVolver } from "@/src/components/arqueo/VistaReportes";
import type { ArqueoTurno, ConteoDenominaciones } from "@/src/app/types/arqueo";
import { CLAVES_DENOMINACION } from "@/src/lib/cajaDenominaciones";

const money = (valor: number) => `$${valor.toFixed(2)}`;

export const conteoVacio = (): ConteoDenominaciones =>
  Object.fromEntries(
    CLAVES_DENOMINACION.map((c) => [c, 0]),
  ) as ConteoDenominaciones;

interface VistaConteoProps {
  turno: ArqueoTurno;
  conteo: ConteoDenominaciones;
  totalContado: number;
  tarjeta: string;
  transferencia: string;
  guardando: boolean;
  onCambioConteo: (clave: keyof ConteoDenominaciones, valor: string) => void;
  onLimpiarConteo: () => void;
  onCambioTarjeta: (valor: string) => void;
  onCambioTransferencia: (valor: string) => void;
  onGuardar: () => void;
  onVolver: () => void;
}

export default function VistaConteo({
  turno,
  conteo,
  totalContado,
  tarjeta,
  transferencia,
  guardando,
  onCambioConteo,
  onLimpiarConteo,
  onCambioTarjeta,
  onCambioTransferencia,
  onGuardar,
  onVolver,
}: VistaConteoProps) {
  const diferencia = totalContado - turno.totales.montoEsperado;

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex items-center gap-3">
        <BotonVolver onClick={onVolver} />
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#32130E]">
            Conteo de efectivo
          </h1>
          <p className="text-xs font-medium text-[#7A5C55]">
            {turno.nombreCaja} · {turno.cajero}
            {turno.estadoConteo === "REALIZADO" && (
              <span className="ml-2 rounded-full border border-[#E8C48C] bg-[#FBF1E1] px-2 py-0.5 text-[10px] font-bold text-[#C07D2B]">
                Editando un arqueo guardado
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-[#EADBCF] bg-white/60 p-5 backdrop-blur-xl">
        <dl className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <Dato
            etiqueta="Apertura"
            valor={money(turno.totales.montoApertura)}
          />
          <Dato
            etiqueta="Ventas efectivo"
            valor={money(turno.totales.ventasEfectivo)}
          />
          <Dato
            etiqueta="Esperado en cajón"
            valor={money(turno.totales.montoEsperado)}
            destacado
          />
          <Dato
            etiqueta="Total vendido"
            valor={money(turno.totales.totalVendido)}
          />
        </dl>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
        <div className="rounded-3xl border border-[#EADBCF] bg-white/60 p-5 backdrop-blur-xl">
          <ConteoDenominacionesInput
            conteo={conteo}
            disabled={guardando}
            onCambio={onCambioConteo}
            onLimpiar={onLimpiarConteo}
          />
        </div>

        <div className="space-y-3 self-start rounded-3xl border border-[#EADBCF] bg-[#F6F2EF]/70 p-4">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold tracking-wider text-[#7A5C55] uppercase">
              Total tarjeta
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={tarjeta}
              disabled={guardando}
              onChange={(e) => onCambioTarjeta(e.target.value)}
              className="w-full rounded-xl border border-[#EADBCF] bg-white/80 px-3 py-2 text-right font-mono text-xs font-bold text-[#32130E] outline-none focus:border-[#9D4B4C]"
            />
            <label className="block text-[10px] font-bold tracking-wider text-[#7A5C55] uppercase">
              Total transferencia
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={transferencia}
              disabled={guardando}
              onChange={(e) => onCambioTransferencia(e.target.value)}
              className="w-full rounded-xl border border-[#EADBCF] bg-white/80 px-3 py-2 text-right font-mono text-xs font-bold text-[#32130E] outline-none focus:border-[#9D4B4C]"
            />
          </div>

          <div className="space-y-1.5 border-t border-[#EADBCF] pt-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider text-[#7A5C55] uppercase">
                Contado
              </span>
              <span className="font-mono text-sm font-bold text-[#32130E]">
                {money(totalContado)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider text-[#7A5C55] uppercase">
                Diferencia
              </span>
              <span
                className={`font-mono text-base font-bold ${
                  diferencia < 0
                    ? "text-[#B83A3A]"
                    : diferencia > 0
                      ? "text-[#1D4E89]"
                      : "text-[#2E6F40]"
                }`}
              >
                {diferencia > 0 ? "+" : ""}
                {money(diferencia)}
              </span>
            </div>
          </div>

          <Button onClick={onGuardar} disabled={guardando} className="w-full">
            {guardando ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            Guardar arqueo
          </Button>
        </div>
      </div>
    </div>
  );
}

function Dato({
  etiqueta,
  valor,
  destacado = false,
}: {
  etiqueta: string;
  valor: string;
  destacado?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-3 ${
        destacado
          ? "border-[#9D4B4C]/30 bg-[#9D4B4C]/5"
          : "border-[#EADBCF] bg-[#F6F2EF]/60"
      }`}
    >
      <dt className="text-[9px] font-bold tracking-wider text-[#7A5C55] uppercase">
        {etiqueta}
      </dt>
      <dd
        className={`mt-0.5 font-mono font-bold text-[#32130E] ${
          destacado ? "text-base" : "text-sm"
        }`}
      >
        {valor}
      </dd>
    </div>
  );
}
