"use client";

import { useMemo, useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import Button from "@/src/components/ui/Button";
import SelectorServicios from "@/src/components/forms/SelectorServicios";
import { useOpcionesAgenda } from "@/src/app/hooks/useOpcionesAgenda";
import { useToast } from "@/src/components/ui/Toast";
import {
  ESTADOS_CITA,
  type CitaDetalle,
  type DetalleCitaInput,
} from "@/src/app/types/agenda";

const CLASE_CAMPO =
  "w-full p-2.5 bg-[#F5EBE1] border border-[#D8C3B3] rounded-xl text-xs text-[#32130E] focus:outline-none focus:ring-2 focus:ring-[#9D4B4C]";

interface EditarCitaFormProps {
  cita: CitaDetalle;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditarCitaForm({
  cita,
  onClose,
  onSuccess,
}: EditarCitaFormProps) {
  const { opciones, loading, error: errorOpciones } = useOpcionesAgenda();
  const toast = useToast();

  const [submitting, setSubmitting] = useState(false);
  const [idcliente, setIdcliente] = useState(String(cita.clienteId));
  const [detalles, setDetalles] = useState<DetalleCitaInput[]>(
    cita.detalles.map((d) => ({
      idservicio: d.idservicio,
      idestilista: d.idestilista,
    })),
  );
  const [fecha, setFecha] = useState(cita.fecha);
  const [horaInicio, setHoraInicio] = useState(cita.hora);
  const [estado, setEstado] = useState(cita.estado);
  const [notas, setNotas] = useState(cita.notas ?? "");

  // Si la cita guarda un cliente que ya no está activo, se cae el select a la
  // primera opción válida al renderizar en lugar de en un efecto.
  const clienteEfectivo = useMemo(() => {
    if (opciones.clientes.some((c) => String(c.id) === idcliente)) {
      return idcliente;
    }
    return opciones.clientes[0] ? String(opciones.clientes[0].id) : "";
  }, [opciones.clientes, idcliente]);

  const servicioInvalido = detalles.some(
    (d) => !d.idservicio || !d.idestilista,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (servicioInvalido) {
      toast.error(
        "Faltan datos del servicio",
        "Cada servicio de la cita necesita un estilista asignado.",
      );
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/agenda/${cita.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idcliente: Number(clienteEfectivo),
          fecha,
          horaInicio,
          estado,
          notas,
          detalles,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        toast.error(
          "No se pudo actualizar la cita",
          data?.error ?? "Ocurrió un error al guardar los cambios.",
        );
        return;
      }

      toast.exito(
        "Cita actualizada",
        `Los cambios de la cita #${cita.id} se guardaron.`,
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
        {/* Skeleton Cliente y Estado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-3.5 w-16 bg-[#D8C3B3]/50 rounded-md" />
            <div className="h-11 w-full bg-[#F5EBE1]/60 rounded-xl" />
          </div>
          <div className="space-y-2">
            <div className="h-3.5 w-16 bg-[#D8C3B3]/50 rounded-md" />
            <div className="h-11 w-full bg-[#F5EBE1]/60 rounded-xl" />
          </div>
        </div>

        {/* Skeleton Servicios */}
        <div className="space-y-2 py-2">
          <div className="h-3.5 w-28 bg-[#D8C3B3]/50 rounded-md" />
          <div className="h-24 w-full bg-[#F5EBE1]/60 rounded-xl" />
        </div>

        {/* Skeleton Fecha y Hora */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-3.5 w-14 bg-[#D8C3B3]/50 rounded-md" />
            <div className="h-11 w-full bg-[#F5EBE1]/60 rounded-xl" />
          </div>
          <div className="space-y-2">
            <div className="h-3.5 w-24 bg-[#D8C3B3]/50 rounded-md" />
            <div className="h-11 w-full bg-[#F5EBE1]/60 rounded-xl" />
          </div>
        </div>

        {/* Skeleton Notas */}
        <div className="space-y-2">
          <div className="h-3.5 w-28 bg-[#D8C3B3]/50 rounded-md" />
          <div className="h-16 w-full bg-[#F5EBE1]/60 rounded-xl" />
        </div>

        {/* Skeleton Botones */}
        <div className="flex justify-end gap-2 pt-4 border-t border-[#D8C3B3]">
          <div className="h-10 w-24 bg-[#F5EBE1] rounded-xl" />
          <div className="h-10 w-36 bg-[#9D4B4C]/20 rounded-xl" />
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

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {/* FILA 1: CLIENTE Y ESTADO (2 COLUMNAS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* CLIENTE */}
        <div>
          <label className="block text-xs font-bold text-[#32130E] mb-1.5">
            Cliente *
          </label>
          <select
            required
            value={clienteEfectivo}
            onChange={(e) => setIdcliente(e.target.value)}
            className={CLASE_CAMPO}
          >
            {opciones.clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre} {c.apellido}
              </option>
            ))}
          </select>
        </div>

        {/* ESTADO */}
        <div>
          <label className="block text-xs font-bold text-[#32130E] mb-1.5">
            Estado *
          </label>
          <select
            required
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className={CLASE_CAMPO}
          >
            {ESTADOS_CITA.map((e) => (
              <option key={e} value={e}>
                {e.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SERVICIOS + ESTILISTAS (Sin contenedor ni fondo) */}
      <div className="w-full">
        <SelectorServicios
          detalles={detalles}
          onChange={setDetalles}
          servicios={opciones.servicios}
          estilistas={opciones.estilistas}
        />
      </div>

      {/* FILA 2: FECHA Y HORA (2 COLUMNAS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-[#32130E] mb-1.5">
            Fecha *
          </label>
          <input
            type="date"
            required
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
          disabled={submitting || !clienteEfectivo || servicioInvalido}
          size="sm"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Guardar Cambios"
          )}
        </Button>
      </div>
    </form>
  );
}
