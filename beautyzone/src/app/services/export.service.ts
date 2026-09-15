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

  static exportUsuarios(data: UsuarioItem[], format: "excel" | "pdf") {
    const dataFormatted = data.map((u) => ({
      ID: u.id,
      Nombre: `${u.nombre} ${u.apellido}`,
      Correo: u.correo,
      Teléfono: u.telefono || "N/A",
      Rol: u.rol?.nombre || "Sin Rol",
      Estado: u.estado ? "Activo" : "Inactivo",
    }));

    if (format === "excel") {
      console.log("Exportando usuarios a Excel...", dataFormatted);
      // Aquí utilizas tu librería de Excel (ej: xlsx / exceljs)
    } else {
      console.log("Exportando usuarios a PDF...", dataFormatted);
      // Aquí utilizas tu librería de PDF (ej: jspdf)
    }
  }

  static exportRoles(data: RoleItem[], format: "excel" | "pdf") {
    const dataFormatted = data.map((r) => ({
      ID: r.id,
      Nombre: r.nombre,
      Estado: r.estado ? "Activo" : "Inactivo",
    }));

    if (format === "excel") {
      console.log("Exportando roles a Excel...", dataFormatted);
    } else {
      console.log("Exportando roles a PDF...", dataFormatted);
    }
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
