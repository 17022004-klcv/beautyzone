import { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-medium rounded-xl transition-all disabled:opacity-50 cursor-pointer";

  const variants = {
    // Terracota / Café Profundo (#572219)
    primary: "bg-[#572219] text-white hover:bg-[#421A13] shadow-sm",
    // Rosa Terracota (#9D4B4C)
    secondary: "bg-[#9D4B4C] text-white hover:bg-[#7A3328] shadow-sm",
    // Borde Neutro (#D8C3B3) + Texto Principal (#32130E)
    outline:
      "border border-[#D8C3B3] text-[#32130E] bg-[#FFFFFF] hover:bg-[#F5EBE1]",
    // Ghost sobre hover crema
    ghost: "text-[#32130E] hover:bg-[#F5EBE1]",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
