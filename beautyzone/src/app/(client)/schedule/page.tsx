"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Clock,
  UserCheck,
  Scissors,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Trash2,
  Plus,
  Sparkles,
  History,
  Tag,
  AlertCircle,
  XCircle,
} from "lucide-react";

// --- DATOS SIMULADOS (Mock Data) ---
const MOCK_SERVICIOS = [
  {
    id: 1,
    nombre: "Balayage + Matizado & Olaplex",
    categoria: "Colorimetría",
    duracion_min: 180,
    precio: 120.0,
    imagen: "/img/servicio1.png",
  },
  {
    id: 2,
    nombre: "Corte Estilizado + Peinado Glam",
    categoria: "Corte & Estilo",
    duracion_min: 60,
    precio: 45.0,
    imagen: "/img/servicio2.png",
  },
  {
    id: 3,
    nombre: "Manicura Rusa con Gel Spa",
    categoria: "Uñas",
    duracion_min: 90,
    precio: 35.0,
    imagen: "/img/servicio3.png",
  },
  {
    id: 4,
    nombre: "Hidratación Profunda Ácido Hialurónico",
    categoria: "Tratamiento",
    duracion_min: 75,
    precio: 65.0,
    imagen: "/img/servicio4.png",
  },
];

const MOCK_ESTILISTAS = [
  { id: 101, nombre: "Elena Rostova", especialidad: "Colorimetría Master" },
  { id: 102, nombre: "Carlos Mendoza", especialidad: "Corte & Styling" },
  { id: 103, nombre: "Sofía Martínez", especialidad: "Manicura & Nails" },
  { id: 104, nombre: "Sin preferencia", especialidad: "Asignación automática" },
];

const HORARIOS_DISPONIBLES = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

// Datos simulados de la BD para el Historial (citas + detalle_citas)
const MOCK_HISTORIAL_CITAS = [
  {
    id: 1024,
    fecha: "2026-08-20",
    hora_inicio: "10:00:00",
    estado: "FINALIZADA",
    notas: "Alergia a productos con amoniaco fuerte.",
    detalles: [
      {
        id: 1,
        servicio_nombre: "Balayage + Matizado & Olaplex",
        estilista_nombre: "Elena Rostova",
        precio_historico: 120.0,
      },
      {
        id: 2,
        servicio_nombre: "Corte Estilizado + Peinado Glam",
        estilista_nombre: "Carlos Mendoza",
        precio_historico: 45.0,
      },
    ],
  },
  {
    id: 1038,
    fecha: "2026-09-02",
    hora_inicio: "15:00:00",
    estado: "CONFIRMADA",
    notas: "Llegaré 5 minutos antes.",
    detalles: [
      {
        id: 3,
        servicio_nombre: "Manicura Rusa con Gel Spa",
        estilista_nombre: "Sofía Martínez",
        precio_historico: 35.0,
      },
    ],
  },
  {
    id: 1012,
    fecha: "2026-07-15",
    hora_inicio: "11:30:00",
    estado: "CANCELADA",
    notas: "",
    detalles: [
      {
        id: 4,
        servicio_nombre: "Hidratación Profunda Ácido Hialurónico",
        estilista_nombre: "Elena Rostova",
        precio_historico: 65.0,
      },
    ],
  },
];

interface DetalleCitaItem {
  idservicio: number;
  servicio_nombre: string;
  idestilista: number;
  estilista_nombre: string;
  precio_historico: number;
  duracion_min: number;
}

