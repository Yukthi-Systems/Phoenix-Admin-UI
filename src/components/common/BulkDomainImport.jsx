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

import { useState, useRef, useCallback, useMemo } from "react";
import {
  X,
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  Clock,
  FileX,
  FileText,
  Maximize2,
  Minimize2,
  Eye,
  Copy,
  Check,
} from "lucide-react";
import {
  processImportFile,
  bulkCreateItems,
  generateSampleFile,
  getRowIdentifier,
  downloadImportResults,
  buildResultsSummaryText,
} from "@/utils/importUtils";
// Import the domain-specific functions
import { processImportFileForDomains } from "@/utils/importUtils";
import { useAtomValue } from "jotai";
import { userInfoAtom } from "@/store/userInfo";

const BulkImportModalDomain = ({
  isOpen,
  onClose,
  importConfig,
  title = "Bulk Import",
  description = "Upload a CSV or Excel file to create multiple items at once.",
  onComplete,
  entityType = null,
}) => {
  const [importStatus, setImportStatus] = useState("idle");
  const [progress, setProgress] = useState({});
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [processedData, setProcessedData] = useState([]);
  const [results, setResults] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false); // Add expanded state
  const [resultsCopied, setResultsCopied] = useState(false);
  const fileInputRef = useRef(null);

  // Get organization_id for domain processing
  const { organization_id } = useAtomValue(userInfoAtom);

  // Add abort controller refs for cancellation
  const processAbortController = useRef(null);
  const createAbortController = useRef(null);

  // Helper to reset all state to initial values
  const resetState = useCallback(() => {
    setImportStatus("idle");
    setProgress({});
    setError(null);
    setSelectedFile(null);
    setProcessedData([]);
    setResults(null);
    setIsExpanded(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleClose = useCallback(() => {
    if (importStatus !== "processing" && importStatus !== "creating") {
      resetState();
      onClose();
    }
  }, [importStatus, onClose, resetState]);

  const handleRemoveFile = useCallback(() => {
    resetState();
  }, [resetState]);

  const handleCancel = useCallback(() => {
    // Cancel ongoing operations
    if (processAbortController.current) {
      processAbortController.current.abort();
      processAbortController.current = null;
    }
    if (createAbortController.current) {
      createAbortController.current.abort();
      createAbortController.current = null;
    }

    setImportStatus("cancelled");
    setProgress({});
    setError("Operation cancelled by user");

    setTimeout(() => {
      setImportStatus("idle");
      setError(null);
    }, 2000);
  }, []);

  const handleFileSelect = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      setImportStatus("idle");
      setProgress({});
      setError(null);
      setProcessedData([]);
      setResults(null);
      setSelectedFile(file);
    }
  }, []);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setImportStatus("idle");
      setProgress({});
      setError(null);
      setProcessedData([]);
      setResults(null);
      setSelectedFile(file);
    }
  }, []);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  const handleProcessFile = async () => {
    if (!selectedFile || !importConfig) return;

    setImportStatus("processing");
    setError(null);

    processAbortController.current = new AbortController();

    try {
      let data;

      if (entityType === "domains" || importConfig.entityType === "domains") {
        data = await processImportFileForDomains(
          selectedFile,
          importConfig.fieldMapping,
          organization_id,
          (progressData) => {
            if (processAbortController.current?.signal.aborted) {
              throw new Error("Operation cancelled");
            }
            setProgress(progressData);
          },
          (error) => setError(error.message),
          processAbortController.current.signal
        );
      } else {
        data = await processImportFile(
          selectedFile,
          importConfig.fieldMapping,
          (progressData) => {
            if (processAbortController.current?.signal.aborted) {
              throw new Error("Operation cancelled");
            }
            setProgress(progressData);
          },
          (error) => setError(error.message),
          processAbortController.current.signal
        );
      }

      if (processAbortController.current?.signal.aborted) {
        return;
      }

      setProcessedData(data);
      setImportStatus("ready");
      setProgress({
        status: "ready",
        message: `Successfully processed ${data.length} items. Ready to import.`,
        totalItems: data.length,
      });
    } catch (err) {
      if (err.name === "AbortError" || err.message === "Operation cancelled") {
        return;
      }
      console.error("Import processing error:", err);
      setImportStatus("error");
      setError(err.message);
    } finally {
      processAbortController.current = null;
    }
  };

  const handleBulkCreate = async () => {
    if (!processedData.length || !importConfig) return;

    setImportStatus("creating");
    setError(null);

    createAbortController.current = new AbortController();

    try {
      const results = await bulkCreateItems(
        processedData,
        importConfig.createFunction,
        (progressData) => {
          if (createAbortController.current?.signal.aborted) {
            throw new Error("Operation cancelled");
          }
          setProgress(progressData);
        },
        (itemResult) => {},
        createAbortController.current.signal
      );

      if (createAbortController.current?.signal.aborted) {
        return;
      }

      setResults(results);
      setImportStatus("success");
      setProgress({
        status: "complete",
        message: `Import complete! ${results.successful.length} items created successfully.`,
        successful: results.successful.length,
        failed: results.failed.length,
        total: results.total,
      });

      onComplete?.(results);
    } catch (err) {
      if (err.name === "AbortError" || err.message === "Operation cancelled") {
        return;
      }
      console.error("Bulk creation error:", err);
      setImportStatus("error");
      setError(err.message);
    } finally {
      createAbortController.current = null;
    }
  };

  const handleDownloadSample = useCallback(() => {
    if (!importConfig) return;
    generateSampleFile(
      importConfig.fieldMapping,
      "excel",
      importConfig.sampleFilename || "sample_import"
    );
  }, [importConfig]);

  const handleDownloadResults = useCallback(() => {
    if (!results || !importConfig) return;
    downloadImportResults(
      results,
      importConfig.fieldMapping,
      `${importConfig.sampleFilename || "import"}_results`,
    );
  }, [results, importConfig]);

  const handleCopyResults = useCallback(async () => {
    if (!results || !importConfig) return;
    const summary = buildResultsSummaryText(results, importConfig.fieldMapping);
    try {
      await navigator.clipboard.writeText(summary);
      setResultsCopied(true);
      setTimeout(() => setResultsCopied(false), 2000);
    } catch (e) {
      setError("Unable to copy results to clipboard");
    }
  }, [results, importConfig]);

  const toggleExpand = () => {
    if (processedData.length > 0) {
      setIsExpanded((prev) => !prev);
    }
  };

  const getStatusIcon = () => {
    switch (importStatus) {
      case "processing":
      case "creating":
        return <Clock className="w-5 h-5 text-warning animate-spin" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-success" />;
      case "error":
      case "cancelled":
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      case "ready":
        return <FileText className="w-5 h-5 text-primary" />;
      default:
        return <Upload className="w-5 h-5 text-primary" />;
    }
  };

  const getStatusMessage = () => {
    if (progress.message) return progress.message;

    switch (importStatus) {
      case "processing":
        return entityType === "domains"
          ? "Processing domains with special transformations..."
          : "Processing file...";
      case "creating":
        return "Creating items...";
      case "success":
        return "Import completed successfully!";
      case "cancelled":
        return "Operation cancelled";
      case "error":
        return error || "Import failed";
      case "ready":
        return "File processed and ready to import";
      default:
        return description;
    }
  };

  const isProcessing =
    importStatus === "processing" || importStatus === "creating";
  const canClose = !isProcessing;

  // Format cell data to handle objects, booleans, and nulls
  const formatCellData = (value) => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "object") {
      try {
        return JSON.stringify(value);
      } catch (e) {
        return "[Complex Data]";
      }
    }
    return String(value);
  };

  const PreviewTable = useMemo(() => {
    if (!processedData || processedData.length === 0) return null;

    // Get all unique keys from data for headers
    const headers = Array.from(
      new Set(processedData.flatMap((item) => Object.keys(item)))
    );

    return (
      <div className="h-full flex flex-col bg-card">
        <div className="p-4 border-b border-border bg-muted/20">
          <h4 className="font-semibold flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            Data Preview
            <span className="text-xs font-normal text-muted-foreground ml-2">
              ({processedData.length} records)
            </span>
          </h4>
        </div>
        <div className="flex-1 overflow-auto p-0">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 border-b border-border font-medium w-16 bg-muted/50">
                  #
                </th>
                {headers.map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 border-b border-border font-medium whitespace-nowrap bg-muted/50"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {processedData.map((row, idx) => (
                <tr
                  key={idx}
                  className="bg-card hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-2 text-muted-foreground font-mono text-xs border-r border-border/50">
                    {idx + 1}
                  </td>
                  {headers.map((header) => (
                    <td
                      key={`${idx}-${header}`}
                      className="px-4 py-2 whitespace-nowrap max-w-[300px] overflow-hidden text-ellipsis"
                      title={
                        typeof row[header] === "object"
                          ? JSON.stringify(row[header], null, 2)
                          : String(row[header])
                      }
                    >
                      {formatCellData(row[header])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }, [processedData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
          onClick={canClose ? handleClose : undefined}
        />

        {/* Modal Container */}
        <div
          className={`relative transform overflow-hidden rounded-lg bg-card text-left shadow-xl transition-all border border-border flex flex-col
            ${
              isExpanded
                ? "w-[95vw] h-[90vh] max-w-none"
                : "sm:my-8 sm:w-full sm:max-w-2xl max-h-[85vh]"
            }`}
        >
          {/* Main Layout Grid */}
          <div
            className={`flex flex-1 overflow-hidden ${isExpanded ? "flex-row" : "flex-col"}`}
          >
            {/* LEFT PANEL: Data Table (Only visible when expanded) */}
            {isExpanded && (
              <div className="flex-[2] border-r border-border overflow-hidden min-w-0">
                {PreviewTable}
              </div>
            )}

            {/* RIGHT PANEL: Controls (Standard Modal Content) */}
            <div
              className={`flex flex-col flex-1 overflow-hidden ${isExpanded ? "min-w-[400px] max-w-[450px]" : ""}`}
            >
              {/* Header */}
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-0 flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon()}
                    <h3 className="text-lg font-semibold text-card-foreground">
                      {title}
                      {entityType === "domains" && (
                        <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          Enhanced
                        </span>
                      )}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Expand Toggle (Only if data exists) */}
                    {processedData.length > 0 && !isProcessing && (
                      <button
                        onClick={toggleExpand}
                        className="rounded-md p-2 text-muted-foreground hover:text-card-foreground hover:bg-muted transition-colors"
                        title={
                          isExpanded
                            ? "Exit Full Screen"
                            : "View Data Full Screen"
                        }
                      >
                        {isExpanded ? (
                          <Minimize2 className="w-4 h-4" />
                        ) : (
                          <Maximize2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    {canClose && (
                      <button
                        onClick={handleClose}
                        className="rounded-md p-2 text-muted-foreground hover:text-card-foreground hover:bg-muted transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Status Message */}
                <div className="text-center mb-6">
                  <p className="text-sm text-left text-muted-foreground break-words">
                    {getStatusMessage()}
                  </p>
                  {entityType === "domains" && importStatus === "idle" && (
                    <p className="text-xs text-primary mt-1 text-left">
                      Using domain-specific processing with password age and
                      hybrid connector transformations
                    </p>
                  )}
                </div>
              </div>

              {/* Scrollable Content (Steps) */}
              <div className="flex-1 overflow-y-auto px-4 pb-4 sm:px-6">
                <div className="space-y-6">
                  {/* Step 1: Download Sample */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold flex-shrink-0">
                        1
                      </div>
                      <h4 className="font-medium text-card-foreground">
                        Download Sample File
                      </h4>
                    </div>
                    <div className="ml-8">
                      <p className="text-sm text-muted-foreground mb-3">
                        Download the sample file to see the required format.
                      </p>
                      <button
                        onClick={handleDownloadSample}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-muted text-muted-foreground rounded-md hover:bg-muted/80 hover:text-card-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Download className="w-4 h-4" />
                        Download Sample Excel File
                      </button>
                    </div>
                  </div>

                  {/* Step 2: Upload File */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold flex-shrink-0 ${
                          selectedFile
                            ? "bg-success text-success-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        2
                      </div>
                      <h4 className="font-medium text-card-foreground">
                        Upload Your File
                      </h4>
                    </div>
                    <div className="ml-8">
                      {!selectedFile ? (
                        <div
                          onDrop={handleDrop}
                          onDragOver={handleDragOver}
                          className={`border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors ${isProcessing ? "pointer-events-none opacity-50" : ""}`}
                          onClick={() =>
                            !isProcessing && fileInputRef.current?.click()
                          }
                        >
                          <FileSpreadsheet className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground mb-2">
                            Click to upload or drag & drop
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Supports .csv, .xlsx, .xls
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-3 bg-success/10 border border-success/20 rounded-lg overflow-hidden">
                          <FileText className="w-5 h-5 text-success flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-success truncate">
                              {selectedFile.name}
                            </p>
                            <p className="text-xs text-success/80">
                              {(selectedFile.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                          {!isProcessing && (
                            <button
                              onClick={handleRemoveFile}
                              className="p-1 text-success/60 hover:text-success transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={isProcessing}
                      />
                    </div>
                  </div>

                  {/* Step 3: Process & Import */}
                  {selectedFile && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold flex-shrink-0 ${
                            importStatus === "success"
                              ? "bg-success text-success-foreground"
                              : importStatus === "ready"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          3
                        </div>
                        <h4 className="font-medium text-card-foreground">
                          Process & Import
                        </h4>
                      </div>
                      <div className="ml-8">
                        {importStatus === "idle" && (
                          <button
                            onClick={handleProcessFile}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                            Process File
                          </button>
                        )}

                        {importStatus === "ready" && (
                          <div className="space-y-3">
                            <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                              <p className="text-sm text-primary font-medium">
                                Ready to import {processedData.length} items
                              </p>
                            </div>

                            <div className="flex gap-2 flex-wrap">
                              {/* VIEW DATA BUTTON */}
                              {!isExpanded && (
                                <button
                                  onClick={() => setIsExpanded(true)}
                                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium border border-border bg-card hover:bg-muted text-card-foreground rounded-md transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Data
                                </button>
                              )}

                              <button
                                onClick={handleBulkCreate}
                                className="flex-[2] flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-success/80 text-success-foreground rounded-md hover:bg-success/90 transition-colors"
                              >
                                <Upload className="w-4 h-4" />
                                Start Import
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Progress Bar */}
                  {isProcessing && (
                    <div className="space-y-2">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                          style={{
                            width: progress.percentage
                              ? `${progress.percentage}%`
                              : "20%",
                          }}
                        />
                      </div>
                      {progress.current && progress.total && (
                        <p className="text-xs text-muted-foreground text-center">
                          {progress.current} of {progress.total} items processed
                        </p>
                      )}
                    </div>
                  )}

                  {/* Results Summary */}
                  {importStatus === "success" && results && (
                    <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-success" />
                          <h4 className="font-medium text-success">
                            Import Complete
                          </h4>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={handleCopyResults}
                            title="Copy results summary"
                            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-muted-foreground hover:text-card-foreground hover:bg-muted rounded-md transition-colors"
                          >
                            {resultsCopied ? (
                              <Check className="w-3.5 h-3.5 text-success" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            {resultsCopied ? "Copied" : "Copy"}
                          </button>
                          <button
                            type="button"
                            onClick={handleDownloadResults}
                            title="Download results as CSV"
                            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-muted-foreground hover:text-card-foreground hover:bg-muted rounded-md transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm mb-2">
                        <div className="text-center">
                          <div className="font-bold text-success">
                            {results.successful.length}
                          </div>
                          <div className="text-success/80 text-xs">Success</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-destructive">
                            {results.failed.length}
                          </div>
                          <div className="text-destructive/80 text-xs">
                            Failed
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-card-foreground">
                            {results.total}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            Total
                          </div>
                        </div>
                      </div>
                      {results.failed.length > 0 && (
                        <div className="mt-3 p-2 bg-destructive/10 border border-destructive/20 rounded h-full overflow-y-auto">
                          <p className="text-xs text-destructive font-medium mb-1">
                            Failures:
                          </p>
                          <div className="space-y-1">
                            {results.failed.map((failed, index) => {
                              const identifier = getRowIdentifier(
                                failed.item,
                                importConfig?.fieldMapping,
                              );
                              return (
                                <div
                                  key={index}
                                  className="text-xs text-destructive/80 flex flex-col gap-0.5"
                                >
                                  <div className="flex gap-2">
                                    <span className="font-mono opacity-70">
                                      #{failed.index + 1}:
                                    </span>
                                    <span className="break-words flex-1">
                                      {failed.error}
                                    </span>
                                  </div>
                                  {identifier && (
                                    <span className="ml-6 text-destructive/60 break-words">
                                      {identifier}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Error Display */}
                  {(importStatus === "error" || importStatus === "cancelled") &&
                    error && (
                      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
                        <FileX className="w-8 h-8 text-destructive mx-auto mb-2" />
                        <p className="text-sm font-medium text-destructive mb-1">
                          {importStatus === "cancelled"
                            ? "Cancelled"
                            : "Failed"}
                        </p>
                        <p className="text-xs text-destructive/80 whitespace-pre-line">
                          {error}
                        </p>
                      </div>
                    )}

                  {/* Required Fields Info */}
                  {importConfig && importStatus === "idle" && !selectedFile && (
                    <div className="bg-muted/30 overflow-y-auto max-h-[20vh] rounded-lg p-4">
                      <h4 className="text-sm font-medium text-card-foreground mb-2">
                        Required Columns:
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {importConfig.fieldMapping.map((field, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${field.required ? "bg-destructive" : "bg-muted-foreground"}`}
                            />
                            <span className="text-muted-foreground">
                              {field.csvHeader || field.header}
                              {field.required && (
                                <span className="text-destructive ml-1">*</span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        <span className="text-destructive">*</span> Required
                        fields
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="bg-muted/20 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-border flex-shrink-0">
                {importStatus === "success" ? (
                  <button
                    type="button"
                    onClick={handleClose}
                    className="inline-flex w-full justify-center items-center gap-2 rounded-md px-4 py-2 text-sm font-medium bg-success text-success-foreground hover:bg-success/90 transition-colors sm:w-auto"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Done
                  </button>
                ) : importStatus === "error" ? (
                  <div className="flex gap-2 w-full sm:w-auto sm:flex-row-reverse">
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 rounded-md px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      Try Again
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex-1 sm:flex-none inline-flex justify-center rounded-md bg-background px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm ring-1 ring-inset ring-border hover:bg-muted hover:text-card-foreground transition-colors"
                    >
                      Close
                    </button>
                  </div>
                ) : isProcessing ? (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="inline-flex w-full justify-center items-center gap-2 rounded-md px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors sm:w-auto"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                ) : (
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
      </div>
    </div>
  );
};

export default BulkImportModalDomain;