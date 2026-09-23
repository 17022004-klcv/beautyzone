"use client";
import { useState } from "react";

interface ModalAperturaProps {
  isOpen: boolean;
  onAperturaExitosa: (cajaData?: any) => void;
}

export default function ModalAperturaCaja({
  isOpen,
  onAperturaExitosa,
}: ModalAperturaProps) {
  const [nombreCaja, setNombreCaja] = useState("Caja Principal");
  const [passwordPin, setPasswordPin] = useState("");
  const [montoApertura, setMontoApertura] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const montoNum = parseFloat(montoApertura);

    if (!passwordPin.trim()) {
      setError("El PIN de seguridad es obligatorio");
      return;
    }

    if (isNaN(montoNum) || montoNum <= 0) {
      setError("El monto de apertura debe ser mayor a 0");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/caja", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombreCaja,
          passwordPin,
          montoApertura: montoNum,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al abrir la caja");
      }

      onAperturaExitosa(data.caja);
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
            Ingresa tu PIN de seguridad para iniciar tu turno
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
              Nombre de la Caja
            </label>
            <input
              type="text"
              value={nombreCaja}
              onChange={(e) => setNombreCaja(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none text-sm"
              placeholder="Ej: Caja Principal"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              PIN Personal de Recepcionista
            </label>
            <input
              type="password"
              maxLength={6}
              value={passwordPin}
              onChange={(e) => setPasswordPin(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none font-mono tracking-widest text-lg"
              placeholder="••••"
              autoFocus
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
            {loading ? "Verificando..." : "Abrir Turno de Caja"}
          </button>
        </form>
      </div>
    </div>
  );
}
