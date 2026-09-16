"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Clock,
  User,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import Button from "@/src/components/ui/Button";
import { CitaAgenda } from "@/src/app/types/agenda";
import Modal from "@/src/components/ui/Modal";
import NuevaCitaForm from "@/src/components/forms/NuevaCitaForm";

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
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<CitaAgenda[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formattedSelectedDate = selectedDate.toISOString().split("T")[0];

  const fetchCitas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/agenda?date=${formattedSelectedDate}`);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error("Error al cargar citas de la agenda:", error);
    } finally {
      setLoading(false);
    }
  }, [formattedSelectedDate]);

  useEffect(() => {
    fetchCitas();
  }, [fetchCitas]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const primerDiaMes = new Date(year, month, 1).getDay();
  const diasEnMes = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const esMismoDia = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const hoy = new Date();

  return (
    <div className="space-y-6">
      {/* BOTÓN SUPERIOR */}
      <div className="flex justify-end">
        <Button
          size="md"
          className="gap-2 px-5 py-2.5 text-sm font-bold bg-[#32130E] text-[#F5EBE1] hover:bg-[#572219] shadow-md rounded-2xl transition-all hover:scale-[1.02]"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Cita</span>
        </Button>
      </div>

      {/* DISPOSICIÓN PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                  onClick={handlePrevMonth}
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
                  onClick={handleNextMonth}
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
          <div>
            <div className="flex items-center justify-between border-b border-[#32130E]/10 pb-4 mb-5">
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
              <div className="flex flex-col items-center justify-center py-12 text-[#7A5C55] gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#32130E]" />
                <span className="text-xs font-semibold">Cargando citas...</span>
              </div>
            ) : appointments.length > 0 ? (
              <div className="space-y-3 max-h-[390px] overflow-y-auto pr-1">
                {appointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="p-3.5 bg-white/60 hover:bg-white/90 transition-all border border-white rounded-2xl space-y-1.5 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#32130E] flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#32130E]" />
                        {appt.cliente}
                      </span>
                      <span className="text-[10px] font-bold text-[#32130E] bg-white px-2.5 py-1 rounded-xl border border-white/80 shadow-2xs flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#7A5C55]" /> {appt.hora}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-[#7A5C55] pl-5">
                      {appt.servicio}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs font-medium text-[#7A5C55] bg-white/30 border border-dashed border-white/80 rounded-2xl">
                No hay citas programadas para esta fecha.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL PARA AGENDAR */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Agendar Nueva Cita"
        subtitle="Completa los datos para registrar la reserva"
        maxWidth="lg"
      >
        <NuevaCitaForm
          selectedDateStr={formattedSelectedDate}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchCitas}
        />
      </Modal>
    </div>
  );
}
