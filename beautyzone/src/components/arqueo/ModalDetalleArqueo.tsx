"use client";

import {
  BILLETES,
  ETIQUETA_DENOMINACION,
  MONEDAS,
  VALOR_DENOMINACIONES,
  type ClaveDenominacion,
} from "@/src/lib/cajaDenominaciones";
import type { ConteoDenominaciones } from "@/src/app/types/arqueo";
import Modal from "@/src/components/ui/Modal";
import Button from "@/src/components/ui/Button";
import { Banknote, Coins, CreditCard, Landmark } from "lucide-react";

const money = (valor: number) => `$${valor.toFixed(2)}`;

interface ModalDetalleArqueoProps {
  abierto: boolean;
  onCerrar: () => void;
  conteo: ConteoDenominaciones;
  totalContado: number;
  totalTarjeta: number;
  totalTransferencia: number;
  montoEsperado: number;
  diferencia: number;
  /** Datos de contexto para la cabecera. */
  nombreCaja: string;
  cajero: string;
  fechaCierre: string | null;
  estadoConteo: "REALIZADO" | "PENDIENTE";
}

function Fila({
  clave,
  cantidad,
  total,
}: {
  clave: ClaveDenominacion;
  cantidad: number;
  total: number;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-2 rounded-lg px-2 py-1 transition ${
        cantidad > 0 ? "bg-white" : "opacity-45"
      }`}
    >
      <span className="flex items-center gap-2">
        <span className="grid h-6 w-10 place-items-center rounded-md border border-[#EADBCF] bg-white font-mono text-[10px] font-bold text-[#32130E]">
          {ETIQUETA_DENOMINACION[clave]}
        </span>
        <span className="text-[11px] text-[#7A5C55]">
          <span className="font-mono font-bold text-[#32130E]">{cantidad}</span>
          <span className="hidden sm:inline"> uds.</span>
        </span>
      </span>
      <span className="font-mono text-[11px] font-bold text-[#32130E]">
        {money(total)}
      </span>
    </div>
  );
}

/**
 * Vista de solo lectura del conteo: muestra el desglose de billetes y monedas
 * que se registraron, más el contraste con lo esperado.
 */
export default function ModalDetalleArqueo({
  abierto,
  onCerrar,
  conteo,
  totalContado,
  totalTarjeta,
  totalTransferencia,
  montoEsperado,
  diferencia,
  nombreCaja,
  cajero,
  fechaCierre,
  estadoConteo,
}: ModalDetalleArqueoProps) {
  const Arqueado = estadoConteo === "REALIZADO";

  return (
    <Modal
      isOpen={abierto}
      onClose={onCerrar}
      title="Detalle del arqueo"
      subtitle={`${nombreCaja} · ${cajero}${
        fechaCierre ? ` · ${new Date(fechaCierre).toLocaleString("es-SV")}` : ""
      }`}
      maxWidth="xl"
    >
      <div className="space-y-3">
        {/* Resumen */}
        <div className="grid grid-cols-4 gap-2">
          <Resumen etiqueta="Esperado" valor={money(montoEsperado)} />
          <Resumen
            etiqueta="Contado"
            valor={money(totalContado)}
            destacado
          />
          <Resumen
            etiqueta="Diferencia"
            valor={`${diferencia > 0 ? "+" : ""}${money(diferencia)}`}
            tono={
              !Arqueado
                ? "neutro"
                : diferencia < 0
                  ? "rojo"
                  : diferencia > 0
                    ? "azul"
                    : "verde"
            }
          />
          <Resumen
            etiqueta="Estado"
            valor={Arqueado ? "Contado" : "Pendiente"}
            tono={Arqueado ? "verde" : "ambar"}
          />
        </div>

        {/* Billetes a la izquierda, monedas a la derecha */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <section className="space-y-1">
            <h4 className="flex items-center gap-1.5 px-0.5 text-[9px] font-bold tracking-wider text-[#7A5C55] uppercase">
              <Banknote className="w-3 h-3" />
              Billetes
            </h4>
            <div className="space-y-0.5 rounded-xl border border-[#EADBCF] bg-[#F6F2EF]/60 p-1">
              {BILLETES.map((clave) => (
                <Fila
                  key={clave}
                  clave={clave}
                  cantidad={conteo[clave]}
                  total={conteo[clave] * VALOR_DENOMINACIONES[clave]}
                />
              ))}
            </div>
          </section>

          <section className="space-y-1">
            <h4 className="flex items-center gap-1.5 px-0.5 text-[9px] font-bold tracking-wider text-[#7A5C55] uppercase">
              <Coins className="w-3 h-3" />
              Monedas
            </h4>
            <div className="space-y-0.5 rounded-xl border border-[#EADBCF] bg-[#F6F2EF]/60 p-1">
              {MONEDAS.map((clave) => (
                <Fila
                  key={clave}
                  clave={clave}
                  cantidad={conteo[clave]}
                  total={conteo[clave] * VALOR_DENOMINACIONES[clave]}
                />
              ))}
            </div>
          </section>
        </div>

        {/* Otros métodos */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-[#EADBCF] bg-[#F6F2EF]/60 px-2.5 py-1.5">
            <CreditCard className="w-3.5 h-3.5 text-[#7A5C55]" />
            <div>
              <p className="text-[8px] tracking-wider text-[#7A5C55] uppercase">
                Tarjeta
              </p>
              <p className="font-mono text-[11px] font-bold text-[#32130E]">
                {money(totalTarjeta)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-[#EADBCF] bg-[#F6F2EF]/60 px-2.5 py-1.5">
            <Landmark className="w-3.5 h-3.5 text-[#7A5C55]" />
            <div>
              <p className="text-[8px] tracking-wider text-[#7A5C55] uppercase">
                Transferencia
              </p>
              <p className="font-mono text-[11px] font-bold text-[#32130E]">
                {money(totalTransferencia)}
              </p>
            </div>
          </div>
        </div>

        <Button variant="outline" onClick={onCerrar} className="w-full">
          Cerrar
        </Button>
      </div>
    </Modal>
  );
}

const TONOS = {
  neutro: "text-[#32130E]",
  verde: "text-[#2E6F40]",
  rojo: "text-[#B83A3A]",
  azul: "text-[#1D4E89]",
  ambar: "text-[#C07D2B]",
} as const;

function Resumen({
  etiqueta,
  valor,
  destacado = false,
  tono = "neutro",
}: {
  etiqueta: string;
  valor: string;
  destacado?: boolean;
  tono?: keyof typeof TONOS;
}) {
  return (
    <div
      className={`rounded-xl border p-2 ${
        destacado
          ? "border-[#9D4B4C]/30 bg-[#9D4B4C]/5"
          : "border-[#EADBCF] bg-white/60"
      }`}
    >
      <p className="text-[8px] font-bold tracking-wider text-[#7A5C55] uppercase">
        {etiqueta}
      </p>
      <p
        className={`mt-0.5 font-mono font-bold ${TONOS[tono]} ${
          destacado ? "text-[15px]" : "text-xs"
        }`}
      >
        {valor}
      </p>
    </div>
  );
}
