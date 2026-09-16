"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/src/components/navigation/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPosPage = pathname === "/pos-admin";

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showPosSidebar, setShowPosSidebar] = useState(false);

  useEffect(() => {
    if (isPosPage) {
      setShowPosSidebar(false);
    }
  }, [pathname, isPosPage]);

  useEffect(() => {
    if (!isPosPage) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowPosSidebar((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPosPage]);

  return (
    <div className="min-h-screen bg-[#F6F2EF] relative flex overflow-hidden w-full">
      {/* ORBES DE LUZ Y COLOR PARA LOGRAR EL GLASSMORPHISM REAL */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Esfera Rosada / Rose Gold */}
        <div className="absolute -top-24 -left-20 w-[450px] h-[450px] rounded-full bg-[#E8C5B8]/60 blur-[120px]" />
        {/* Esfera Champán Cálida */}
        <div className="absolute top-1/3 left-10 w-[380px] h-[380px] rounded-full bg-[#D1B8AA]/50 blur-[130px]" />
        {/* Esfera Inferior Bronce suave */}
        <div className="absolute -bottom-20 left-1/3 w-[550px] h-[550px] rounded-full bg-[#E5D4C0]/60 blur-[160px]" />
      </div>

      {isPosPage ? (
        <>
          {showPosSidebar && (
            <>
              <div
                className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 transition-opacity"
                onClick={() => setShowPosSidebar(false)}
              />
              <div className="fixed top-0 left-0 h-full z-50 shadow-2xl">
                <AdminSidebar
                  isCollapsed={isCollapsed}
                  setIsCollapsed={setIsCollapsed}
                />
              </div>
            </>
          )}
        </>
      ) : (
        <div className="fixed top-0 left-0 h-full z-50">
          <AdminSidebar
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
        </div>
      )}

      <main
        className={`w-full min-h-screen z-10 relative transition-all duration-300 ${
          isPosPage ? "pl-0" : isCollapsed ? "pl-20" : "pl-64"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
