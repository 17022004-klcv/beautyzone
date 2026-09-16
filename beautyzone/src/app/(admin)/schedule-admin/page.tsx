import AgendaView from "@/src/components/admin/AgendaView";
import PageTitle from "@/src/components/ui/PageTitle";

export default function AgendaPage() {
  return (
    <div className="p-6 md:p-8 space-y-6 min-h-screen">
      <PageTitle
        title="Agenda del Salón"
        subtitle="Organiza, visualiza y gestiona las citas programadas para mantener un control fluido del tiempo y tus clientes."
      />
      <AgendaView />
    </div>
  );
}
