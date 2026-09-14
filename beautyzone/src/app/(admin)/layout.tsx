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

  // Al cambiar a la ruta POS, fuerza la ocultación inicial
  useEffect(() => {
    if (isPosPage) {
      setShowPosSidebar(false);
    }
  }, [pathname, isPosPage]);

  // Manejo de la tecla ESC (exclusivo para la vista POS)
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
    <div className="min-h-screen bg-[#F0ECEA] relative flex overflow-hidden w-full">
      {isPosPage ? (
        /* ================= MODO POS ================= */
        <>
          {/* Si showPosSidebar es TRUE, muestra el Sidebar flotante por encima */}
          {showPosSidebar && (
            <>
              {/* Fondo semitransparente para cerrar al hacer clic afuera */}
              <div
                className="fixed inset-0 bg-black/40 z-40 transition-opacity"
                onClick={() => setShowPosSidebar(false)}
              />
              {/* Contenedor del Sidebar Flotante */}
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
        /* ================= MODO NORMAL ================= */
        <div className="fixed top-0 left-0 h-full z-50">
          <AdminSidebar
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
        </div>
      )}

      {/* 
        CONTENIDO PRINCIPAL:
        - En POS: Cero padding (pl-0). El POS abarca el 100% real del ancho.
        - En resto de páginas: Padding según colapso (pl-64 / pl-20).
      */}
      <main
        className={`w-full min-h-screen transition-all duration-300 ${
          isPosPage ? "pl-0" : isCollapsed ? "pl-20" : "pl-64"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
