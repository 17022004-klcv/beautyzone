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
  const totalPages = Math.ceil(data.length / pageSize);

  const currentData = data.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="bg-[#FFFFFF] border border-[#D8C3B3] rounded-2xl overflow-hidden shadow-sm">
      <table className="w-full text-left text-xs text-[#32130E]">
        <thead className="bg-[#F5EBE1] border-b border-[#D8C3B3] text-[#32130E] font-semibold uppercase tracking-wider">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className="px-6 py-3.5">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#D8C3B3]/40">
          {currentData.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="hover:bg-[#F5EBE1]/50 transition-colors"
            >
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="px-6 py-4">
                  {typeof col.accessorKey === "function"
                    ? col.accessorKey(row)
                    : (row[col.accessorKey] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginación */}
      <div className="p-4 border-t border-[#D8C3B3] flex items-center justify-between bg-[#FFFFFF]">
        <span className="text-xs text-[#7A5C55]">
          Página {currentPage} de {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="p-1.5 rounded-lg border border-[#D8C3B3] text-[#32130E] hover:bg-[#F5EBE1] disabled:opacity-40 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="p-1.5 rounded-lg border border-[#D8C3B3] text-[#32130E] hover:bg-[#F5EBE1] disabled:opacity-40 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
