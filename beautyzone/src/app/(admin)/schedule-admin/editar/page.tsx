"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import PageTitle from "@/src/components/ui/PageTitle";
import EditarCitaForm from "@/src/components/forms/EditarCitaForm";
import type { CitaDetalle } from "@/src/app/types/agenda";

const RUTA_AGENDA = "/schedule-admin";

function EditarCita() {
  const router = useRouter();
  const params = useSearchParams();

  const [cita, setCita] = useState<CitaDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const irAAgenda = useCallback(() => router.push(RUTA_AGENDA), [router]);

  const id = Number(params.get("id"));
  const idInvalido = !Number.isInteger(id) || id <= 0;

  useEffect(() => {
    if (idInvalido) return;

    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(`/api/agenda/${id}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!res.ok) {
          const detalle = await res.json().catch(() => null);
          throw new Error(detalle?.error ?? "No se pudo cargar la cita.");
        }

        setCita(await res.json());
      } catch (err: unknown) {
        if (controller.signal.aborted) return;
        setError(
          err instanceof Error ? err.message : "No se pudo cargar la cita.",
        );
      } finally {
        if (!controller.signal.aborted) setCargando(false);
      }
    })();

    return () => controller.abort();
  }, [id, idInvalido]);

  const mensajeError = idInvalido ? "La cita indicada no es válida." : error;

  return (
    <div className="w-full p-6 md:p-8 space-y-6 min-h-screen">
      {/* HEADER */}
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={irAAgenda}
          className="rounded-2xl border border-[#EADBCF] bg-white/60 p-2 text-[#7A5C55] transition hover:bg-white shrink-0"
          aria-label="Volver a la agenda"
          title="Volver a la agenda"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <PageTitle
          title="Editar Cita"
          subtitle="Ajusta los datos de la reserva. Al guardar vuelves a la agenda."
        />
      </div>

      {/* CONTENEDOR PRINCIPAL - ANCHO COMPLETO */}
      <div className="w-full bg-white/50 backdrop-blur-xl border border-white/90 rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgba(50,19,14,0.05)]">
        {mensajeError ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
            <AlertTriangle className="w-6 h-6 text-[#B83A3A]" />
            <p className="text-xs font-semibold text-[#B83A3A]">
              {mensajeError}
            </p>
            <button
              type="button"
              onClick={irAAgenda}
              className="text-xs font-bold text-[#32130E] underline"
            >
              Volver a la agenda
            </button>
          </div>
        ) : cargando ? (
          /* SKELETON INTEGRADO EN LUGAR DE SPINNER */
          <div className="w-full space-y-5 animate-pulse">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-3.5 w-16 bg-[#D8C3B3]/50 rounded-md" />
                <div className="h-11 w-full bg-[#F5EBE1]/60 rounded-xl" />
              </div>
              <div className="space-y-2">
                <div className="h-3.5 w-16 bg-[#D8C3B3]/50 rounded-md" />
                <div className="h-11 w-full bg-[#F5EBE1]/60 rounded-xl" />
              </div>
            </div>
            <div className="space-y-2 py-2">
              <div className="h-3.5 w-28 bg-[#D8C3B3]/50 rounded-md" />
              <div className="h-24 w-full bg-[#F5EBE1]/60 rounded-xl" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-3.5 w-14 bg-[#D8C3B3]/50 rounded-md" />
                <div className="h-11 w-full bg-[#F5EBE1]/60 rounded-xl" />
              </div>
              <div className="space-y-2">
                <div className="h-3.5 w-24 bg-[#D8C3B3]/50 rounded-md" />
                <div className="h-11 w-full bg-[#F5EBE1]/60 rounded-xl" />
              </div>
            </div>
          </div>
        ) : (
          cita && (
            <EditarCitaForm
              cita={cita}
              onClose={irAAgenda}
              onSuccess={irAAgenda}
            />
          )
        )}
      </div>
    </div>
  );
}

export default function EditarCitaPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full p-6 md:p-8 space-y-6 min-h-screen animate-pulse">
          {/* Skeleton Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EADBCF]/60 shrink-0" />
            <div className="space-y-2">
              <div className="h-6 w-48 bg-[#D8C3B3]/60 rounded-md" />
              <div className="h-3.5 w-72 bg-[#D8C3B3]/30 rounded-md" />
            </div>
          </div>

          {/* Skeleton Card Contenedor */}
          <div className="w-full bg-white/50 backdrop-blur-xl border border-white/90 rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgba(50,19,14,0.05)] space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-3.5 w-16 bg-[#D8C3B3]/50 rounded-md" />
                <div className="h-11 w-full bg-[#F5EBE1]/60 rounded-xl" />
              </div>
              <div className="space-y-2">
                <div className="h-3.5 w-16 bg-[#D8C3B3]/50 rounded-md" />
                <div className="h-11 w-full bg-[#F5EBE1]/60 rounded-xl" />
              </div>
            </div>
            <div className="space-y-2 py-2">
              <div className="h-3.5 w-28 bg-[#D8C3B3]/50 rounded-md" />
              <div className="h-24 w-full bg-[#F5EBE1]/60 rounded-xl" />
            </div>
          </div>
        </div>
      }
    >
      <EditarCita />
    </Suspense>
  );
}
