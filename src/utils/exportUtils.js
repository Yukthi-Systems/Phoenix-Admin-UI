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
import { formatDate } from "./dateFormat";
import { FIELD_MAPPINGS } from "@/constants/export";

/**
 * Generic export utility for exporting data to Excel using ExcelJS
 * @param {Object} config - Export configuration
 * @param {Function} config.fetchFunction - Function to fetch data for a specific page
 * @param {Object} config.fetchParams - Base parameters for fetch function
 * @param {Array} config.fieldMapping - Array of field mapping objects
 * @param {string} config.filename - Name of the exported file
 * @param {string} config.sheetName - Name of the worksheet
 * @param {Function} config.onProgress - Progress callback function
 * @param {Function} config.onError - Error callback function
 * @param {Function} config.onSuccess - Success callback function
 * @param {number} config.pageSize - Size of each page (default: 100)
 */
export const exportToExcel = async (config) => {
  const {
    fetchFunction,
    fetchParams,
    fieldMapping,
    filename,
    sheetName = "Data",
    onProgress,
    onError,
    onSuccess,
    pageSize = 100,
  } = config;

  try {
    let allData = [];
    let currentPage = 1;
    let hasMoreData = true;
    let totalFetched = 0;

    onProgress?.({ status: "starting", message: "Starting export..." });

    // --- Fetching Loop (Same as before) ---
    while (hasMoreData) {
      try {
        onProgress?.({
          status: "fetching",
          message: `Fetching page ${currentPage}...`,
          currentPage,
          totalFetched,
        });

        const response = await fetchFunction({
          ...fetchParams,
          page: currentPage,
          pageSize,
        });

        // Handle different response structures
        const pageData = extractDataFromResponse(
          response,
          fieldMapping[0]?.dataPath,
        );
        const totalPages = extractTotalPages(response, pageSize);

        if (!pageData || pageData.length === 0) {
          hasMoreData = false;
          break;
        }

        const transformedData = pageData.map((item) =>
          transformItem(item, fieldMapping),
        );
        allData = [...allData, ...transformedData];
        totalFetched += pageData.length;

        onProgress?.({
          status: "processing",
          message: `Processed ${totalFetched} records...`,
          currentPage,
          totalFetched,
          totalPages,
        });

        hasMoreData = currentPage < totalPages;
        currentPage++;

        if (hasMoreData) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (pageError) {
        console.error(`Error fetching page ${currentPage}:`, pageError);

        if (currentPage === 1) {
          throw pageError;
        }

        onProgress?.({
          status: "warning",
          message: `Warning: Failed to fetch page ${currentPage}. Continuing with available data...`,
          currentPage,
          totalFetched,
        });

        hasMoreData = false;
      }
    }

    if (allData.length === 0) {
      throw new Error("No data found to export");
    }

    onProgress?.({
      status: "generating",
      message: "Generating Excel file...",
      totalFetched,
    });

    // --- ExcelJS Generation Logic ---
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    // Define columns based on fieldMapping
    // ExcelJS uses 'key' to map data object properties to columns
    worksheet.columns = fieldMapping.map((field) => ({
      header: field.header,
      key: field.header, // We used field.header as key in transformItem
      width: field.width ? field.width / 7 : 20, // Approx conversion (chars to excel width)
    }));

    // Style the header row
    worksheet.getRow(1).font = { bold: true };

    // Add the data
    worksheet.addRows(allData);

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Create filename with timestamp
    const timestamp = new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:-]/g, "");
    const finalFilename = `${filename}_${timestamp}.xlsx`;

    // Download
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onSuccess?.({
      message: `Successfully exported ${totalFetched} records`,
      filename: finalFilename,
      totalRecords: totalFetched,
    });
  } catch (error) {
    console.error("Export error:", error);
    onError?.(error);
  }
};

/**
 * Export data to CSV format
 * @param {Object} config - Export configuration (same as Excel export)
 */
export const exportToCSV = async (config) => {
  const {
    fetchFunction,
    fetchParams,
    fieldMapping,
    filename,
    onProgress,
    onError,
    onSuccess,
    pageSize = 100,
  } = config;

  try {
    let allData = [];
    let currentPage = 1;
    let hasMoreData = true;
    let totalFetched = 0;

    onProgress?.({ status: "starting", message: "Starting CSV export..." });

    while (hasMoreData) {
      try {
        onProgress?.({
          status: "fetching",
          message: `Fetching page ${currentPage}...`,
          currentPage,
          totalFetched,
        });

        const response = await fetchFunction({
          ...fetchParams,
          page: currentPage,
          pageSize,
        });

        // Handle different response structures
        const pageData = extractDataFromResponse(
          response,
          fieldMapping[0]?.dataPath,
        );
        const totalPages = extractTotalPages(response, pageSize);

        if (!pageData || pageData.length === 0) {
          hasMoreData = false;
          break;
        }

        const transformedData = pageData.map((item) =>
          transformItem(item, fieldMapping),
        );
        allData = [...allData, ...transformedData];
        totalFetched += pageData.length;

        onProgress?.({
          status: "processing",
          message: `Processed ${totalFetched} records...`,
          currentPage,
          totalFetched,
          totalPages,
        });

        hasMoreData = currentPage < totalPages;
        currentPage++;

        if (hasMoreData) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (pageError) {
        console.error(`Error fetching page ${currentPage}:`, pageError);

        if (currentPage === 1) {
          throw pageError;
        }

        onProgress?.({
          status: "warning",
          message: `Warning: Failed to fetch page ${currentPage}. Continuing with available data...`,
          currentPage,
          totalFetched,
        });

        hasMoreData = false;
      }
    }

    if (allData.length === 0) {
      throw new Error("No data found to export");
    }

    onProgress?.({
      status: "generating",
      message: "Generating CSV file...",
      totalFetched,
    });

    // Convert to CSV
    const csvContent = convertToCSV(allData, fieldMapping);

    // Create and download the CSV file
    const timestamp = new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:-]/g, "");
    const finalFilename = `${filename}_${timestamp}.csv`;

    downloadCSV(csvContent, finalFilename);

    onSuccess?.({
      message: `Successfully exported ${totalFetched} records`,
      filename: finalFilename,
      totalRecords: totalFetched,
    });
  } catch (error) {
    console.error("CSV Export error:", error);
    onError?.(error);
  }
};

