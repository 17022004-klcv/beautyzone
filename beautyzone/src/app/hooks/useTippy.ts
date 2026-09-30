import { useEffect } from "react";

interface TippyInstance {
  destroy(): void;
}

interface TippyContent {
  content?: string | ((referencia: Element) => string);
  placement?: string;
  animation?: string | boolean;
  duration?: number | [number, number];
  delay?: number | [number | null, number | null];
  arrow?: boolean | string;
  theme?: string;
  allowHTML?: boolean;
  interactive?: boolean;
}

type TippyFactory = (
  objetivos: Element | Element[],
  opciones?: TippyContent,
) => TippyInstance[];

declare global {
  interface Window {
    tippy?: TippyFactory;
  }
}

const SELECTOR = "[data-tippy-content]";
const INTERVALO_CARGA_MS = 100;
const INTENTOS_MAXIMOS = 50;

export function useTippy() {
  useEffect(() => {
    const instancias: TippyInstance[] = [];
    const yaInicializados = new WeakSet<Element>();
    let cargaResuelta = false;

    const inicializar = () => {
      if (typeof window === "undefined" || typeof window.tippy !== "function") {
        return;
      }

      const nuevos = Array.from(
        document.querySelectorAll<Element>(SELECTOR),
      ).filter((el) => !yaInicializados.has(el));

      if (nuevos.length === 0) return;

      instancias.push(
        ...window.tippy(nuevos, {
          content: (referencia) =>
            referencia.getAttribute("data-tippy-content") ?? "",
          placement: "top",
          animation: "shift-away",
          duration: [150, 100],
          delay: [200, 0],
          arrow: true,
          theme: "beautyzone",
          allowHTML: false,
        }),
      );

      nuevos.forEach((el) => yaInicializados.add(el));
    };

    const esperarCdn = () => {
      let intentos = 0;

      const temporizador = window.setInterval(() => {
        if (typeof window.tippy === "function") {
          window.clearInterval(temporizador);
          cargaResuelta = true;
          inicializar();
          return;
        }

        intentos += 1;
        if (intentos >= INTENTOS_MAXIMOS) {
          window.clearInterval(temporizador);
        }
      }, INTERVALO_CARGA_MS);
    };

    inicializar();
    if (!cargaResuelta) esperarCdn();

    const observer = new MutationObserver(inicializar);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      instancias.forEach((instancia) => instancia.destroy());
    };
  }, []);
}
