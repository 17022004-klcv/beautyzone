"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Clock,
  User,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Eye,
  SquarePen,
} from "lucide-react";
import Button from "@/src/components/ui/Button";
import { CitaAgenda, type CitaDetalle } from "@/src/app/types/agenda";
import Modal from "@/src/components/ui/Modal";
import DetalleCitaModal, {
  EtiquetaEstado,
} from "@/src/components/admin/DetalleCitaModal";
import { useToast } from "@/src/components/ui/Toast";
import { hoyComoDateISO } from "@/src/lib/cajaTotales";

const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export default function AgendaView() {
  const toast = useToast();
  const router = useRouter();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<CitaAgenda[]>([]);
  const [loading, setLoading] = useState(false);

  const [citaDetalle, setCitaDetalle] = useState<CitaDetalle | null>(null);
  const [detalleLoading, setDetalleLoading] = useState(false);

  // `toISOString()` devuelve la fecha en UTC y en UTC-5/-6 eso adelanta un día
  // el filtro de la agenda. `hoyComoDateISO` usa la fecha local del calendario.
  const formattedSelectedDate = hoyComoDateISO(selectedDate);

  const fetchCitas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/agenda?date=${formattedSelectedDate}`);
      if (res.ok) {
        setAppointments(await res.json());
      } else {
        toast.error(
          "No se pudieron cargar las citas",
          "Intenta recargar la agenda.",
        );
      }
    } catch (error) {
      console.error("Error al cargar citas de la agenda:", error);
      toast.error(
        "Error de conexión",
        "No se pudo consultar la agenda del servidor.",
      );
    } finally {
      setLoading(false);
    }
  }, [formattedSelectedDate, toast]);

  useEffect(() => {
    fetchCitas();
  }, [fetchCitas]);

  const cargarCita = useCallback(
    async (id: number) => {
      setDetalleLoading(true);
      try {
        const res = await fetch(`/api/agenda/${id}`);
        if (!res.ok) throw new Error();
        setCitaDetalle((await res.json()) as CitaDetalle);
      } catch {
        toast.error(
          "No se pudo abrir la cita",
          "Ocurrió un error al consultar el detalle.",
        );
      } finally {
        setDetalleLoading(false);
      }
    },
    [toast],
  );

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const primerDiaMes = new Date(year, month, 1).getDay();
  const diasEnMes = new Date(year, month + 1, 0).getDate();

  // Al saltar de mes se selecciona el 1º: si no, la tarjeta seguiría mostrando
  // un día que ya no está visible en la grilla.
  const cambiarMes = (offset: number) => {
    const nuevo = new Date(year, month + offset, 1);
    setCurrentMonth(nuevo);
    setSelectedDate(nuevo);
  };

  const esMismoDia = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const hoy = new Date();

  return (
    <div className="w-full space-y-6 animate__animated animate__fadeIn">
      {/* BOTÓN SUPERIOR */}
      <div className="flex justify-end">
        <Button
          size="md"
          className="gap-2 px-5 py-2.5 text-sm font-bold bg-[#32130E] text-[#F5EBE1] hover:bg-[#572219] shadow-md rounded-2xl transition-all hover:scale-[1.02]"
          onClick={() =>
            router.push(`/schedule-admin/nueva?fecha=${formattedSelectedDate}`)
          }
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Cita</span>
        </Button>
      </div>

      {/* DISPOSICIÓN PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* CALENDARIO INTERACTIVO */}
        <div className="lg:col-span-2 bg-white/50 backdrop-blur-xl border border-white/90 rounded-3xl p-6 shadow-[0_8px_30px_rgba(50,19,14,0.05)] flex flex-col justify-between">
          <div>
            {/* CABECERA DEL CALENDARIO */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl font-bold text-[#32130E] flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-[#32130E]" />
                {MESES[month]} {year}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => cambiarMes(-1)}
                  className="p-2 hover:bg-white/80 rounded-xl transition-all text-[#32130E] border border-transparent hover:border-white shadow-xs"
                  title="Mes anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setCurrentMonth(new Date());
                    setSelectedDate(new Date());
                  }}
                  className="text-xs font-bold px-3.5 py-2 bg-white/80 hover:bg-white text-[#32130E] rounded-xl border border-white shadow-xs transition-all"
                >
                  Hoy
                </button>
                <button
                  onClick={() => cambiarMes(1)}
                  className="p-2 hover:bg-white/80 rounded-xl transition-all text-[#32130E] border border-transparent hover:border-white shadow-xs"
                  title="Mes siguiente"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* DÍAS DE LA SEMANA */}
            <div className="grid grid-cols-7 text-center mb-3">
              {DIAS_SEMANA.map((dia) => (
                <span
                  key={dia}
                  className="text-xs font-bold text-[#7A5C55] uppercase tracking-wider py-1"
                >
                  {dia}
                </span>
              ))}
            </div>

            {/* GRILLA DE DÍAS */}
            <div className="grid grid-cols-7 gap-1.5 text-center">
              {Array.from({ length: primerDiaMes }).map((_, i) => (
                <div key={`empty-${i}`} className="h-10 md:h-12" />
              ))}

              {Array.from({ length: diasEnMes }).map((_, i) => {
                const diaNumero = i + 1;
                const fechaDia = new Date(year, month, diaNumero);
                const isSelected = esMismoDia(fechaDia, selectedDate);
                const isToday = esMismoDia(fechaDia, hoy);

                return (
                  <button
                    key={diaNumero}
                    onClick={() => setSelectedDate(fechaDia)}
                    className={`h-10 md:h-12 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-200 ${
                      isSelected
                        ? "bg-[#32130E] text-[#F5EBE1] shadow-lg scale-105"
                        : isToday
                          ? "bg-white/90 text-[#32130E] border-2 border-[#32130E] shadow-sm"
                          : "hover:bg-white/70 text-[#32130E] hover:shadow-xs"
                    }`}
                  >
                    {diaNumero}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* CITAS DEL DÍA SELECCIONADO */}
        <div className="bg-white/50 backdrop-blur-xl border border-white/90 rounded-3xl p-6 shadow-[0_8px_30px_rgba(50,19,14,0.05)] flex flex-col justify-between">
          <div className="w-full">
            <div className="flex items-center justify-between border-b border-[#32130E]/10 pb-4 mb-4">
              <h3 className="font-serif font-bold text-[#32130E] text-lg">
                Citas del Día
              </h3>
              <span className="text-xs bg-white/80 text-[#32130E] px-3 py-1 rounded-full font-bold border border-white shadow-xs">
                {selectedDate.toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>

            {loading ? (
              /* Skeleton Citas del Día */
              <div className="space-y-3 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-3.5 bg-white/40 border border-white/60 rounded-2xl space-y-2.5"
                  >
                    <div className="flex justify-between items-center">
                      <div className="h-3.5 w-28 bg-[#D8C3B3]/50 rounded-md" />
                      <div className="h-4 w-14 bg-[#F5EBE1] rounded-lg" />
                    </div>
                    <div className="flex justify-between items-center pl-1">
                      <div className="h-3 w-20 bg-[#D8C3B3]/30 rounded-md" />
                      <div className="h-4 w-16 bg-[#D8C3B3]/40 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : appointments.length > 0 ? (
              /* Contenedor con Scroll de SimpleBar integrando las variables del CSS global */
              <div
                data-simplebar
                className="space-y-3 max-h-[420px] pr-2 overflow-x-hidden"
              >
                {appointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="p-3.5 bg-white/60 hover:bg-white/90 transition-all border border-white rounded-2xl space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-[#32130E] flex items-center gap-1.5 min-w-0">
                        <User className="w-3.5 h-3.5 text-[#32130E] shrink-0" />
                        <span className="truncate">{appt.cliente}</span>
                      </span>
                      <span className="text-[10px] font-bold text-[#32130E] bg-white px-2.5 py-1 rounded-xl border border-white/80 shadow-2xs flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3 text-[#7A5C55]" /> {appt.hora}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pl-5">
                      <p className="text-xs font-medium text-[#7A5C55] truncate">
                        {appt.servicio}
                      </p>
                      <EtiquetaEstado estado={appt.estado} />
                    </div>

                    {/* ACCIONES */}
                    <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-[#32130E]/5">
                      <button
                        onClick={() => cargarCita(appt.id)}
                        title="Ver detalle de la cita"
                        aria-label={`Ver detalle de la cita de ${appt.cliente}`}
                        className="p-1.5 rounded-lg text-[#7A5C55] hover:text-[#32130E] hover:bg-white/80 border border-transparent hover:border-[#D8C3B3] transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          router.push(`/schedule-admin/editar?id=${appt.id}`)
                        }
                        title="Editar cita"
                        aria-label={`Editar la cita de ${appt.cliente}`}
                        className="p-1.5 rounded-lg text-[#7A5C55] hover:text-[#32130E] hover:bg-white/80 border border-transparent hover:border-[#D8C3B3] transition-all"
                      >
                        <SquarePen className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs font-medium text-[#7A5C55] bg-white/30 border border-dashed border-[#D8C3B3]/60 rounded-2xl">
                No hay citas programadas para esta fecha.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL DE DETALLE (solo lectura) */}
      <Modal
        isOpen={!!citaDetalle}
        onClose={() => setCitaDetalle(null)}
        title="Detalle de la Cita"
        subtitle="Información registrada de la reserva"
        maxWidth="lg"
      >
        {detalleLoading || !citaDetalle ? (
          /* Skeleton Modal de Cita */
          <div className="space-y-4 animate-pulse p-2">
            <div className="h-10 w-full bg-[#F5EBE1]/60 rounded-xl" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-12 bg-[#F5EBE1]/60 rounded-xl" />
              <div className="h-12 bg-[#F5EBE1]/60 rounded-xl" />
            </div>
            <div className="h-20 w-full bg-[#F5EBE1]/60 rounded-xl" />
          </div>
        ) : (
          <DetalleCitaModal cita={citaDetalle} />
        )}
      </Modal>
    </div>
  );
}
