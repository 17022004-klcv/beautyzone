"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  AlertTriangle,
  ArrowLeft,
  Banknote,
  CalendarClock,
  Check,
  Coins,
  Hash,
  Layers,
  Loader2,
  Pencil,
  Percent,
  Power,
  Sparkles,
  Tag,
  Trash2,
  User,
} from "lucide-react";
import Button from "@/src/components/ui/Button";
import { useToast } from "@/src/components/ui/Toast";
import type { ServicioItem } from "@/src/app/types/servicio";
import {
  esComisionMonto,
  formatoComision,
  valorComision,
  comisionEnDinero,
} from "@/src/lib/comision";

const RUTA_SERVICIOS = "/services-admin";

function fechaLegible(valor?: string) {
  if (!valor) return "No registrado";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "No registrado";

  return fecha.toLocaleDateString("es-SV", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Fila de solo lectura: etiqueta a la izquierda, valor a la derecha. */
function Dato({
  icono: Icono,
  etiqueta,
  children,
}: {
  icono: React.ComponentType<{ className?: string }>;
  etiqueta: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-[#EADBCF]/60 last:border-b-0">
      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#7A5C55] shrink-0">
        <Icono className="w-3.5 h-3.5" />
        {etiqueta}
      </span>
      <span className="text-xs font-semibold text-[#32130E] text-right break-words">
        {children}
      </span>
    </div>
  );
}

export default function DetalleServicioPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const toast = useToast();

  const id = Number(params?.id);
  const idInvalido = !Number.isInteger(id) || id <= 0;

  const [servicio, setServicio] = useState<ServicioItem | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [desactivando, setDesactivando] = useState(false);

  const irAServicios = useCallback(
    () => router.push(RUTA_SERVICIOS),
    [router],
  );

  useEffect(() => {
    if (idInvalido) return;

    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(`/api/servicios/${id}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!res.ok) {
          const detalle = await res.json().catch(() => null);
          throw new Error(detalle?.error ?? "No se pudo cargar el servicio.");
        }

        setServicio(await res.json());
      } catch (err: unknown) {
        if (controller.signal.aborted) return;
        setError(
          err instanceof Error ? err.message : "No se pudo cargar el servicio.",
        );
      } finally {
        if (!controller.signal.aborted) setCargando(false);
      }
    })();

    return () => controller.abort();
  }, [id, idInvalido]);

  const handleDesactivar = async () => {
    if (!servicio) return;
    if (!confirm(`¿Desactivar el servicio "${servicio.nombre}"?`)) return;

    setDesactivando(true);
    try {
      const res = await fetch(`/api/servicios/${servicio.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.exito("Servicio desactivado", `${servicio.nombre} ya no aparece en el catálogo.`);
        irAServicios();
      } else {
        const detalle = await res.json().catch(() => null);
        toast.error(
          "No se pudo desactivar",
          detalle?.error ?? "Ocurrió un error al desactivar el servicio.",
        );
      }
    } catch (err) {
      console.error("Error al desactivar el servicio:", err);
      toast.error("No se pudo desactivar", "Revisa tu conexión e intenta otra vez.");
    } finally {
      setDesactivando(false);
    }
  };

  const mensajeError = idInvalido
    ? "El servicio indicado no es válido."
    : error;
  const mostrarCargando = !idInvalido && cargando;

  return (
    <div className="p-6 md:p-8 space-y-6 min-h-screen">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={irAServicios}
            className="rounded-2xl border border-[#EADBCF] bg-white/60 p-2 text-[#7A5C55] transition hover:bg-white shrink-0"
            aria-label="Volver a los servicios"
            title="Volver a los servicios"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <h1 className="text-2xl font-serif font-bold text-[#32130E]">
              {servicio?.nombre ?? "Detalle del Servicio"}
            </h1>
            <p className="text-xs font-medium text-[#7A5C55] mt-1">
              Información del servicio. Toca la flecha de la tarjeta o el botón
              Editar para modificarlo.
            </p>
          </div>
        </div>

        {servicio && (
          <div className="flex items-center gap-2">
            {servicio.estado && (
              <Button
                variant="outline"
                onClick={handleDesactivar}
                disabled={desactivando}
                className="gap-1.5 border-[#EADBCF] bg-white/60 hover:bg-white text-[#B83A3A]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {desactivando ? "Desactivando..." : "Desactivar"}
              </Button>
            )}
            <Button
              onClick={() => router.push(`${RUTA_SERVICIOS}/${servicio.id}/editar`)}
              className="gap-1.5"
            >
              <Pencil className="w-3.5 h-3.5" />
              Editar
            </Button>
          </div>
        )}
      </div>

      {mostrarCargando ? (
        <div className="flex flex-col items-center justify-center py-20 gap-2 text-[#7A5C55]">
          <Loader2 className="w-6 h-6 animate-spin text-[#9D4B4C]" />
          <span className="text-xs font-semibold">Cargando el servicio...</span>
        </div>
      ) : mensajeError ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <AlertTriangle className="w-6 h-6 text-[#B83A3A]" />
          <p className="text-xs font-semibold text-[#B83A3A]">{mensajeError}</p>
          <button
            type="button"
            onClick={irAServicios}
            className="text-xs font-bold text-[#32130E] underline"
          >
            Volver a los servicios
          </button>
        </div>
      ) : (
        servicio && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">
            {/* 75% — INFORMACIÓN */}
            <div className="lg:col-span-3 bg-white/50 backdrop-blur-xl border border-white/90 rounded-3xl p-6 shadow-[0_8px_30px_rgba(50,19,14,0.05)] space-y-5">
              {servicio.imagen ? (
                <div className="relative w-full h-52 rounded-2xl overflow-hidden border border-[#D8C3B3]">
                  <Image
                    src={servicio.imagen}
                    alt={servicio.nombre}
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-28 rounded-2xl border border-dashed border-[#D8C3B3] bg-[#F5EBE1]/40 flex flex-col items-center justify-center gap-1 text-[#7A5C55]">
                  <Sparkles className="w-5 h-5 stroke-[1.5]" />
                  <span className="text-[10px] font-semibold">
                    Este servicio no tiene imagen
                  </span>
                </div>
              )}

              <div>
                <h2 className="text-base font-bold text-[#32130E]">
                  {servicio.nombre}
                </h2>
                <p className="text-2xl font-serif font-extrabold text-[#32130E] mt-1">
                  ${Number(servicio.precio).toFixed(2)}
                </p>
              </div>

              <div>
                <Dato icono={Tag} etiqueta="Categoría">
                  {servicio.categoria?.nombre ?? "Sin categoría"}
                </Dato>
                <Dato icono={Coins} etiqueta="Comisión del estilista">
                  {formatoComision(
                    valorComision(servicio),
                    servicio.tipoComision,
                  )}
                </Dato>
                <Dato icono={esComisionMonto(servicio.tipoComision) ? Banknote : Percent} etiqueta="Modo de cálculo">
                  {esComisionMonto(servicio.tipoComision)
                    ? "Monto fijo"
                    : "Porcentaje del precio"}
                </Dato>
                <Dato icono={Check} etiqueta="Estado">
                  <span
                    className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase rounded-md ${
                      servicio.estado
                        ? "bg-[#2E6F40]/15 text-[#2E6F40]"
                        : "bg-[#B83A3A]/15 text-[#B83A3A]"
                    }`}
                  >
                    {servicio.estado ? "Activo" : "Inactivo"}
                  </span>
                </Dato>
                <Dato icono={Hash} etiqueta="ID">#{servicio.id}</Dato>
                <Dato icono={Layers} etiqueta="Categoría ID">
                  #{servicio.idcategoria}
                </Dato>
                <Dato icono={User} etiqueta="Registrado">
                  {fechaLegible(servicio.createdAt)}
                </Dato>
                <Dato icono={CalendarClock} etiqueta="Actualizado">
                  {fechaLegible(servicio.updatedAt)}
                </Dato>
              </div>

              <div>
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#7A5C55]">
                  <Layers className="w-3.5 h-3.5" /> Descripción
                </span>
                <p className="text-xs font-medium text-[#32130E] mt-1.5 whitespace-pre-line leading-relaxed">
                  {servicio.descripcion?.trim()
                    ? servicio.descripcion
                    : "Sin descripción."}
                </p>
              </div>
            </div>

            {/* 25% — BADGES */}
            <aside className="lg:col-span-1 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#7A5C55] px-1">
                Resumen
              </p>

              <div className="p-4 rounded-2xl bg-[#F5EBE1] border border-[#D8C3B3] space-y-1">
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#7A5C55]">
                  <Tag className="w-3 h-3" /> Categoría
                </span>
                <p className="text-xs font-bold text-[#32130E]">
                  {servicio.categoria?.nombre ?? "Sin categoría"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F5EBE1] border border-[#D8C3B3] space-y-1">
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#7A5C55]">
                  <Check className="w-3 h-3" /> Estado
                </span>
                <span
                  className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase rounded-md ${
                    servicio.estado
                      ? "bg-[#2E6F40]/15 text-[#2E6F40]"
                      : "bg-[#B83A3A]/15 text-[#B83A3A]"
                  }`}
                >
                  {servicio.estado ? "Activo" : "Inactivo"}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#F5EBE1] border border-[#D8C3B3] space-y-1">
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#7A5C55]">
                  <Coins className="w-3 h-3" /> Comisión
                </span>
                <p className="text-sm font-bold text-[#32130E]">
                  {formatoComision(valorComision(servicio), servicio.tipoComision)}
                </p>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase rounded-md bg-[#70b3b1]/30 text-[#1f4948]">
                  {esComisionMonto(servicio.tipoComision) ? (
                    <Banknote className="w-3 h-3" />
                  ) : (
                    <Percent className="w-3 h-3" />
                  )}
                  {esComisionMonto(servicio.tipoComision)
                    ? "Monto fijo"
                    : "Porcentaje"}
                </span>
                <p className="text-[10px] text-[#7A5C55] pt-1">
                  Equivale a ${comisionEnDinero(servicio).toFixed(2)} sobre un
                  precio de ${Number(servicio.precio).toFixed(2)}.
                </p>
              </div>

              {!servicio.estado && (
                <p className="flex items-center gap-2 p-3 rounded-2xl bg-white/60 border border-dashed border-[#D8C3B3] text-[10px] font-semibold text-[#7A5C55]">
                  <Power className="w-3.5 h-3.5" />
                  Este servicio está inactivo. Edítalo para volver a activarlo.
                </p>
              )}
            </aside>
          </div>
        )
      )}
    </div>
  );
}
