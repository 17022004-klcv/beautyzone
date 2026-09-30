"use client";

import { useEffect, useState } from "react";
import type { OpcionesAgenda } from "@/src/app/types/agenda";

const VACIO: OpcionesAgenda = { clientes: [], servicios: [], estilistas: [] };

/**
 * Carga `/api/agenda/opciones`, que ya devuelve separados solo clientes
 * (rol "Cliente") y solo estilistas (rol "Estilista").
 */
export function useOpcionesAgenda() {
  const [opciones, setOpciones] = useState<OpcionesAgenda>(VACIO);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;

    async function cargar() {
      try {
        const res = await fetch("/api/agenda/opciones", { cache: "no-store" });
        if (!res.ok) throw new Error("No se pudieron cargar las opciones");
        const data = (await res.json()) as OpcionesAgenda;
        if (vigente) setOpciones({ ...VACIO, ...data });
      } catch (e) {
        if (vigente) {
          setError(
            e instanceof Error
              ? e.message
              : "No se pudieron cargar las opciones",
          );
        }
      } finally {
        if (vigente) setLoading(false);
      }
    }

    cargar();
    return () => {
      vigente = false;
    };
  }, []);

  return { opciones, loading, error };
}
