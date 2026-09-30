"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PageTitle from "@/src/components/ui/PageTitle";
import NuevoServicioForm from "@/src/components/forms/NuevoServicioForm";

const RUTA_SERVICIOS = "/services-admin";

export default function NuevoServicioPage() {
  const router = useRouter();
  const irAServicios = () => router.push(RUTA_SERVICIOS);

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
          title="Nuevo Servicio"
          subtitle="Registra las opciones de atención que ofrecerá el salón. Al guardar vuelves al catálogo."
        />
      </div>

      <div className="w-full bg-white/50 backdrop-blur-xl border border-white/90 rounded-3xl p-6 shadow-[0_8px_30px_rgba(50,19,14,0.05)]">
        <NuevoServicioForm onClose={irAServicios} onSuccess={irAServicios} />
      </div>
    </div>
  );
}
