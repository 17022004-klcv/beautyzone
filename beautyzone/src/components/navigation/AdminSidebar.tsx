"use client";

import Link from "next/link";
import Image from "next/image";
import Logo from "@/public/img/logo.jpg";
import { usePathname } from "next/navigation";
import {
  Home,
  Calendar,
  CreditCard,
  Package,
  Scissors,
  Users,
  Clock,
  Globe,
  Settings,
  User,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const menuItems = [
  { name: "Inicio", href: "/home", icon: Home },
  { name: "Agenda", href: "/schedule-admin", icon: Calendar },
  { name: "POS", href: "/pos-admin", icon: CreditCard },
  { name: "Arqueos de Cajas", href: "/arqueo", icon: CreditCard },
  { name: "Productos", href: "/products-admin", icon: Package },
  { name: "Servicios", href: "/services-admin", icon: Scissors },
  { name: "Usuarios", href: "/users", icon: Users },
  { name: "Asistencias", href: "/attendance", icon: Clock },
  { name: "Sitio Web", href: "/", icon: Globe },
];

interface AdminSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export function AdminSidebar({
  isCollapsed,
  setIsCollapsed,
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`h-screen text-[#32130E] flex flex-col justify-between p-3 fixed left-0 top-0 z-40 transition-all duration-300 bg-white/45 backdrop-blur-2xl border-r border-white/80 shadow-[8px_0_32px_rgba(50,19,14,0.06)] overflow-hidden ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div>
        {/* LOGO SUPERIOR */}
        <div
          className={`flex items-center py-3 mb-4 border-b border-[#32130E]/10 ${
            isCollapsed ? "justify-center" : "justify-between px-2"
          }`}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-3 overflow-hidden">
              <Link href="/" className="flex-shrink-0">
                <div className="relative w-9 h-9 overflow-hidden rounded-xl border border-white shadow-md">
                  <Image
                    src={Logo}
                    alt="B-Zone Logo"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </Link>
              <div className="whitespace-nowrap transition-all duration-300">
                <h2 className="font-serif text-base font-bold tracking-wide text-[#32130E]">
                  BeautyZone
                </h2>
                <span className="text-[9px] text-[#7A5C55] font-bold tracking-widest uppercase block">
                  Admin Panel
                </span>
              </div>
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 text-[#7A5C55] hover:text-[#32130E] hover:bg-white/60 rounded-xl transition-all flex-shrink-0"
            title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-5 h-5 text-[#32130E]" />
            ) : (
              <PanelLeftClose className="w-5 h-5 text-[#32130E]" />
            )}
          </button>
        </div>

        {/* NAVEGACIÓN PRINCIPAL */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                  isActive
                    ? "bg-white/90 text-[#32130E] font-bold shadow-md border border-white"
                    : "text-[#6E554F] hover:text-[#32130E] hover:bg-white/50"
                } ${isCollapsed ? "justify-center px-0" : ""}`}
              >
                {/* LÍNEA INDICADORA FINITA Y DELICADA */}
                {isActive && (
                  <span className="absolute left-1 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-[#32130E] rounded-full" />
                )}
                <Icon
                  className={`w-4 h-4 flex-shrink-0 transition-colors ${
                    isActive ? "text-[#32130E]" : "text-[#8C7167]"
                  }`}
                />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* FOOTER */}
      <div
        className={`pt-3 border-t border-[#32130E]/10 flex items-center justify-between ${
          isCollapsed ? "flex-col gap-2" : "px-2"
        }`}
      >
        <Link
          href="/profile-admin"
          title={isCollapsed ? "Mi Perfil" : undefined}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-xl bg-[#32130E] text-[#F5EBE1] shadow-md border border-white/20 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4" />
          </div>
          {!isCollapsed && (
            <div className="text-left truncate">
              <p className="text-xs font-bold text-[#32130E] truncate">
                Mi Perfil
              </p>
            </div>
          )}
        </Link>

        <Link
          href="/dashboard/configuracion"
          className="p-2 text-[#7A5C55] hover:text-[#32130E] hover:bg-white/60 rounded-xl transition-all"
          title="Configuración"
        >
          <Settings className="w-4 h-4" />
        </Link>
      </div>
    </aside>
  );
}
