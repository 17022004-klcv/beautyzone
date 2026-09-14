"use client";

import { LucideIcon } from "lucide-react";

interface POSActionButtonProps {
  shortcut: string; // ej. "F1", "F2"
  label: string; // ej. "Buscar", "Cierre"
  icon: LucideIcon;
  onClick: () => void;
  variant?: "primary" | "danger" | "default";
}

export default function POSActionButton({
  shortcut,
  label,
  icon: Icon,
  onClick,
  variant = "default",
}: POSActionButtonProps) {
  const variantStyles = {
    default: "bg-white border-[#D8C3B3] text-[#32130E] hover:bg-[#F5EBE1]/60",
    primary: "bg-[#572219] border-[#32130E] text-[#F5EBE1] hover:bg-[#32130E]",
    danger: "bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100",
  };

  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center justify-center p-3 rounded-2xl border shadow-sm transition-all active:scale-95 ${variantStyles[variant]}`}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-wide">
          {label}
        </span>
      </div>
      <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-[#F5EBE1] text-[#572219] border border-[#D8C3B3]">
        [{shortcut}]
      </span>
    </button>
  );
}
