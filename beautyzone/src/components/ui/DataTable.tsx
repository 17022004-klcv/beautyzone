"use client";

import { useState } from "react";
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
  pageSize = 5,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));

  const currentData = data.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="bg-white/50 backdrop-blur-xl border border-white/90 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(50,19,14,0.05)]">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#32130E]">
          <thead className="bg-white/80 border-b border-white text-[#32130E] font-bold uppercase tracking-wider">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className="px-6 py-4">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/60">
            {currentData.length > 0 ? (
              currentData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-white/60 transition-colors"
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 font-medium">
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
                  className="px-6 py-8 text-center text-[#7A5C55]"
                >
                  No se encontraron registros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="p-4 border-t border-white/60 flex items-center justify-between bg-white/40">
        <span className="text-xs font-semibold text-[#7A5C55]">
          Página {currentPage} de {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="p-2 rounded-xl border border-white bg-white/80 text-[#32130E] hover:bg-white disabled:opacity-40 transition-all shadow-xs"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="p-2 rounded-xl border border-white bg-white/80 text-[#32130E] hover:bg-white disabled:opacity-40 transition-all shadow-xs"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
