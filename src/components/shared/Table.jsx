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
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

const Table = ({
  table,
  isLoading = false,
  totalCount = 0,
  cellPadding = "py-0.5",
  // Default height is a fixed viewport-relative calc, tuned for pages where
  // the table sits right below a thin header. Pages with a taller filter
  // area above the table (e.g. multi-field log search forms) need the
  // table to fill whatever space its flex parent actually gives it instead,
  // or the page ends up with two independent scrollbars (page + table).
  fillContainer = false,
}) => {
  const skeletonRows = Array(5).fill(null);
  const visibleColumns = table.getHeaderGroups()[0]?.headers || [];
  const [pageInput, setPageInput] = useState("");
  const [focusedRowIndex, setFocusedRowIndex] = useState(-1);
  const [isKeyboardNav, setIsKeyboardNav] = useState(false);
  const tableBodyRef = useRef(null);

  // Get current pagination state
  const currentPage = table.getState().pagination.pageIndex + 1;
  const pageSize = table.getState().pagination.pageSize;
  const totalPages = table.getPageCount();

  // Calculate pagination display values
  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalCount);
  const endItem = Math.min(currentPage * pageSize, totalCount);

  // Helper function to get alignment class (respects external alignment)
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

  // Handle manual page navigation
  const handlePageInputSubmit = (e) => {
    e.preventDefault();
    const pageNumber = parseInt(pageInput);
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      table.setPageIndex(pageNumber - 1);
      setPageInput("");
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      const rows = table.getRowModel().rows;
      if (rows.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setIsKeyboardNav(true);
        setFocusedRowIndex((prev) => Math.min(prev + 1, rows.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setIsKeyboardNav(true);
        setFocusedRowIndex((prev) => Math.max(prev - 1, -1));
      } else if (e.key === "Enter" && focusedRowIndex >= 0) {
        e.preventDefault();
        const row = rows[focusedRowIndex];
        const firstCell = row.getVisibleCells()[0];
        if (firstCell) {
          const linkElement = document.querySelector(
            `[data-row-id="${row.id}"] a`,
          );
          if (linkElement) {
            linkElement.click();
          }
        }
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardNav(false);
      setFocusedRowIndex(-1);
    };

    if (tableBodyRef.current) {
      tableBodyRef.current.addEventListener("keydown", handleKeyDown);
      tableBodyRef.current.addEventListener("mousedown", handleMouseDown);
      return () => {
        tableBodyRef.current?.removeEventListener("keydown", handleKeyDown);
        tableBodyRef.current?.removeEventListener("mousedown", handleMouseDown);
      };
    }
  }, [focusedRowIndex, table]);

  // Auto-scroll focused row into view
  useEffect(() => {
    if (focusedRowIndex >= 0 && isKeyboardNav && tableBodyRef.current) {
      const rows = table.getRowModel().rows;
      const focusedRow = document.querySelector(
        `[data-row-id="${rows[focusedRowIndex]?.id}"]`,
      );

      if (focusedRow) {
        focusedRow.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  }, [focusedRowIndex, isKeyboardNav, table]);

  return (
    <>
      <div
        className={`w-full shadow-lg overflow-hidden rounded-lg bg-card border border-border ${fillContainer ? "h-full flex flex-col" : "h-[calc(100vh-140px)]"}`}
      >
        <div
          className={`w-full overflow-auto relative ${fillContainer ? "flex-1 min-h-0" : "h-[calc(100vh-198px)]"}`}
          ref={tableBodyRef}
          tabIndex={0}
        >
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
                      data-row-id={row.id}
                      className={`bg-card hover:bg-primary/10 transition-colors duration-150 
                      ${rowIndex % 2 === 1 ? "bg-muted/10" : ""}
                      ${isKeyboardNav && focusedRowIndex === rowIndex ? "ring-2 ring-primary ring-inset" : ""}`}
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

        <div
          className={`flex items-center justify-between px-6 py-3 border-t border-border bg-muted/20 ${fillContainer ? "shrink-0" : ""}`}
        >
          <div className="flex items-center gap-3">
            <label
              htmlFor="pageSize"
              className="text-sm font-medium text-foreground/70"
            >
              Show:
            </label>
            <select
              id="pageSize"
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
              className="border border-border rounded-md px-3 py-1.5 text-sm bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 min-w-[70px]"
            >
              {[10, 15, 25, 50, 100].map((pageSize) => (
                <option
                  key={pageSize}
                  value={pageSize}
                  className="bg-background text-foreground"
                >
                  {pageSize}
                </option>
              ))}
            </select>
            <span className="text-sm text-foreground/70">entries</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground/70">
              {totalCount > 0 && (
                <>
                  Showing {startItem} to {endItem} of {totalCount} entries
                </>
              )}
              {totalCount === 0 && !isLoading && <>No entries found</>}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => table.firstPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground disabled:opacity-40 disabled:cursor-not-allowed text-foreground/60 hover:text-foreground transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label="Go to first page"
              title="First page"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground disabled:opacity-40 disabled:cursor-not-allowed text-foreground/60 hover:text-foreground transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label="Go to previous page"
              title="Previous page"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-1 mx-2">
              <span className="text-sm text-foreground/70">Page</span>
              <form onSubmit={handlePageInputSubmit} className="inline-flex">
                <input
                  type="text"
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  placeholder={currentPage.toString()}
                  className="w-14 px-2 py-1 text-sm text-center font-semibold text-primary bg-primary/10 rounded-md border border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                  onBlur={() => setPageInput("")}
                  title="Type page number and press Enter"
                />
              </form>
              <span className="text-sm text-foreground/70">
                of {totalPages}
              </span>
            </div>

            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground disabled:opacity-40 disabled:cursor-not-allowed text-foreground/60 hover:text-foreground transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label="Go to next page"
              title="Next page"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => table.lastPage()}
              disabled={!table.getCanNextPage()}
              className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground disabled:opacity-40 disabled:cursor-not-allowed text-foreground/60 hover:text-foreground transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label="Go to last page"
              title="Last page"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Table;
