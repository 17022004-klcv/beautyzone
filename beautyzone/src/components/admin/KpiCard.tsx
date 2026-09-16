import { ReactNode } from "react";

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: ReactNode;
}

export default function KpiCard({
  title,
  value,
  change,
  isPositive,
  icon,
}: KpiCardProps) {
  return (
    <div className="bg-white/50 backdrop-blur-xl p-5 rounded-3xl border border-white/90 shadow-[0_8px_30px_rgba(50,19,14,0.05)] flex items-center justify-between transition-all duration-300 hover:bg-white/70 hover:shadow-[0_12px_40px_rgba(50,19,14,0.08)] hover:-translate-y-1">
      <div className="space-y-1">
        <p className="text-[11px] font-bold text-[#7A5C55] uppercase tracking-wider">
          {title}
        </p>
        <p className="font-serif text-3xl font-extrabold text-[#32130E] tracking-tight">
          {value}
        </p>
        {change && (
          <p
            className={`text-xs font-bold ${
              isPositive ? "text-[#2E6F40]" : "text-[#B83A3A]"
            }`}
          >
            {change}
          </p>
        )}
      </div>
      <div className="w-12 h-12 rounded-2xl bg-[#32130E] text-[#F5EBE1] shadow-lg flex items-center justify-center">
        {icon}
      </div>
    </div>
  );
}
