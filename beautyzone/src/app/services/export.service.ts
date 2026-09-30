import { Producto, Categoria } from "@/src/app/types/producto";
import { exportToExcel } from "@/src/lib/exportUtils";
import { generatePDFWithTemplate } from "@/src/lib/pdfTemplate";
import { UsuarioItem, RoleItem } from "@/src/app/types/usuario";
import { AsistenciaItem } from "@/src/app/types/asistencia";

export class ExportService {
  // EXPORTAR PRODUCTOS
  static exportProductos(productos: Producto[], format: "excel" | "pdf") {
    if (format === "excel") {
      const data = productos.map((p) => ({
        ID: p.id,
        Nombre: p.nombre,
        Categoría: p.categoria?.nombre || "Sin Categoría",
        Precio: `$${Number(p.precio).toFixed(2)}`,
        Stock: p.stock,
        "Stock Mínimo": p.stockMinimo ?? "N/A",
        Estado: p.estado ? "Activo" : "Inactivo",
      }));
      exportToExcel(data, "Reporte_Productos");
    } else {
      generatePDFWithTemplate({
        title: "Reporte de Inventario de Productos",
        subtitle: `Listado detallado de existencias acumuladas (${productos.length} registros)`,
        headers: ["ID", "Nombre", "Categoría", "Precio", "Stock", "Estado"],
        rows: productos.map((p) => [
          p.id,
          p.nombre,
          p.categoria?.nombre || "N/A",
          `$${Number(p.precio).toFixed(2)}`,
          `${p.stock} uds.`,
          p.estado ? "Activo" : "Inactivo",
        ]),
        filename: "Reporte_Productos_BeautyZone",
      });
    }
  }

  // EXPORTAR CATEGORÍAS
  static exportCategorias(
    categorias: Categoria[],
    format: "excel" | "pdf",
  ) {
    if (format === "excel") {
      const data = categorias.map((c) => ({
        ID: c.id,
        Nombre: c.nombre,
        Tipo: c.tipo,
        Estado: c.estado ? "Activo" : "Inactivo",
      }));
      exportToExcel(data, "Reporte_Categorias");
    } else {
      generatePDFWithTemplate({
        title: "Reporte de Categorías",
        subtitle: `Listado de clasificación de productos y servicios (${categorias.length} registros)`,
        headers: ["ID", "Nombre Categoría", "Tipo", "Estado"],
        rows: categorias.map((c) => [
          c.id,
          c.nombre,
          c.tipo,
          c.estado ? "Activo" : "Inactivo",
        ]),
        filename: "Reporte_Categorias_BeautyZone",
      });
    }
  }

  // EXPORTAR UN SOLO PRODUCTO (ficha)
  static exportarProducto(producto: Producto) {
    generatePDFWithTemplate({
      title: `Ficha de Producto`,
      subtitle: producto.categoria?.nombre || "Sin Categoría",
      headers: ["Campo", "Detalle"],
      rows: [
        ["ID", producto.id],
        ["Nombre", producto.nombre],
        ["Categoría", producto.categoria?.nombre || "N/A"],
        ["Descripción", producto.descripcion || "Sin descripción"],
        ["Precio", `$${Number(producto.precio).toFixed(2)}`],
        ["Stock", `${producto.stock} uds.`],
        ["Stock mínimo", producto.stockMinimo ?? "N/A"],
        ["Estado", producto.estado ? "Activo" : "Inactivo"],
      ],
      filename: `Producto_${producto.nombre}`.replace(/\s+/g, "_"),
    });
  }

  // EXPORTAR UNA SOLA CATEGORÍA (ficha)
  static exportarCategoria(categoria: Categoria) {
    generatePDFWithTemplate({
      title: `Ficha de Categoría`,
      subtitle: `Clasificación de tipo ${categoria.tipo}`,
      headers: ["Campo", "Detalle"],
      rows: [
        ["ID", categoria.id],
        ["Nombre", categoria.nombre],
        ["Tipo", categoria.tipo],
        ["Estado", categoria.estado ? "Activo" : "Inactivo"],
      ],
      filename: `Categoria_${categoria.nombre}`.replace(/\s+/g, "_"),
    });
  }

