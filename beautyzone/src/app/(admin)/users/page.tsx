"use client";

import { useUsuariosPage } from "@/src/app/(admin)/users/useUsuarioPage";
import { UsuarioModal } from "@/src/components/forms/UsuarioModal";
import { RolModal } from "@/src/components/forms/RolModal";

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

  // Cargar datos según el TAB
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
      {/* TÍTULO Y CONTROLES SUPERIORES */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-serif font-bold text-[#32130E]">
          Gestión de {activeTab}
        </h1>

        <div className="flex items-center gap-3">
          {/* MENÚ DESCARGAR */}
          <div className="relative">
            <Button
              variant="outline"
              size="md"
              className="gap-2 text-sm font-semibold"
              onClick={() => setShowExportMenu(!showExportMenu)}
            >
              <Download className="w-4 h-4" />
              <span>Descargar</span>
            </Button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-[#D8C3B3] rounded-xl shadow-lg z-20 overflow-hidden">
                <button
                  onClick={() => handleExport("excel")}
                  className="w-full px-4 py-2 text-xs font-semibold text-[#572219] hover:bg-[#F5EBE1] flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4 text-green-600" />
                  Excel (.xlsx)
                </button>
                <button
                  onClick={() => handleExport("pdf")}
                  className="w-full px-4 py-2 text-xs font-semibold text-[#572219] hover:bg-[#F5EBE1] flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-red-600" />
                  PDF (.pdf)
                </button>
              </div>
            )}
          </div>

          {/* BOTÓN DINÁMICO */}
          <Button
            size="md"
            className="gap-2 px-4 py-2.5 text-sm font-semibold"
            onClick={() => handleOpenModal()}
          >
            <Plus className="w-5 h-5" />
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

      {/* CONTENEDOR DE TABLA */}
      <div className="bg-[#FFFFFF] border border-[#D8C3B3] rounded-2xl p-6 shadow-sm min-h-[400px]">
        {loading ? (
          <div className="flex justify-center items-center py-20 text-[#7A5C55] text-sm">
            Cargando {activeTab.toLowerCase()}...
          </div>
        ) : activeTab === "Usuarios" ? (
          /* TABLA DE USUARIOS */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#D8C3B3] text-xs font-bold text-[#572219]">
                  <th className="py-3 px-4">Nombre Completo</th>
                  <th className="py-3 px-4">Correo</th>
                  <th className="py-3 px-4">Teléfono</th>
                  <th className="py-3 px-4">Rol</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5EBE1]">
                {usuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-[#F5EBE1]/40 text-sm">
                    <td className="py-3 px-4 font-semibold text-[#32130E]">
                      {u.nombre} {u.apellido}
                    </td>
                    <td className="py-3 px-4 text-[#7A5C55]">{u.correo}</td>
                    <td className="py-3 px-4 text-[#7A5C55]">
                      {u.telefono || "-"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-[#F5EBE1] text-[#572219] px-2.5 py-1 rounded-md text-xs font-semibold border border-[#D8C3B3]">
                        {u.rol?.nombre || "Sin Rol"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-md font-semibold ${
                          u.estado
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {u.estado ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenModal(u)}
                        className="p-1 text-[#572219] hover:bg-[#F5EBE1] rounded-md transition"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleEstadoUsuario(u)}
                        className={`p-1 rounded-md transition ${
                          u.estado
                            ? "text-red-600 hover:bg-red-50"
                            : "text-green-600 hover:bg-green-50"
                        }`}
                        title={u.estado ? "Desactivar" : "Activar"}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {usuarios.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-8 text-xs text-[#7A5C55]"
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
                <tr className="border-b border-[#D8C3B3] text-xs font-bold text-[#572219]">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Nombre del Rol</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5EBE1]">
                {roles.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F5EBE1]/40 text-sm">
                    <td className="py-3 px-4 text-[#7A5C55]">#{r.id}</td>
                    <td className="py-3 px-4 font-semibold text-[#32130E]">
                      {r.nombre}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs px-2 py-0.5 rounded-md bg-green-100 text-green-800 font-semibold">
                        {r.estado ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenModal(r)}
                        className="p-1 text-[#572219] hover:bg-[#F5EBE1] rounded-md transition"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleEstadoRol(r)}
                        className={`p-1 rounded-md transition ${
                          r.estado
                            ? "text-red-600 hover:bg-red-50"
                            : "text-green-600 hover:bg-green-50"
                        }`}
                        title={r.estado ? "Desactivar" : "Activar"}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {roles.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-8 text-xs text-[#7A5C55]"
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

      {/* MODAL */}
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
                <label className="block text-xs font-semibold text-[#572219] mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-[#D8C3B3] rounded-lg text-sm text-[#32130E] focus:outline-none focus:ring-2 focus:ring-[#572219]"
                  value={formUser.nombre}
                  onChange={(e) =>
                    setFormUser({ ...formUser, nombre: e.target.value })
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
                  className="w-full px-3 py-2 border border-[#D8C3B3] rounded-lg text-sm text-[#32130E] focus:outline-none focus:ring-2 focus:ring-[#572219]"
                  value={formUser.apellido}
                  onChange={(e) =>
                    setFormUser({ ...formUser, apellido: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#572219] mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                className="w-full px-3 py-2 border border-[#D8C3B3] rounded-lg text-sm text-[#32130E] focus:outline-none focus:ring-2 focus:ring-[#572219]"
                value={formUser.correo}
                onChange={(e) =>
                  setFormUser({ ...formUser, correo: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#572219] mb-1">
                  Teléfono
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-[#D8C3B3] rounded-lg text-sm text-[#32130E] focus:outline-none focus:ring-2 focus:ring-[#572219]"
                  value={formUser.telefono}
                  onChange={(e) =>
                    setFormUser({ ...formUser, telefono: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#572219] mb-1">
                  Rol
                </label>
                <select
                  value={formUser.idrol}
                  onChange={(e) =>
                    setFormUser({ ...formUser, idrol: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-[#D8C3B3] rounded-lg text-sm text-[#32130E] bg-white focus:outline-none focus:ring-2 focus:ring-[#572219]"
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
              <label className="block text-xs font-semibold text-[#572219] mb-1">
                Contraseña{" "}
                {usuarioEditando && (
                  <span className="text-[#7A5C55] font-normal">(Opcional)</span>
                )}
              </label>
              <input
                type="password"
                required={!usuarioEditando}
                className="w-full px-3 py-2 border border-[#D8C3B3] rounded-lg text-sm text-[#32130E] focus:outline-none focus:ring-2 focus:ring-[#572219]"
                value={formUser.password}
                onChange={(e) =>
                  setFormUser({ ...formUser, password: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#F5EBE1]">
              <Button
                type="button"
                variant="outline"
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
              <label className="block text-xs font-semibold text-[#572219] mb-1">
                Nombre del Rol
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Estilista, Administrador"
                className="w-full px-3 py-2 border border-[#D8C3B3] rounded-lg text-sm text-[#32130E] focus:outline-none focus:ring-2 focus:ring-[#572219]"
                value={formRol.nombre}
                onChange={(e) => setFormRol({ nombre: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#F5EBE1]">
              <Button
                type="button"
                variant="outline"
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
