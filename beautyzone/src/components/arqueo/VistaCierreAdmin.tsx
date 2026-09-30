"use client";

import { useMemo, useState } from "react";
import {
  Banknote,
  CheckCircle2,
  FileText,
  Loader2,
  Plus,
  Receipt,
  ShieldCheck,
  Trash2,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import Button from "@/src/components/ui/Button";
import DialogoPos, {
  type LineaDetalle,
  type TipoDialogo,
} from "@/src/components/ui/DialogoPos";
import ConteoDenominacionesInput from "@/src/components/arqueo/ConteoDenominacionesInput";
import { BotonVolver } from "@/src/components/arqueo/VistaReportes";
import { CierreAdminService } from "@/src/app/services/cierreAdmin.client";
import {
  calcularTotalEfectivo,
  CLAVES_DENOMINACION,
} from "@/src/lib/cajaDenominaciones";
import type { ConteoDenominaciones } from "@/src/app/types/arqueo";
import type { ResumenCierreAdmin } from "@/src/app/types/cierreAdmin";

const money = (valor: number) => `$${valor.toFixed(2)}`;

const TIPOS_SUGERIDOS = ["LUZ", "AGUA", "INTERNET", "RENTA", "LIMPIEZA", "PAPELERIA"];

const conteoVacio = (): ConteoDenominaciones =>
  Object.fromEntries(CLAVES_DENOMINACION.map((c) => [c, 0])) as ConteoDenominaciones;

interface VistaCierreAdminProps {
  resumen: ResumenCierreAdmin | null;
  cargando: boolean;
  /** PIN ya validado al entrar a la vista. */
  pin: string;
  /** Reutiliza el modal de autorización de la página. */
  onPedirPin: (
    motivo: string,
    accion: (pin: string) => void | Promise<void>,
  ) => void;
  onVolver: () => void;
  onRecargar: () => Promise<void>;
}

export default function VistaCierreAdmin({
  resumen,
  cargando,
  pin,
  onPedirPin,
  onVolver,
  onRecargar,
}: VistaCierreAdminProps) {
  // Cuando ya hay un conteo guardado, el formulario arranca con esos valores.
  const [conteo, setConteo] = useState<ConteoDenominaciones>(conteoVacio());
  const [guardando, setGuardando] = useState(false);
  const [agregandoGasto, setAgregandoGasto] = useState(false);

  const [tipo, setTipo] = useState("");
  const [comprobante, setComprobante] = useState("");
  const [monto, setMonto] = useState("");

  const [dialogo, setDialogo] = useState<{
    abierto: boolean;
    tipo: TipoDialogo;
    titulo: string;
    mensaje?: string;
    detalle?: LineaDetalle[];
  }>({ abierto: false, tipo: "exito", titulo: "" });

  // Si el resumen trae un cierre guardado, se cargan sus denominaciones.
  const [cierreCargadoId, setCierreCargadoId] = useState<number | null>(null);
  if (resumen?.cierre && resumen.cierre.id !== cierreCargadoId) {
    setCierreCargadoId(resumen.cierre.id);
    setConteo({ ...resumen.cierre.conteo });
  }

  const totalContado = useMemo(() => calcularTotalEfectivo(conteo), [conteo]);

  const esperado = resumen?.totalEsperado ?? 0;
  const diferencia = useMemo(
    () => Math.round((totalContado - esperado) * 100) / 100,
    [totalContado, esperado],
  );

  const guardarConteo = async (pinCierre: string) => {
    setGuardando(true);
    try {
      const r = await CierreAdminService.guardarConteo(conteo, pinCierre);
      await onRecargar();
      setDialogo({
        abierto: true,
        tipo: "exito",
        titulo: "Cierre administrativo guardado",
        detalle: [
          { etiqueta: "Esperado", valor: money(r.totalEsperado) },
          { etiqueta: "Contado", valor: money(r.totalContado), destacado: true },
          {
            etiqueta: "Diferencia",
            valor: `${r.diferencia > 0 ? "+" : ""}${money(r.diferencia)}`,
          },
        ],
      });
    } catch (e: unknown) {
      setDialogo({
        abierto: true,
        tipo: "error",
        titulo: "No se pudo guardar el cierre",
        mensaje: e instanceof Error ? e.message : "Intenta de nuevo.",
      });
    } finally {
      setGuardando(false);
    }
  };

  const agregarGasto = async (e: React.FormEvent) => {
    e.preventDefault();
    const importe = Number(monto);

    if (!tipo.trim()) {
      setDialogo({
        abierto: true,
        tipo: "error",
        titulo: "Falta el tipo de factura",
        mensaje: "Escribe o elige de qué fue la factura (luz, agua, etc).",
      });
      return;
    }

    if (!Number.isFinite(importe) || importe <= 0) {
      setDialogo({
        abierto: true,
        tipo: "error",
        titulo: "Monto inválido",
        mensaje: "El monto debe ser mayor que cero.",
      });
      return;
    }

    setAgregandoGasto(true);
    try {
      await CierreAdminService.agregarGasto(
        { tipo, numeroComprobante: comprobante, monto: importe },
        pin,
      );
      setTipo("");
      setComprobante("");
      setMonto("");
      await onRecargar();
    } catch (e: unknown) {
      setDialogo({
        abierto: true,
        tipo: "error",
        titulo: "No se pudo registrar la factura",
        mensaje: e instanceof Error ? e.message : "Intenta de nuevo.",
      });
    } finally {
      setAgregandoGasto(false);
    }
  };

  const eliminarGasto = async (id: number) => {
    try {
      await CierreAdminService.eliminarGasto(id, pin);
      await onRecargar();
    } catch (e: unknown) {
      setDialogo({
        abierto: true,
        tipo: "error",
        titulo: "No se pudo eliminar la factura",
        mensaje: e instanceof Error ? e.message : "Intenta de nuevo.",
      });
    }
  };

  if (cargando && !resumen) {
    return (
      <div className="grid min-h-96 place-items-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#7A5C55]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <BotonVolver onClick={onVolver} />
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#32130E]">
              Cierre administrativo
            </h1>
            <p className="text-xs font-medium text-[#7A5C55]">
              Conteo final de todas las cajas del {resumen?.fecha ?? "hoy"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {resumen?.cajasAbiertas.length ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C07D2B]/25 bg-[#FBF1E1] px-3 py-1.5 text-[11px] font-bold text-[#C07D2B]">
              <TriangleAlert className="w-3.5 h-3.5" />
              {resumen.cajasAbiertas.length} caja
              {resumen.cajasAbiertas.length > 1 ? "s" : ""} abierta
              {resumen.cajasAbiertas.length > 1 ? "s" : ""} sin contar
            </span>
          ) : null}

          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#2E6F40]/25 bg-[#E7F0E9] px-3 py-1.5 text-[11px] font-bold text-[#2E6F40]">
            <ShieldCheck className="w-3.5 h-3.5" />
            PIN autorizado
          </span>
        </div>
      </div>

      {/* Mitad y mitad: cajas del día a la izquierda, facturas a la derecha */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Caja izquierda: efectivo facturado por cada caja */}
        <section className="flex flex-col rounded-3xl border border-[#EADBCF] bg-white/60 p-5 backdrop-blur-xl">
          <h2 className="flex items-center gap-2 font-serif text-base font-bold text-[#32130E]">
            <Wallet className="w-4 h-4 text-[#7A5C55]" />
            Cajas abiertas en el día
          </h2>
          <p className="mt-1 text-[11px] font-medium text-[#7A5C55]">
            Solo el efectivo facturado de cada caja. El fondo de apertura no
            suma.
          </p>

          <div className="mt-3.5 flex-1 space-y-1.5">
            {resumen?.cajas.length ? (
              resumen.cajas.map((caja) => (
                <div
                  key={caja.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#EADBCF] bg-[#F6F2EF]/60 px-3.5 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#32130E]">
                      {caja.nombreCaja}
                    </p>
                    <p className="text-[11px] text-[#7A5C55]">
                      {caja.cajero}
                      {caja.fechaCierre
                        ? ` · ${new Date(caja.fechaCierre).toLocaleTimeString("es-SV", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}`
                        : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[9px] font-bold tracking-wider text-[#7A5C55] uppercase">
                        Facturado
                      </p>
                      <p className="font-mono text-sm font-bold text-[#32130E]">
                        {money(caja.totales.ventasEfectivo)}
                      </p>
                    </div>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                        caja.estadoConteo === "REALIZADO"
                          ? "border-[#2E6F40]/25 bg-[#E7F0E9] text-[#2E6F40]"
                          : "border-[#C07D2B]/25 bg-[#FBF1E1] text-[#C07D2B]"
                      }`}
                    >
                      {caja.estadoConteo === "REALIZADO" ? "Arqueada" : "Sin conteo"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-[#EADBCF] px-4 py-6 text-center text-xs text-[#7A5C55]">
                No hay cajas cerradas hoy todavía.
              </p>
            )}

            {resumen?.cajasAbiertas.map((caja) => (
              <div
                key={caja.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-dashed border-[#C07D2B]/40 bg-[#FBF1E1]/50 px-3.5 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#C07D2B]">
                    {caja.nombreCaja}
                  </p>
                  <p className="text-[11px] text-[#7A5C55]">{caja.cajero}</p>
                </div>
                <span className="text-[11px] font-bold text-[#C07D2B]">
                  Abierta · no suma
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3.5 flex items-center justify-between rounded-2xl bg-[#32130E] px-4 py-3">
            <span className="text-xs font-bold tracking-wider text-[#EADBCF] uppercase">
              Efectivo facturado
            </span>
            <span className="font-mono text-lg font-bold text-[#F5EBE1]">
              {money(resumen?.totalCajas ?? 0)}
            </span>
          </div>
        </section>

        {/* Columna derecha: facturas pagadas con efectivo */}
        <section className="flex flex-col rounded-3xl border border-[#EADBCF] bg-white/60 p-5 backdrop-blur-xl">
          <h2 className="flex items-center gap-2 font-serif text-base font-bold text-[#32130E]">
            <Receipt className="w-4 h-4 text-[#7A5C55]" />
            Facturas pagadas
          </h2>
          <p className="mt-1 text-[11px] font-medium text-[#7A5C55]">
            Se descuentan solas: lo que debes tener en mano es el efectivo
            facturado menos estas facturas.
          </p>

          <form
            onSubmit={agregarGasto}
            className="mt-3.5 grid gap-2.5 sm:grid-cols-[1fr_1fr_auto]"
          >
            <input
              value={tipo}
              onChange={(e) => setTipo(e.target.value.toUpperCase())}
              placeholder="Tipo (luz, agua...)"
              list="tipos-gasto"
              className="rounded-2xl border border-[#EADBCF] bg-white/80 px-3.5 py-2.5 text-xs font-semibold text-[#32130E] uppercase outline-none transition placeholder:normal-case placeholder:text-[#D8C3B3] focus:border-[#9D4B4C]"
            />
            <datalist id="tipos-gasto">
              {TIPOS_SUGERIDOS.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>

            <input
              value={comprobante}
              onChange={(e) => setComprobante(e.target.value)}
              placeholder="Nº comprobante"
              className="rounded-2xl border border-[#EADBCF] bg-white/80 px-3.5 py-2.5 text-xs font-semibold text-[#32130E] outline-none transition placeholder:font-normal placeholder:text-[#D8C3B3] focus:border-[#9D4B4C]"
            />

            <div className="flex gap-2.5">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="Monto"
                className="w-28 rounded-2xl border border-[#EADBCF] bg-white/80 px-3.5 py-2.5 text-right font-mono text-xs font-bold text-[#32130E] outline-none transition placeholder:font-normal placeholder:text-[#D8C3B3] focus:border-[#9D4B4C]"
              />
              <Button type="submit" disabled={agregandoGasto}>
                {agregandoGasto ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                Agregar
              </Button>
            </div>
          </form>

          <div className="mt-3 flex-1 space-y-1.5">
            {resumen?.gastos.length ? (
              resumen.gastos.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center justify-between gap-2 rounded-2xl border border-[#EADBCF] bg-[#F6F2EF]/60 px-3.5 py-2"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <FileText className="w-3.5 h-3.5 shrink-0 text-[#7A5C55]" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-[#32130E]">
                        {g.tipo}
                      </p>
                      {g.numeroComprobante && (
                        <p className="truncate font-mono text-[10px] text-[#7A5C55]">
                          Comprobante {g.numeroComprobante}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#B83A3A]">
                      -{money(g.monto)}
                    </span>
                    <button
                      onClick={() => eliminarGasto(g.id)}
                      aria-label={`Quitar factura de ${g.tipo}`}
                      className="rounded-lg p-1.5 text-[#D8C3B3] transition hover:bg-[#F8E9E9] hover:text-[#B83A3A]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-[#EADBCF] px-4 py-4 text-center text-xs text-[#7A5C55]">
                Sin facturas registradas.
              </p>
            )}
          </div>

          <div className="mt-3.5 space-y-1.5">
            <Linea
              etiqueta="Efectivo facturado"
              valor={money(resumen?.totalCajas ?? 0)}
            />
            <Linea
              etiqueta="Menos facturas"
              valor={`-${money(resumen?.totalGastos ?? 0)}`}
              tono="rojo"
            />
            <div className="flex items-center justify-between rounded-2xl bg-[#32130E] px-4 py-3">
              <span className="text-xs font-bold tracking-wider text-[#EADBCF] uppercase">
                Debes tener en mano
              </span>
              <span className="font-mono text-lg font-bold text-[#F5EBE1]">
                {money(esperado)}
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Conteo final */}
      <section className="rounded-3xl border border-[#EADBCF] bg-white/60 p-5 backdrop-blur-xl">
        <h2 className="flex items-center gap-2 font-serif text-base font-bold text-[#32130E]">
          <Banknote className="w-4 h-4 text-[#7A5C55]" />
          Conteo final de tu efectivo
        </h2>
        <p className="mt-1 text-[11px] font-medium text-[#7A5C55]">
          Cuenta todo lo que tienes en mano y compáralo contra{" "}
          {money(esperado)}.
        </p>

        <div className="mt-3.5 grid gap-4 lg:grid-cols-[1fr_260px]">
          <ConteoDenominacionesInput
            conteo={conteo}
            onCambio={(clave, valor) =>
              setConteo((prev) => ({
                ...prev,
                [clave]: Math.max(0, Math.trunc(Number(valor) || 0)),
              }))
            }
            onLimpiar={() => setConteo(conteoVacio())}
            disabled={guardando}
          />

          <div className="space-y-2.5 self-start rounded-2xl border border-[#EADBCF] bg-[#F6F2EF]/70 p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider text-[#7A5C55] uppercase">
                Esperado
              </span>
              <span className="font-mono text-sm font-bold text-[#32130E]">
                {money(esperado)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider text-[#7A5C55] uppercase">
                Contado
              </span>
              <span className="font-mono text-sm font-bold text-[#32130E]">
                {money(totalContado)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-[#EADBCF] pt-2.5">
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

            <Button
              onClick={() =>
                onPedirPin(
                  "Confirma tu PIN de administrador para guardar el conteo final del cierre.",
                  guardarConteo,
                )
              }
              disabled={guardando}
              className="w-full"
            >
              {guardando ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5" />
              )}
              Guardar cierre
            </Button>

            {resumen?.cierre?.estado === "REALIZADO" && (
              <p className="flex items-start gap-1.5 text-[10px] font-medium text-[#2E6F40]">
                <CheckCircle2 className="mt-px w-3 h-3 shrink-0" />
                Ya hay un cierre guardado hoy. Vuelve a guardar para corregirlo.
              </p>
            )}
          </div>
        </div>
      </section>

      <DialogoPos
        abierto={dialogo.abierto}
        tipo={dialogo.tipo}
        titulo={dialogo.titulo}
        mensaje={dialogo.mensaje}
        detalle={dialogo.detalle}
        onCerrar={() => setDialogo((d) => ({ ...d, abierto: false }))}
      />
    </div>
  );
}

function Linea({
  etiqueta,
  valor,
  tono = "neutro",
}: {
  etiqueta: string;
  valor: string;
  tono?: "neutro" | "rojo";
}) {
  return (
    <div className="flex items-center justify-between px-1 py-1">
      <span className="text-xs font-medium text-[#7A5C55]">{etiqueta}</span>
      <span
        className={`font-mono text-sm font-bold ${
          tono === "rojo" ? "text-[#B83A3A]" : "text-[#32130E]"
        }`}
      >
        {valor}
      </span>
    </div>
  );
}
