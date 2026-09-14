import AgendaView from "@/src/components/admin/AgendaView";
import PageTitle from "@/src/components/ui/PageTitle";

export default function AgendaPage() {
  return (
    <div className="p-2 md:p-8 space-y-6 bg-[#F0ECEA] min-h-screen">
      <PageTitle
        title="Agenda del Salón"
        subtitle="Gestión y control de citas programadas."
      />
      <AgendaView />
    </div>
  );
}
