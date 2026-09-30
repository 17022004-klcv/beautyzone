"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Filter,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import type { ArqueoTurno } from "@/src/app/types/arqueo";

type PeriodoReporte = "dia" | "semana" | "mes" | "anio";

const money = (valor: number) => `$${valor.toFixed(2)}`;

const ETIQUETAS_DIA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const ETIQUETAS_MES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

/** Ventana [ini, fin) del periodo pedido, anclada al día de hoy. */
export function ventanaPeriodo(periodo: PeriodoReporte): { ini: Date; fin: Date } {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const ini = new Date(hoy);
  const fin = new Date(hoy);

  if (periodo === "dia") {
    fin.setDate(fin.getDate() + 1);
  } else if (periodo === "semana") {
    ini.setDate(ini.getDate() - ((ini.getDay() + 6) % 7));
    fin.setDate(fin.getDate() - ((fin.getDay() + 6) % 7));
    fin.setDate(fin.getDate() + 7);
  } else if (periodo === "mes") {
    ini.setDate(1);
    fin.setMonth(fin.getMonth() + 1);
    fin.setDate(1);
  } else {
    ini.setMonth(0, 1);
    fin.setMonth(0, 1);
    fin.setFullYear(fin.getFullYear() + 1);
  }

  return { ini, fin };
}

function dentroDe(fecha: string | null, ini: Date, fin: Date): boolean {
  if (!fecha) return false;
  const f = new Date(fecha);
  return f >= ini && f < fin;
}

/** Agrupa lo facturado del periodo en barras comparables. */
function seriePorPeriodo(
  turnos: ArqueoTurno[],
  periodo: PeriodoReporte,
): { etiqueta: string; total: number }[] {
  const suma = new Map<number, number>();
  const sumar = (clave: number, total: number) =>
    suma.set(clave, (suma.get(clave) ?? 0) + total);

  if (periodo === "anio") {
    for (const t of turnos) {
      if (t.fechaCierre) {
        sumar(new Date(t.fechaCierre).getMonth(), t.totales.totalVendido);
      }
    }
    return ETIQUETAS_MES.map((etiqueta, i) => ({
      etiqueta,
      total: Number((suma.get(i) ?? 0).toFixed(2)),
    }));
  }

  if (periodo === "mes") {
    const diasEnMes = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0,
    ).getDate();
    for (const t of turnos) {
      if (t.fechaCierre) {
        sumar(new Date(t.fechaCierre).getDate() - 1, t.totales.totalVendido);
      }
    }
    return Array.from({ length: diasEnMes }, (_, i) => ({
      etiqueta: `${i + 1}`,
      total: Number((suma.get(i) ?? 0).toFixed(2)),
    }));
  }

  if (periodo === "semana") {
    for (const t of turnos) {
      if (t.fechaCierre) {
        sumar(
          (new Date(t.fechaCierre).getDay() + 6) % 7,
          t.totales.totalVendido,
        );
      }
    }
    return ETIQUETAS_DIA.map((etiqueta, i) => ({
      etiqueta,
      total: Number((suma.get(i) ?? 0).toFixed(2)),
    }));
  }

  for (const t of turnos) {
    if (t.fechaCierre) {
      sumar(
        Math.floor(new Date(t.fechaCierre).getHours() / 4),
        t.totales.totalVendido,
      );
    }
  }
  return Array.from({ length: 6 }, (_, i) => ({
    etiqueta: `${String(i * 4).padStart(2, "0")}h`,
    total: Number((suma.get(i) ?? 0).toFixed(2)),
  }));
}

interface VistaReportesProps {
  turnos: ArqueoTurno[];
  onVolver: () => void;
}

