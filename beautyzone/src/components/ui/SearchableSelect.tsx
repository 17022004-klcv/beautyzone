"use client";

import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";

interface Option {
  label: string;
  value: string;
}

interface SearchableSelectProps {
  options: Option[];
  placeholder?: string;
  onSelect: (value: string) => void;
}

export default function SearchableSelect({
  options,
  placeholder = "Seleccionar...",
  onSelect,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className={`relative w-full ${isOpen ? "z-50" : "z-10"}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs bg-white/50 border border-white/90 rounded-2xl text-[#32130E] focus:outline-none focus:bg-white/80 transition-all shadow-2xs font-semibold cursor-pointer"
      >
        <span
          className={
            selectedLabel ? "text-[#32130E] font-bold" : "text-[#7A5C55]"
          }
        >
          {selectedLabel || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-[#7A5C55] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1.5 bg-white/95 backdrop-blur-2xl border border-white rounded-2xl shadow-[0_12px_30px_rgba(50,19,14,0.15)] p-2 space-y-2">
          {/* Buscador interno */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7A5C55]" />
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white/60 border border-white/80 text-[#32130E] rounded-xl focus:outline-none placeholder-[#7A5C55]"
            />
          </div>

          {/* CONTENEDOR CON SIMPLEBAR VIA CDN */}
          <div
            data-simplebar
            style={{ maxHeight: "160px" }}
            className="space-y-0.5 pr-1"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setSelectedLabel(opt.label);
                    onSelect(opt.value);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs font-semibold text-[#32130E] hover:bg-[#32130E]/5 rounded-xl transition-colors cursor-pointer"
                >
                  {opt.label}
                </button>
              ))
            ) : (
              <p className="p-2 text-[11px] text-[#7A5C55] font-medium text-center">
                Sin resultados
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
