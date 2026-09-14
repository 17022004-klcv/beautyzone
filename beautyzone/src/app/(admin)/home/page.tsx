"use client";

import { useState, useEffect } from "react";
import { DashboardStats } from "@/src/app/types/dashboard";
import PageTitle from "@/src/components/ui/PageTitle";
import KpiCard from "@/src/components/admin/KpiCard";
import {
  Calendar,
  CalendarDays,
  Users,
  CheckCircle2,
  Package,
  Scissors,
} from "lucide-react";

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
      <div className="p-8 text-center text-[#7A5C55] font-medium">
        Cargando estadísticas del panel...
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 bg-[#F0ECEA] min-h-screen">
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
          icon={<Calendar className="w-6 h-6" />}
        />

        <KpiCard
          title="Citas de la Semana"
          value={stats?.citasSemana ?? 0}
          change="Esta semana"
          isPositive={true}
          icon={<CalendarDays className="w-6 h-6" />}
        />

        <KpiCard
          title="Total Clientes"
          value={stats?.totalClientes ?? 0}
          change="Registrados"
          isPositive={true}
          icon={<Users className="w-6 h-6" />}
        />
      </div>

      {/* 2. SECCIÓN PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SERVICIOS MÁS SOLICITADOS */}
        <div className="lg:col-span-2 bg-[#FFFFFF] p-6 rounded-2xl border border-[#D8C3B3] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-lg font-bold text-[#32130E] flex items-center gap-2">
                <Scissors className="w-5 h-5 text-[#572219]" />
                Demanda de Servicios
              </h2>
              <span className="text-xs bg-[#F5EBE1] text-[#7A5C55] px-3 py-1 rounded-full font-semibold">
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
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-[#32130E]">
                    <span>{item.servicio}</span>
                    <span>{item.cantidad} citas</span>
                  </div>
                  <div className="w-full bg-[#F5EBE1] rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-[#572219] h-2.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min((item.cantidad / 20) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-stone-400">
                No hay servicios registrados aún.
              </p>
            )}
          </div>
        </div>

        {/* PRODUCTOS MÁS VENDIDOS */}
        <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#D8C3B3] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-serif text-lg font-bold text-[#32130E] flex items-center gap-2">
              <Package className="w-5 h-5 text-[#572219]" />
              Productos Más Vendidos
            </h2>
          </div>
          <p className="text-xs text-[#7A5C55] mb-4">
            Top artículos populares del POS.
          </p>

          <div className="space-y-3">
            {stats?.productosMasVendidos &&
            stats.productosMasVendidos.length > 0 ? (
              stats.productosMasVendidos.map((prod) => (
                <div
                  key={prod.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F5EBE1]/50 transition-colors border border-[#D8C3B3]/40"
                >
                  <div>
                    <p className="text-xs font-bold text-[#32130E]">
                      {prod.nombre}
                    </p>
                    <p className="text-[11px] text-[#7A5C55]">
                      {prod.ventas} unidades vendidas
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#2E6F40]">
                    ${prod.precio.toFixed(2)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-stone-400">
                No hay productos vendidos aún.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
