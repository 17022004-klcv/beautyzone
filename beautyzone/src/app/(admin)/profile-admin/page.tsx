"use client";

import ProfileCard from "@/src/components/ui/ProfileCard";

export default function PerfilPage() {
  // Aquí pasas el ID del usuario logueado desde tu contexto o sesión (ej. 1)
  const currentUserId = 1;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-[#32130E]">
          Mi Perfil
        </h1>
        <p className="text-xs text-[#7A5C55] mt-1">
          Gestiona tu información personal y credenciales de acceso
        </p>
      </div>

      <ProfileCard userId={currentUserId} />
    </div>
  );
}
