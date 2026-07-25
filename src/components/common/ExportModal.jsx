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

import { useState, useEffect } from "react";
import {
  X,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  Clock,
  FileX,
  FileText,
} from "lucide-react";
import { exportToExcel, exportToCSV } from "@/utils/exportUtils";

const ExportModal = ({
  isOpen,
  onClose,
  exportConfig,
  title = "Export Data",
  description = "Export all data to Excel or CSV format. This may take a few minutes for large datasets.",
}) => {
  const [exportStatus, setExportStatus] = useState("idle");
  const [progress, setProgress] = useState({});
  const [error, setError] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState("excel"); // 'excel' or 'csv'

  useEffect(() => {
    if (!isOpen) {
      setExportStatus("idle");
      setProgress({});
      setError(null);
      setSelectedFormat("excel");
    }
  }, [isOpen]);

  const handleExport = async () => {
    if (!exportConfig) {
      setError("Export configuration is missing");
      return;
    }

    setExportStatus("exporting");
    setError(null);
    setProgress({ status: "starting", percent: 0 }); // Reset state cleanly at start

    try {
      const exportFunction =
        selectedFormat === "csv" ? exportToCSV : exportToExcel;

      await exportFunction({
        ...exportConfig,
        onProgress: (progressData) => {
          // Merge previous state to keep properties like 'totalFetched' available
          // even if the new event doesn't send them (e.g. during generation phase)
          setProgress((prev) => ({ ...prev, ...progressData }));
        },
        onSuccess: (result) => {
          setExportStatus("success");
          setProgress((prev) => ({ ...prev, ...result, percent: 100 }));
        },
        onError: (error) => {
          setExportStatus("error");
          setError(error.message || "Export failed. Please try again.");
        },
      });
    } catch (err) {
      setExportStatus("error");
      setError(err.message || "Export failed. Please try again.");
    }
  };

  const handleClose = () => {
    if (exportStatus !== "exporting") {
      onClose();
    }
  };

  // Improved progress width logic to prevent regression
  const getProgressWidth = () => {
    // If generating or success, we are effectively done with fetching, show 100%
    if (progress.status === "success" || progress.status === "generating") {
      return "100%";
    }
    
    // During fetching
    if (progress.currentPage && progress.totalPages) {
      const percent = (progress.currentPage / progress.totalPages) * 100;
      return `${Math.max(5, percent)}%`; // Ensure at least 5% visible
    }
    
    return "5%"; // Initial loading state
  };

  const getStatusIcon = () => {
    switch (exportStatus) {
      case "exporting":
        return <Clock className="w-5 h-5 text-warning animate-spin" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-success" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      default:
        return selectedFormat === "csv" ? (
          <FileText className="w-5 h-5 text-primary" />
        ) : (
          <FileSpreadsheet className="w-5 h-5 text-primary" />
        );
    }
  };

  const getStatusMessage = () => {
    switch (exportStatus) {
      case "exporting":
        if (progress.status === "starting") {
          return `Preparing ${selectedFormat.toUpperCase()} export...`;
        } else if (progress.status === "fetching") {
          return `Fetching data... (Page ${progress.currentPage || 1})`;
        } else if (progress.status === "processing") {
          return `Processing ${progress.totalFetched || 0} records...`;
        } else if (progress.status === "generating") {
          return `Generating ${selectedFormat.toUpperCase()} file...`;
        } else if (progress.status === "warning") {
          return progress.message;
        }
        return "Exporting data...";
      case "success":
        return `Successfully exported ${progress.totalRecords || progress.totalFetched || 0} records to ${progress.filename}`;
      case "error":
        return error || "Export failed";
      default:
        return description;
    }
  };

  const getFormatExtension = () => {
    return selectedFormat === "csv" ? ".csv" : ".xlsx";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
          onClick={handleClose}
        />

        <div className="relative transform overflow-hidden rounded-lg bg-card text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-border">
          <div className="bg-card px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {getStatusIcon()}
                <h3 className="text-lg font-semibold text-card-foreground">
                  {title}
                </h3>
              </div>
              {exportStatus !== "exporting" && (
                <button
                  onClick={handleClose}
                  className="rounded-md p-2 text-muted-foreground hover:text-card-foreground hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Format Selection */}
            {exportStatus === "idle" && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-card-foreground mb-3">
                  Choose Export Format:
                </label>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setSelectedFormat("excel")}
                    disabled={exportStatus === "exporting"}
                    className={`flex items-center w-6/12 gap-2 px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                      selectedFormat === "excel"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    <FileSpreadsheet className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">Excel</div>
                    </div>
                    {selectedFormat === "excel" && (
                      <div className="ml-2 w-2 h-2 bg-primary rounded-full"></div>
                    )}
                  </button>

                  <button
                    onClick={() => setSelectedFormat("csv")}
                    disabled={exportStatus === "exporting"}
                    className={`flex items-center w-6/12 gap-2 px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                      selectedFormat === "csv"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">CSV</div>
                    </div>
                    {selectedFormat === "csv" && (
                      <div className="ml-2 w-2 h-2 bg-primary rounded-full"></div>
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-4">
                {getStatusMessage()}
              </p>
              {exportStatus === "exporting" && (
                <div className="space-y-3">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                      style={{
                        width: getProgressWidth(),
                      }}
                    />
                  </div>
                  {(progress.totalFetched || progress.totalRecords) && (
                    <p className="text-xs text-muted-foreground text-center">
                      {progress.totalFetched || progress.totalRecords} records processed
                      {progress.totalPages &&
                        progress.status === "fetching" &&
                        ` (Page ${progress.currentPage || 1} of ${progress.totalPages})`}
                    </p>
                  )}
                </div>
              )}
              {exportStatus === "success" && (
                <div className="bg-success/10 border border-success/20 rounded-lg p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
                  <p className="text-sm font-medium text-success mb-1">
                    Export Complete!
                  </p>
                  <p className="text-xs text-success/80">
                    The {selectedFormat.toUpperCase()} file has been downloaded
                    to your computer.
                  </p>
                </div>
              )}
              {exportStatus === "error" && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
                  <FileX className="w-8 h-8 text-destructive mx-auto mb-2" />
                  <p className="text-sm font-medium text-destructive mb-1">
                    Export Failed
                  </p>
                  <p className="text-xs text-destructive/80">{error}</p>
                </div>
              )}

              {exportStatus === "idle" && exportConfig && (
                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Format:</span>
                    <span className="text-card-foreground font-medium">
                      {selectedFormat === "csv" ? "CSV" : "Excel"} (
                      {getFormatExtension()})
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fields:</span>
                    <span className="text-card-foreground font-medium">
                      {exportConfig.fieldMapping?.length || 0} columns
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Source:</span>
                    <span className="text-card-foreground font-medium">
                      All pages
                    </span>
                  </div>
                </div>
              )}

              {exportStatus === "idle" && (
                <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-warning">
                      <p className="font-medium mb-1">Important Notes:</p>
                      <ul className="space-y-1 text-warning/90">
                        <li>
                          • Large datasets may take several minutes to export
                        </li>
                        <li>
                          • The file will be automatically downloaded when ready
                        </li>
                        <li>• Do not close this window during export</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-muted/20 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-border">
            <button
              type="button"
              onClick={exportStatus === "idle" ? handleExport : handleClose}
              disabled={exportStatus === "exporting"}
              className={`inline-flex w-full justify-center items-center gap-2 rounded-md px-4 py-2 text-sm font-medium shadow-sm transition-all duration-200 sm:ml-3 sm:w-auto ${
                exportStatus === "idle"
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md hover:-translate-y-0.5"
                  : exportStatus === "success"
                    ? "bg-success text-success-foreground hover:bg-success/90"
                    : exportStatus === "error"
                      ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
              } ${exportStatus === "exporting" ? "cursor-not-allowed opacity-60" : ""}`}
            >
              {exportStatus === "exporting" ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  Exporting {selectedFormat.toUpperCase()}...
                </>
              ) : exportStatus === "success" ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Done
                </>
              ) : exportStatus === "error" ? (
                <>
                  <AlertCircle className="w-4 h-4" />
                  Try Again
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Start {selectedFormat === "csv" ? "CSV" : "Excel"} Export
                </>
              )}
            </button>

            {exportStatus !== "exporting" && (
              <button
                type="button"
                onClick={handleClose}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-background px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm ring-1 ring-inset ring-border hover:bg-muted hover:text-card-foreground transition-colors sm:mt-0 sm:w-auto"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;