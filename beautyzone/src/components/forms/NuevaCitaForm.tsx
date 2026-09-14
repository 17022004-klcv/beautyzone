"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import Button from "@/src/components/ui/Button";

interface OptionItem {
  id: number;
  nombre: string;
  apellido?: string;
  precio?: number;
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
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [clientes, setClientes] = useState<OptionItem[]>([]);
  const [servicios, setServicios] = useState<OptionItem[]>([]);
  const [estilistas, setEstilistas] = useState<OptionItem[]>([]);

  const [formData, setFormData] = useState({
    idcliente: "",
    idservicio: "",
    idestilista: "",
    fecha: selectedDateStr,
    horaInicio: "09:00",
    notas: "",
  });

  useEffect(() => {
    async function loadOptions() {
      setLoading(true);
      try {
        const res = await fetch("/api/agenda/opciones");
        if (res.ok) {
          const data = await res.json();
          setClientes(data.clientes || []);
          setServicios(data.servicios || []);
          setEstilistas(data.estilistas || []);
        }
      } catch (e) {
        console.error("Error al cargar opciones:", e);
      } finally {
        setLoading(false);
      }
    }
    loadOptions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/agenda/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "No se pudo agendar la cita.");
      }
    } catch (err) {
      console.error(err);
      alert("Error al conectar con el servidor.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10 text-[#7A5C55]">
        <Loader2 className="w-6 h-6 animate-spin text-[#9D4B4C]" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* CLIENTE */}
      <div>
        <label className="block text-xs font-bold text-[#32130E] mb-1">
          Cliente *
        </label>
        <select
          required
          value={formData.idcliente}
          onChange={(e) =>
            setFormData({ ...formData, idcliente: e.target.value })
          }
          className="w-full p-2.5 bg-[#F5EBE1] border border-[#D8C3B3] rounded-xl text-xs text-[#32130E] focus:outline-none focus:ring-2 focus:ring-[#9D4B4C]"
        >
          <option value="">Seleccionar cliente...</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre} {c.apellido}
            </option>
          ))}
        </select>
      </div>

      {/* SERVICIO Y ESTILISTA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-[#32130E] mb-1">
            Servicio *
          </label>
          <select
            required
            value={formData.idservicio}
            onChange={(e) =>
              setFormData({ ...formData, idservicio: e.target.value })
            }
            className="w-full p-2.5 bg-[#F5EBE1] border border-[#D8C3B3] rounded-xl text-xs text-[#32130E] focus:outline-none focus:ring-2 focus:ring-[#9D4B4C]"
          >
            <option value="">Seleccionar servicio...</option>
            {servicios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre} (${Number(s.precio).toFixed(2)})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#32130E] mb-1">
            Estilista / Personal *
          </label>
          <select
            required
            value={formData.idestilista}
            onChange={(e) =>
              setFormData({ ...formData, idestilista: e.target.value })
            }
            className="w-full p-2.5 bg-[#F5EBE1] border border-[#D8C3B3] rounded-xl text-xs text-[#32130E] focus:outline-none focus:ring-2 focus:ring-[#9D4B4C]"
          >
            <option value="">Seleccionar estilista...</option>
            {estilistas.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre} {e.apellido}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* FECHA Y HORA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-[#32130E] mb-1">
            Fecha *
          </label>
          <input
            type="date"
            required
            value={formData.fecha}
            onChange={(e) =>
              setFormData({ ...formData, fecha: e.target.value })
            }
            className="w-full p-2.5 bg-[#F5EBE1] border border-[#D8C3B3] rounded-xl text-xs text-[#32130E] focus:outline-none focus:ring-2 focus:ring-[#9D4B4C]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#32130E] mb-1">
            Hora de Inicio *
          </label>
          <input
            type="time"
            required
            value={formData.horaInicio}
            onChange={(e) =>
              setFormData({ ...formData, horaInicio: e.target.value })
            }
            className="w-full p-2.5 bg-[#F5EBE1] border border-[#D8C3B3] rounded-xl text-xs text-[#32130E] focus:outline-none focus:ring-2 focus:ring-[#9D4B4C]"
          />
        </div>
      </div>

      {/* NOTAS */}
      <div>
        <label className="block text-xs font-bold text-[#32130E] mb-1">
          Notas adicionales
        </label>
        <textarea
          rows={2}
          value={formData.notas}
          onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
          placeholder="Preferencias del cliente, observaciones..."
          className="w-full p-2.5 bg-[#F5EBE1] border border-[#D8C3B3] rounded-xl text-xs text-[#32130E] focus:outline-none focus:ring-2 focus:ring-[#9D4B4C]"
        />
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="flex justify-end gap-2 pt-3 border-t border-[#D8C3B3]">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-xs font-semibold text-[#7A5C55] hover:bg-[#F5EBE1] rounded-xl transition-colors"
        >
          Cancelar
        </button>
        <Button type="submit" disabled={submitting} size="sm">
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
