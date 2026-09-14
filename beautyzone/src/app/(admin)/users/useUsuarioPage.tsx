"use client";

import { useState, useEffect, useCallback } from "react";
import {
  UsuarioItem,
  RoleItem,
  CreateUsuarioDTO,
} from "@/src/app/types/usuario";

export function useUsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<number | "ALL">("ALL");
  const [activeTab, setActiveTab] = useState<"usuarios" | "roles">("usuarios");

  // Modales
  const [isUsuarioModalOpen, setIsUsuarioModalOpen] = useState(false);
  const [isRolModalOpen, setIsRolModalOpen] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<UsuarioItem | null>(
    null,
  );
  const [rolEditando, setRolEditando] = useState<RoleItem | null>(null);

  // Cargar datos de la API
  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const [resUsuarios, resRoles] = await Promise.all([
        fetch("/api/usuarios"),
        fetch("/api/roles"),
      ]);

      if (resUsuarios.ok && resRoles.ok) {
        const dataUsuarios = await resUsuarios.json();
        const dataRoles = await resRoles.json();
        setUsuarios(dataUsuarios);
        setRoles(dataRoles);
      }
    } catch (error) {
      console.error("Error al cargar usuarios y roles:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Guardar/Editar Usuario
  const guardarUsuario = async (data: CreateUsuarioDTO, id?: number) => {
    const url = id ? `/api/usuarios/${id}` : "/api/usuarios";
    const method = id ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      cargarDatos();
      setIsUsuarioModalOpen(false);
      setUsuarioEditando(null);
    } else {
      const err = await res.json();
      alert(err.error || "Error al guardar el usuario");
    }
  };

  // Toggle Estado Usuario
  const toggleEstadoUsuario = async (usuario: UsuarioItem) => {
    const res = await fetch(`/api/usuarios/${usuario.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: !usuario.estado }),
    });

    if (res.ok) {
      cargarDatos();
    }
  };

  // Guardar/Editar Rol
  const guardarRol = async (nombre: string, id?: number) => {
    const url = id ? `/api/roles/${id}` : "/api/roles";
    const method = id ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre }),
    });

    if (res.ok) {
      cargarDatos();
      setIsRolModalOpen(false);
      setRolEditando(null);
    } else {
      const err = await res.json();
      alert(err.error || "Error al guardar el rol");
    }
  };

  // Filtrado de usuarios en cliente
  const usuariosFiltrados = usuarios.filter((user) => {
    const coincideTexto =
      `${user.nombre} ${user.apellido} ${user.correo} ${user.telefono || ""}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const coincideRol = roleFilter === "ALL" || user.idrol === roleFilter;

    return coincideTexto && coincideRol;
  });

  return {
    usuarios: usuariosFiltrados,
    roles,
    loading,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    activeTab,
    setActiveTab,
    isUsuarioModalOpen,
    setIsUsuarioModalOpen,
    isRolModalOpen,
    setIsRolModalOpen,
    usuarioEditando,
    setUsuarioEditando,
    rolEditando,
    setRolEditando,
    guardarUsuario,
    toggleEstadoUsuario,
    guardarRol,
  };
}
