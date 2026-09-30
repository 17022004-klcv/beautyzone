"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogIn, User } from "lucide-react";

import PageTitle from "@/src/components/ui/PageTitle";
import ProfileCard from "@/src/components/ui/ProfileCard";

export default function PerfilPage() {
  const [userId, setUserId] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const sesion = localStorage.getItem("user");
    if (sesion) {
      try {
        const parsed = JSON.parse(sesion);
        if (parsed?.id) {
          setUserId(parsed.id);
        }
      } catch (error) {
        console.error("Error al leer la sesión:", error);
      }
    }
    setCargando(false);
  }, []);

  if (cargando) return null;

  if (!userId) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-[#32130E]/10 flex items-center justify-center">
          <User className="w-7 h-7 text-[#32130E]" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#32130E]">
          Inicia sesión para ver tu perfil
        </h2>
        <p className="text-xs font-medium text-[#7A5C55] max-w-sm">
          Necesitas una cuenta activa para consultar y editar tu información
          personal.
        </p>
        <Link
          href="/login"
          className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-[#32130E] hover:bg-[#4A241D] text-white text-xs font-bold rounded-2xl transition"
        >
          <LogIn className="w-4 h-4" />
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="px-6 py-10 max-w-6xl mx-auto w-full">
      <div className="mb-8">
        <PageTitle
          title="Mi Perfil"
          subtitle="Actualiza tus datos de contacto, tu contraseña y genera tu gafete digital"
        />
      </div>

      <ProfileCard userId={userId} />
    </div>
  );
}
