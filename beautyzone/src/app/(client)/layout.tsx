import ClientNavbar from "@/src/components/navigation/ClientNavbar";
export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <ClientNavbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
