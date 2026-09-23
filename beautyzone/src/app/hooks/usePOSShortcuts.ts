"use client";
import { useEffect } from "react";

interface POSShortcuts {
  onBuscar?: () => void;
  onCliente?: () => void;
  onCitas?: () => void;
  onFacturar?: () => void;
  onVaciar?: () => void;
  onCierre?: () => void;
}

export function usePOSShortcuts({
  onBuscar,
  onCliente,
  onCitas,
  onFacturar,
  onVaciar,
  onCierre,
}: POSShortcuts) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "F1":
          e.preventDefault();
          onBuscar?.();
          break;
        case "F2":
          e.preventDefault();
          onCliente?.();
          break;
        case "F3":
          e.preventDefault();
          onCitas?.();
          break;
        case "F4":
          e.preventDefault();
          onFacturar?.();
          break;
        case "F8":
          e.preventDefault(); // Previene la pausa de depuración del navegador
          onVaciar?.();
          break;
        case "F12":
          e.preventDefault();
          onCierre?.();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onBuscar, onCliente, onCitas, onFacturar, onVaciar, onCierre]);
}
