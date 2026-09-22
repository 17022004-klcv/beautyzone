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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#32130E]/20 backdrop-blur-md p-4 animate-in fade-in duration-200 animate__animated animate__fadeIn">
      <div
        className={`bg-white/80 backdrop-blur-2xl border border-white rounded-3xl w-full ${maxWidthClasses[maxWidth]} p-6 shadow-[0_16px_40px_rgba(50,19,14,0.12)] space-y-4`}
      >
        <div className="flex items-start justify-between border-b border-[#32130E]/10 pb-3.5">
          <div>
            <h2 className="font-serif font-bold text-xl text-[#32130E]">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs font-medium text-[#7A5C55] mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white rounded-xl text-[#7A5C55] hover:text-[#32130E] transition-all border border-transparent hover:border-white shadow-2xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
}
