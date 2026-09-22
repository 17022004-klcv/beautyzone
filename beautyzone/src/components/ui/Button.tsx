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
    "inline-flex items-center justify-center font-bold rounded-2xl transition-all disabled:opacity-50 cursor-pointer active:scale-95 animate__animated animate__fadeIn";

  const variants = {
    primary:
      "bg-[#32130E] text-[#F5EBE1] hover:bg-[#572219] shadow-md hover:shadow-lg",
    secondary:
      "bg-[#9D4B4C] text-white hover:bg-[#7A3328] shadow-md hover:shadow-lg",
    outline:
      "border border-white/80 bg-white/60 text-[#32130E] hover:bg-white shadow-xs backdrop-blur-md",
    ghost: "text-[#32130E] hover:bg-white/60 backdrop-blur-xs",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4.5 py-2.5 text-xs",
    lg: "px-6 py-3 text-sm",
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
