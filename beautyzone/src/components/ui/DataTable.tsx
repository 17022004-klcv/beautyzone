import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Column<T> {
  header: string;
  accessorKey: keyof T | ((row: T) => React.ReactNode);
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pageSize?: number;
}

export default function DataTable<T>({
  columns,
  data,
  pageSize = 10,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const currentData = data.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="bg-white/50 backdrop-blur-xl border border-white/100 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(50,19,14,0.04)] animate__animated animate__fadeIn">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white/40 text-xs font-bold text-[#32130E]">
            <tr className="border-b border-[#32130E]/10 text-xs font-bold text-[#32130E]">
              {columns.map((col, index) => (
                <th key={index} className="py-3 px-4 whitespace-nowrap">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#32130E]/5">
            {currentData.length > 0 ? (
              currentData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-white/60 transition-colors text-xs font-medium"
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="py-3.5 px-4">
                      {typeof col.accessorKey === "function"
                        ? col.accessorKey(row)
                        : (row[col.accessorKey] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-12 text-xs text-[#7A5C55] font-semibold"
                >
                  No se encontraron registros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-[#32130E]/5 flex items-center justify-between bg-transparent">
        <span className="text-xs font-semibold text-[#7A5C55]">
          Página {currentPage} de {totalPages}
        </span>

        <div className="flex gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((page) => page - 1)}
            className="p-2 rounded-xl border border-white bg-white/80 text-[#32130E] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
            title="Página anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((page) => page + 1)}
            className="p-2 rounded-xl border border-white bg-white/80 text-[#32130E] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
            title="Página siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
