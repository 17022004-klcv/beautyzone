import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Buscar...",
}: SearchBarProps) {
  return (
    <div className="relative w-full md:w-72">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A5C55]" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2 text-xs bg-white/50 border border-white/90 rounded-2xl text-[#32130E] placeholder-[#7A5C55] focus:outline-none focus:bg-white/80 transition-all shadow-2xs font-medium"
      />
    </div>
  );
}
