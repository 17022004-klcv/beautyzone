declare global {
  interface Window {
    XLSX: any;
    jspdf: any;
  }
}

// EXPORTAR A EXCEL
export const exportToExcel = (data: any[], filename: string) => {
  if (typeof window === "undefined" || !window.XLSX) {
    console.error("SheetJS no se ha cargado correctamente.");
    return;
  }

  const worksheet = window.XLSX.utils.json_to_sheet(data);
  const workbook = window.XLSX.utils.book_new();
  window.XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");
  window.XLSX.writeFile(workbook, `${filename}.xlsx`);
};

// EXPORTAR A PDF
export const exportToPDF = (
  title: string,
  headers: string[],
  rows: (string | number)[][],
  filename: string,
) => {
  if (typeof window === "undefined" || !window.jspdf) {
    console.error("jsPDF no está disponible.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Título del documento
  doc.setFontSize(16);
  doc.setTextColor(50, 19, 14); // Color #32130E
  doc.text(title, 14, 20);

  // Fecha de emisión
  doc.setFontSize(9);
  doc.setTextColor(122, 92, 85); // Color #7A5C55
  doc.text(`Fecha: ${new Date().toLocaleDateString("es-ES")}`, 14, 27);

  // Generación de Tabla con AutoTable
  doc.autoTable({
    startY: 32,
    head: [headers],
    body: rows,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: {
      fillColor: [87, 34, 25], // Color #572219
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [245, 235, 225] }, // Color #F5EBE1
  });

  doc.save(`${filename}.pdf`);
};
