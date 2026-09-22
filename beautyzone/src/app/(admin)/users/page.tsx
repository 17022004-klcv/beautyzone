"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Download,
  FileSpreadsheet,
  FileText,
  Edit,
  Power,
  Loader2,
} from "lucide-react";
import Button from "@/src/components/ui/Button";
import Modal from "@/src/components/ui/Modal";
import CategoryFilter from "@/src/components/ui/CategoryFilter";
import SearchBar from "@/src/components/ui/SearchBar";
import SearchableSelect from "@/src/components/ui/SearchableSelect";
import Table from "@/src/components/ui/DataTable";
import { UsuarioItem, RoleItem } from "@/src/app/types/usuario";
import { ExportService } from "@/src/app/services/export.service";

const TABS = ["Usuarios", "Roles"];

const ESTADO_OPTIONS = [
  { label: "Todos los estados", value: "ALL" },
  { label: "Activos", value: "ACTIVE" },
  { label: "Inactivos", value: "INACTIVE" },
];

export default function UsuariosView() {
  const [activeTab, setActiveTab] = useState("Usuarios");
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Estados para Filtros y Búsqueda
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEstadoFilter, setSelectedEstadoFilter] = useState("ALL");
  const [selectedRolFilter, setSelectedRolFilter] = useState("ALL");

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

  // Cargar datos
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

  // Limpiar filtros al cambiar de pestaña
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchQuery("");
    setSelectedEstadoFilter("ALL");
    setSelectedRolFilter("ALL");
  };

  // Opciones para el filtro de roles en usuarios
  const rolOptions = useMemo(() => {
    const opts = roles.map((r) => ({ label: r.nombre, value: String(r.id) }));
    return [{ label: "Todos los roles", value: "ALL" }, ...opts];
  }, [roles]);

  // Filtrado dinámico de Usuarios
  const filteredUsuarios = useMemo(() => {
    return usuarios.filter((u) => {
      const fullText =
        `${u.nombre} ${u.apellido} ${u.correo} ${u.telefono || ""}`.toLowerCase();
      const matchesSearch = fullText.includes(searchQuery.toLowerCase());

      const matchesEstado =
        selectedEstadoFilter === "ALL" ||
        (selectedEstadoFilter === "ACTIVE" && u.estado) ||
        (selectedEstadoFilter === "INACTIVE" && !u.estado);

      const matchesRol =
        selectedRolFilter === "ALL" || String(u.idrol) === selectedRolFilter;

      return matchesSearch && matchesEstado && matchesRol;
    });
  }, [usuarios, searchQuery, selectedEstadoFilter, selectedRolFilter]);

  // Filtrado dinámico de Roles
  const filteredRoles = useMemo(() => {
    return roles.filter((r) => {
      const matchesSearch = r.nombre
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesEstado =
        selectedEstadoFilter === "ALL" ||
        (selectedEstadoFilter === "ACTIVE" && r.estado) ||
        (selectedEstadoFilter === "INACTIVE" && !r.estado);

      return matchesSearch && matchesEstado;
    });
  }, [roles, searchQuery, selectedEstadoFilter]);

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

  // Toggle Estado Usuario
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
      ExportService.exportUsuarios?.(filteredUsuarios, format);
    } else {
      ExportService.exportRoles?.(filteredRoles, format);
    }
    setShowExportMenu(false);
  };

  // Definición de Columnas para Usuarios
  const usuarioColumns = [
    {
      header: "Nombre Completo",
      accessorKey: (u: UsuarioItem) => (
        <span className="font-bold text-[#32130E]">
          {u.nombre} {u.apellido}
        </span>
      ),
    },
    {
      header: "Correo",
      accessorKey: (u: UsuarioItem) => (
        <span className="text-[#7A5C55]">{u.correo}</span>
      ),
    },
    {
      header: "Teléfono",
      accessorKey: (u: UsuarioItem) => (
        <span className="text-[#7A5C55]">{u.telefono || "-"}</span>
      ),
    },
    {
      header: "Rol",
      accessorKey: (u: UsuarioItem) => (
        <span className="bg-white/80 text-[#32130E] px-2.5 py-1 rounded-full text-[10px] font-bold border border-white shadow-2xs">
          {u.rol?.nombre || "Sin Rol"}
        </span>
      ),
    },
    {
      header: "Estado",
      accessorKey: (u: UsuarioItem) => (
        <span
          className={`text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${
            u.estado
              ? "bg-[#2E6F40]/10 border-[#2E6F40]/20 text-[#2E6F40]"
              : "bg-[#B83A3A]/10 border-[#B83A3A]/20 text-[#B83A3A]"
          }`}
        >
          {u.estado ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      header: "Acciones",
      accessorKey: (u: UsuarioItem) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => handleOpenModal(u)}
            className="p-1.5 text-[#32130E] hover:bg-white/80 rounded-xl transition border border-transparent hover:border-white/80 shadow-2xs cursor-pointer"
            title="Editar"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => toggleEstadoUsuario(u)}
            className={`p-1.5 rounded-xl transition border border-transparent hover:border-white/80 shadow-2xs cursor-pointer ${
              u.estado
                ? "text-[#B83A3A] hover:bg-[#B83A3A]/10"
                : "text-[#2E6F40] hover:bg-[#2E6F40]/10"
            }`}
            title={u.estado ? "Desactivar" : "Activar"}
          >
            <Power className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  // Definición de Columnas para Roles
  const rolColumns = [
    {
      header: "ID",
      accessorKey: (r: RoleItem) => (
        <span className="text-[#7A5C55]">#{r.id}</span>
      ),
    },
    {
      header: "Nombre del Rol",
      accessorKey: (r: RoleItem) => (
        <span className="font-bold text-[#32130E]">{r.nombre}</span>
      ),
    },
    {
      header: "Estado",
      accessorKey: (r: RoleItem) => (
        <span
          className={`text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${
            r.estado
              ? "bg-[#2E6F40]/10 border-[#2E6F40]/20 text-[#2E6F40]"
              : "bg-[#B83A3A]/10 border-[#B83A3A]/20 text-[#B83A3A]"
          }`}
        >
          {r.estado ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      header: "Acciones",
      accessorKey: (r: RoleItem) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => handleOpenModal(r)}
            className="p-1.5 text-[#32130E] hover:bg-white/80 rounded-xl transition border border-transparent hover:border-white/80 shadow-2xs cursor-pointer"
            title="Editar"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => toggleEstadoRol(r)}
            className={`p-1.5 rounded-xl transition border border-transparent hover:border-white/80 shadow-2xs cursor-pointer ${
              r.estado
                ? "text-[#B83A3A] hover:bg-[#B83A3A]/10"
                : "text-[#2E6F40] hover:bg-[#2E6F40]/10"
            }`}
            title={r.estado ? "Desactivar" : "Activar"}
          >
            <Power className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6 animate__animated animate__fadeIn">
      {/* HEADER SUPERIOR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#32130E]">
            Gestión de {activeTab}
          </h1>
          <p className="text-xs font-medium text-[#7A5C55] mt-1">
            Administra los usuarios del sistema y sus niveles de acceso
          </p>
        </div>

        {/* ACCIONES SUPERIORES */}
        <div className="flex items-center gap-3">
          {/* MENU DESCARGAR */}
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
              <div className="absolute right-0 mt-2 w-44 bg-white/90 backdrop-blur-2xl border border-white rounded-2xl shadow-[0_12px_30px_rgba(50,19,14,0.08)] z-30 overflow-hidden p-1 space-y-0.5 animate__animated animate__fadeIn">
                <button
                  onClick={() => handleExport("excel")}
                  className="w-full px-3 py-2 text-xs font-semibold text-[#32130E] hover:bg-[#32130E]/5 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  Excel (.xlsx)
                </button>
                <button
                  onClick={() => handleExport("pdf")}
                  className="w-full px-3 py-2 text-xs font-semibold text-[#32130E] hover:bg-[#32130E]/5 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-rose-600" />
                  PDF (.pdf)
                </button>
              </div>
            )}
          </div>

          {/* BOTON NUEVO */}
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

      {/* TABS DE NAVEGACIÓN */}
      <CategoryFilter
        categories={TABS}
        selectedCategory={activeTab}
        onSelectCategory={handleTabChange}
      />

      {/* SECCIÓN DE FILTROS Y BUSCADOR */}
      <div className="relative z-20 flex flex-wrap items-center gap-3 w-full">
        <div className="w-full sm:w-60">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={`Buscar ${activeTab.toLowerCase()}...`}
          />
        </div>

        {/* Filtro por Rol (Sólo vista Usuarios) */}
        {activeTab === "Usuarios" && (
          <div className="w-full sm:w-48">
            <SearchableSelect
              options={rolOptions}
              placeholder="Todos los roles"
              onSelect={setSelectedRolFilter}
            />
          </div>
        )}

        {/* Filtro por Estado (Ambas vistas) */}
        <div className="w-full sm:w-44">
          <SearchableSelect
            options={ESTADO_OPTIONS}
            placeholder="Todos los estados"
            onSelect={setSelectedEstadoFilter}
          />
        </div>
      </div>

      {/* TABLA PRINCIPAL CON CARGADOR NATIVO TAILWIND */}
      <div>
        {loading ? (
          <div className="bg-white/50 backdrop-blur-xl border border-white/90 rounded-3xl p-6 shadow-[0_8px_30px_rgba(50,19,14,0.04)] animate-pulse space-y-4">
            <div className="h-8 bg-[#32130E]/5 rounded-xl w-full" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-white/60 rounded-xl w-full" />
            ))}
          </div>
        ) : activeTab === "Usuarios" ? (
          <Table columns={usuarioColumns} data={filteredUsuarios} />
        ) : (
          <Table columns={rolColumns} data={filteredRoles} />
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