export default function ReservasPage() {
  const [paso, setPaso] = useState<1 | 2 | 3 | 4>(1);

  // Estados del agendamiento
  const [detalles, setDetalles] = useState<DetalleCitaItem[]>([]);
  const [fecha, setFecha] = useState<string>("");
  const [horaInicio, setHoraInicio] = useState<string>("");
  const [notas, setNotas] = useState<string>("");

  // Estado temporal para selección de servicios
  const [servicioSeleccionado, setServicioSeleccionado] = useState<
    number | null
  >(null);
  const [estilistaSeleccionado, setEstilistaSeleccionado] =
    useState<number>(104);

  // Cálculos financieros
  const totalEstimado = detalles.reduce(
    (acc, item) => acc + item.precio_historico,
    0,
  );
  const duracionTotal = detalles.reduce(
    (acc, item) => acc + item.duracion_min,
    0,
  );

  const agregarServicio = () => {
    if (!servicioSeleccionado) return;
    const s = MOCK_SERVICIOS.find((serv) => serv.id === servicioSeleccionado);
    const e = MOCK_ESTILISTAS.find((est) => est.id === estilistaSeleccionado);

    if (!s) return;

    const nuevoDetalle: DetalleCitaItem = {
      idservicio: s.id,
      servicio_nombre: s.nombre,
      idestilista: e ? e.id : 104,
      estilista_nombre: e ? e.nombre : "Sin preferencia",
      precio_historico: s.precio,
      duracion_min: s.duracion_min,
    };

    setDetalles([...detalles, nuevoDetalle]);
    setServicioSeleccionado(null);
    setEstilistaSeleccionado(104);
  };

  const eliminarDetalle = (index: number) => {
    setDetalles(detalles.filter((_, idx) => idx !== index));
  };

  const handleConfirmarReserva = () => {
    const payloadCita = {
      citas: {
        idcliente: 1,
        fecha: fecha,
        hora_inicio: horaInicio + ":00",
        estado: "PENDIENTE",
        notas: notas,
      },
      detalle_citas: detalles.map((item) => ({
        idservicio: item.idservicio,
        idestilista: item.idestilista,
        precio_historico: item.precio_historico,
      })),
    };

    console.log("Cita enviada:", payloadCita);
    setPaso(4);
  };

  // Helper para insignias de estado según tu esquema enum
  const renderEstadoBadge = (estado: string) => {
    switch (estado) {
      case "CONFIRMADA":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" /> CONFIRMADA
          </span>
        );
      case "FINALIZADA":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3" /> FINALIZADA
          </span>
        );
      case "CANCELADA":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
            <XCircle className="w-3 h-3" /> CANCELADA
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
            <AlertCircle className="w-3 h-3" /> PENDIENTE
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[var(--sys-color-bg-highlight)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* ENCABEZADO */}
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--sys-color-bg-base)] text-[var(--sys-color-primary-base)] text-xs font-semibold uppercase tracking-wider border border-[var(--sys-color-border)]">
            <Sparkles className="w-3.5 h-3.5" /> Reserva Online
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-[var(--sys-color-text-primary)]">
            Agenda tu Experiencia B-Zone
          </h1>
          <p className="text-[var(--sys-color-text-muted)] text-sm max-w-lg mx-auto">
            Selecciona los servicios que deseas agendar, tu estilista preferido
            y la fecha ideal.
          </p>
        </div>

        {/* INDICADOR DE PASOS */}
        {paso < 4 && (
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-[var(--sys-color-border)] shadow-sm">
            {[
              { num: 1, title: "Servicios" },
              { num: 2, title: "Fecha y Hora" },
              { num: 3, title: "Confirmación" },
            ].map((s) => (
              <div key={s.num} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                    paso >= s.num
                      ? "bg-[var(--sys-color-primary-base)] text-white"
                      : "bg-[var(--sys-color-bg-base)] text-[var(--sys-color-text-muted)]"
                  }`}
                >
                  {s.num}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:inline ${
                    paso >= s.num
                      ? "text-[var(--sys-color-text-primary)] font-semibold"
                      : "text-[var(--sys-color-text-muted)]"
                  }`}
                >
                  {s.title}
                </span>
                {s.num < 3 && (
                  <ChevronRight className="w-4 h-4 text-[var(--sys-color-border)] ml-2 hidden sm:block" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* PASO 1: SELECCIÓN DE SERVICIOS Y ESTILISTAS */}
        {paso === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-[var(--sys-color-border)] shadow-sm space-y-4">
                <h2 className="font-serif text-xl font-bold text-[var(--sys-color-text-primary)] flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-[var(--sys-color-primary-accent)]" />{" "}
                  1. Elige un servicio
                </h2>

                <div className="grid grid-cols-1 gap-3">
                  {MOCK_SERVICIOS.map((serv) => {
                    const isSelected = servicioSeleccionado === serv.id;
                    return (
                      <div
                        key={serv.id}
                        onClick={() => setServicioSeleccionado(serv.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "border-[var(--sys-color-primary-base)] bg-[var(--sys-color-bg-highlight)] shadow-sm"
                            : "border-stone-200 hover:border-[var(--sys-color-border)]"
                        }`}
                      >
                        <div>
                          <p className="text-xs text-[var(--sys-color-primary-accent)] font-semibold uppercase">
                            {serv.categoria}
                          </p>
                          <h3 className="font-semibold text-[var(--sys-color-text-primary)]">
                            {serv.nombre}
                          </h3>
                          <span className="text-xs text-[var(--sys-color-text-muted)] flex items-center gap-1 mt-1">
                            <Clock className="w-3.5 h-3.5" />{" "}
                            {serv.duracion_min} min
                          </span>
                        </div>
                        <span className="font-serif font-bold text-lg text-[var(--sys-color-primary-base)]">
                          ${serv.precio.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {servicioSeleccionado && (
                <div className="bg-white p-6 rounded-2xl border border-[var(--sys-color-border)] shadow-sm space-y-4">
                  <h2 className="font-serif text-xl font-bold text-[var(--sys-color-text-primary)] flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-[var(--sys-color-primary-accent)]" />{" "}
                    2. Elige un estilista para este servicio
                  </h2>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {MOCK_ESTILISTAS.map((est) => {
                      const isSelected = estilistaSeleccionado === est.id;
                      return (
                        <div
                          key={est.id}
                          onClick={() => setEstilistaSeleccionado(est.id)}
                          className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                            isSelected
                              ? "border-[var(--sys-color-primary-base)] bg-[var(--sys-color-bg-highlight)]"
                              : "border-stone-200 hover:border-[var(--sys-color-border)]"
                          }`}
                        >
                          <div className="w-12 h-12 rounded-full bg-[var(--sys-color-bg-base)] text-[var(--sys-color-primary-base)] flex items-center justify-center mx-auto mb-2 font-bold text-sm">
                            {est.nombre.charAt(0)}
                          </div>
                          <p className="text-xs font-semibold text-[var(--sys-color-text-primary)] line-clamp-1">
                            {est.nombre}
                          </p>
                          <p className="text-[10px] text-[var(--sys-color-text-muted)] line-clamp-1">
                            {est.especialidad}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={agregarServicio}
                    className="w-full mt-4 py-3 bg-[var(--sys-color-primary-base)] text-white rounded-xl font-medium text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Agregar Servicio al Listado
                  </button>
                </div>
              )}
            </div>

            {/* Resumen Lateral */}
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-2xl border border-[var(--sys-color-border)] shadow-sm space-y-4 sticky top-6">
                <h3 className="font-serif font-bold text-lg text-[var(--sys-color-text-primary)] border-b pb-2">
                  Detalle de la Cita ({detalles.length})
                </h3>

                {detalles.length === 0 ? (
                  <p className="text-xs text-[var(--sys-color-text-muted)] text-center py-6">
                    Aún no has agregado ningún servicio a tu cita.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {detalles.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-start bg-[var(--sys-color-bg-highlight)] p-3 rounded-xl border border-[var(--sys-color-border)]/50"
                      >
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-[var(--sys-color-text-primary)]">
                            {item.servicio_nombre}
                          </p>
                          <p className="text-[11px] text-[var(--sys-color-primary-accent)]">
                            Estilista: {item.estilista_nombre}
                          </p>
                          <p className="text-[10px] text-[var(--sys-color-text-muted)]">
                            {item.duracion_min} min
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[var(--sys-color-text-primary)]">
                            ${item.precio_historico.toFixed(2)}
                          </span>
                          <button
                            onClick={() => eliminarDetalle(idx)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {detalles.length > 0 && (
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-xs text-[var(--sys-color-text-muted)]">
                      <span>Duración estimada:</span>
                      <span className="font-semibold text-[var(--sys-color-text-primary)]">
                        {duracionTotal} min
                      </span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-[var(--sys-color-text-primary)]">
                      <span>Total:</span>
                      <span className="font-serif text-xl text-[var(--sys-color-primary-base)]">
                        ${totalEstimado.toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={() => setPaso(2)}
                      className="w-full mt-4 py-3 bg-[var(--sys-color-primary-accent)] text-white rounded-xl font-medium text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-md"
                    >
                      Continuar a Fecha y Hora{" "}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PASO 2: SELECCIÓN DE FECHA Y HORA */}
        {paso === 2 && (
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-[var(--sys-color-border)] shadow-sm space-y-6">
            <h2 className="font-serif text-2xl font-bold text-[var(--sys-color-text-primary)] flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-[var(--sys-color-primary-accent)]" />{" "}
              Selecciona Fecha y Hora
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-[var(--sys-color-text-muted)]">
                  Fecha de la cita
                </label>
                <input
                  type="date"
                  value={fecha}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[var(--sys-color-primary-base)] text-sm font-medium text-[var(--sys-color-text-primary)] bg-[var(--sys-color-bg-highlight)]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-[var(--sys-color-text-muted)]">
                  Hora de inicio
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {HORARIOS_DISPONIBLES.map((hora) => (
                    <button
                      key={hora}
                      type="button"
                      onClick={() => setHoraInicio(hora)}
                      className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                        horaInicio === hora
                          ? "bg-[var(--sys-color-primary-base)] text-white border-[var(--sys-color-primary-base)]"
                          : "border-stone-200 text-[var(--sys-color-text-primary)] hover:border-[var(--sys-color-border)]"
                      }`}
                    >
                      {hora}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-[var(--sys-color-text-muted)]">
                Notas o especificaciones adicionales
              </label>
              <textarea
                rows={3}
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Ej. Alergias a tintes, preferencia de bebida, etc."
                className="w-full p-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[var(--sys-color-primary-base)] text-sm text-[var(--sys-color-text-primary)]"
              />
            </div>

            <div className="flex justify-between pt-4 border-t">
              <button
                onClick={() => setPaso(1)}
                className="px-6 py-2.5 border border-stone-300 text-[var(--sys-color-text-primary)] rounded-xl font-medium text-sm hover:bg-stone-50 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Volver
              </button>
              <button
                disabled={!fecha || !horaInicio}
                onClick={() => setPaso(3)}
                className="px-8 py-2.5 bg-[var(--sys-color-primary-base)] text-white rounded-xl font-medium text-sm hover:opacity-90 transition-all disabled:opacity-40 flex items-center gap-1"
              >
                Revisar Reserva <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* PASO 3: REVISIÓN FINAL */}
        {paso === 3 && (
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-[var(--sys-color-border)] shadow-sm space-y-6">
            <h2 className="font-serif text-2xl font-bold text-[var(--sys-color-text-primary)]">
              Resumen Final de tu Reserva
            </h2>

            <div className="bg-[var(--sys-color-bg-highlight)] p-4 rounded-xl border border-[var(--sys-color-border)] space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--sys-color-text-muted)]">
                  Fecha & Hora:
                </span>
                <span className="font-bold text-[var(--sys-color-text-primary)]">
                  {fecha} a las {horaInicio} hs
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--sys-color-text-muted)]">
                  Estado inicial:
                </span>
                <span className="font-bold text-[var(--sys-color-warning)] bg-amber-50 px-2 py-0.5 rounded text-xs">
                  PENDIENTE
                </span>
              </div>
              {notas && (
                <div className="text-xs text-[var(--sys-color-text-muted)] border-t border-[var(--sys-color-border)] pt-2">
                  <span className="font-bold">Notas:</span> {notas}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-sm text-[var(--sys-color-text-primary)]">
                Servicios agendados
              </h3>
              <div className="border rounded-xl overflow-hidden divide-y">
                {detalles.map((d, i) => (
                  <div
                    key={i}
                    className="p-3 flex justify-between items-center text-xs"
                  >
                    <div>
                      <p className="font-bold text-[var(--sys-color-text-primary)]">
                        {d.servicio_nombre}
                      </p>
                      <p className="text-[var(--sys-color-text-muted)]">
                        Estilista: {d.estilista_nombre}
                      </p>
                    </div>
                    <span className="font-bold text-[var(--sys-color-primary-base)]">
                      ${d.precio_historico.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-lg font-serif font-bold text-[var(--sys-color-text-primary)]">
                Total a pagar en salón:
              </span>
              <span className="text-2xl font-serif font-bold text-[var(--sys-color-primary-base)]">
                ${totalEstimado.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setPaso(2)}
                className="px-6 py-2.5 border border-stone-300 text-[var(--sys-color-text-primary)] rounded-xl font-medium text-sm hover:bg-stone-50"
              >
                Volver
              </button>
              <button
                onClick={handleConfirmarReserva}
                className="px-8 py-3 bg-[var(--sys-color-primary-accent)] text-white rounded-xl font-bold text-sm hover:opacity-90 shadow-lg flex items-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" /> Confirmar Cita
              </button>
            </div>
          </div>
        )}

        {/* PASO 4: CONFIRMACIÓN EXITOSA */}
        {paso === 4 && (
          <div className="bg-white p-8 rounded-2xl border border-[var(--sys-color-border)] text-center space-y-6 shadow-sm">
            <div className="w-16 h-16 bg-emerald-100 text-[var(--sys-color-success)] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif text-3xl font-bold text-[var(--sys-color-text-primary)]">
                ¡Cita Registrada con Éxito!
              </h2>
              <p className="text-sm text-[var(--sys-color-text-muted)] max-w-md mx-auto">
                Tu solicitud ha sido registrada con el estado{" "}
                <span className="font-bold text-[var(--sys-color-warning)]">
                  PENDIENTE
                </span>
                .
              </p>
            </div>

            <div className="pt-4 flex justify-center gap-4">
              <button
                onClick={() => {
                  setPaso(1);
                  setDetalles([]);
                  setFecha("");
                  setHoraInicio("");
                  setNotas("");
                }}
                className="px-6 py-2.5 bg-[var(--sys-color-primary-base)] text-white rounded-xl font-medium text-sm hover:opacity-90 transition-all"
              >
                Agendar otra cita
              </button>
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* NUEVA SECCIÓN: HISTORIAL DE CITAS DE CLIENTE */}
        {/* ========================================= */}
        <section className="bg-white p-6 md:p-8 rounded-2xl border border-[var(--sys-color-border)] shadow-sm space-y-6 pt-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[var(--sys-color-text-primary)] flex items-center gap-2">
                <History className="w-6 h-6 text-[var(--sys-color-primary-accent)]" />{" "}
                Mis Citas & Historial
              </h2>
              <p className="text-xs text-[var(--sys-color-text-muted)] mt-1">
                Consulta el estado de tus citas pasadas y programas
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-[var(--sys-color-bg-base)] text-[var(--sys-color-primary-base)] rounded-lg">
              {MOCK_HISTORIAL_CITAS.length} Registros
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[var(--sys-color-text-primary)]">
              <thead className="bg-[var(--sys-color-bg-highlight)] text-[var(--sys-color-text-muted)] uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4 rounded-l-lg">ID Cita</th>
                  <th className="py-3 px-4">Fecha & Hora</th>
                  <th className="py-3 px-4">Servicios (`detalle_citas`)</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 rounded-r-lg text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {MOCK_HISTORIAL_CITAS.map((cita) => {
                  const totalCita = cita.detalles.reduce(
                    (acc, d) => acc + d.precio_historico,
                    0,
                  );
                  return (
                    <tr
                      key={cita.id}
                      className="hover:bg-stone-50 transition-colors"
                    >
                      <td className="py-4 px-4 font-mono font-bold text-[var(--sys-color-text-muted)]">
                        #{cita.id}
                      </td>
                      <td className="py-4 px-4 font-medium">
                        <div>{cita.fecha}</div>
                        <div className="text-[10px] text-[var(--sys-color-text-muted)]">
                          {cita.hora_inicio.slice(0, 5)} hs
                        </div>
                      </td>
                      <td className="py-4 px-4 space-y-1">
                        {cita.detalles.map((det, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <Tag className="w-3 h-3 text-[var(--sys-color-primary-accent)] shrink-0" />
                            <span className="font-semibold">
                              {det.servicio_nombre}
                            </span>
                            <span className="text-[10px] text-[var(--sys-color-text-muted)]">
                              ({det.estilista_nombre})
                            </span>
                          </div>
                        ))}
                      </td>
                      <td className="py-4 px-4">
                        {renderEstadoBadge(cita.estado)}
                      </td>
                      <td className="py-4 px-4 text-right font-serif font-bold text-sm text-[var(--sys-color-primary-base)]">
                        ${totalCita.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
