"use client";

import { useState, useEffect } from "react";
import {
  UsuarioItem,
  RoleItem,
  CreateUsuarioDTO,
} from "@/src/app/types/usuario";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateUsuarioDTO, id?: number) => Promise<void>;
  usuario?: UsuarioItem | null;
  roles: RoleItem[];
}

export function UsuarioModal({
  isOpen,
  onClose,
  onSave,
  usuario,
  roles,
}: Props) {
  const [formData, setFormData] = useState<CreateUsuarioDTO>({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    idrol: roles[0]?.id || 1,
    password: "",
    pinCaja: "",
    passwordAdmin: "",
  });
  const [quitarPin, setQuitarPin] = useState(false);
  const [quitarPasswordAdmin, setQuitarPasswordAdmin] = useState(false);

  const pinActual = usuario?.pinCaja || null;
  const pinEnviado = formData.pinCaja?.trim() || "";
  const passwordAdminActual = usuario?.passwordAdmin || null;
  const esAdmin = roles.find((r) => r.id === formData.idrol)?.nombre === "Admin";

  useEffect(() => {
    if (usuario) {
      setFormData({
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        telefono: usuario.telefono || "",
        idrol: usuario.idrol,
        password: "", // Opcional al editar
        pinCaja: "",
        passwordAdmin: "",
      });
    } else {
      setFormData({
        nombre: "",
        apellido: "",
        correo: "",
        telefono: "",
        idrol: roles[0]?.id || 1,
        password: "",
        pinCaja: "",
        passwordAdmin: "",
      });
    }
    setQuitarPin(false);
    setQuitarPasswordAdmin(false);
  }, [usuario, roles]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateUsuarioDTO = { ...formData };

    if (quitarPin) {
      payload.pinCaja = "";
    } else if (!pinEnviado) {
      delete payload.pinCaja;
    }

    if (quitarPasswordAdmin) {
      payload.passwordAdmin = "";
    } else if (!formData.passwordAdmin?.trim()) {
      delete payload.passwordAdmin;
    }

    await onSave(payload, usuario?.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
        <div className="px-6 py-4 bg-indigo-600 text-white flex justify-between items-center">
          <h3 className="font-semibold text-lg">
            {usuario ? "Editar Usuario" : "Nuevo Usuario"}
          </h3>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white font-bold text-xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                Nombre
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm text-gray-800"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                Apellido
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm text-gray-800"
                value={formData.apellido}
                onChange={(e) =>
                  setFormData({ ...formData, apellido: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm text-gray-800"
              value={formData.correo}
              onChange={(e) =>
                setFormData({ ...formData, correo: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                Teléfono
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm text-gray-800"
                value={formData.telefono || ""}
                onChange={(e) =>
                  setFormData({ ...formData, telefono: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                Rol
              </label>
              <select
                value={formData.idrol}
                onChange={(e) =>
                  setFormData({ ...formData, idrol: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm text-gray-800 bg-white"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
              Contraseña{" "}
              {usuario && (
                <span className="text-gray-400 font-normal">
                  (Dejar en blanco para conservar)
                </span>
              )}
            </label>
            <input
              type="password"
              required={!usuario}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm text-gray-800"
              value={formData.password || ""}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-amber-800 uppercase">
                PIN de Caja
              </label>
              {pinActual && !quitarPin && (
                <button
                  type="button"
                  onClick={() => {
                    setQuitarPin(true);
                    setFormData({ ...formData, pinCaja: "" });
                  }}
                  className="text-xs font-medium text-amber-700 hover:text-amber-900 underline"
                >
                  Quitar PIN
                </button>
              )}
            </div>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              pattern="[0-9]*"
              disabled={quitarPin}
              value={quitarPin ? "" : formData.pinCaja || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  pinCaja: e.target.value.replace(/\D/g, ""),
                })
              }
              className="w-full px-3 py-2 border border-amber-300 bg-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm text-gray-800 font-mono tracking-widest disabled:bg-gray-100 disabled:text-gray-400"
              placeholder={
                usuario
                  ? pinActual
                    ? "Dejar en blanco para conservar"
                    : "Sin PIN asignado"
                  : "Opcional - 6 dígitos"
              }
            />
            <p className="text-xs text-amber-700 mt-1">
              {quitarPin
                ? "El PIN se eliminará al guardar."
                : "Hasta 6 dígitos, único por usuario. Necesario para abrir y cerrar la caja en el POS."}
            </p>
          </div>

          {/* Contraseña de administrador (para operaciones sensibles) */}
          {esAdmin && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex justify-between items-start mb-2">
                <label className="block text-sm font-semibold text-blue-900">
                  Contraseña de administrador
                </label>
                {passwordAdminActual && !quitarPasswordAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuitarPasswordAdmin(true);
                      setFormData({ ...formData, passwordAdmin: "" });
                    }}
                    className="text-xs font-medium text-blue-700 hover:text-blue-900 underline"
                  >
                    Quitar contraseña
                  </button>
                )}
              </div>
              <input
                type="password"
                disabled={quitarPasswordAdmin}
                value={quitarPasswordAdmin ? "" : formData.passwordAdmin || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    passwordAdmin: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-blue-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm text-gray-800 disabled:bg-gray-100 disabled:text-gray-400"
                placeholder={
                  usuario
                    ? passwordAdminActual
                      ? "Dejar en blanco para conservar"
                      : "Sin contraseña asignada"
                    : "Opcional - usada para editar arqueos y cierre admin"
                }
              />
              <p className="text-xs text-blue-700 mt-1">
                {quitarPasswordAdmin
                  ? "La contraseña de administrador se eliminará al guardar."
                  : "Independiente del login. Si está vacía, las operaciones sensibles quedan deshabilitadas hasta que se asigne."}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition font-medium shadow-sm"
            >
              Guardar Usuario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
