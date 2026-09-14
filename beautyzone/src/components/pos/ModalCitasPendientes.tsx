"use client";

import { Calendar, Clock, Check } from "lucide-react";

interface CitaConDetalles {
  id: number;
  cliente: { nombre: string; apellido: string };
  horaInicio: string;
  detallesCita: {
    idservicio: number;
    servicio: { nombre: string; precio: number };
    estilista: { id: number; nombre: string };
  }[];
}

interface ModalCitasProps {
  citas: CitaConDetalles[];
  onCargarCita: (cita: CitaConDetalles) => void;
  onClose: () => void;
}

export default function ModalCitasPendientes({
  citas,
  onCargarCita,
  onClose,
}: ModalCitasProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-[#D8C3B3]">
        <div className="flex justify-between items-center border-b border-[#F5EBE1] pb-3 mb-4">
          <h2 className="text-lg font-serif font-bold text-[#32130E] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#572219]" />
            Citas Pendientes del Día
          </h2>
          <button onClick={onClose} className="text-[#7A5C55] font-bold">
            ✕
          </button>
        </div>

        {citas.length === 0 ? (
          <p className="text-xs text-[#7A5C55] text-center py-8">
            No hay citas pendientes agendadas para hoy.
          </p>
        ) : (
          <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
            {citas.map((cita) => {
              const totalCita = cita.detallesCita.reduce(
                (acc, d) => acc + Number(d.servicio.precio),
                0,
              );

              return (
                <div
                  key={cita.id}
                  className="p-4 border border-[#D8C3B3] rounded-xl bg-white hover:border-[#572219] transition-all flex justify-between items-center"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-3.5 h-3.5 text-[#572219]" />
                      <span className="text-xs font-bold text-[#572219]">
                        {cita.horaInicio} hrs
                      </span>
                      <span className="text-xs font-semibold text-[#32130E]">
                        - {cita.cliente.nombre} {cita.cliente.apellido}
                      </span>
                    </div>
                    <ul className="text-[11px] text-[#7A5C55] list-disc list-inside">
                      {cita.detallesCita.map((d, i) => (
                        <li key={i}>
                          {d.servicio.nombre} ($
                          {Number(d.servicio.precio).toFixed(2)})
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      onCargarCita(cita);
                      onClose();
                    }}
                    className="px-3 py-2 bg-[#572219] text-[#F5EBE1] rounded-xl text-xs font-bold hover:bg-[#32130E] flex items-center gap-1 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Cargar a Orden (${totalCita.toFixed(2)})
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
