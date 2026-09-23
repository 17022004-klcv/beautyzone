export interface ProductoServicioItem {
  id: number;
  tipo: "SERVICIO" | "PRODUCTO";
  nombre: string;
  categoria: string;
  precio: number;
  stock?: number;
}

export interface ItemOrden {
  id: number;
  tipo: "SERVICIO" | "PRODUCTO";
  nombre: string;
  precio: number;
  cantidad: number;
  subtotal: number;
  estilistaId?: number;
}

export interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  correo?: string;
  telefono?: string | null;
}

export interface DetalleCitaItem {
  idservicio: number;
  servicio: {
    nombre: string;
    precio: number | string;
  };
  estilista: {
    id: number;
    nombre: string;
  };
}

export interface CitaPendiente {
  id: number;
  horaInicio: string;
  cliente: {
    id: number;
    nombre: string;
    apellido: string;
  };
  detallesCita: DetalleCitaItem[];
}

export interface CrearVentaPayload {
  cajaTurnoId?: number;
  idempleadoCaja: number;
  clienteId?: number;
  citaId?: number;
  metodoPago: "EFECTIVO" | "TARJETA" | "TRANSFERENCIA";
  montoTotal: number;
  items: Array<{
    itemId: number;
    tipo: "SERVICIO" | "PRODUCTO";
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
    estilistaId?: number;
  }>;
}
