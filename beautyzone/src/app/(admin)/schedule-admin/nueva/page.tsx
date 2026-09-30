"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import PageTitle from "@/src/components/ui/PageTitle";
import NuevaCitaForm from "@/src/components/forms/NuevaCitaForm";
import { hoyComoDateISO } from "@/src/lib/cajaTotales";
import { REGEX_FECHA } from "@/src/lib/validaciones";

const RUTA_AGENDA = "/schedule-admin";

/** El día puede venir en la URL desde la agenda; si no es válido, es hoy. */
function leerFecha(param: string | null): string {
  return param && REGEX_FECHA.test(param) ? param : hoyComoDateISO();
}

function NuevaCita() {
  const router = useRouter();
  const params = useSearchParams();

  const fecha = leerFecha(params.get("fecha"));
  const irAAgenda = () => router.push(RUTA_AGENDA);

  return (
    <div className="p-6 md:p-8 space-y-6 min-h-screen">
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
          title="Agendar Nueva Cita"
          subtitle="Registra la reserva del cliente. Al guardar vuelves a la agenda."
        />
      </div>

      <div className="w-full bg-white/50 backdrop-blur-xl border border-white/90 rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgba(50,19,14,0.05)]">
        <NuevaCitaForm
          selectedDateStr={fecha}
          onClose={irAAgenda}
          onSuccess={irAAgenda}
        />
      </div>
    </div>
  );
}

export default function NuevaCitaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-20 gap-2 text-[#7A5C55]">
          <Loader2 className="w-6 h-6 animate-spin text-[#9D4B4C]" />
          <span className="text-xs font-semibold">Cargando formulario...</span>
        </div>
      }
    >
      <NuevaCita />
    </Suspense>
  );
}
