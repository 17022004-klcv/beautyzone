"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, AlertTriangle, Info, X, Loader2 } from "lucide-react";

export type ToastVariante = "exito" | "error" | "info" | "carga";

export interface ToastItem {
  id: number;
  variante: ToastVariante;
  titulo: string;
  mensaje?: string;
}

interface ToastContextValue {
  push: (toast: Omit<ToastItem, "id">) => number;
  exito: (titulo: string, mensaje?: string) => number;
  error: (titulo: string, mensaje?: string) => number;
  info: (titulo: string, mensaje?: string) => number;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Colores del sistema de BeautyZone. No se usan verde ni azul: el éxito se
 * apoya en el marrón de marca (`--sys-color-primary-base`) y el error en el
 * rojo del propio sistema (`--sys-color-error`).
 */
const ESTILOS: Record<
  ToastVariante,
  { borde: string; fondo: string; icono: ReactNode }
> = {
  exito: {
    borde: "border-[#572219]",
    fondo: "bg-[#F5EBE1]",
    icono: <CheckCircle2 className="w-5 h-5 text-[#572219]" />,
  },
  error: {
    borde: "border-[#B83A3A]",
    fondo: "bg-[#FBF0F0]",
    icono: <AlertTriangle className="w-5 h-5 text-[#B83A3A]" />,
  },
  info: {
    borde: "border-[#9D4B4C]",
    fondo: "bg-[#F5EBE1]",
    icono: <Info className="w-5 h-5 text-[#9D4B4C]" />,
  },
  carga: {
    borde: "border-[#D8C3B3]",
    fondo: "bg-[#F5EBE1]",
    icono: <Loader2 className="w-5 h-5 animate-spin text-[#7A5C55]" />,
  },
};

const DURACION_MS = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const siguienteId = useRef(1);
  const temporizadores = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = temporizadores.current.get(id);
    if (timer) {
      clearTimeout(timer);
      temporizadores.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (toast: Omit<ToastItem, "id">) => {
      const id = siguienteId.current++;
      setToasts((prev) => [...prev, { ...toast, id }]);

      // Las variantes de error se quedan el doble: suelen traer texto técnico
      // que da tiempo a leer.
      const duracion = toast.variante === "error" ? DURACION_MS * 2 : DURACION_MS;
      temporizadores.current.set(
        id,
        setTimeout(() => dismiss(id), duracion),
      );

      return id;
    },
    [dismiss],
  );

  // El valor del contexto solo expone las acciones, nunca la lista. Así
  // `useToast()` devuelve siempre el mismo objeto y los `useEffect` que lo
  // dependan no se re-disparan cada vez que entra o sale una notificación.
  const valor = useMemo<ToastContextValue>(
    () => ({
      push,
      dismiss,
      exito: (titulo, mensaje) => push({ variante: "exito", titulo, mensaje }),
      error: (titulo, mensaje) => push({ variante: "error", titulo, mensaje }),
      info: (titulo, mensaje) => push({ variante: "info", titulo, mensaje }),
    }),
    [push, dismiss],
  );

  return (
    <ToastContext.Provider value={valor}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast debe usarse dentro de <ToastProvider>");
  }
  return ctx;
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 w-[calc(100vw-3rem)] max-w-sm pointer-events-none"
      role="region"
      aria-label="Notificaciones"
    >
      {toasts.map((toast) => {
        const estilo = ESTILOS[toast.variante];
        return (
          <div
            key={toast.id}
            role="status"
            aria-live="polite"
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border ${estilo.borde} ${estilo.fondo} shadow-[0_10px_30px_rgba(50,19,14,0.18)] backdrop-blur-xl animate__animated animate__fadeIn`}
          >
            <span className="shrink-0 mt-0.5">{estilo.icono}</span>

            <div className="flex-1 min-w-0 space-y-0.5">
              <p className="text-xs font-bold text-[#32130E] leading-snug">
                {toast.titulo}
              </p>
              {toast.mensaje && (
                <p className="text-[11px] font-medium text-[#7A5C55] leading-snug break-words">
                  {toast.mensaje}
                </p>
              )}
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              aria-label="Cerrar notificación"
              className="shrink-0 p-1 rounded-lg text-[#7A5C55] hover:text-[#32130E] hover:bg-white/60 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
