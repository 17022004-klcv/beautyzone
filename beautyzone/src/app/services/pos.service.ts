import {
  ProductoServicioItem,
  Cliente,
  CitaPendiente,
  CrearVentaPayload,
} from "@/src/app/types/pos";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

export const POSService = {
  // 1. Obtener catálogo unificado de productos/servicios
  async obtenerCatalogo(): Promise<ProductoServicioItem[]> {
    const res = await fetch(`${API_BASE}/pos/catalogo`);
    if (!res.ok)
      throw new Error("Error al obtener el catálogo de productos y servicios");
    return res.json();
  },

  // 2. Obtener lista de clientes usando tu ruta real: /api/usuarios
  async obtenerClientes(): Promise<Cliente[]> {
    try {
      const res = await fetch(`${API_BASE}/usuarios?estado=true`);
      if (!res.ok) return [];
      const usuarios = await res.json();

      // Mapea al tipo Cliente que necesita el POS
      return usuarios.map((u: any) => ({
        id: u.id,
        nombre: u.nombre,
        apellido: u.apellido,
        correo: u.correo,
        telefono: u.telefono,
      }));
    } catch (error) {
      console.error("Error cargando usuarios/clientes:", error);
      return [];
    }
  },

  // 3. Obtener citas agendadas usando tu ruta real: /api/agenda
  async obtenerCitasPendientes(fecha?: string): Promise<CitaPendiente[]> {
    try {
      const fechaConsulta = fecha || new Date().toISOString().split("T")[0];
      const res = await fetch(`${API_BASE}/agenda?date=${fechaConsulta}`);
      if (!res.ok) return [];

      const citas = await res.json();

      // Filtra las citas en estado PENDIENTE si no vienen filtradas
      return citas
        .filter((c: any) => c.estado === "PENDIENTE")
        .map((c: any) => ({
          id: c.id,
          horaInicio: c.horaInicio,
          cliente: {
            id: c.cliente?.id || c.idcliente,
            nombre: c.cliente?.nombre || "Cliente",
            apellido: c.cliente?.apellido || "",
          },
          detallesCita: (c.detallesCita || []).map((d: any) => ({
            idservicio: d.idservicio,
            servicio: {
              nombre: d.servicio?.nombre || "Servicio",
              precio: d.precioHistorico || d.servicio?.precio || 0,
            },
            estilista: {
              id: d.estilista?.id || d.idestilista,
              nombre: d.estilista?.nombre || "Estilista",
            },
          })),
        }));
    } catch (error) {
      console.error("Error cargando agenda:", error);
      return [];
    }
  },

  // 4. Registrar la venta en POS
  async registrarVenta(payload: CrearVentaPayload) {
    const res = await fetch(`${API_BASE}/pos/ventas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        errorData.error || errorData.message || "Error al procesar la venta",
      );
    }
    return res.json();
  },

  // 5. Cierre de Turno de Caja usando tu ruta real: /api/caja/cierre
  async realizarCierreX(
    idcajaTurno: number,
    passwordPin: string,
    montoCierreReal?: number,
  ) {
    const res = await fetch(`${API_BASE}/caja/cierre`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idcajaTurno,
        passwordPin,
        montoCierreReal,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Error al realizar el cierre de caja");
    }
    return res.json();
  },
};
