"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Clock,
  User,
  Loader2,
  ChevronLeft,
  ChevronRight,
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
    <div className="space-y-4">
      {/* BOTÓN SUPERIOR MÁS GRANDE Y FUNCIONAL */}
      <div className="flex justify-end">
        <Button
          size="md"
          className="gap-2 px-5 py-2.5 text-sm font-semibold shadow-sm hover:shadow-md transition-all"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Cita</span>
        </Button>
      </div>

      {/* DISPOSICIÓN PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CALENDARIO INTERACTIVO */}
        <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#D8C3B3] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl font-bold text-[#32130E]">
                {MESES[month]} {year}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-[#F5EBE1] rounded-lg transition-colors text-[#572219]"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setCurrentMonth(new Date());
                    setSelectedDate(new Date());
                  }}
                  className="text-xs font-semibold px-3 py-1.5 bg-[#F5EBE1] text-[#572219] rounded-lg border border-[#D8C3B3]"
                >
                  Hoy
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-[#F5EBE1] rounded-lg transition-colors text-[#572219]"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 text-center mb-2">
              {DIAS_SEMANA.map((dia) => (
                <span
                  key={dia}
                  className="text-xs font-bold text-[#7A5C55] py-1"
                >
                  {dia}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
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
                    className={`h-10 md:h-12 rounded-xl flex items-center justify-center font-medium text-sm transition-all ${
                      isSelected
                        ? "bg-[#572219] text-[#FFFFFF] font-bold shadow-sm"
                        : isToday
                          ? "bg-[#F5EBE1] text-[#9D4B4C] font-bold border border-[#9D4B4C]"
                          : "hover:bg-[#F5EBE1]/60 text-[#32130E]"
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
        <div className="bg-[#FFFFFF] border border-[#D8C3B3] rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#D8C3B3] pb-3 mb-4">
              <h3 className="font-serif font-bold text-[#32130E] text-lg">
                Citas del día
              </h3>
              <span className="text-xs bg-[#F5EBE1] text-[#7A5C55] px-2.5 py-0.5 rounded-md font-semibold border border-[#D8C3B3]/40">
                {selectedDate.toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 text-[#7A5C55] gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#9D4B4C]" />
                <span className="text-xs">Cargando agenda...</span>
              </div>
            ) : appointments.length > 0 ? (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {appointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="p-3 bg-[#F5EBE1] border border-[#D8C3B3]/60 rounded-xl space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-[#32130E] flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-[#9D4B4C]" />
                        {appt.cliente}
                      </span>
                      <span className="text-[10px] font-bold text-[#572219] bg-[#FFFFFF] px-2 py-0.5 rounded-md border border-[#D8C3B3] flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {appt.hora}
                      </span>
                    </div>
                    <p className="text-xs text-[#7A5C55] pl-4.5">
                      {appt.servicio}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-[#7A5C55] bg-[#F5EBE1]/40 border border-dashed border-[#D8C3B3] rounded-xl">
                No hay citas programadas para esta fecha.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL GENÉRICO CONTENIENDO EL FORMULARIO */}
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