  static exportUsuarios(data: UsuarioItem[], format: "excel" | "pdf") {
    if (format === "excel") {
      const filas = data.map((u) => ({
        ID: u.id,
        Nombre: `${u.nombre} ${u.apellido}`,
        Correo: u.correo,
        Teléfono: u.telefono || "N/A",
        Rol: u.rol?.nombre || "Sin Rol",
        Estado: u.estado ? "Activo" : "Inactivo",
      }));
      exportToExcel(filas, "Reporte_Usuarios");
    } else {
      generatePDFWithTemplate({
        title: "Reporte de Usuarios",
        subtitle: `Listado del personal registrado (${data.length} registros)`,
        headers: [
          "ID",
          "Nombre",
          "Correo",
          "Teléfono",
          "Rol",
          "Estado",
        ],
        rows: data.map((u) => [
          u.id,
          `${u.nombre} ${u.apellido}`,
          u.correo,
          u.telefono || "N/A",
          u.rol?.nombre || "Sin Rol",
          u.estado ? "Activo" : "Inactivo",
        ]),
        filename: "Reporte_Usuarios_BeautyZone",
      });
    }
  }

  static exportRoles(data: RoleItem[], format: "excel" | "pdf") {
    if (format === "excel") {
      const filas = data.map((r) => ({
        ID: r.id,
        Nombre: r.nombre,
        Estado: r.estado ? "Activo" : "Inactivo",
      }));
      exportToExcel(filas, "Reporte_Roles");
    } else {
      generatePDFWithTemplate({
        title: "Reporte de Roles",
        subtitle: `Niveles de acceso del sistema (${data.length} registros)`,
        headers: ["ID", "Nombre Rol", "Estado"],
        rows: data.map((r) => [
          r.id,
          r.nombre,
          r.estado ? "Activo" : "Inactivo",
        ]),
        filename: "Reporte_Roles_BeautyZone",
      });
    }
  }

  // EXPORTAR UN SOLO USUARIO (ficha)
  static exportarUsuario(usuario: UsuarioItem) {
    generatePDFWithTemplate({
      title: "Ficha de Usuario",
      subtitle: `${usuario.nombre} ${usuario.apellido}`,
      headers: ["Campo", "Detalle"],
      rows: [
        ["ID", usuario.id],
        ["Nombre", `${usuario.nombre} ${usuario.apellido}`],
        ["Correo", usuario.correo],
        ["Teléfono", usuario.telefono || "N/A"],
        ["Rol", usuario.rol?.nombre || "Sin Rol"],
        ["Estado", usuario.estado ? "Activo" : "Inactivo"],
        [
          "Registrado",
          usuario.createdAt
            ? new Date(usuario.createdAt).toLocaleDateString("es-SV")
            : "N/A",
        ],
      ],
      filename: `Usuario_${usuario.nombre}_${usuario.apellido}`.replace(
        /\s+/g,
        "_",
      ),
    });
  }

  // EXPORTAR UN SOLO ROL (ficha)
  static exportarRol(rol: RoleItem) {
    generatePDFWithTemplate({
      title: "Ficha de Rol",
      subtitle: rol.nombre,
      headers: ["Campo", "Detalle"],
      rows: [
        ["ID", rol.id],
        ["Nombre", rol.nombre],
        ["Estado", rol.estado ? "Activo" : "Inactivo"],
        [
          "Registrado",
          rol.createdAt ? new Date(rol.createdAt).toLocaleDateString("es-SV") : "N/A",
        ],
      ],
      filename: `Rol_${rol.nombre}`.replace(/\s+/g, "_"),
    });
  }

  // Agregar dentro de la clase ExportService
  static exportAsistencias(data: AsistenciaItem[], format: "excel" | "pdf") {
    const dataFormatted = data.map((a) => ({
      ID: a.id,
      Empleado: a.empleado
        ? `${a.empleado.nombre} ${a.empleado.apellido}`
        : "N/A",
      Fecha: new Date(a.fecha).toLocaleDateString("es-SV"),
      Hora: a.hora,
      Tipo: a.tipoRegistro.replace("_", " "),
    }));

    if (format === "excel") {
      console.log("Exportando asistencias a Excel...", dataFormatted);
      // Lógica para descargar Excel
    } else {
      console.log("Exportando asistencias a PDF...", dataFormatted);
      // Lógica para descargar PDF
    }
  }
}