export default function VistaReportes({ turnos, onVolver }: VistaReportesProps) {
  const [periodo, setPeriodo] = useState<PeriodoReporte>("dia");
  const [filtroCajero, setFiltroCajero] = useState("todos");

  const { ini, fin } = useMemo(() => ventanaPeriodo(periodo), [periodo]);

  const turnosPeriodo = useMemo(
    () => turnos.filter((t) => dentroDe(t.fechaCierre, ini, fin)),
    [turnos, ini, fin],
  );

  const cajeros = useMemo(
    () => [...new Set(turnosPeriodo.map((t) => t.cajero))].sort(),
    [turnosPeriodo],
  );

  const filtroActivo =
    filtroCajero !== "todos" && cajeros.includes(filtroCajero)
      ? filtroCajero
      : "todos";

  const turnosFiltrados = useMemo(
    () =>
      filtroActivo === "todos"
        ? turnosPeriodo
        : turnosPeriodo.filter((t) => t.cajero === filtroActivo),
    [turnosPeriodo, filtroActivo],
  );

  const totalPeriodo = turnosPeriodo.reduce(
    (acc, t) => acc + t.totales.totalVendido,
    0,
  );

  const variacion = useMemo(() => {
    const duracion = fin.getTime() - ini.getTime();
    const iniPrevio = new Date(ini.getTime() - duracion);
    const previo = turnos.filter((t) => dentroDe(t.fechaCierre, iniPrevio, ini));
    const totalPrevio = previo.reduce(
      (acc, t) => acc + t.totales.totalVendido,
      0,
    );
    if (totalPrevio <= 0) return null;
    return ((totalPeriodo - totalPrevio) / totalPrevio) * 100;
  }, [turnos, ini, fin, totalPeriodo]);

  const { faltante, sobrante, neto } = useMemo(() => {
    let f = 0;
    let s = 0;
    for (const t of turnosPeriodo) {
      if (t.diferencia < 0) f += t.diferencia;
      else s += t.diferencia;
    }
    return { faltante: Math.abs(f), sobrante: s, neto: f + s };
  }, [turnosPeriodo]);

  const serie = useMemo(
    () => seriePorPeriodo(turnosPeriodo, periodo),
    [turnosPeriodo, periodo],
  );

  const maximoSerie = useMemo(
    () => serie.reduce((max, p) => Math.max(max, p.total), 0),
    [serie],
  );

  const estadisticas = useMemo(() => {
    const mapa = new Map<
      string,
      { nombre: string; turnos: number; facturado: number; diferencias: number }
    >();

    for (const t of turnosFiltrados) {
      const actual = mapa.get(t.cajero) ?? {
        nombre: t.cajero,
        turnos: 0,
        facturado: 0,
        diferencias: 0,
      };
      actual.turnos += 1;
      actual.facturado += t.totales.totalVendido;
      actual.diferencias += t.diferencia;
      mapa.set(t.cajero, actual);
    }

    return [...mapa.values()]
      .map((r) => ({
        ...r,
        facturado: Number(r.facturado.toFixed(2)),
        diferencias: Number(r.diferencias.toFixed(2)),
      }))
      .sort((a, b) => b.facturado - a.facturado);
  }, [turnosFiltrados]);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <BotonVolver onClick={onVolver} />
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#32130E]">
              Reportes de arqueos
            </h1>
            <p className="text-xs font-medium text-[#7A5C55]">
              Métricas acumuladas y análisis de descuadres en caja.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 rounded-2xl border border-[#EADBCF] bg-white/60 p-1">
          {(["dia", "semana", "mes", "anio"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`rounded-xl px-3 py-1.5 text-[11px] font-bold capitalize transition ${
                periodo === p
                  ? "bg-[#32130E] text-white"
                  : "text-[#7A5C55] hover:bg-white"
              }`}
            >
              {p === "anio" ? "Año" : p === "dia" ? "Día" : p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Gráfica de ingresos */}
        <div className="space-y-3.5 rounded-3xl border border-[#EADBCF] bg-white/60 p-5 backdrop-blur-xl lg:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-serif text-base font-bold text-[#32130E]">
                Totales facturados
              </h3>
              <p className="text-[11px] text-[#7A5C55]">
                Comparativa de ingresos del período seleccionado
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-[11px] font-bold ${
                variacion === null
                  ? "bg-[#F6F2EF] text-[#7A5C55]"
                  : variacion >= 0
                    ? "bg-[#E7F0E9] text-[#2E6F40]"
                    : "bg-[#F8E9E9] text-[#B83A3A]"
              }`}
            >
              {variacion === null ? (
                "Sin periodo previo"
              ) : variacion >= 0 ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {variacion === null
                ? "—"
                : `${variacion >= 0 ? "+" : ""}${variacion.toFixed(1)}% vs. previo`}
            </span>
          </div>

          <div className="grid h-56 place-items-center rounded-2xl border border-dashed border-[#EADBCF] bg-[#F6F2EF]/40 p-4">
            {maximoSerie > 0 ? (
              <div className="flex h-full w-full items-end justify-between gap-1 px-2">
                {serie.map((punto) => (
                  <div
                    key={punto.etiqueta}
                    className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
                    title={`${punto.etiqueta}: ${money(punto.total)}`}
                  >
                    <div
                      style={{
                        height: `${Math.max(
                          (punto.total / maximoSerie) * 100,
                          punto.total > 0 ? 3 : 0,
                        )}%`,
                      }}
                      className="w-full rounded-t-lg bg-[#32130E] transition-all duration-300 hover:bg-[#9D4B4C]"
                    />
                    <span className="max-w-full truncate text-[9px] font-bold text-[#7A5C55] uppercase">
                      {punto.etiqueta}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-6 text-center text-xs text-[#7A5C55]">
                No hay cierres de caja en el período seleccionado.
              </p>
            )}
          </div>
        </div>

        {/* Acumulados de diferencias */}
        <div className="flex flex-col justify-between space-y-3.5 rounded-3xl border border-[#EADBCF] bg-white/60 p-5 backdrop-blur-xl">
          <div>
            <h3 className="font-serif text-base font-bold text-[#32130E]">
              Diferencias en caja
            </h3>
            <p className="text-[11px] text-[#7A5C55]">
              Resumen de descuadres registrados
            </p>
          </div>

          <div className="my-auto space-y-2.5">
            <TarjetaDiferencia
              icono={<AlertTriangle className="w-4 h-4" />}
              circulo="bg-[#F8E9E9] text-[#B83A3A]"
              etiqueta="Faltante acumulado"
              valor={`-${money(faltante)}`}
              color="text-[#B83A3A]"
            />
            <TarjetaDiferencia
              icono={<Wallet className="w-4 h-4" />}
              circulo="bg-[#E4EDF6] text-[#1D4E89]"
              etiqueta="Sobrante acumulado"
              valor={`+${money(sobrante)}`}
              color="text-[#1D4E89]"
            />
          </div>

          <div className="flex items-center justify-between border-t border-[#EADBCF] pt-2.5 text-[11px]">
            <span className="font-semibold text-[#7A5C55]">
              Neto de diferencias:
            </span>
            <span
              className={`font-mono font-bold ${
                neto < 0
                  ? "text-[#B83A3A]"
                  : neto > 0
                    ? "text-[#1D4E89]"
                    : "text-[#2E6F40]"
              }`}
            >
              {neto > 0 ? `+${money(neto)}` : money(neto)}
            </span>
          </div>
        </div>
      </div>

      {/* Rendimiento por recepcionista */}
      <div className="space-y-3.5 rounded-3xl border border-[#EADBCF] bg-white/60 p-5 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-serif text-base font-bold text-[#32130E]">
              Rendimiento por recepcionista
            </h3>
            <p className="text-[11px] text-[#7A5C55]">
              Total facturado y precisión en el conteo de efectivo
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#7A5C55]" />
            <select
              value={filtroActivo}
              onChange={(e) => setFiltroCajero(e.target.value)}
              className="rounded-xl border border-[#EADBCF] bg-white/80 px-2.5 py-1.5 text-[11px] font-bold text-[#32130E] outline-none focus:border-[#9D4B4C]"
            >
              <option value="todos">Todos los recepcionistas</option>
              {cajeros.map((nombre) => (
                <option key={nombre} value={nombre}>
                  {nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {estadisticas.length === 0 ? (
            <p className="col-span-full py-8 text-center text-xs text-[#7A5C55]">
              No hay cierres de caja en el período seleccionado.
            </p>
          ) : (
            estadisticas.map((rec) => (
              <div
                key={rec.nombre}
                className="space-y-2.5 rounded-2xl border border-[#EADBCF] bg-[#F6F2EF]/50 p-3.5 transition hover:bg-[#F6F2EF]"
              >
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[#32130E] text-xs font-bold text-white">
                    {rec.nombre.charAt(0)}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-[#32130E]">
                      {rec.nombre}
                    </p>
                    <p className="text-[10px] text-[#7A5C55]">
                      {rec.turnos} {rec.turnos === 1 ? "turno" : "turnos"} de
                      caja
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-[#EADBCF] pt-2.5 text-[11px]">
                  <div>
                    <span className="block text-[#7A5C55]">Facturado</span>
                    <span className="font-mono font-bold text-[#32130E]">
                      {money(rec.facturado)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[#7A5C55]">Diferencias</span>
                    <span
                      className={`font-mono font-bold ${
                        rec.diferencias < 0
                          ? "text-[#B83A3A]"
                          : rec.diferencias > 0
                            ? "text-[#1D4E89]"
                            : "text-[#2E6F40]"
                      }`}
                    >
                      {rec.diferencias > 0 ? "+" : ""}
                      {money(rec.diferencias)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export function BotonVolver({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl border border-[#EADBCF] bg-white/60 p-2 text-[#7A5C55] transition hover:bg-white"
      aria-label="Volver al historial"
    >
      <ArrowLeft className="w-4 h-4" />
    </button>
  );
}

function TarjetaDiferencia({
  icono,
  circulo,
  etiqueta,
  valor,
  color,
}: {
  icono: React.ReactNode;
  circulo: string;
  etiqueta: string;
  valor: string;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#EADBCF] bg-[#F6F2EF]/50 p-3.5">
      <div className="flex items-center gap-2.5">
        <span className={`rounded-xl p-2 ${circulo}`}>{icono}</span>
        <p className="text-[10px] font-bold tracking-wider text-[#7A5C55] uppercase">
          {etiqueta}
        </p>
      </div>
      <span className={`font-mono text-base font-bold ${color}`}>{valor}</span>
    </div>
  );
}
