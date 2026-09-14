declare global {
  interface Window {
    Swal: any;
  }
}

export const showAlert = (
  title: string,
  text: string,
  icon: "success" | "error" | "warning" | "info",
) => {
  if (typeof window !== "undefined" && window.Swal) {
    window.Swal.fire({
      title,
      text,
      icon,
      confirmButtonColor: "#572219", // Terracota / Café Profundo
      background: "#FFFFFF",
      color: "#32130E",
      customClass: {
        popup: "rounded-2xl border border-[#D8C3B3]",
      },
    });
  }
};

export const showConfirm = async (title: string, text: string) => {
  if (typeof window !== "undefined" && window.Swal) {
    const result = await window.Swal.fire({
      title,
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#572219",
      cancelButtonColor: "#7A5C55",
      confirmButtonText: "Sí, continuar",
      cancelButtonText: "Cancelar",
      background: "#FFFFFF",
      color: "#32130E",
      customClass: {
        popup: "rounded-2xl border border-[#D8C3B3]",
      },
    });
    return result.isConfirmed;
  }
  return false;
};
