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

import ExcelJS from "exceljs";
import Papa from "papaparse";
import { IMPORT_FIELD_MAPPINGS } from "@/constants/import";
import { formatErrorMessage } from "./errorProcessing";

/**
 * Process uploaded file (CSV or Excel) for bulk import
 * @param {File} file - The uploaded file
 * @param {Array} fieldMapping - Field mapping configuration
 * @param {Function} onProgress - Progress callback
 * @param {Function} onError - Error callback
 * @returns {Promise<Array>} Processed data array
 */
export const processImportFile = async (
  file,
  fieldMapping,
  onProgress,
  onError,
  signal,
) => {
  try {
    onProgress?.({ status: "reading", message: "Reading file..." });
    if (signal?.aborted) throw new Error("Operation cancelled");
    const fileExtension = file.name.split(".").pop().toLowerCase();
    let rawData = [];

    if (fileExtension === "csv") {
      rawData = await parseCSVFile(file);
    } else if (["xlsx", "xls"].includes(fileExtension)) {
      rawData = await parseExcelFile(file);
    } else {
      throw new Error(
        "Unsupported file format. Please use CSV or Excel files.",
      );
    }

    onProgress?.({ status: "processing", message: "Processing data..." });
    if (signal?.aborted) throw new Error("Operation cancelled");
    // Validate and transform data
    const processedData = validateAndTransformData(rawData, fieldMapping);

    onProgress?.({ status: "validation", message: "Validating data..." });

    return processedData;
  } catch (error) {
    onError?.(error);
    throw error;
  }
};

/**
 * Parse CSV file
 */
