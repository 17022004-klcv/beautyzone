"use client";
import { AlertCircle, CheckCircle2, HelpCircle, X } from "lucide-react";

export type TipoDialogo = "exito" | "error" | "confirmar";

export interface LineaDetalle {
  etiqueta: string;
  valor: string;
  destacado?: boolean;
}

interface DialogoPosProps {
  abierto: boolean;
  tipo: TipoDialogo;
  titulo: string;
  mensaje?: string;
  detalle?: LineaDetalle[];
  textoConfirmar?: string;
  textoCancelar?: string;
  onConfirmar?: () => void;
  onCerrar: () => void;
  cargando?: boolean;
  /** Impide cerrar con clic fuera mientras se guarda algo. */
  bloqueado?: boolean;
}

const ESTILOS = {
  exito: {
    icono: CheckCircle2,
    circulo: "bg-[#E7F0E9] text-[#2E6F40]",
    barra: "bg-[#2E6F40]",
  },
  error: {
    icono: AlertCircle,
    circulo: "bg-[#F8E9E9] text-[#B83A3A]",
    barra: "bg-[#B83A3A]",
  },
  confirmar: {
    icono: HelpCircle,
    circulo: "bg-[#EADBCF] text-[#7A5C55]",
    barra: "bg-[#7A5C55]",
  },
} as const;

/**
 * Reemplaza los alert()/confirm() nativos del POS por un diálogo con la misma
 * paleta de la interfaz, para que las ventas y el vaciado de orden no
 * interrumpan con modales del navegador.
 */
export default function DialogoPos({
  abierto,
  tipo,
  titulo,
  mensaje,
  detalle,
  textoConfirmar,
  textoCancelar = "Cancelar",
  onConfirmar,
  onCerrar,
  cargando = false,
  bloqueado = false,
}: DialogoPosProps) {
  if (!abierto) return null;

  const estilo = ESTILOS[tipo];
  const Icono = estilo.icono;
  const esConfirmacion = tipo === "confirmar";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={() => {
        if (!bloqueado && !cargando) onCerrar();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-[#EADBCF] bg-white shadow-2xl"
      >
        <div className={`h-1 w-full ${estilo.barra}`} />

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${estilo.circulo}`}
            >
              <Icono size={22} strokeWidth={2.5} />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-serif text-lg leading-tight font-semibold text-[#32130E]">
                {titulo}
              </h3>
              {mensaje && (
                <p className="mt-1 text-sm leading-relaxed text-[#7A5C55]">
                  {mensaje}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onCerrar}
              disabled={bloqueado || cargando}
              className="-mt-1 -mr-1 shrink-0 rounded-lg p-1 text-[#D8C3B3] transition hover:bg-[#F5EBE1] hover:text-[#7A5C55] disabled:opacity-40"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
          </div>

          {detalle && detalle.length > 0 && (
            <dl className="mt-4 space-y-1.5 rounded-xl border border-[#F5EBE1] bg-[#F0ECEA] p-3 font-mono text-sm">
              {detalle.map((linea) => (
                <div
                  key={linea.etiqueta}
                  className="flex items-center justify-between gap-3"
                >
                  <dt className="text-[9px] tracking-wider text-[#7A5C55] uppercase">
                    {linea.etiqueta}
                  </dt>
                  <dd
                    className={
                      linea.destacado
                        ? "text-base font-bold text-[#32130E]"
                        : "font-semibold text-[#32130E]"
                    }
                  >
                    {linea.valor}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-6 flex gap-2">
            {esConfirmacion && (
              <button
                type="button"
                onClick={onCerrar}
                className="flex-1 rounded-lg border border-[#D8C3B3] px-4 py-2.5 text-xs font-bold tracking-wider text-[#7A5C55] uppercase transition hover:bg-[#F5EBE1]"
              >
                {textoCancelar}
              </button>
            )}
            <button
              type="button"
              onClick={esConfirmacion ? onConfirmar : onCerrar}
              disabled={cargando}
              className={`flex-1 rounded-lg px-4 py-2.5 text-xs font-bold tracking-wider text-white uppercase transition disabled:opacity-50 ${
                esConfirmacion
                  ? "bg-[#32130E] hover:bg-[#4A241D]"
                  : tipo === "exito"
                    ? "bg-[#2E6F40] hover:bg-[#255730]"
                    : "bg-[#B83A3A] hover:bg-[#992F2F]"
              }`}
            >
              {cargando ? "Procesando..." : (textoConfirmar ?? "Entendido")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
