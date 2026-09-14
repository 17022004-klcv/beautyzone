"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Key,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";

// UI & Servicios
import Button from "@/src/components/ui/Button";
import { PerfilUsuario, ActualizarPerfilDTO } from "@/src/app/types/perfil";
import { PerfilService } from "@/src/app/services/perfil.service";

interface ProfileCardProps {
  userId: number; // ID del usuario en sesión
}

export default function ProfileCard({ userId }: ProfileCardProps) {
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // Estados del formulario
  const [formData, setFormData] = useState<ActualizarPerfilDTO>({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    passwordActual: "",
    nuevaPassword: "",
  });

  // Mensajes de Feedback
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  // Cargar datos iniciales del perfil
  useEffect(() => {
    async function loadPerfil() {
      try {
        setLoading(true);
        const data = await PerfilService.getPerfil(userId);
        setPerfil(data);
        setFormData({
          nombre: data.nombre || "",
          apellido: data.apellido || "",
          correo: data.correo || "",
          telefono: data.telefono || "",
          passwordActual: "",
          nuevaPassword: "",
        });
      } catch (err: any) {
        setMensajeError(
          err.message || "Error al cargar la información del usuario",
        );
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      loadPerfil();
    }
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeExito(null);
    setMensajeError(null);

    // Validar contraseña si intenta cambiarla
    if (formData.nuevaPassword && !formData.passwordActual) {
      setMensajeError(
        "Debes ingresar tu contraseña actual para establecer una nueva.",
      );
      return;
    }

    try {
      setSaving(true);
      const usuarioActualizado = await PerfilService.updatePerfil(
        userId,
        formData,
      );
      setPerfil(usuarioActualizado);

      // Limpiar campos de contraseñas
      setFormData((prev) => ({
        ...prev,
        passwordActual: "",
        nuevaPassword: "",
      }));

      setMensajeExito("¡Perfil actualizado correctamente!");
      setTimeout(() => setMensajeExito(null), 4000);
    } catch (err: any) {
      setMensajeError(err.message || "No se pudo actualizar el perfil.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-[#D8C3B3] rounded-2xl p-8 flex justify-center items-center text-[#7A5C55] text-sm">
        Cargando datos del perfil...
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-sm">
        No se pudo cargar el perfil del usuario.
      </div>
    );
  }

  // Iniciales para el Avatar
  const iniciales =
    `${perfil.nombre.charAt(0)}${perfil.apellido.charAt(0)}`.toUpperCase();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* TARJETA IZQUIERDA: RESUMEN DE USUARIO */}
      <div className="bg-white border border-[#D8C3B3] rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full bg-[#572219] text-[#F5EBE1] flex items-center justify-center text-2xl font-bold font-serif mb-4 shadow-inner border-2 border-[#D8C3B3]">
          {iniciales}
        </div>

        <h2 className="text-xl font-bold font-serif text-[#32130E]">
          {perfil.nombre} {perfil.apellido}
        </h2>

        <span className="mt-2 px-3 py-1 bg-[#F5EBE1] border border-[#D8C3B3] text-[#572219] text-xs font-bold rounded-full uppercase tracking-wider">
          {perfil.rol.nombre}
        </span>

        <div className="w-full border-t border-[#F5EBE1] my-6"></div>

        <div className="w-full space-y-3 text-left text-xs text-[#7A5C55]">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#572219]" />
            <span className="truncate">{perfil.correo}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#572219]" />
            <span>{perfil.telefono || "Sin teléfono registrado"}</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#572219]" />
            <span>Estado: {perfil.estado ? "Activo" : "Inactivo"}</span>
          </div>
          {perfil.createdAt && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#572219]" />
              <span>
                Miembro desde:{" "}
                {new Date(perfil.createdAt).toLocaleDateString("es-SV", {
                  year: "numeric",
                  month: "short",
                })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* FORMULARIO DERECHO: EDICIÓN DE DATOS */}
      <div className="lg:col-span-2 bg-white border border-[#D8C3B3] rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold font-serif text-[#32130E] mb-1">
          Editar Información Personal
        </h3>
        <p className="text-xs text-[#7A5C55] mb-6">
          Actualiza tus datos de contacto o cambia tu contraseña de acceso
        </p>

        {/* Notificaciones */}
        {mensajeExito && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {mensajeExito}
          </div>
        )}

        {mensajeError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            {mensajeError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre y Apellido */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#572219] mb-1">
                Nombre
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 text-sm bg-white border border-[#D8C3B3] rounded-xl text-[#32130E] focus:outline-none focus:ring-2 focus:ring-[#9D4B4C]"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#572219] mb-1">
                Apellido
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 text-sm bg-white border border-[#D8C3B3] rounded-xl text-[#32130E] focus:outline-none focus:ring-2 focus:ring-[#9D4B4C]"
                value={formData.apellido}
                onChange={(e) =>
                  setFormData({ ...formData, apellido: e.target.value })
                }
              />
            </div>
          </div>

          {/* Correo y Teléfono */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#572219] mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                className="w-full px-3 py-2 text-sm bg-white border border-[#D8C3B3] rounded-xl text-[#32130E] focus:outline-none focus:ring-2 focus:ring-[#9D4B4C]"
                value={formData.correo}
                onChange={(e) =>
                  setFormData({ ...formData, correo: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#572219] mb-1">
                Teléfono
              </label>
              <input
                type="text"
                placeholder="Ej. 7890-1234"
                className="w-full px-3 py-2 text-sm bg-white border border-[#D8C3B3] rounded-xl text-[#32130E] focus:outline-none focus:ring-2 focus:ring-[#9D4B4C]"
                value={formData.telefono || ""}
                onChange={(e) =>
                  setFormData({ ...formData, telefono: e.target.value })
                }
              />
            </div>
          </div>

          {/* SECCIÓN CAMBIO DE CONTRASEÑA */}
          <div className="pt-4 mt-4 border-t border-[#F5EBE1]">
            <h4 className="text-sm font-bold text-[#32130E] flex items-center gap-2 mb-3">
              <Key className="w-4 h-4 text-[#572219]" />
              Cambiar Contraseña (Opcional)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#572219] mb-1">
                  Contraseña Actual
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-sm bg-white border border-[#D8C3B3] rounded-xl text-[#32130E] focus:outline-none focus:ring-2 focus:ring-[#9D4B4C]"
                  value={formData.passwordActual}
                  onChange={(e) =>
                    setFormData({ ...formData, passwordActual: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#572219] mb-1">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-sm bg-white border border-[#D8C3B3] rounded-xl text-[#32130E] focus:outline-none focus:ring-2 focus:ring-[#9D4B4C]"
                  value={formData.nuevaPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, nuevaPassword: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* BOTÓN GUARDAR */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={saving}
              className="gap-2 px-6 py-2.5 text-sm font-semibold"
            >
              <Save className="w-4 h-4" />
              {saving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
