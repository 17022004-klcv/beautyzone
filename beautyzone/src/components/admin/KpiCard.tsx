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
    <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#D8C3B3] shadow-sm flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-xs font-semibold text-[#7A5C55] uppercase tracking-wider">
          {title}
        </p>
        <p className="font-serif text-2xl font-bold text-[#32130E]">{value}</p>
        {change && (
          <p
            className={`text-xs font-medium ${isPositive ? "text-[#2E6F40]" : "text-[#B83A3A]"}`}
          >
            {change}
          </p>
        )}
      </div>
      <div className="w-12 h-12 rounded-xl bg-[#F5EBE1] text-[#572219] flex items-center justify-center">
        {icon}
      </div>
    </div>
  );
}
