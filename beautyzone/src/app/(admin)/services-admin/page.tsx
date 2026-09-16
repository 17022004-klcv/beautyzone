import ServiceGrid from "@/src/components/admin/ServiceGrid";

export const metadata = {
  title: "Servicios | BeautyZone",
};

export default function ServiciosPage() {
  return (
    <main className="p-6 max-w-7xl mx-auto space-y-6">
      {/* ENCABEZADO DE LA PÁGINA */}
      <div className=" backdrop-blur-xl rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#32130E]">
            Catálogo de Servicios
          </h1>
          <p className="text-xs font-medium text-[#7A5C55] mt-1">
            Gestiona los tratamientos, precios y comisiones ofrecidos en el
            salón
          </p>
        </div>
      </div>

      <ServiceGrid />
    </main>
  );
}
