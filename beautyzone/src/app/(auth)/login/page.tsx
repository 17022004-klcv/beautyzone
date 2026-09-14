"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // <-- IMPORTADO PARA REDIRECCIONAR
import { handleLogin } from "@/src/app/handlers/auth.handler";
import { Scissors, Sparkles, Heart, Crown, Palette, Eye } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // <-- INSTANCIA DE ROUTER

  async function onSubmit(formData: FormData) {
    setError(null);
    const result = await handleLogin(formData);

    if (result?.error) {
      setError(result.error);
      return;
    }

    if (result?.user) {
      // Guardar sesión y rol en localStorage
      localStorage.setItem("user", JSON.stringify(result.user));
      localStorage.setItem("user_role", result.user.rol);

      // Redirección dinámica según el rol
      switch (result.user.rol) {
        case "Admin":
          router.push("/home");
          break;
        case "ESTILISTA":
          router.push("/estilista");
          break;
        case "RECEPCIONISTA":
          router.push("/recepcion");
          break;
        case "CLIENTE":
        default:
          router.push("/homefdgfx");
          break;
      }
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-rose-100 via-stone-100 to-pink-100 overflow-hidden p-4">
      {/* CAPA DE ICONOS ANIMADOS TIPO GIF / FLOTANTES */}
      <div className="absolute inset-0 pointer-events-none opacity-20 select-none overflow-hidden">
        {/* Tijera girando e inclinándose */}
        <Scissors className="absolute top-10 left-10 w-28 h-28 text-rose-800 animate-float" />

        {/* Destellos palpitando */}
        <Sparkles className="absolute top-1/4 left-1/3 w-16 h-16 text-pink-600 animate-pulse" />

        {/* Corona flotando al lado opuesto */}
        <Crown className="absolute top-12 right-1/4 w-24 h-24 text-rose-700 animate-float-reverse" />

        {/* Paleta de colores en rotación continua super lenta */}
        <Palette className="absolute top-1/3 right-10 w-28 h-28 text-pink-800 animate-spin-slow" />

        {/* Corazón flotando suavemente */}
        <Heart className="absolute bottom-1/3 left-12 w-20 h-20 text-rose-700 animate-float" />

        {/* Ojo estético con destello en pulso */}
        <Eye className="absolute bottom-1/4 right-1/3 w-16 h-16 text-rose-900 animate-pulse" />

        {/* Tijera secundaria flotando en la esquina inferior */}
        <Scissors className="absolute bottom-10 left-1/4 w-24 h-24 text-pink-900 animate-float-reverse" />

        {/* Destello final */}
        <Sparkles className="absolute bottom-12 right-12 w-20 h-20 text-rose-800 animate-float" />
      </div>

      {/* TARJETA PRINCIPAL DEL LOGIN */}
      <div className="relative z-10 max-w-md w-full bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/40">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-100 text-rose-600 mb-3">
            <Scissors className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-4xl font-bold text-stone-900 tracking-wide">
            BeautyZone
          </h1>
          <p className="text-xs text-stone-500 uppercase tracking-widest mt-1">
            Plataforma de Gestión & Estética
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs font-medium rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <form action={onSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block font-medium text-stone-700 mb-1">
              Correo Electrónico
            </label>
            <input
              name="correo"
              type="email"
              required
              className="w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 bg-stone-50/50"
              placeholder="tu@salon.com"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block font-medium text-stone-700">
                Contraseña
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-rose-600 font-medium hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <input
              name="password"
              type="password"
              required
              className="w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 bg-stone-50/50"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-stone-900 hover:bg-stone-800 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg mt-2"
          >
            Iniciar Sesión
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-stone-500">
          ¿No tienes una cuenta?{" "}
          <Link
            href="/register"
            className="text-rose-600 font-semibold hover:underline"
          >
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
