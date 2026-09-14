"use client";

import { useState } from "react";
import Link from "next/link";
import { Scissors, Sparkles, Heart, Crown, Palette, Eye } from "lucide-react";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
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
            Recuperar Contraseña
          </p>
        </div>

        {sent ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm text-center">
            <p className="font-medium">¡Instrucciones enviadas!</p>
            <p className="text-xs mt-1 text-emerald-600">
              Revisa tu correo electrónico para restablecer la contraseña.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div>
              <label className="block font-medium text-stone-700 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-stone-50"
                placeholder="tu@correo.com"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-stone-900 hover:bg-stone-800 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
            >
              Enviar Enlace de Recuperación
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-xs text-stone-500">
          <Link
            href="/login"
            className="text-pink-600 font-semibold hover:underline"
          >
            ← Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
