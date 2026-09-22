"use client";

import Link from "next/link";
import Image from "next/image";
import Logo from "@/public/img/logo.jpg";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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

const menuSections = [
  {
    title: "Principal",
    items: [
      {
        name: "Inicio",
        href: "/home",
        icon: Home,
      },
    ],
  },
  {
    title: "Operaciones",
    items: [
      {
        name: "Agenda",
        href: "/schedule-admin",
        icon: Calendar,
      },
      {
        name: "POS",
        href: "/pos-admin",
        icon: CreditCard,
      },
      {
        name: "Arqueos de Cajas",
        href: "/arqueo",
        icon: CreditCard,
      },
    ],
  },
  {
    title: "Catálogo",
    items: [
      {
        name: "Productos",
        href: "/products-admin",
        icon: Package,
      },
      {
        name: "Servicios",
        href: "/services-admin",
        icon: Scissors,
      },
    ],
  },
  {
    title: "Gestión",
    items: [
      {
        name: "Usuarios",
        href: "/users",
        icon: Users,
      },
      {
        name: "Asistencias",
        href: "/attendance",
        icon: Clock,
      },
    ],
  },
  {
    title: "Externo",
    items: [
      {
        name: "Sitio Web",
        href: "/",
        icon: Globe,
      },
    ],
  },
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
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showLabels, setShowLabels] = useState(!isCollapsed);

  useEffect(() => {
    if (!isCollapsed) {
      setShowLabels(true);
      return;
    }

    const timer = setTimeout(() => {
      setShowLabels(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [isCollapsed]);

  const handleToggle = () => {
    setHasInteracted(true);
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside
      className={`h-screen fixed left-0 top-0 z-40 flex flex-col overflow-hidden text-[#32130E] bg-white/45 backdrop-blur-2xl border-r border-white/80 shadow-[8px_0_32px_rgba(50,19,14,0.06)] transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div
        className={`relative flex items-center py-3 px-2 mb-2 border-b border-[#32130E]/10 transition-all duration-300 ${
          isCollapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!isCollapsed && (
          <div
            className={`flex items-center gap-3 min-w-0 overflow-hidden ${
              hasInteracted ? "animate__animated animate__backInLeft" : ""
            }`}
          >
            <Link
              href="/"
              className="flex-shrink-0 transition-transform duration-300 hover:scale-105"
            >
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

            <div className="whitespace-nowrap overflow-hidden">
              <h2 className="font-serif text-base font-bold tracking-wide text-[#32130E]">
                BeautyZone
              </h2>
              <span className="block text-[9px] text-[#7A5C55] font-bold tracking-widest uppercase">
                Admin Panel
              </span>
            </div>
          </div>
        )}

        <button
          onClick={handleToggle}
          className="flex-shrink-0 flex items-center justify-center p-2 text-[#32130E] hover:bg-white/70 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
          title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-5 h-5 text-[#32130E] animate__animated animate__fadeIn" />
          ) : (
            <PanelLeftClose className="w-5 h-5 text-[#32130E] animate__animated animate__fadeIn" />
          )}
        </button>
      </div>

      <div
        data-simplebar
        data-simplebar-auto-hide="true"
        className="flex-1 min-h-0 px-2"
      >
        <nav className="space-y-5 py-2">
          {menuSections.map((section) => (
            <div key={section.title}>
              {!isCollapsed && showLabels && (
                <div
                  className={`px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#A0847B] ${
                    hasInteracted
                      ? `animate__animated ${
                          isCollapsed
                            ? "animate__backOutLeft"
                            : "animate__backInLeft"
                        }`
                      : ""
                  }`}
                >
                  {section.title}
                </div>
              )}

              <div className="space-y-1.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      title={isCollapsed ? item.name : undefined}
                      className={`relative flex items-center min-h-[42px] rounded-2xl text-sm font-medium transition-all duration-200 overflow-hidden ${
                        isCollapsed ? "justify-center px-0" : "gap-3 px-3.5"
                      } ${
                        isActive
                          ? "bg-white/90 text-[#32130E] font-bold shadow-md border border-white scale-[1.01]"
                          : "text-[#6E554F] hover:text-[#32130E] hover:bg-white/50 hover:translate-x-[2px]"
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-1 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-[#32130E] rounded-full animate__animated animate__fadeIn" />
                      )}

                      <span
                        className={`flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                          isCollapsed ? "scale-105" : "scale-100"
                        } ${isActive ? "text-[#32130E]" : "text-[#8C7167]"}`}
                      >
                        <Icon
                          className={`w-4 h-4 flex-shrink-0 transition-all duration-300 ${
                            isActive ? "stroke-[2.2]" : "stroke-[1.8]"
                          } ${isCollapsed ? "hover:scale-110" : ""}`}
                        />
                      </span>

                      {showLabels && (
                        <span
                          className={`truncate whitespace-nowrap ${
                            hasInteracted
                              ? `animate__animated ${
                                  isCollapsed
                                    ? "animate__backOutLeft"
                                    : "animate__backInLeft"
                                }`
                              : ""
                          }`}
                        >
                          {item.name}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div
        className={`flex items-center pt-3 px-2 pb-3 border-t border-[#32130E]/10 ${
          isCollapsed ? "flex-col gap-2" : "justify-between"
        }`}
      >
        <Link
          href="/profile-admin"
          title={isCollapsed ? "Mi Perfil" : undefined}
          className={`flex items-center gap-2.5 min-w-0 transition-all duration-200 hover:opacity-80 ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <div className="w-8 h-8 rounded-xl bg-[#32130E] text-[#F5EBE1] shadow-md border border-white/20 flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-105">
            <User className="w-4 h-4" />
          </div>

          {!isCollapsed && (
            <div
              className={`text-left truncate ${
                hasInteracted ? "animate__animated animate__backInLeft" : ""
              }`}
            >
              <p className="text-xs font-bold text-[#32130E] truncate">
                Mi Perfil
              </p>
            </div>
          )}
        </Link>

        <Link
          href="/dashboard/configuracion"
          title="Configuración"
          className="flex items-center justify-center p-2 text-[#7A5C55] hover:text-[#32130E] hover:bg-white/60 rounded-xl transition-all duration-200 hover:rotate-12"
        >
          <Settings className="w-4 h-4" />
        </Link>
      </div>
    </aside>
  );
}
