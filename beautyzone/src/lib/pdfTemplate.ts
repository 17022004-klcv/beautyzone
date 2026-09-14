declare global {
  interface Window {
    jspdf: any;
  }
}

interface PDFOptions {
  title: string;
  subtitle?: string;
  headers: string[];
  rows: (string | number)[][];
  filename: string;
}

export const generatePDFWithTemplate = ({
  title,
  subtitle = "Reporte General del Sistema",
  headers,
  rows,
  filename,
}: PDFOptions) => {
  if (typeof window === "undefined" || !window.jspdf) {
    console.error("jsPDF no está disponible.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // CONFIGURE COLORES DE MARCA
  const primaryColor = [87, 34, 25]; // #572219
  const secondaryColor = [157, 75, 76]; // #9D4B4C
  const textColor = [50, 19, 14]; // #32130E
  const lightBg = [245, 235, 225]; // #F5EBE1

  // --- ENCABEZADO Y MEMBRETE ---
  // Barra superior decorativa
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 8, "F");

  // Nombre del Salón / Logo
  doc.setFont("serif", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...primaryColor);
  doc.text("BeautyZone", 14, 22);

  // Subtítulo del negocio
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...secondaryColor);
  doc.text("Sistema de Gestión & Punto de Venta", 14, 27);

  // Metadatos a la derecha (Fecha y Hora)
  const fechaActual = new Date().toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.setFontSize(8);
  doc.setTextColor(122, 92, 85);
  doc.text(`Fecha de emisión: ${fechaActual}`, 196, 22, { align: "right" });

  // Línea divisora
  doc.setDrawColor(216, 195, 179); // #D8C3B3
  doc.setLineWidth(0.5);
  doc.line(14, 31, 196, 31);

  // --- TÍTULO Y SUBTÍTULO DEL REPORTE ---
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...textColor);
  doc.text(title.toUpperCase(), 14, 40);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(122, 92, 85);
  doc.text(subtitle, 14, 45);

  // --- TABLA DINÁMICA DE CONTENIDO ---
  doc.autoTable({
    startY: 50,
    head: [headers],
    body: rows,
    styles: {
      fontSize: 8.5,
      cellPadding: 3.5,
      textColor: textColor,
    },
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "left",
    },
    alternateRowStyles: {
      fillColor: lightBg,
    },
    // Pie de página dinámico por cada hoja agregada
    didDrawPage: (data: any) => {
      const pageSize = doc.internal.pageSize;
      const pageHeight = pageSize.height
        ? pageSize.height
        : pageSize.getHeight();

      // Línea inferior del pie
      doc.setDrawColor(216, 195, 179);
      doc.line(14, pageHeight - 15, 196, pageHeight - 15);

      // Texto de pie de página
      doc.setFontSize(8);
      doc.setTextColor(122, 92, 85);
      doc.text(
        "BeautyZone - Documento generado automáticamente",
        14,
        pageHeight - 10,
      );

      // Número de Página
      const pageStr = `Página ${data.pageNumber}`;
      doc.text(pageStr, 196, pageHeight - 10, { align: "right" });
    },
  });

  // DESCARGAR ARCHIVO PDF
  doc.save(`${filename}.pdf`);
};
