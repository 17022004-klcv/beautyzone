// src/app/servicios/page.tsx
import ServiceGrid from "@/src/components/admin/ServiceGrid";

export const metadata = {
  title: "Servicios | BeautyZone",
};

export default function ServiciosPage() {
  return (
    <main className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-serif font-bold text-[#32130E]">
        Catálogo de Servicios
      </h1>
      <ServiceGrid />
    </main>
  );
}
