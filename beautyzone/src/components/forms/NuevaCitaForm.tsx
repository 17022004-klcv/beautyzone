"use client";

import { useMemo, useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import Button from "@/src/components/ui/Button";
import SelectorServicios from "@/src/components/forms/SelectorServicios";
import { useOpcionesAgenda } from "@/src/app/hooks/useOpcionesAgenda";
import { useToast } from "@/src/components/ui/Toast";
import { hoyComoDateISO } from "@/src/lib/cajaTotales";
import { validarFechaHoraCita } from "@/src/lib/validaciones";
import type { DetalleCitaInput } from "@/src/app/types/agenda";

const CLASE_CAMPO =
  "w-full p-2.5 bg-[#F5EBE1] border border-[#D8C3B3] rounded-xl text-xs text-[#32130E] focus:outline-none focus:ring-2 focus:ring-[#9D4B4C]";

/**
 * Hora con la que arranca el formulario.
 *
 * Para un día futuro vale la apertura de siempre, pero si la cita es de hoy
 * arrancar a las 09:00 abriría el formulario con un error en rojo antes de que
 * la persona toque nada. En ese caso se propone la próxima media hora.
 */
function horaInicialSugerida(fecha: string): string {
  const ahora = new Date();
  if (fecha !== hoyComoDateISO(ahora)) return "09:00";

  const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();
  const siguiente = Math.ceil((minutosAhora + 1) / 30) * 30;
  const elegido = Math.min(siguiente, 23 * 60 + 59);

  return `${String(Math.floor(elegido / 60)).padStart(2, "0")}:${String(
    elegido % 60,
  ).padStart(2, "0")}`;
}

interface NuevaCitaFormProps {
  selectedDateStr: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NuevaCitaForm({
  selectedDateStr,
  onClose,
  onSuccess,
}: NuevaCitaFormProps) {
  const { opciones, loading, error: errorOpciones } = useOpcionesAgenda();
  const toast = useToast();

  const [submitting, setSubmitting] = useState(false);
  const [idcliente, setIdcliente] = useState("");
  const [detalles, setDetalles] = useState<DetalleCitaInput[]>([
    { idservicio: 0, idestilista: 0 },
  ]);
  const [fecha, setFecha] = useState(selectedDateStr);
  const [horaInicio, setHoraInicio] = useState(() =>
    horaInicialSugerida(selectedDateStr),
  );
  const [notas, setNotas] = useState("");

  // La primera opción válida se resuelve al renderizar en lugar de en un
  // efecto: así el `<select>` ya muestra algo y no se dispara un render extra.
  const detallesEfectivos = useMemo(
    () =>
      detalles.map((d) => ({
        idservicio: d.idservicio || (opciones.servicios[0]?.id ?? 0),
        idestilista: d.idestilista || (opciones.estilistas[0]?.id ?? 0),
      })),
    [detalles, opciones.servicios, opciones.estilistas],
  );

  const sinEstilistas = opciones.estilistas.length === 0;
  const servicioInvalido = detallesEfectivos.some(
    (d) => !d.idservicio || !d.idestilista,
  );

  // No se puede agendar hacia atrás: hoy a una hora que no haya pasado, ni
  // ningún día anterior. La ruta POST repite esta misma validación.
  const errorCita = validarFechaHoraCita(fecha, horaInicio);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (servicioInvalido) {
      toast.error(
        "Faltan datos del servicio",
        "Elige un servicio y un estilista para cada línea de la cita.",
      );
      return;
    }

    if (errorCita) {
      toast.error("No se puede agendar la cita", errorCita);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/agenda/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idcliente: Number(idcliente),
          fecha,
          horaInicio,
          notas,
          detalles: detallesEfectivos,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        toast.error(
          "No se pudo agendar la cita",
          data?.error ?? "Ocurrió un error al guardar la cita.",
        );
        return;
      }

      toast.exito(
        "Cita agendada",
        `Reserva confirmada para el ${fecha} a las ${horaInicio}.`,
      );
      onSuccess();
      onClose();
    } catch {
      toast.error(
        "Error de conexión",
        "No se pudo conectar con el servidor. Inténtalo de nuevo.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full space-y-5 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-3.5 w-20 bg-[#D8C3B3]/50 rounded-md" />
            <div className="h-11 w-full bg-[#F5EBE1]/60 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="h-3.5 w-16 bg-[#D8C3B3]/50 rounded-md" />
              <div className="h-11 w-full bg-[#F5EBE1]/60 rounded-xl" />
            </div>
            <div className="space-y-2">
              <div className="h-3.5 w-20 bg-[#D8C3B3]/50 rounded-md" />
              <div className="h-11 w-full bg-[#F5EBE1]/60 rounded-xl" />
            </div>
          </div>
        </div>
        <div className="space-y-2 py-2">
          <div className="h-3.5 w-28 bg-[#D8C3B3]/50 rounded-md" />
          <div className="h-24 w-full bg-[#F5EBE1]/60 rounded-xl" />
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-[#D8C3B3]">
          <div className="h-10 w-24 bg-[#F5EBE1] rounded-xl" />
          <div className="h-10 w-32 bg-[#9D4B4C]/20 rounded-xl" />
        </div>
      </div>
    );
  }

  if (errorOpciones) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-10 px-4 text-center">
        <AlertTriangle className="w-8 h-8 text-[#B83A3A] mb-2" />
        <p className="text-xs font-semibold text-[#B83A3A] mb-3">
          {errorOpciones}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-bold text-[#32130E] hover:underline"
        >
          Cerrar
        </button>
      </div>
    );
  }

  if (opciones.clientes.length === 0 || sinEstilistas) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-10 px-4 text-center">
        <AlertTriangle className="w-8 h-8 text-[#C07D2B] mb-2" />
        <p className="text-xs font-semibold text-[#32130E] mb-1">
          {opciones.clientes.length === 0 && sinEstilistas
            ? "No hay clientes ni estilistas activos registrados."
            : opciones.clientes.length === 0
              ? "No hay clientes activos registrados."
              : "No hay estilistas activos registrados."}
        </p>
        <span className="text-[11px] text-[#7A5C55]">
          Los roles deben existir con el nombre exacto &quot;Cliente&quot; y
          &quot;Estilista&quot;.
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {/* FILA SUPERIOR: CLIENTE (Columna Izquierda) y FECHA/HORA (Columna Derecha) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CLIENTE */}
        <div>
          <label className="block text-xs font-bold text-[#32130E] mb-1.5">
            Cliente *
          </label>
          <select
            required
            value={idcliente}
            onChange={(e) => setIdcliente(e.target.value)}
            className={CLASE_CAMPO}
          >
            <option value="">Seleccionar cliente...</option>
            {opciones.clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre} {c.apellido}
              </option>
            ))}
          </select>
        </div>

        {/* FECHA Y HORA DE INICIO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#32130E] mb-1.5">
              Fecha *
            </label>
            <input
              type="date"
              required
              min={hoyComoDateISO()}
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className={CLASE_CAMPO}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#32130E] mb-1.5">
              Hora de Inicio *
            </label>
            <input
              type="time"
              required
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
              className={CLASE_CAMPO}
            />
          </div>
        </div>
      </div>

      {/* ERROR DE CITA */}
      {errorCita && (
        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-[#B83A3A] bg-[#B83A3A]/5 p-2.5 rounded-lg border border-[#B83A3A]/20">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          {errorCita}
        </p>
      )}

      {/* SERVICIOS + ESTILISTAS (Sin contenedor ni fondo) */}
      <div className="w-full">
        <SelectorServicios
          detalles={detallesEfectivos}
          onChange={setDetalles}
          servicios={opciones.servicios}
          estilistas={opciones.estilistas}
        />
      </div>

      {/* NOTAS ADICIONALES */}
      <div>
        <label className="block text-xs font-bold text-[#32130E] mb-1.5">
          Notas adicionales
        </label>
        <textarea
          rows={2}
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Preferencias del cliente, observaciones..."
          className={CLASE_CAMPO}
        />
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="flex justify-end gap-2 pt-4 border-t border-[#D8C3B3]">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-xs font-semibold text-[#7A5C55] hover:bg-[#F5EBE1] rounded-xl transition-colors"
        >
          Cancelar
        </button>
        <Button
          type="submit"
          disabled={submitting || !idcliente || servicioInvalido}
          size="sm"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Guardar Cita"
          )}
        </Button>
      </div>
    </form>
  );
}
