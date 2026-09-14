"use client";

import { useState } from "react";
import Link from "next/link";
import { handleRegister } from "@/src/app/handlers/auth.handler";
import { Scissors, Sparkles, Heart, Crown, Palette, Eye } from "lucide-react";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setError(null);
    const result = await handleRegister(formData);
    if (result?.error) {
      setError(result.error);
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

      <div className="relative z-10 max-w-md w-full bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/40">
        <div className="text-center mb-6">
          <h1 className="font-serif text-3xl font-bold text-stone-900 tracking-wide">
            BeautyZone
          </h1>
          <p className="text-xs text-stone-500 uppercase tracking-widest mt-1">
            Crea tu cuenta de cliente
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs font-medium rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <form action={onSubmit} className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-stone-700 mb-1">
                Nombre
              </label>
              <input
                name="nombre"
                type="text"
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-stone-50"
                placeholder="María"
              />
            </div>
            <div>
              <label className="block font-medium text-stone-700 mb-1">
                Apellido
              </label>
              <input
                name="apellido"
                type="text"
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-stone-50"
                placeholder="Gómez"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-stone-700 mb-1">
              Teléfono
            </label>
            <input
              name="telefono"
              type="tel"
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-stone-50"
              placeholder="+503 7000-0000"
            />
          </div>

          <div>
            <label className="block font-medium text-stone-700 mb-1">
              Correo Electrónico
            </label>
            <input
              name="correo"
              type="email"
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-stone-50"
              placeholder="maria@ejemplo.com"
            />
          </div>

          <div>
            <label className="block font-medium text-stone-700 mb-1">
              Contraseña
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-stone-50"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-stone-900 hover:bg-stone-800 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors mt-2"
          >
            Registrarme
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-stone-500">
          ¿Ya tienes una cuenta?{" "}
          <Link
            href="/login"
            className="text-pink-600 font-semibold hover:underline"
          >
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
