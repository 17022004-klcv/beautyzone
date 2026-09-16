"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Download,
  FileSpreadsheet,
  FileText,
  Edit,
  Power,
} from "lucide-react";
import Button from "@/src/components/ui/Button";
import Modal from "@/src/components/ui/Modal";
import CategoryFilter from "@/src/components/ui/CategoryFilter";
import { UsuarioItem, RoleItem } from "@/src/app/types/usuario";
import { ExportService } from "@/src/app/services/export.service";

const TABS = ["Usuarios", "Roles"];

export default function UsuariosView() {
  const [activeTab, setActiveTab] = useState("Usuarios");
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Estados de edición y formularios
  const [usuarioEditando, setUsuarioEditando] = useState<UsuarioItem | null>(
    null,
  );
  const [rolEditando, setRolEditando] = useState<RoleItem | null>(null);

  // Formulario Usuario
  const [formUser, setFormUser] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    idrol: 1,
    password: "",
  });

  // Formulario Rol
  const [formRol, setFormRol] = useState({ nombre: "" });

  // Cargar datos (Usuarios y Roles siempre en paralelo)
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [resUsers, resRoles] = await Promise.all([
        fetch("/api/usuarios"),
        fetch("/api/roles"),
      ]);

      if (resUsers.ok) {
        const dataUsers = await resUsers.json();
        setUsuarios(dataUsers);
      }

      if (resRoles.ok) {
        const dataRoles = await resRoles.json();
        setRoles(dataRoles);
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Manejador del Modal Nuevo / Editar
  const handleOpenModal = (item?: UsuarioItem | RoleItem) => {
    if (activeTab === "Usuarios") {
      if (item) {
        const u = item as UsuarioItem;
        setUsuarioEditando(u);
        setFormUser({
          nombre: u.nombre,
          apellido: u.apellido,
          correo: u.correo,
          telefono: u.telefono || "",
          idrol: u.idrol,
          password: "",
        });
      } else {
        setUsuarioEditando(null);
        setFormUser({
          nombre: "",
          apellido: "",
          correo: "",
          telefono: "",
          idrol: roles[0]?.id || 1,
          password: "",
        });
      }
    } else {
      if (item) {
        const r = item as RoleItem;
        setRolEditando(r);
        setFormRol({ nombre: r.nombre });
      } else {
        setRolEditando(null);
        setFormRol({ nombre: "" });
      }
    }
    setIsModalOpen(true);
  };

  // Guardar Usuario
  const handleSubmitUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = usuarioEditando
      ? `/api/usuarios/${usuarioEditando.id}`
      : "/api/usuarios";
    const method = usuarioEditando ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formUser),
    });

    if (res.ok) {
      setIsModalOpen(false);
      fetchData();
    } else {
      const err = await res.json();
      alert(err.error || "Error al procesar la solicitud");
    }
  };

  // Guardar Rol
  const handleSubmitRol = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = rolEditando ? `/api/roles/${rolEditando.id}` : "/api/roles";
    const method = rolEditando ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formRol),
    });

    if (res.ok) {
      setIsModalOpen(false);
      fetchData();
    } else {
      const err = await res.json();
      alert(err.error || "Error al procesar el rol");
    }
  };

  // Toggle Estado (Activo / Inactivo)
  const toggleEstadoUsuario = async (u: UsuarioItem) => {
    const res = await fetch(`/api/usuarios/${u.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: !u.estado }),
    });

    if (res.ok) fetchData();
  };

  // Toggle Estado Rol
  const toggleEstadoRol = async (r: RoleItem) => {
    const res = await fetch(`/api/roles/${r.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: !r.estado }),
    });

    if (res.ok) fetchData();
  };

  const handleExport = (format: "excel" | "pdf") => {
    if (activeTab === "Usuarios") {
      ExportService.exportUsuarios?.(usuarios, format);
    } else {
      ExportService.exportRoles?.(roles, format);
    }
    setShowExportMenu(false);
  };

  return (
    <div className="space-y-6 p-6">
      {/* TÍTULO SIN FONDO Y CONTROLES SUPERIORES */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#32130E]">
            Gestión de {activeTab}
          </h1>
          <p className="text-xs font-medium text-[#7A5C55] mt-1">
            Administra los usuarios del sistema y sus niveles de acceso
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* MENÚ DESCARGAR */}
          <div className="relative">
            <Button
              variant="outline"
              size="md"
              className="gap-2 text-xs font-semibold border-white/90 bg-white/60 hover:bg-white text-[#32130E] shadow-2xs"
              onClick={() => setShowExportMenu(!showExportMenu)}
            >
              <Download className="w-4 h-4 text-[#32130E]" />
              <span>Descargar</span>
            </Button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-white/90 backdrop-blur-2xl border border-white rounded-2xl shadow-[0_12px_30px_rgba(50,19,14,0.08)] z-30 overflow-hidden p-1 space-y-0.5">
                <button
                  onClick={() => handleExport("excel")}
                  className="w-full px-3 py-2 text-xs font-semibold text-[#32130E] hover:bg-[#32130E]/5 rounded-xl transition-colors flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  Excel (.xlsx)
                </button>
                <button
                  onClick={() => handleExport("pdf")}
                  className="w-full px-3 py-2 text-xs font-semibold text-[#32130E] hover:bg-[#32130E]/5 rounded-xl transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-rose-600" />
                  PDF (.pdf)
                </button>
              </div>
            )}
          </div>

          {/* BOTÓN DINÁMICO */}
          <Button
            size="md"
            className="gap-2 px-4 py-2 text-xs font-semibold shadow-sm"
            onClick={() => handleOpenModal()}
          >
            <Plus className="w-4 h-4" />
            <span>
              {activeTab === "Usuarios" ? "Agregar Usuario" : "Agregar Rol"}
            </span>
          </Button>
        </div>
      </div>

      {/* COMPONENTE DE FILTRO / TAB */}
      <CategoryFilter
        categories={TABS}
        selectedCategory={activeTab}
        onSelectCategory={setActiveTab}
      />

      {/* CONTENEDOR DE TABLA CON GLASSMORPHISM */}
      <div className="bg-white/50 backdrop-blur-xl border border-white/90 rounded-3xl p-6 shadow-[0_8px_30px_rgba(50,19,14,0.04)] min-h-[400px]">
        {loading ? (
          <div className="flex justify-center items-center py-20 text-[#7A5C55] text-xs font-semibold">
            Cargando {activeTab.toLowerCase()}...
          </div>
        ) : activeTab === "Usuarios" ? (
          /* TABLA DE USUARIOS */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#32130E]/10 text-xs font-bold text-[#32130E]">
                  <th className="py-3 px-4">Nombre Completo</th>
                  <th className="py-3 px-4">Correo</th>
                  <th className="py-3 px-4">Teléfono</th>
                  <th className="py-3 px-4">Rol</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#32130E]/5">
                {usuarios.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-white/60 transition-colors text-xs font-medium"
                  >
                    <td className="py-3.5 px-4 font-bold text-[#32130E]">
                      {u.nombre} {u.apellido}
                    </td>
                    <td className="py-3.5 px-4 text-[#7A5C55]">{u.correo}</td>
                    <td className="py-3.5 px-4 text-[#7A5C55]">
                      {u.telefono || "-"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-white/80 text-[#32130E] px-2.5 py-1 rounded-full text-[10px] font-bold border border-white shadow-2xs">
                        {u.rol?.nombre || "Sin Rol"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${
                          u.estado
                            ? "bg-[#2E6F40]/10 border-[#2E6F40]/20 text-[#2E6F40]"
                            : "bg-[#B83A3A]/10 border-[#B83A3A]/20 text-[#B83A3A]"
                        }`}
                      >
                        {u.estado ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenModal(u)}
                        className="p-1.5 text-[#32130E] hover:bg-white/80 rounded-xl transition border border-transparent hover:border-white/80 shadow-2xs"
                        title="Editar"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleEstadoUsuario(u)}
                        className={`p-1.5 rounded-xl transition border border-transparent hover:border-white/80 shadow-2xs ${
                          u.estado
                            ? "text-[#B83A3A] hover:bg-[#B83A3A]/10"
                            : "text-[#2E6F40] hover:bg-[#2E6F40]/10"
                        }`}
                        title={u.estado ? "Desactivar" : "Activar"}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {usuarios.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-12 text-xs text-[#7A5C55] font-semibold"
                    >
                      No hay usuarios registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* TABLA DE ROLES */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#32130E]/10 text-xs font-bold text-[#32130E]">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Nombre del Rol</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#32130E]/5">
                {roles.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-white/60 transition-colors text-xs font-medium"
                  >
                    <td className="py-3.5 px-4 text-[#7A5C55]">#{r.id}</td>
                    <td className="py-3.5 px-4 font-bold text-[#32130E]">
                      {r.nombre}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${
                          r.estado
                            ? "bg-[#2E6F40]/10 border-[#2E6F40]/20 text-[#2E6F40]"
                            : "bg-[#B83A3A]/10 border-[#B83A3A]/20 text-[#B83A3A]"
                        }`}
                      >
                        {r.estado ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenModal(r)}
                        className="p-1.5 text-[#32130E] hover:bg-white/80 rounded-xl transition border border-transparent hover:border-white/80 shadow-2xs"
                        title="Editar"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleEstadoRol(r)}
                        className={`p-1.5 rounded-xl transition border border-transparent hover:border-white/80 shadow-2xs ${
                          r.estado
                            ? "text-[#B83A3A] hover:bg-[#B83A3A]/10"
                            : "text-[#2E6F40] hover:bg-[#2E6F40]/10"
                        }`}
                        title={r.estado ? "Desactivar" : "Activar"}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {roles.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-12 text-xs text-[#7A5C55] font-semibold"
                    >
                      No hay roles registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL CON VIDRIO */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          activeTab === "Usuarios"
            ? usuarioEditando
              ? "Editar Usuario"
              : "Nuevo Usuario"
            : rolEditando
              ? "Editar Rol"
              : "Nuevo Rol"
        }
        subtitle={
          activeTab === "Usuarios"
            ? "Ingresa los datos del usuario para el sistema"
            : "Especifica el nombre para el nuevo rol de acceso"
        }
      >
        {activeTab === "Usuarios" ? (
          <form onSubmit={handleSubmitUsuario} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#32130E] mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-white/80 rounded-2xl text-xs text-[#32130E] bg-white/60 focus:outline-none focus:bg-white transition-all shadow-2xs"
                  value={formUser.nombre}
                  onChange={(e) =>
                    setFormUser({ ...formUser, nombre: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#32130E] mb-1">
                  Apellido
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-white/80 rounded-2xl text-xs text-[#32130E] bg-white/60 focus:outline-none focus:bg-white transition-all shadow-2xs"
                  value={formUser.apellido}
                  onChange={(e) =>
                    setFormUser({ ...formUser, apellido: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#32130E] mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                className="w-full px-3 py-2 border border-white/80 rounded-2xl text-xs text-[#32130E] bg-white/60 focus:outline-none focus:bg-white transition-all shadow-2xs"
                value={formUser.correo}
                onChange={(e) =>
                  setFormUser({ ...formUser, correo: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#32130E] mb-1">
                  Teléfono
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-white/80 rounded-2xl text-xs text-[#32130E] bg-white/60 focus:outline-none focus:bg-white transition-all shadow-2xs"
                  value={formUser.telefono}
                  onChange={(e) =>
                    setFormUser({ ...formUser, telefono: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#32130E] mb-1">
                  Rol
                </label>
                <select
                  value={formUser.idrol}
                  onChange={(e) =>
                    setFormUser({ ...formUser, idrol: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-white/80 rounded-2xl text-xs text-[#32130E] bg-white/60 focus:outline-none focus:bg-white transition-all shadow-2xs cursor-pointer"
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
              <label className="block text-xs font-semibold text-[#32130E] mb-1">
                Contraseña{" "}
                {usuarioEditando && (
                  <span className="text-[#7A5C55] font-normal">(Opcional)</span>
                )}
              </label>
              <input
                type="password"
                required={!usuarioEditando}
                className="w-full px-3 py-2 border border-white/80 rounded-2xl text-xs text-[#32130E] bg-white/60 focus:outline-none focus:bg-white transition-all shadow-2xs"
                value={formUser.password}
                onChange={(e) =>
                  setFormUser({ ...formUser, password: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#32130E]/10">
              <Button
                type="button"
                variant="outline"
                className="border-white/80 bg-white/60 text-[#32130E]"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {usuarioEditando ? "Guardar Cambios" : "Crear Usuario"}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmitRol} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#32130E] mb-1">
                Nombre del Rol
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Estilista, Administrador"
                className="w-full px-3 py-2 border border-white/80 rounded-2xl text-xs text-[#32130E] bg-white/60 focus:outline-none focus:bg-white transition-all shadow-2xs"
                value={formRol.nombre}
                onChange={(e) => setFormRol({ nombre: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#32130E]/10">
              <Button
                type="button"
                variant="outline"
                className="border-white/80 bg-white/60 text-[#32130E]"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {rolEditando ? "Guardar Cambios" : "Crear Rol"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
