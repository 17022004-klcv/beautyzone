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
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-sm bg-[#FFFFFF] border border-[#D8C3B3] rounded-xl text-[#32130E] focus:outline-none focus:ring-2 focus:ring-[#9D4B4C]"
      >
        <span
          className={
            selectedLabel ? "text-[#32130E] font-medium" : "text-[#7A5C55]"
          }
        >
          {selectedLabel || placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-[#7A5C55]" />
      </button>

      {isOpen && (
        <div className="absolute z-30 w-full mt-1 bg-[#FFFFFF] border border-[#D8C3B3] rounded-xl shadow-lg p-2 space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7A5C55]" />
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F5EBE1] border border-[#D8C3B3] text-[#32130E] rounded-lg focus:outline-none placeholder-[#7A5C55]"
            />
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {filteredOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setSelectedLabel(opt.label);
                  onSelect(opt.value);
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-[#32130E] hover:bg-[#F5EBE1] rounded-md transition-colors"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