const parseCSVFile = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parsing error: ${results.errors[0].message}`));
        } else {
          resolve(results.data);
        }
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      },
    });
  });
};

/**
 * Recursively unwrap an ExcelJS cell value into a plain primitive.
 * Handles rich text runs, hyperlink cells (whose `text` can itself be a
 * rich text object, e.g. when Excel auto-links a domain-like string), and
 * formula results — any of which can otherwise leak through as a plain
 * object and get stringified to the literal text "[object Object]".
 */
const extractCellValue = (cellValue) => {
  if (!cellValue || typeof cellValue !== "object") return cellValue;
  if (cellValue instanceof Date) return cellValue;

  if (Array.isArray(cellValue.richText)) {
    return cellValue.richText.map((run) => run.text || "").join("");
  }
  if (cellValue.text !== undefined) return extractCellValue(cellValue.text);
  if (cellValue.result !== undefined) return extractCellValue(cellValue.result);

  // Unrecognized object shape — fall back to empty rather than
  // letting "[object Object]" silently fail downstream validation
  return "";
};

/**
 * Parse Excel file using ExcelJS
 */
const parseExcelFile = async (file) => {
  try {
    const buffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new Error("Excel file appears to be empty");
    }

    const jsonData = [];
    let headers = [];

    // Iterate over rows
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      // row.values is a 1-based array: [ <empty>, 'Col1', 'Col2', ... ]
      // slice(1) removes the empty 0-index item provided by ExcelJS
      const rowValues = Array.isArray(row.values) ? row.values.slice(1) : [];

      if (rowNumber === 1) {
        // Capture headers
        headers = rowValues.map((h) => String(h || "").trim());
      } else {
        // Map data to headers
        const rowData = {};
        let hasData = false;

        headers.forEach((header, index) => {
          const cellValue = extractCellValue(rowValues[index]);

          const value =
            cellValue === undefined || cellValue === null ? "" : cellValue;
          rowData[header] = value;

          if (value !== "") hasData = true;
        });

        if (hasData) {
          jsonData.push(rowData);
        }
      }
    });

    if (jsonData.length === 0) {
      throw new Error(
        "Excel file must contain at least a header row and one data row",
      );
    }

    return jsonData;
  } catch (error) {
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }
};

const shouldIncludeField = (value, field) => {
  // Always include required fields, and any optional field the backend
  // expects present in the payload even when empty (e.g. policy_description).
  if (field.required || field.alwaysSend) {
    return true;
  }

  // For other non-required fields, check if value is meaningful
  if (value === null || value === undefined || value === "") {
    return false;
  }

  // Include all other non-empty values
  return true;
};

/**
 * Validate and transform data according to field mapping
 */
const validateAndTransformData = (rawData, fieldMapping) => {
  const errors = [];
  const transformedData = [];

  rawData.forEach((row, index) => {
    const rowNumber = index + 2; // +2 because index starts at 0 and we skip header
    const transformedRow = {};
    const rowErrors = [];

    fieldMapping.forEach((field) => {
      const csvHeader = field.csvHeader || field.header;
      const header = field.header;
      const value =
        row[csvHeader] !== undefined
          ? row[csvHeader]
          : row[csvHeader + "*"] !== undefined
            ? row[csvHeader + "*"]
            : row[csvHeader + " *"] !== undefined
              ? row[csvHeader + " *"]
              : row[header] !== undefined
                ? row[header]
                : row[header + "*"] !== undefined
                  ? row[header + "*"]
                  : row[header + " *"] !== undefined
                    ? row[header + " *"]
                    : undefined;

      try {
        // Apply transformation first
        let transformedValue = transformFieldValue(value, field, rowNumber);

        // Apply additional field validation if available (for complex validations)
        if (field.validate && typeof field.validate === "function") {
          transformedValue = field.validate(
            transformedValue,
            transformedRow,
            index,
          );
        }

        // Only set the value if it's not empty, or if the field is required
        if (shouldIncludeField(transformedValue, field)) {
          setNestedValue(transformedRow, field.key, transformedValue);
        }
      } catch (error) {
        rowErrors.push({
          row: rowNumber,
          field: field.csvHeader || field.header,
          error: error.message,
          value: value,
        });
      }
    });

    if (rowErrors.length > 0) {
      errors.push(...rowErrors);
    } else {
      transformedData.push(transformedRow);
    }
  });

  if (errors.length > 0) {
    const errorMessage = `Data validation failed:\n${errors
      .slice(0, 10)
      .map((e) => `Row ${e.row}, ${e.field}: ${e.error}`)
      .join(
        "\n",
      )}${errors.length > 10 ? `\n... and ${errors.length - 10} more errors` : ""}`;

    throw new Error(errorMessage);
  }

  return transformedData;
};

/**
 * Transform field value according to field configuration
 */
const transformFieldValue = (value, field, rowNumber) => {
  // Handle empty values
  if (value === null || value === undefined || value === "") {
    if (field.required) {
      throw new Error(`${field.csvHeader || field.header} is required`);
    }
    return field.defaultValue || (field.type === "array" ? [] : "");
  }

  // Apply type-specific transformations
  switch (field.type) {
    case "string":
      return String(value).trim();

    case "number":
      const num = Number(value);
      if (isNaN(num)) {
        throw new Error(`Invalid number: ${value}`);
      }
      return num;

    case "boolean":
      if (typeof value === "boolean") return value;
      const str = String(value).toLowerCase().trim();
      if (["true", "1", "yes", "active"].includes(str)) return true;
      if (["false", "0", "no", "inactive"].includes(str)) return false;
      throw new Error(`Invalid boolean value: ${value}`);

    case "date":
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date: ${value}`);
      }
      return date.toISOString();

    case "select":
      if (field.options && !field.options.some((opt) => opt.value === value)) {
        throw new Error(
          `Invalid option: ${value}. Valid options: ${field.options.map((o) => o.value).join(", ")}`,
        );
      }
      return value;

    case "array":
      // Handle array transformation
      let arrayValue;

      // Use field's transform function if available
      if (field.transform && typeof field.transform === "function") {
        arrayValue = field.transform(value);
      } else {
        // Default array transformation: split by comma and trim
        if (typeof value === "string") {
          arrayValue = value
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item.length > 0);
        } else if (Array.isArray(value)) {
          arrayValue = value;
        } else {
          arrayValue = [String(value).trim()].filter((item) => item.length > 0);
        }
      }

      // Apply field validation if available
      if (field.validate && typeof field.validate === "function") {
        return field.validate(arrayValue);
      }

      return arrayValue;

    default:
      return value;
  }
};

