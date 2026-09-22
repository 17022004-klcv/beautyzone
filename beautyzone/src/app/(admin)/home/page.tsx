"use client";

import { useState, useEffect } from "react";
import { DashboardStats } from "@/src/app/types/dashboard";
import PageTitle from "@/src/components/ui/PageTitle";
import KpiCard from "@/src/components/admin/KpiCard";
import { Calendar, CalendarDays, Users, Package, Scissors } from "lucide-react";

export default function AdminHomePage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Error cargando dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0ECEA]">
        <div className="flex flex-col items-center justify-center text-center">
          {/* Contenedor de la Tijera */}
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full bg-white/60 backdrop-blur-xl border border-white/90 shadow-[0_8px_30px_rgba(50,19,14,0.08)] flex items-center justify-center overflow-hidden">
              {/* Tijera con efecto de corte (abrir/cerrar) */}
              <Scissors className="w-10 h-10 text-[#32130E] animate-[snip_0.8s_ease-in-out_infinite]" />

              {/* Línea de "corte" o hilo decorativo que se encoge */}
              <div className="absolute top-1/2 left-0 w-full h-[1px] bg-dashed border-b border-dashed border-[#C89B8C]/60 animate-[pulse_1s_infinite]" />
            </div>

            {/* Círculo decorativo */}
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#C89B8C] animate-ping" />
          </div>

          {/* Texto */}
          <h2 className="font-serif text-2xl font-bold text-[#32130E]">
            Preparando tu espacio...
          </h2>

          <p className="mt-2 text-sm text-[#7A5C55]">
            Un momento, estamos cargando el panel.
          </p>

          {/* Indicador de puntos */}
          <div className="mt-6 flex gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#32130E] animate-bounce [animation-delay:0ms]" />
            <span className="w-2 h-2 rounded-full bg-[#32130E] animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 rounded-full bg-[#32130E] animate-bounce [animation-delay:300ms]" />
          </div>

          {/* Estilos inyectados para la animación de tijera (snip) */}
          <style>{`
          @keyframes snip {
            0%, 100% {
              transform: rotate(0deg) scale(1);
            }
            50% {
              transform: rotate(-18deg) scale(1.05);
            }
            75% {
              transform: rotate(12deg) scale(0.98);
            }
          }
        `}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 min-h-screen">
      {/* CABECERA */}
      <PageTitle
        title="Dashboard de Estadísticas"
        subtitle="Resumen general del rendimiento del salón."
      />

      {/* 1. TARJETAS MÉTRICAS SUPERIORES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <KpiCard
          title="Citas del Día"
          value={stats?.citasDia ?? 0}
          change="Hoy"
          isPositive={true}
          icon={<Calendar className="w-5 h-5 text-[#F5EBE1]" />}
        />

        <KpiCard
          title="Citas de la Semana"
          value={stats?.citasSemana ?? 0}
          change="Esta semana"
          isPositive={true}
          icon={<CalendarDays className="w-5 h-5 text-[#F5EBE1]" />}
        />

        <KpiCard
          title="Total Clientes"
          value={stats?.totalClientes ?? 0}
          change="Registrados"
          isPositive={true}
          icon={<Users className="w-5 h-5 text-[#F5EBE1]" />}
        />
      </div>

      {/* 2. SECCIÓN PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate__animated animate__fadeIn">
        {/* SERVICIOS MÁS SOLICITADOS */}
        <div className="lg:col-span-2 bg-white/50 backdrop-blur-xl p-6 rounded-3xl border border-white/90 shadow-[0_8px_30px_rgba(50,19,14,0.05)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-serif text-lg font-bold text-[#32130E] flex items-center gap-2">
                <Scissors className="w-5 h-5 text-[#32130E]" />
                Demanda de Servicios
              </h2>
              <span className="text-[11px] bg-[#32130E] text-[#F5EBE1] px-3 py-1 rounded-full font-bold shadow-sm">
                Más Solicitados
              </span>
            </div>
            <p className="text-xs text-[#7A5C55] mb-6">
              Distribución de los servicios más reservados.
            </p>
          </div>

          <div className="space-y-4">
            {stats?.serviciosPopulares &&
            stats.serviciosPopulares.length > 0 ? (
              stats.serviciosPopulares.map((item, index) => (
                <div key={index} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-[#32130E]">
                    <span>{item.servicio}</span>
                    <span className="text-[#7A5C55]">
                      {item.cantidad} citas
                    </span>
                  </div>
                  <div className="w-full bg-white/70 rounded-full h-2.5 overflow-hidden border border-white/60 p-0.5 shadow-inner">
                    <div
                      className="bg-gradient-to-r from-[#572219] to-[#32130E] h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min((item.cantidad / 20) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#8C7167]">
                No hay servicios registrados aún.
              </p>
            )}
          </div>
        </div>

        {/* PRODUCTOS MÁS VENDIDOS */}
        <div className="bg-white/50 backdrop-blur-xl p-6 rounded-3xl border border-white/90 shadow-[0_8px_30px_rgba(50,19,14,0.05)]">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-serif text-lg font-bold text-[#32130E] flex items-center gap-2">
              <Package className="w-5 h-5 text-[#32130E]" />
              Productos Más Vendidos
            </h2>
          </div>
          <p className="text-xs text-[#7A5C55] mb-5">
            Top artículos populares del POS.
          </p>

          <div className="space-y-2.5">
            {stats?.productosMasVendidos &&
            stats.productosMasVendidos.length > 0 ? (
              stats.productosMasVendidos.map((prod) => (
                <div
                  key={prod.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/60 hover:bg-white/90 transition-all border border-white shadow-xs"
                >
                  <div>
                    <p className="text-xs font-bold text-[#32130E]">
                      {prod.nombre}
                    </p>
                    <p className="text-[11px] text-[#7A5C55]">
                      {prod.ventas} unidades vendidas
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#2E6F40] bg-white px-2.5 py-1 rounded-xl border border-white shadow-xs">
                    ${prod.precio.toFixed(2)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#8C7167]">
                No hay productos vendidos aún.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