/**
 * Convert data array to CSV string
 * @param {Array} data - Array of objects to convert
 * @param {Array} fieldMapping - Field mapping configuration
 * @returns {string} CSV content
 */
const convertToCSV = (data, fieldMapping) => {
  if (!data || data.length === 0) return "";

  // Create header row
  const headers = fieldMapping.map((field) => field.header);
  const csvRows = [headers.map((header) => escapeCsvValue(header)).join(",")];

  // Create data rows
  data.forEach((row) => {
    const values = fieldMapping.map((field) => {
      const value = row[field.header];
      return escapeCsvValue(value);
    });
    csvRows.push(values.join(","));
  });

  return csvRows.join("\n");
};

/**
 * Escape CSV values to handle commas, quotes, newlines, AND FORMULA INJECTION
 * @param {*} value - Value to escape
 * @returns {string} Escaped CSV value
 */
const escapeCsvValue = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  let stringValue = String(value);

  // PREVENT CSV INJECTION (Formula Injection):
  // If value starts with =, +, -, or @, prepend a single quote to force it as text.
  // This prevents spreadsheet software from executing it as a formula.
  if (/^[=+\-@]/.test(stringValue)) {
    stringValue = `'${stringValue}`;
  }

  // If the value contains comma, quote, or newline, wrap in quotes and escape existing quotes
  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n") ||
    stringValue.includes("\r")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

/**
 * Download CSV content as a file
 * @param {string} csvContent - CSV content to download
 * @param {string} filename - Name of the file
 */
const downloadCSV = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

const extractDataFromResponse = (response, dataPath) => {
  if (!response) return [];

  if (dataPath) {
    return getNestedValue(response, dataPath) || [];
  }
  if (response.data?.imap_sync_jobs) return response.data.imap_sync_jobs;
  if (response.data?.cautions) return response.data.cautions;
  if (response.data?.departments) return response.data.departments;
  if (response.users_list) return response.users_list;
  if (response.servers) return response.servers;
  if (response.data?.disclaimers) return response.data.disclaimers;
  if (response.domains?.domains) return response.domains.domains;
  if (response.data?.mailboxes) return response.data.mailboxes;
  if (response.data?.identities) return response.data.identities;
  if (response.data?.data) return response.data.data;
  if (response.data)
    return Array.isArray(response.data) ? response.data : [response.data];
  if (response.cautions) return response.cautions;
  if (response.departments) return response.departments;
  if (response.users) return response.users;
  if (response.domains) return response.domains;
  if (response.mailboxes) return response.mailboxes;
  if (Array.isArray(response)) return response;

  return [];
};

const extractTotalPages = (response, pageSize = 100) => {
  if (!response) return 1;

  if (response.data?.total_pages) return response.data.total_pages;
  if (response.total_pages) return response.total_pages;
  if (response.data?.totalPages) return response.data.totalPages;
  if (response.totalPages) return response.totalPages;

  const totalCount = response.data?.total_count ?? response.total_count;
  if (totalCount !== undefined && totalCount !== null) {
    return Math.ceil(totalCount / pageSize);
  }

  return 1;
};

const getNestedValue = (obj, path) => {
  return path.split(".").reduce((current, key) => current?.[key], obj);
};

const transformItem = (item, fieldMapping) => {
  const transformedItem = {};

  fieldMapping.forEach((field) => {
    let value = getNestedValue(item, field.key);
    if (field.transform && typeof field.transform === "function") {
      value = field.transform(value, item);
    }
    if (value !== null && value !== undefined) {
      switch (field.type) {
        case "date":
          value = formatDate(value);
          break;
        case "boolean":
          value = value ? "Yes" : "No";
          break;
        case "status":
          value = value ? "Active" : "Inactive";
          break;
        case "number":
          value = Number(value);
          break;
        case "currency":
          value = `$${Number(value).toFixed(2)}`;
          break;
        default:
          value = String(value);
      }
    } else {
      value = field.defaultValue || "";
    }

    transformedItem[field.header] = value;
  });

  return transformedItem;
};

export const createExportConfig = (
  entityType,
  fetchFunction,
  fetchParams,
  customFieldMapping = null,
) => {
  const fieldMapping = customFieldMapping || FIELD_MAPPINGS[entityType];

  if (!fieldMapping) {
    throw new Error(`No field mapping found for entity type: ${entityType}`);
  }

  return {
    fetchFunction,
    fetchParams,
    fieldMapping,
    filename: `${entityType}_export`,
    sheetName: entityType.charAt(0).toUpperCase() + entityType.slice(1),
  };
};
