"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, KeyRound, Loader2, ShieldAlert } from "lucide-react";
import Modal from "@/src/components/ui/Modal";
import Button from "@/src/components/ui/Button";
import { verificarPasswordAdmin } from "@/src/app/services/adminPassword.service";

interface ModalPasswordAdminProps {
  abierto: boolean;
  titulo: string;
  descripcion: string;
  /** Se llama con la contraseña ya validada por el servidor. */
  onAutorizado: (password: string) => void | Promise<void>;
  onCerrar: () => void;
}

/**
 * Puerta de autorización para editar un arqueo o guardar el cierre
 * administrativo. Valida contra el servidor y solo entrega la contraseña si
 * coincide, para que el resto de la interfaz solo reciba el OK.
 */
export default function ModalPasswordAdmin({
  abierto,
  titulo,
  descripcion,
  onAutorizado,
  onCerrar,
}: ModalPasswordAdminProps) {
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificando, setVerificando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [abiertoAnterior, setAbiertoAnterior] = useState(abierto);

  // Al abrir el diálogo se limpia lo que quedó del intento anterior.
  if (abierto !== abiertoAnterior) {
    setAbiertoAnterior(abierto);
    if (abierto) {
      setPassword("");
      setVisible(false);
      setError(null);
    }
  }

  useEffect(() => {
    if (!abierto) return;
    // El foco entra al dialogo para poder escribir de una.
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [abierto]);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      setError("Escribe la contraseña de administrador.");
      return;
    }

    setVerificando(true);
    setError(null);

    try {
      await verificarPasswordAdmin(password);
      await onAutorizado(password);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo verificar la contraseña.",
      );
      setPassword("");
      inputRef.current?.focus();
    } finally {
      setVerificando(false);
    }
  };

  return (
    <Modal isOpen={abierto} onClose={onCerrar} title={titulo} maxWidth="sm">
      <form onSubmit={enviar} className="space-y-4">
        <div className="flex items-start gap-3 rounded-2xl border border-[#EADBCF] bg-[#F6F2EF] p-3.5">
          <ShieldAlert className="mt-0.5 w-4 h-4 shrink-0 text-[#7A5C55]" />
          <p className="text-xs leading-relaxed font-medium text-[#7A5C55]">
            {descripcion}
          </p>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="password-admin"
            className="text-[10px] font-bold tracking-wider text-[#7A5C55] uppercase"
          >
            Contraseña de administrador
          </label>

          <div className="relative">
            <KeyRound className="pointer-events-none absolute top-1/2 left-3.5 w-4 h-4 -translate-y-1/2 text-[#D8C3B3]" />
            <input
              id="password-admin"
              ref={inputRef}
              type={visible ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={verificando}
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full rounded-2xl border border-[#EADBCF] bg-white/70 py-3 pr-11 pl-10 text-sm text-[#32130E] outline-none transition placeholder:text-[#D8C3B3] focus:border-[#9D4B4C] focus:ring-2 focus:ring-[#9D4B4C]/15 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              disabled={verificando}
              aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-lg p-1 text-[#D8C3B3] transition hover:text-[#7A5C55] disabled:opacity-40"
            >
              {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && (
          <p className="rounded-xl border border-[#E8B4B4] bg-[#F8E9E9] px-3 py-2 text-xs font-semibold text-[#B83A3A]">
            {error}
          </p>
        )}

        <div className="flex gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={onCerrar}
            disabled={verificando}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={verificando} className="flex-1">
            {verificando ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Verificando
              </>
            ) : (
              "Autorizar"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
