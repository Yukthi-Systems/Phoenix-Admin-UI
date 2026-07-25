/*
 * Copyright (C) 2026 Yukthi Systems Private Limited
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * version 3 along with this program. If not, see
 * <https://www.gnu.org/licenses/>.
 */

import { flexRender } from "@tanstack/react-table";

const TableWithoutPagination = ({ 
  table, 
  isLoading = false,
  cellPadding = "py-0.5" 
}) => {
  const skeletonRows = Array(5).fill(null);
  const visibleColumns = table.getHeaderGroups()[0]?.headers || [];

  // Helper function to get alignment class
  const getAlignmentClass = (column) => {
    const align = column.columnDef.meta?.align || "center";
    switch (align) {
      case "center":
        return "text-center";
      case "right":
        return "text-right";
      case "left":
      default:
        return "text-left";
    }
  };

  return (
    <div className="w-full h-[calc(100vh-150px)] shadow-lg overflow-hidden rounded-lg bg-card border border-border">
      <div className="w-full h-full overflow-auto relative">
        <table className="min-w-full">
          <thead className="bg-muted sticky top-0 left-0 z-[10] border-b-2 border-primary/20">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header, index) => (
                  <th
                    key={header.id}
                    className={`px-4 py-2 font-bold text-foreground text-sm bg-muted 
                      ${getAlignmentClass(header.column)}
                      ${index === 0 ? "pl-6" : ""}`}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border/50">
            {isLoading
              ? skeletonRows.map((_, rowIndex) => (
                  <tr
                    key={`skeleton-${rowIndex}`}
                    className="bg-card hover:bg-muted/20 transition-colors duration-150"
                  >
                    {visibleColumns.map((header, colIndex) => (
                      <td
                        key={`skeleton-${rowIndex}-${colIndex}`}
                        className={`px-4 ${cellPadding} ${colIndex === 0 ? "pl-6" : ""}`}
                      >
                        <div className="h-4 w-full rounded bg-muted animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              : table.getRowModel().rows.map((row, rowIndex) => (
                  <tr
                    key={row.id}
                    className={`bg-card hover:bg-primary/10 transition-colors duration-150 
                    ${rowIndex % 2 === 1 ? "bg-muted/10" : ""}`}
                  >
                    {row.getVisibleCells().map((cell, cellIndex) => (
                      <td
                        key={cell.id}
                        className={`px-4 ${cellPadding} text-sm text-foreground  
                        ${getAlignmentClass(cell.column)}
                        ${cellIndex === 0 ? "pl-6" : ""} 
                        ${cell.column.id === "select" ? "w-12" : ""}`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>

        {!isLoading && table.getRowModel().rows.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <div className="text-center">
              <p className="text-sm">No data available</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableWithoutPagination;