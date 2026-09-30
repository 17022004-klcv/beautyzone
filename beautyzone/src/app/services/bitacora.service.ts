import type { Prisma } from "@prisma/client";
import { db } from "@/src/lib/db";
import { obtenerSesion, type SesionUsuario } from "@/src/lib/sesion";

/**
 * Registro de auditoría.
 *
 * `registrar` está pensado para usarse dentro de las rutas de escritura y
 * NUNCA propaga errores: si la bitácora falla, la operación de negocio que la
 * llamó sigue adelante. Perder una entrada de auditoría es preferible a tumbar
 * una venta o el cierre de caja por un problema de escritura.
 */

export type ResultadoBitacora = "EXITO" | "FALLO";

export interface EntradaBitacora {
  /** Verbo en pasado: CREO, ACTUALIZO, ELIMINO, INICIO_SESION, etc. */
  accion: string;
  /** Entidad afectada: Usuario, Venta, CajaTurno, ... */
  entidad: string;
  entidadId?: string | number | null;
  descripcion: string;
  /** Valores antes/después o contexto relevante. */
  datos?: unknown;
  resultado?: ResultadoBitacora;
  /** Actor explícito. Si se omite, se resuelve desde la cookie de sesión. */
  usuario?: SesionUsuario | null;
  metodo?: string | null;
  ruta?: string | null;
  ip?: string | null;
  userAgent?: string | null;
}

export interface FiltrosBitacora {
  idUsuario?: number;
  accion?: string;
  entidad?: string;
  resultado?: ResultadoBitacora;
  desde?: string;
  hasta?: string;
  busqueda?: string;
  page?: number;
  pageSize?: number;
}

/** Cabeceras que un proxy puede anteponer a la IP real del cliente. */
const CABECERAS_IP = [
  "x-forwarded-for",
  "x-real-ip",
  "cf-connecting-ip",
  "true-client-ip",
];

export interface ContextoPeticion {
  metodo: string | null;
  ruta: string | null;
  ip: string | null;
  userAgent: string | null;
}

/** Extrae IP y user-agent de una `Request` o de las cabeceras de la petición. */
export function contextoPeticion(entrada: Request | Headers): ContextoPeticion {
  const headers =
    entrada instanceof Request ? entrada.headers : (entrada as Headers);

  let ip: string | null = null;
  for (const nombre of CABECERAS_IP) {
    const valor = headers.get(nombre);
    if (valor) {
      // `x-forwarded-for` puede traer la cadena "cliente, proxy1, proxy2".
      ip = valor.split(",")[0]!.trim();
      break;
    }
  }
  if (!ip) ip = null;

  return {
    metodo: "method" in entrada ? (entrada as Request).method : null,
    ruta: headers.get("x-ruta") ?? null,
    ip,
    userAgent: headers.get("user-agent"),
  };
}

/** Construye el contexto a partir de una `Request` y su ruta real. */
export function contextoDesdeRequest(
  request: Request,
  ruta: string,
): ContextoPeticion {
  const base = contextoPeticion(request);
  return { ...base, ruta };
}

/** Serializa a algo que Prisma pueda guardar en un campo `Json`. */
function aJsonSeguro(valor: unknown): Prisma.InputJsonValue | undefined {
  if (valor === undefined || valor === null) return undefined;
  try {
    return JSON.parse(
      JSON.stringify(valor, (_clave, v) =>
        typeof v === "bigint" ? v.toString() : v,
      ),
    ) as Prisma.InputJsonValue;
  } catch {
    return { serializable: false };
  }
}

/**
 * El actor sale de la cookie de sesión, que solo existe dentro de una
 * petición. Los trabajos en segundo plano (ciclo de respaldos) no tienen
 * petición: ahí la entrada se guarda sin autor en vez de perderse.
 */
async function resolverActor(entrada: EntradaBitacora): Promise<SesionUsuario | null> {
  if (entrada.usuario !== undefined) return entrada.usuario;

  try {
    return await obtenerSesion();
  } catch {
    return null;
  }
}

export class BitacoraService {
  /**
   * Agrega una entrada. Nunca lanza: un fallo aquí no debe impedir la operación
   * de negocio que la registrarse.
   */
  static async registrar(entrada: EntradaBitacora): Promise<void> {
    try {
      const actor = await resolverActor(entrada);

      await db.bitacora.create({
        data: {
          idusuario: actor?.id ?? null,
          accion: entrada.accion,
          entidad: entrada.entidad,
          entidadId:
            entrada.entidadId === undefined || entrada.entidadId === null
              ? null
              : String(entrada.entidadId),
          descripcion: entrada.descripcion,
          datos: aJsonSeguro(entrada.datos),
          metodo: entrada.metodo ?? null,
          ruta: entrada.ruta ?? null,
          ip: entrada.ip ?? null,
          userAgent: entrada.userAgent?.slice(0, 400) ?? null,
          resultado: entrada.resultado ?? "EXITO",
        },
      });
    } catch (error) {
      // Deliberadamente silencioso. Se deja traza en la consola del servidor
      // para diagnosticar sin romper la acción del usuario.
      console.error("[bitacora] no se pudo registrar la entrada:", error);
    }
  }

  /** Lista paginada con los mismos filtros que usa la pantalla. */
  static async listar(filtros: FiltrosBitacora) {
    const page = Math.max(1, filtros.page ?? 1);
    const pageSize = Math.min(200, Math.max(1, filtros.pageSize ?? 25));
    const where = BitacoraService.construirWhere(filtros);

    const [total, entradas] = await Promise.all([
      db.bitacora.count({ where }),
      db.bitacora.findMany({
        where,
        include: { usuario: { select: { id: true, nombre: true, apellido: true, correo: true } } },
        orderBy: { id: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      total,
      page,
      pageSize,
      totalPaginas: Math.max(1, Math.ceil(total / pageSize)),
      entradas: entradas.map((e) => ({
        id: e.id,
        idUsuario: e.idusuario,
        usuario: e.usuario
          ? {
              id: e.usuario.id,
              nombre: `${e.usuario.nombre} ${e.usuario.apellido}`.trim(),
              correo: e.usuario.correo,
            }
          : null,
        accion: e.accion,
        entidad: e.entidad,
        entidadId: e.entidadId,
        descripcion: e.descripcion,
        datos: e.datos,
        metodo: e.metodo,
        ruta: e.ruta,
        ip: e.ip,
        userAgent: e.userAgent,
        resultado: e.resultado,
        fecha: e.createdAt.toISOString(),
      })),
    };
  }

  /** Opciones para poblar los filtros de la pantalla. */
  static async obtenerFiltrosDisponibles() {
    const [acciones, entidades, usuarios] = await Promise.all([
      db.bitacora.groupBy({ by: ["accion"], _count: { accion: true } }),
      db.bitacora.groupBy({ by: ["entidad"], _count: { entidad: true } }),
      db.usuario.findMany({
        where: { bitacoras: { some: {} } },
        select: { id: true, nombre: true, apellido: true },
        orderBy: { nombre: "asc" },
      }),
    ]);

    return {
      acciones: acciones
        .map((a) => ({ valor: a.accion, conteo: a._count.accion }))
        .sort((a, b) => a.valor.localeCompare(b.valor)),
      entidades: entidades
        .map((e) => ({ valor: e.entidad, conteo: e._count.entidad }))
        .sort((a, b) => a.valor.localeCompare(b.valor)),
      usuarios: usuarios.map((u) => ({
        id: u.id,
        nombre: `${u.nombre} ${u.apellido}`.trim(),
      })),
    };
  }

  private static construirWhere(filtros: FiltrosBitacora) {
    const where: Record<string, unknown> = {};

    if (filtros.idUsuario) where.idusuario = filtros.idUsuario;
    if (filtros.accion) where.accion = filtros.accion;
    if (filtros.entidad) where.entidad = filtros.entidad;
    if (filtros.resultado) where.resultado = filtros.resultado;

    if (filtros.desde || filtros.hasta) {
      const rango: Record<string, Date> = {};
      if (filtros.desde) {
        const d = new Date(filtros.desde);
        if (!Number.isNaN(d.getTime())) rango.gte = d;
      }
      if (filtros.hasta) {
        const d = new Date(filtros.hasta);
        if (!Number.isNaN(d.getTime())) {
          // El usuario elige un día completo, así que el límite superior es
          // exclusivo: se suma un día al final.
          d.setHours(23, 59, 59, 999);
          rango.lte = d;
        }
      }
      if (Object.keys(rango).length) where.createdAt = rango;
    }

    if (filtros.busqueda?.trim()) {
      where.OR = [
        { descripcion: { contains: filtros.busqueda.trim(), mode: "insensitive" } },
        { accion: { contains: filtros.busqueda.trim(), mode: "insensitive" } },
        { entidad: { contains: filtros.busqueda.trim(), mode: "insensitive" } },
      ];
    }

    return where;
  }
}
