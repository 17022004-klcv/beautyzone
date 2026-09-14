"use client";
import { useState } from "react";
import { CajaService } from "@/src/app/services/caja.service";

interface ModalAperturaProps {
  idcajero: number;
  onAperturaExitosa: () => void;
}

export default function ModalAperturaCaja({
  idcajero,
  onAperturaExitosa,
}: ModalAperturaProps) {
  const [nombreCaja, setNombreCaja] = useState("Caja Principal");
  const [passwordPin, setPasswordPin] = useState("");
  const [montoApertura, setMontoApertura] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const montoNum = parseFloat(montoApertura);

    if (!passwordPin.trim()) {
      setError("La contraseña/PIN es obligatoria");
      return;
    }

    if (isNaN(montoNum) || montoNum <= 0) {
      setError("El monto de apertura debe ser un valor numérico mayor a 0");
      return;
    }

    try {
      setLoading(true);
      await CajaService.abrirCaja({
        idcajero,
        nombreCaja,
        passwordPin,
        montoApertura: montoNum,
      });
      onAperturaExitosa();
    } catch (err: any) {
      setError(err.message || "Error al abrir la caja");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-100">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Apertura de Caja</h2>
          <p className="text-sm text-gray-500 mt-1">
            Ingresa los datos para iniciar tu turno de ventas
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Nombre o Identificador de Caja
            </label>
            <input
              type="text"
              value={nombreCaja}
              onChange={(e) => setNombreCaja(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none"
              placeholder="Ej: Caja Principal, Caja 1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Contraseña / PIN de Caja
            </label>
            <input
              type="password"
              value={passwordPin}
              onChange={(e) => setPasswordPin(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none"
              placeholder="****"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Monto de Apertura ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={montoApertura}
              onChange={(e) => setMontoApertura(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none font-mono text-lg"
              placeholder="0.00"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? "Abriendo caja..." : "Abrir Turno de Caja"}
          </button>
        </form>
      </div>
    </div>
  );
}
