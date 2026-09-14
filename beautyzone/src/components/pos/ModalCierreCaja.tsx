"use client";
import { useState } from "react";
import { CajaService } from "@/src/app/services/caja.service";
import Button from "@/src/components/ui/Button";
import { Lock, AlertCircle, CheckCircle2 } from "lucide-react";

interface ModalCierreProps {
  idcajaTurno: number;
  montoApertura: number;
  montoEsperado: number; // Fondo apertura + ventas registradas
  onClose: () => void;
  onCierreExitoso: () => void;
}

export default function ModalCierreCaja({
  idcajaTurno,
  montoApertura,
  montoEsperado,
  onClose,
  onCierreExitoso,
}: ModalCierreProps) {
  const [passwordPin, setPasswordPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCerrarTurno = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordPin.trim()) {
      setError("Debes ingresar la contraseña de caja para confirmar.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Enviamos el cierre directo con el total registrado por el sistema
      await CajaService.cerrarCaja({
        idcajaTurno,
        montoCierreReal: montoEsperado,
        passwordPin,
        denominaciones: {
          b100: 0,
          b50: 0,
          b20: 0,
          b10: 0,
          b5: 0,
          b1: 0,
          m100: 0,
          m025: 0,
          m010: 0,
          m005: 0,
          m001: 0,
          totalTarjeta: 0,
          totalTransferencia: 0,
        },
      });

      onCierreExitoso();
    } catch (err: any) {
      setError(err.message || "Contraseña incorrecta o error al cerrar caja.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-[#D8C3B3]">
        <div className="flex justify-between items-center border-b border-[#F5EBE1] pb-3 mb-4">
          <h2 className="text-lg font-serif font-bold text-[#32130E] flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#572219]" />
            Cierre de Caja (Turno)
          </h2>
          <button
            onClick={onClose}
            className="text-[#7A5C55] hover:text-[#32130E] font-bold text-lg"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Resumen de Montos */}
        <div className="space-y-3 bg-[#F5EBE1]/50 p-4 rounded-xl border border-[#D8C3B3] mb-5">
          <div className="flex justify-between items-center text-sm">
            <span className="text-[#7A5C55]">Monto de Apertura:</span>
            <span className="font-mono font-bold text-[#32130E]">
              ${montoApertura.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm border-t border-[#D8C3B3] pt-2">
            <span className="text-[#572219] font-semibold">
              Total Registrado en Sistema:
            </span>
            <span className="font-mono font-bold text-lg text-[#572219]">
              ${montoEsperado.toFixed(2)}
            </span>
          </div>
        </div>

        <form onSubmit={handleCerrarTurno} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#572219] mb-1">
              Contraseña / PIN de Caja *
            </label>
            <input
              type="password"
              required
              value={passwordPin}
              onChange={(e) => setPasswordPin(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm bg-white border border-[#D8C3B3] rounded-xl text-[#32130E] focus:outline-none focus:ring-2 focus:ring-[#9D4B4C]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-red-700 hover:bg-red-800 text-white text-xs px-5"
            >
              {loading ? "Cerrando..." : "Confirmar y Cerrar Turno"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
