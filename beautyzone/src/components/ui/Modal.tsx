"use client";

import { X } from "lucide-react";
import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "md",
}: ModalProps) {
  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        className={`bg-[#FFFFFF] border border-[#D8C3B3] rounded-2xl w-full ${maxWidthClasses[maxWidth]} p-6 shadow-xl space-y-4 animate-in fade-in duration-200`}
      >
        {/* CABECERA REUTILIZABLE */}
        <div className="flex items-start justify-between border-b border-[#D8C3B3] pb-3">
          <div>
            <h2 className="font-serif font-bold text-xl text-[#32130E]">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-[#7A5C55] mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#F5EBE1] rounded-lg text-[#7A5C55] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENIDO (FORMULARIO O LO QUE PASEO POR PROPS) */}
        <div>{children}</div>
      </div>
    </div>
  );
}
