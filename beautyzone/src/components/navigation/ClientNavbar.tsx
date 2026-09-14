"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/public/img/logo.jpg";
import { useRouter } from "next/navigation";
import {
  User,
  LogOut,
  LogIn,
  LayoutDashboard,
  Calendar,
  Scissors,
  Receipt,
  ShoppingCart,
  Settings,
} from "lucide-react";

interface UsuarioSesion {
  id: number;
  nombre: string;
  email: string;
  rol: "CLIENTE" | "ADMIN" | "ESTILISTA" | "RECEPCIONISTA";
}

export function ClientNavbar() {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);

  useEffect(() => {
    const sesionGuardada = localStorage.getItem("user");
    if (sesionGuardada) {
      try {
        setUsuario(JSON.parse(sesionGuardada));
      } catch (error) {
        console.error("Error al leer la sesión:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    localStorage.removeItem("user");
    localStorage.removeItem("user_role");
    setUsuario(null);
    router.push("/");
  };

  const getPanelLinkByRole = () => {
    if (!usuario) return "/";
    switch (usuario.rol) {
      case "ADMIN":
        return "/home";
      case "ESTILISTA":
        return "/estilista";
      case "RECEPCIONISTA":
        return "/recepcion";
      case "CLIENTE":
      default:
        return "/home";
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#EADBCF] backdrop-blur-md border-b border-[var(--sys-color-border)] px-8 py-3 flex items-center justify-between transition-all">
      {/* 1. LOGO CON IMAGEN */}
      <Link href="/" className="flex items-center gap-2">
        {/* Cambia '/logo.png' por la ruta de tu imagen de logo */}
        <div className="relative w-10 h-10 overflow-hidden rounded-full border border-stone-200">
          <Image
            src={Logo}
            alt="B-Zone Logo"
            fill
            className="object-cover"
            priority
          />
        </div>
        <span className="font-serif text-xl font-bold text-[var(--sys-color-primary-base)] hidden sm:inline">
          BEAUTY-ZONE
        </span>
      </Link>

      {/* 2. ENLACES DE NAVEGACIÓN PRINCIPAL (CENTRO) */}
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-700">
        <Link
          href="/"
          className="hover:text-[var(--sys-color-primary-base)] transition-colors"
        >
          Inicio
        </Link>
        <Link
          href="/reservas"
          className="hover:text-[var(--sys-color-primary-base)] transition-colors"
        >
          Agenda
        </Link>
        <Link
          href="/servicios"
          className="hover:text-[var(--sys-color-primary-base)] transition-colors"
        >
          Servicios
        </Link>
        <Link
          href="/productos"
          className="hover:text-[var(--sys-color-primary-base)] transition-colors"
        >
          Productos
        </Link>
      </div>

      {/* 3. ACCIONES DE LA DERECHA (CARRITO + PERFIL) */}
      <div className="flex items-center gap-4">
        {/* ICONO DE CARRITO DE COMPRAS */}
        <Link
          href="/carrito"
          className="p-2 text-stone-700 hover:text-[var(--sys-color-primary-base)] hover:bg-stone-100 rounded-full transition-colors relative"
          title="Carrito"
        >
          <ShoppingCart className="w-5 h-5" />
          {/* Badge de cantidad (opcional) */}
          <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
        </Link>

        {/* MENÚ DE PERFIL Y DROPDOWN */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-full hover:bg-stone-100 transition-colors border border-stone-200"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--sys-color-primary-base)] text-white flex items-center justify-center font-bold text-xs">
              {usuario ? (
                usuario.nombre.charAt(0).toUpperCase()
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
            {usuario && (
              <span className="text-xs font-semibold text-stone-700 hidden lg:inline pr-1">
                {usuario.nombre}
              </span>
            )}
          </button>

          {/* MENÚ DESPLEGABLE */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-fadeIn">
              {usuario ? (
                <>
                  <div className="px-4 py-2 border-b border-stone-100">
                    <p className="text-xs font-bold text-stone-800">
                      {usuario.nombre}
                    </p>
                    <p className="text-[10px] text-[var(--sys-color-primary-accent)] font-semibold uppercase">
                      {usuario.rol}
                    </p>
                  </div>

                  {/* Panel según el Rol */}
                  <Link
                    href={getPanelLinkByRole()}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                  >
                    {usuario.rol === "ADMIN" && (
                      <LayoutDashboard className="w-4 h-4 text-stone-500" />
                    )}
                    {usuario.rol === "ESTILISTA" && (
                      <Scissors className="w-4 h-4 text-stone-500" />
                    )}
                    {usuario.rol === "RECEPCIONISTA" && (
                      <Receipt className="w-4 h-4 text-stone-500" />
                    )}
                    {usuario.rol === "CLIENTE" && (
                      <Calendar className="w-4 h-4 text-stone-500" />
                    )}

                    <span>
                      {usuario.rol === "CLIENTE"
                        ? "Mis Citas & Reservas"
                        : `Panel de ${usuario.rol}`}
                    </span>
                  </Link>

                  {/* Opción de Configuración */}
                  <Link
                    href="/configuracion"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-stone-500" />
                    <span>Configuración</span>
                  </Link>

                  <div className="border-t border-stone-100 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </>
              ) : (
                /* CASO INVITADO */
                <Link
                  href="/login"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-[var(--sys-color-primary-base)] hover:bg-stone-50 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Iniciar Sesión</span>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default ClientNavbar;
