"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";
import PageTitle from "@/src/components/ui/PageTitle";
import NuevoServicioForm from "@/src/components/forms/NuevoServicioForm";
import type { ServicioItem } from "@/src/app/types/servicio";

const RUTA_SERVICIOS = "/services-admin";

export default function EditarServicioPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const id = Number(params?.id);
  const idInvalido = !Number.isInteger(id) || id <= 0;

  const [servicio, setServicio] = useState<ServicioItem | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const irAServicios = useCallback(() => router.push(RUTA_SERVICIOS), [router]);

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

  const mensajeError = idInvalido
    ? "El servicio indicado no es válido."
    : error;
  const mostrarCargando = !idInvalido && cargando;

  return (
    <div className="p-6 md:p-8 space-y-6 min-h-screen">
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

        <PageTitle
          title={servicio ? `Editar: ${servicio.nombre}` : "Editar Servicio"}
          subtitle="Modifica los datos del servicio. Al guardar vuelves al catálogo."
        />
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
          <div className="w-full bg-white/50 backdrop-blur-xl border border-white/90 rounded-3xl p-6 shadow-[0_8px_30px_rgba(50,19,14,0.05)]">
            <NuevoServicioForm
              onClose={irAServicios}
              onSuccess={irAServicios}
              servicioAEditar={servicio}
            />
          </div>
        )
      )}
    </div>
  );
}
