"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  Phone,
  ShieldCheck,
  Key,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  QrCode,
  Printer,
  X,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import Button from "@/src/components/ui/Button";
import { PerfilUsuario, ActualizarPerfilDTO } from "@/src/app/types/perfil";
import { PerfilService } from "@/src/app/services/perfil.service";

interface ProfileCardProps {
  userId: number;
}

export default function ProfileCard({ userId }: ProfileCardProps) {
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [showGafeteModal, setShowGafeteModal] = useState<boolean>(false);

  const [formData, setFormData] = useState<ActualizarPerfilDTO>({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    passwordActual: "",
    nuevaPassword: "",
  });

  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

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

  const handlePrintGafete = () => {
    window.print();
  };

  // SKELETON DE CARGA GLASSMORPHISM
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
        {/* Skeleton Resumen */}
        <div className="bg-white/50 backdrop-blur-xl border border-white/90 rounded-3xl p-6 shadow-[0_8px_30px_rgba(50,19,14,0.05)] flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-[#32130E]/10 mb-4" />
          <div className="h-5 bg-[#32130E]/10 rounded-xl w-3/4 mb-2" />
          <div className="h-4 bg-[#32130E]/10 rounded-full w-1/3 mb-6" />
          <div className="w-full border-t border-[#32130E]/10 my-4" />
          <div className="w-full space-y-3">
            <div className="h-4 bg-[#32130E]/10 rounded-lg w-5/6" />
            <div className="h-4 bg-[#32130E]/10 rounded-lg w-2/3" />
            <div className="h-4 bg-[#32130E]/10 rounded-lg w-3/4" />
          </div>
          <div className="w-full h-9 bg-[#32130E]/10 rounded-2xl mt-6" />
        </div>

        {/* Skeleton Formulario */}
        <div className="lg:col-span-2 bg-white/50 backdrop-blur-xl border border-white/90 rounded-3xl p-6 shadow-[0_8px_30px_rgba(50,19,14,0.05)] space-y-6">
          <div className="space-y-2">
            <div className="h-5 bg-[#32130E]/10 rounded-xl w-1/3" />
            <div className="h-3 bg-[#32130E]/10 rounded-xl w-2/3" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-10 bg-[#32130E]/10 rounded-2xl" />
            <div className="h-10 bg-[#32130E]/10 rounded-2xl" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-10 bg-[#32130E]/10 rounded-2xl" />
            <div className="h-10 bg-[#32130E]/10 rounded-2xl" />
          </div>
          <div className="h-12 bg-[#32130E]/10 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="bg-rose-50/80 backdrop-blur-md border border-rose-200 text-rose-800 p-4 rounded-2xl text-xs font-semibold">
        No se pudo cargar el perfil del usuario.
      </div>
    );
  }

  const iniciales =
    `${perfil.nombre.charAt(0)}${perfil.apellido.charAt(0)}`.toUpperCase();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate__animated animate__fadeIn">
      {/* RESUMEN DE USUARIO */}
      <div className="bg-white/50 backdrop-blur-xl border border-white/90 rounded-3xl p-6 shadow-[0_8px_30px_rgba(50,19,14,0.05)] flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full bg-[#32130E] text-[#F5EBE1] flex items-center justify-center text-2xl font-bold font-serif mb-4 shadow-md border-2 border-white">
          {iniciales}
        </div>

        <h2 className="text-xl font-bold font-serif text-[#32130E]">
          {perfil.nombre} {perfil.apellido}
        </h2>

        <span className="mt-2 px-3 py-1 bg-white/80 border border-white text-[#32130E] text-[10px] font-extrabold rounded-full uppercase tracking-wider shadow-2xs">
          {perfil.rol.nombre}
        </span>

        <div className="w-full border-t border-[#32130E]/10 my-6"></div>

        <div className="w-full space-y-3 text-left text-xs font-medium text-[#7A5C55]">
          <div className="flex items-center gap-2.5">
            <Mail className="w-4 h-4 text-[#32130E]" />
            <span className="truncate">{perfil.correo}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Phone className="w-4 h-4 text-[#32130E]" />
            <span>{perfil.telefono || "Sin teléfono registrado"}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#32130E]" />
            <span>Estado: {perfil.estado ? "Activo" : "Inactivo"}</span>
          </div>
          {perfil.createdAt && (
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-[#32130E]" />
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

        {/* BOTÓN GENERAR GAFETE */}
        <div className="w-full pt-6 mt-6 border-t border-[#32130E]/10">
          <Button
            onClick={() => setShowGafeteModal(true)}
            variant="outline"
            className="w-full gap-2 border-white/90 bg-white/70 hover:bg-white text-[#32130E] shadow-2xs rounded-2xl text-xs font-bold"
          >
            <QrCode className="w-4 h-4 text-[#32130E]" />
            <span>Generar Gafete Digital</span>
          </Button>
        </div>
      </div>

      {/* FORMULARIO DE EDICIÓN */}
      <div className="lg:col-span-2 bg-white/50 backdrop-blur-xl border border-white/90 rounded-3xl p-6 shadow-[0_8px_30px_rgba(50,19,14,0.05)]">
        <h3 className="text-lg font-bold font-serif text-[#32130E] mb-1">
          Editar Información Personal
        </h3>
        <p className="text-xs font-medium text-[#7A5C55] mb-6">
          Actualiza tus datos de contacto o cambia tu contraseña de acceso
        </p>

        {mensajeExito && (
          <div className="mb-4 p-3 bg-[#2E6F40]/10 border border-[#2E6F40]/20 text-[#2E6F40] rounded-2xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {mensajeExito}
          </div>
        )}

        {mensajeError && (
          <div className="mb-4 p-3 bg-[#B83A3A]/10 border border-[#B83A3A]/20 text-[#B83A3A] rounded-2xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {mensajeError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#32130E] mb-1">
                Nombre
              </label>
              <input
                type="text"
                required
                className="w-full px-3.5 py-2 text-xs bg-white/60 border border-white/90 rounded-2xl text-[#32130E] focus:outline-none focus:bg-white transition-all shadow-2xs"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#32130E] mb-1">
                Apellido
              </label>
              <input
                type="text"
                required
                className="w-full px-3.5 py-2 text-xs bg-white/60 border border-white/90 rounded-2xl text-[#32130E] focus:outline-none focus:bg-white transition-all shadow-2xs"
                value={formData.apellido}
                onChange={(e) =>
                  setFormData({ ...formData, apellido: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#32130E] mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                className="w-full px-3.5 py-2 text-xs bg-white/60 border border-white/90 rounded-2xl text-[#32130E] focus:outline-none focus:bg-white transition-all shadow-2xs"
                value={formData.correo}
                onChange={(e) =>
                  setFormData({ ...formData, correo: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#32130E] mb-1">
                Teléfono
              </label>
              <input
                type="text"
                placeholder="Ej. 7890-1234"
                className="w-full px-3.5 py-2 text-xs bg-white/60 border border-white/90 rounded-2xl text-[#32130E] placeholder-[#7A5C55] focus:outline-none focus:bg-white transition-all shadow-2xs"
                value={formData.telefono || ""}
                onChange={(e) =>
                  setFormData({ ...formData, telefono: e.target.value })
                }
              />
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#32130E]/10">
            <h4 className="text-xs font-bold text-[#32130E] flex items-center gap-2 mb-3">
              <Key className="w-4 h-4 text-[#32130E]" />
              Cambiar Contraseña (Opcional)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#32130E] mb-1">
                  Contraseña Actual
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 text-xs bg-white/60 border border-white/90 rounded-2xl text-[#32130E] placeholder-[#7A5C55] focus:outline-none focus:bg-white transition-all shadow-2xs"
                  value={formData.passwordActual}
                  onChange={(e) =>
                    setFormData({ ...formData, passwordActual: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#32130E] mb-1">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 text-xs bg-white/60 border border-white/90 rounded-2xl text-[#32130E] placeholder-[#7A5C55] focus:outline-none focus:bg-white transition-all shadow-2xs"
                  value={formData.nuevaPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, nuevaPassword: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={saving}
              variant="primary"
              size="md"
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </div>

      {/* MODAL DE GAFETE DIGITAL */}
      {showGafeteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white/90 backdrop-blur-2xl border border-white rounded-3xl p-6 max-w-sm w-full shadow-[0_25px_50px_rgba(50,19,14,0.15)] space-y-6 relative">
            <button
              onClick={() => setShowGafeteModal(false)}
              className="absolute top-4 right-4 p-1.5 text-[#7A5C55] hover:text-[#32130E] hover:bg-white rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* DISEÑO DEL GAFETE EN VIVO */}
            <div
              id="gafete-print"
              className="bg-white border-2 border-[#32130E]/20 rounded-2xl p-6 text-center space-y-4 shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-3 bg-[#32130E]"></div>

              <div className="pt-2">
                <span className="text-[10px] font-extrabold text-[#7A5C55] uppercase tracking-widest">
                  Gafete de Asistencia
                </span>
                <h3 className="text-xl font-bold font-serif text-[#32130E] leading-tight">
                  {perfil.nombre} {perfil.apellido}
                </h3>
                <span className="inline-block mt-1 px-3 py-0.5 bg-[#32130E]/5 text-[#32130E] text-[10px] font-bold rounded-full border border-[#32130E]/10">
                  {perfil.rol.nombre}
                </span>
              </div>

              {/* CÓDIGO QR GENERADO */}
              <div className="flex justify-center p-3 bg-white border border-[#32130E]/10 rounded-2xl shadow-2xs">
                <QRCodeSVG
                  value={String(perfil.id)}
                  size={140}
                  fgColor="#32130E"
                  level="H"
                />
              </div>

              <div className="text-[10px] font-mono text-[#7A5C55]">
                ID: {String(perfil.id).padStart(6, "0")}
              </div>
            </div>

            {/* ACCIONES DEL MODAL */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="w-full text-xs font-semibold border-white/80 bg-white/60 text-[#32130E]"
                onClick={() => setShowGafeteModal(false)}
              >
                Cerrar
              </Button>
              <Button
                onClick={handlePrintGafete}
                className="w-full gap-2 text-xs font-semibold"
              >
                <Printer className="w-4 h-4" />
                Imprimir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
