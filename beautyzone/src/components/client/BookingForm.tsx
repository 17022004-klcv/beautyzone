"use client";

import { useState } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Scissors,
  CheckCircle,
} from "lucide-react";

const stylists = [
  { id: 1, name: "Valeria Gómez", role: "Especialista en Balayage" },
  { id: 2, name: "Carlos Mendoza", role: "Estilista Senior & Barbería" },
  { id: 3, name: "Sofía Martínez", role: "Especialista en Uñas & Spa" },
];

const availableTimes = [
  "09:00 AM",
  "10:30 AM",
  "01:00 PM",
  "02:30 PM",
  "04:00 PM",
  "05:30 PM",
];

export default function BookingForm() {
  const [formData, setFormData] = useState({
    serviceId: "",
    stylistId: "",
    date: "",
    time: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-8 text-center space-y-4">
        <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
        <h3 className="font-serif text-2xl font-bold">
          ¡Reserva Solicitada con Éxito!
        </h3>
        <p className="text-sm text-emerald-700 max-w-md mx-auto">
          Hemos recibido tu solicitud. Te enviaremos un mensaje de confirmación
          a tu correo registrado.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-stone-200 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm"
    >
      <h2 className="font-serif text-2xl font-bold text-stone-900 border-b border-stone-100 pb-4">
        Agendar Cita
      </h2>

      {/* Selector de Servicio */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-2">
          <Scissors className="w-4 h-4 text-rose-600" /> Servicio
        </label>
        <select
          required
          value={formData.serviceId}
          onChange={(e) =>
            setFormData({ ...formData, serviceId: e.target.value })
          }
          className="w-full p-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400"
        >
          <option value="">Selecciona un servicio...</option>
          <option value="1">Balayage + Matizado & Olaplex - $120.00</option>
          <option value="2">Corte Estilizado + Peinado Glam - $45.00</option>
          <option value="3">Manicura Rusa con Gel Spa - $35.00</option>
          <option value="4">
            Hidratación Profunda Ácido Hialurónico - $65.00
          </option>
        </select>
      </div>

      {/* Selector de Estilista */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-2">
          <User className="w-4 h-4 text-rose-600" /> Estilista
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {stylists.map((s) => (
            <button
              type="button"
              key={s.id}
              onClick={() =>
                setFormData({ ...formData, stylistId: String(s.id) })
              }
              className={`p-3 rounded-xl border text-left transition-all ${
                formData.stylistId === String(s.id)
                  ? "border-rose-600 bg-rose-50/50 ring-1 ring-rose-600"
                  : "border-stone-200 hover:bg-stone-50"
              }`}
            >
              <p className="font-semibold text-stone-900 text-xs">{s.name}</p>
              <p className="text-[10px] text-stone-500 mt-0.5">{s.role}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Fecha y Hora */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-rose-600" /> Fecha
          </label>
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full p-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-rose-600" /> Hora
          </label>
          <select
            required
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            className="w-full p-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400"
          >
            <option value="">Selecciona la hora...</option>
            {availableTimes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl transition-all shadow-md mt-4"
      >
        Confirmar Reserva
      </button>
    </form>
  );
}