/**
 * Set nested object value using dot notation
 */
const setNestedValue = (obj, path, value) => {
  const keys = path.split(".");
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    if (!(keys[i] in current)) {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }

  current[keys[keys.length - 1]] = value;
};

/**
 * Bulk create items using API
 */
export const bulkCreateItems = async (
  items,
  createFunction,
  onProgress,
  onItemComplete,
  signal,
) => {
  const results = {
    successful: [],
    failed: [],
    total: items.length,
  };

  for (let i = 0; i < items.length; i++) {
    if (signal?.aborted) throw new Error("Operation cancelled");
    const item = items[i];
    const currentProgress = i + 1;

    try {
      onProgress?.({
        status: "creating",
        message: `Creating item ${currentProgress} of ${items.length}...`,
        current: currentProgress,
        total: items.length,
        percentage: Math.round((currentProgress / items.length) * 100),
      });

      const result = await createFunction(item);
      results.successful.push({ item, result, index: i });

      onItemComplete?.({
        success: true,
        item,
        result,
        index: i,
      });

      // Small delay to prevent overwhelming the server
      if (i < items.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    } catch (error) {
      const formattedError = formatErrorMessage(error);

      results.failed.push({
        item,
        error: formattedError,
        index: i,
      });

      onItemComplete?.({
        success: false,
        item,
        error: formattedError,
        index: i,
      });
    }
  }

  return results;
};

/**
 * Bulk update existing items using API. Mirrors bulkCreateItems exactly,
 * except it calls updateFunction (an existing record's ID is expected to
 * already be present on each item, e.g. from a matchKey column resolved
 * during import) instead of a create function - kept as a separate
 * function rather than a "mode" flag on bulkCreateItems so progress/status
 * text ("Updating" vs "Creating") is never wrong for the operation actually
 * running.
 */
export const bulkUpdateItems = async (
  items,
  updateFunction,
  onProgress,
  onItemComplete,
  signal,
) => {
  const results = {
    successful: [],
    failed: [],
    total: items.length,
  };

  for (let i = 0; i < items.length; i++) {
    if (signal?.aborted) throw new Error("Operation cancelled");
    const item = items[i];
    const currentProgress = i + 1;

    try {
      onProgress?.({
        status: "updating",
        message: `Updating item ${currentProgress} of ${items.length}...`,
        current: currentProgress,
        total: items.length,
        percentage: Math.round((currentProgress / items.length) * 100),
      });

      const result = await updateFunction(item);
      results.successful.push({ item, result, index: i });

      onItemComplete?.({
        success: true,
        item,
        result,
        index: i,
      });

      // Small delay to prevent overwhelming the server
      if (i < items.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    } catch (error) {
      const formattedError = formatErrorMessage(error);

      results.failed.push({
        item,
        error: formattedError,
        index: i,
      });

      onItemComplete?.({
        success: false,
        item,
        error: formattedError,
        index: i,
      });
    }
  }

  return results;
};

/**
 * Generate sample file for download using ExcelJS
 */
export const generateSampleFile = async (
  fieldMapping,
  format = "excel",
  filename = "sample",
) => {
  // Create headers
  const headers = fieldMapping.map((field) => {
    const headerText = field.csvHeader || field.header;
    return field.required ? `${headerText}*` : headerText;
  });

  // Create sample data rows
  const row1 = fieldMapping.map(
    (field) => field.sampleValue || getDefaultSampleValue(field),
  );
  const row2 = fieldMapping.map(
    (field) => field.sampleValue2 || getDefaultSampleValue(field, true),
  );

  if (format === "csv") {
    const sampleData = [headers, row1, row2];
    const csvContent = Papa.unparse(sampleData);
    downloadFile(csvContent, `${filename}.csv`, "text/csv");
  } else {
    // Excel format
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sample Data");

    // Add Headers
    const headerRow = worksheet.addRow(headers);
    headerRow.font = { bold: true };

    // Add Data
    worksheet.addRow(row1);
    worksheet.addRow(row2);

    // Set column widths (ExcelJS width is approx chars)
    worksheet.columns = fieldMapping.map((field) => ({
      width: field.width ? field.width / 7 : 20,
    }));

    // Write Buffer
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Download
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

/**
 * Get default sample value for a field
 */
const getDefaultSampleValue = (field, isSecond = false) => {
  if (field.sampleValue && !isSecond) return field.sampleValue;
  if (field.sampleValue2 && isSecond) return field.sampleValue2;

  switch (field.type) {
    case "string":
      return isSecond ? `Sample ${field.header} 2` : `Sample ${field.header}`;
    case "number":
      return isSecond ? 200 : 100;
    case "boolean":
      return isSecond ? "No" : "Yes";
    case "date":
      const date = new Date();
      date.setDate(date.getDate() + (isSecond ? 1 : 0));
      return date.toISOString().split("T")[0];
    case "select":
      if (field.options && field.options.length > 0) {
        return field.options[isSecond && field.options.length > 1 ? 1 : 0]
          .value;
      }
      return isSecond ? "Option 2" : "Option 1";
    default:
      return isSecond ? `Sample ${field.header} 2` : `Sample ${field.header}`;
  }
};

/**
 * Field key/header patterns that must never surface in failure labels or
 * exported/copied results (passwords, tokens, etc. are sensitive even when
 * base64-encoded, since that's trivially reversible).
 */
const SENSITIVE_FIELD_PATTERN = /password|secret|token|api[_-]?key/i;

/**
 * Get nested object value using dot notation (mirrors setNestedValue)
 */
const getNestedValue = (obj, path) => {
  return path
    .split(".")
    .reduce(
      (acc, key) => (acc && typeof acc === "object" ? acc[key] : undefined),
      obj,
    );
};

const formatFieldValue = (value) => {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

/**
 * Build a short, non-sensitive identifier for a row (e.g. "First Name: John,
 * Email Prefix: john.doe") so failure lists can show which record failed,
 * not just its row number. Prefers required fields; falls back to the first
 * couple of fields if none are marked required. Sensitive fields are always
 * excluded.
 */
export const getRowIdentifier = (item, fieldMapping = []) => {
  if (!item || !fieldMapping.length) return "";

  const safeFields = fieldMapping.filter(
    (field) => !SENSITIVE_FIELD_PATTERN.test(field.key || field.header || ""),
  );
  const requiredFields = safeFields.filter((field) => field.required);
  const fieldsToUse = (
    requiredFields.length ? requiredFields : safeFields
  ).slice(0, 3);

  return fieldsToUse
    .map((field) => {
      const value = formatFieldValue(getNestedValue(item, field.key));
      return value ? `${field.csvHeader || field.header}: ${value}` : null;
    })
    .filter(Boolean)
    .join(", ");
};

/**
 * Combine successful + failed results (ordered by original row index) into
 * plain rows suitable for CSV export or clipboard copy. Sensitive fields
 * (passwords, tokens, etc.) are always excluded.
 */
export const buildResultsExportRows = (results, fieldMapping = []) => {
  const safeFields = fieldMapping.filter(
    (field) => !SENSITIVE_FIELD_PATTERN.test(field.key || field.header || ""),
  );

  const combined = [
    ...results.successful.map((entry) => ({ ...entry, status: "Success" })),
    ...results.failed.map((entry) => ({ ...entry, status: "Failed" })),
  ].sort((a, b) => a.index - b.index);

  return combined.map((entry) => {
    const row = { Row: entry.index + 1, Status: entry.status };
    safeFields.forEach((field) => {
      row[field.csvHeader || field.header] = formatFieldValue(
        getNestedValue(entry.item, field.key),
      );
    });
    row.Error = entry.status === "Failed" ? entry.error : "";
    return row;
  });
};

/**
 * Download the combined import results (success + failure) as a CSV file.
 */
export const downloadImportResults = (
  results,
  fieldMapping,
  filename = "import_results",
) => {
  const rows = buildResultsExportRows(results, fieldMapping);
  const csvContent = Papa.unparse(rows);
  downloadFile(csvContent, `${filename}.csv`, "text/csv");
};

/**
 * Build a plain-text summary of the import results, suitable for copying to
 * the clipboard.
 */
export const buildResultsSummaryText = (
  results,
  fieldMapping,
  actionLabel = "Import",
) => {
  const rows = buildResultsExportRows(results, fieldMapping);
  const lines = rows.map((row) => {
    const { Row, Status, Error, ...fields } = row;
    const fieldsText = Object.entries(fields)
      .filter(([, value]) => value !== "")
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
    return `#${Row} [${Status}]${fieldsText ? " " + fieldsText : ""}${Error ? " - " + Error : ""}`;
  });
  return `${actionLabel} Results (${results.successful.length} succeeded, ${results.failed.length} failed, ${results.total} total)\n\n${lines.join("\n")}`;
};

/**
 * Download file utility
 */
const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Helper function to create import configuration
 */
export const createImportConfig = (
  entityType,
  createFunction,
  customFieldMapping = null,
) => {
  const fieldMapping = customFieldMapping || IMPORT_FIELD_MAPPINGS[entityType];

  if (!fieldMapping) {
    throw new Error(`No field mapping found for entity type: ${entityType}`);
  }

  return {
    entityType,
    createFunction,
    fieldMapping,
    sampleFilename: `${entityType}_import_sample`,
  };
};

//dpomain

const transformDomainForAPI = (transformedRow, organizationId) => {
  const apiData = { ...transformedRow };

  apiData.organization_id = organizationId;
  apiData.domain_name = apiData.domain_name.toLowerCase();
  apiData.filter_policy_id = null;
  apiData.max_password_age_properties = {
    enable_max_password_age: apiData.enable_max_password_age || false,
  };

  if (apiData.enable_max_password_age) {
    apiData.max_password_age_properties.max_password_age =
      apiData.max_password_age;
    apiData.max_password_age_properties.notify_at = [
      apiData.notify_1,
      apiData.notify_2,
      apiData.notify_3,
    ]
      .filter((val) => val !== undefined && val !== null && !isNaN(val))
      .sort((a, b) => a - b);
  } else {
    apiData.max_password_age = 0;
    apiData.max_password_age_properties.max_password_age = 0;
    apiData.max_password_age_properties.notify_at = [];
  }

  delete apiData.enable_max_password_age;
  delete apiData.notify_1;
  delete apiData.notify_2;
  delete apiData.notify_3;

  if (!apiData.enable_hybrid_mode) {
    apiData.hybrid_connector_properties = null;
  } else {
    if (
      !apiData.hybrid_connector_properties ||
      typeof apiData.hybrid_connector_properties !== "object"
    ) {
      throw new Error(
        "Hybrid connector properties are required when hybrid mode is enabled",
      );
    }
  }

  if (!apiData.enable_catch_all) {
    apiData.catch_all_forwarding_address = null;
  }

  if (!apiData.caution_id || apiData.caution_id === "") {
    apiData.caution_id = null;
  }
  if (!apiData.disclaimer_id || apiData.disclaimer_id === "") {
    apiData.disclaimer_id = null;
  }

  return apiData;
};

/**
 * Updated validateAndTransformData function with domain-specific transformation
 */
const validateAndTransformDataForDomains = (
  rawData,
  fieldMapping,
  organizationId,
) => {
  const errors = [];
  const transformedData = [];

  rawData.forEach((row, index) => {
    const rowNumber = index + 2; // +2 because index starts at 0 and we skip header
    const transformedRow = {};
    const rowErrors = [];

    fieldMapping.forEach((field) => {
      const csvHeader = field.csvHeader || field.header;
      const header = field.header;
      const value =
        row[csvHeader] !== undefined
          ? row[csvHeader]
          : row[csvHeader + "*"] !== undefined
            ? row[csvHeader + "*"]
            : row[csvHeader + " *"] !== undefined
              ? row[csvHeader + " *"]
              : row[header] !== undefined
                ? row[header]
                : row[header + "*"] !== undefined
                  ? row[header + "*"]
                  : row[header + " *"] !== undefined
                    ? row[header + " *"]
                    : undefined;

      try {
        // Apply transformation first
        let transformedValue = transformFieldValue(value, field, rowNumber);

        // Apply additional field validation if available (for complex validations)
        if (field.validate && typeof field.validate === "function") {
          transformedValue = field.validate(
            transformedValue,
            transformedRow,
            index,
          );
        }

        // Only set the value if it's not empty, or if the field is required
        if (shouldIncludeField(transformedValue, field)) {
          setNestedValue(transformedRow, field.key, transformedValue);
        }
      } catch (error) {
        rowErrors.push({
          row: rowNumber,
          field: field.csvHeader || field.header,
          error: error.message,
          value: value,
        });
      }
    });

    if (rowErrors.length > 0) {
      errors.push(...rowErrors);
    } else {
      // Apply domain-specific transformation before adding to results
      try {
        const apiReadyData = transformDomainForAPI(
          transformedRow,
          organizationId,
        );
        transformedData.push(apiReadyData);
      } catch (transformError) {
        errors.push({
          row: rowNumber,
          field: "Data Transformation",
          error: transformError.message,
          value: "N/A",
        });
      }
    }
  });

  if (errors.length > 0) {
    const errorMessage = `Data validation failed:\n${errors
      .slice(0, 10)
      .map((e) => `Row ${e.row}, ${e.field}: ${e.error}`)
      .join(
        "\n",
      )}${errors.length > 10 ? `\n... and ${errors.length - 10} more errors` : ""}`;

    throw new Error(errorMessage);
  }

  return transformedData;
};

const processImportFileForDomains = async (
  file,
  fieldMapping,
  organizationId,
  onProgress,
  onError,
  signal,
) => {
  try {
    onProgress?.({ status: "reading", message: "Reading file..." });
    if (signal?.aborted) throw new Error("Operation cancelled");

    const fileExtension = file.name.split(".").pop().toLowerCase();
    let rawData = [];

    if (fileExtension === "csv") {
      rawData = await parseCSVFile(file);
    } else if (["xlsx", "xls"].includes(fileExtension)) {
      rawData = await parseExcelFile(file);
    } else {
      throw new Error(
        "Unsupported file format. Please use CSV or Excel files.",
      );
    }

    onProgress?.({ status: "processing", message: "Processing data..." });
    if (signal?.aborted) throw new Error("Operation cancelled");

    // Use domain-specific validation and transformation
    const processedData = validateAndTransformDataForDomains(
      rawData,
      fieldMapping,
      organizationId,
    );

    onProgress?.({ status: "validation", message: "Validating data..." });

    return processedData;
  } catch (error) {
    onError?.(error);
    throw error;
  }
};

/**
 * Helper function to clean up hybrid connector properties that might have empty values
 */
const cleanupHybridConnectorProperties = (item) => {
  if (!item.enable_hybrid_mode) {
    return null;
  }

  const hybrid = item.hybrid_connector_properties || {};

  // Check if all required fields are present when hybrid mode is enabled
  const requiredFields = ["description", "port"];
  const missingFields = requiredFields.filter(
    (field) => !hybrid[field] || hybrid[field] === "",
  );

  if (missingFields.length > 0) {
    throw new Error(
      `Missing required hybrid fields: ${missingFields.join(", ")}`,
    );
  }

  // FQDN and IPv4 are not both mandatory — at least one must be provided
  if (!hybrid.fqdn && !hybrid.ipv4) {
    throw new Error(
      "Either Hybrid FQDN or Hybrid IPv4 is required when hybrid mode is enabled",
    );
  }

  // Clean up empty optional fields
  Object.keys(hybrid).forEach((key) => {
    if (hybrid[key] === "" || hybrid[key] === undefined) {
      if (key === "ipv6") {
        hybrid[key] = ""; // IPv6 can be empty
      } else {
        delete hybrid[key];
      }
    }
  });

  return hybrid;
};

// Export the domain-specific functions
export {
  transformDomainForAPI,
  validateAndTransformDataForDomains,
  processImportFileForDomains,
  cleanupHybridConnectorProperties,
};
