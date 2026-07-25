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

import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMailMapping, useGetServer } from "@/hooks/useServer";
import { Link } from "react-router-dom";
import ExcelJS from "exceljs"; // Replaced XLSX
import Papa from "papaparse"; // Added for secure CSV handling
import { userProfileAtom } from "@/store/userProfile";
import { useAtomValue } from "jotai";
import { useToastify } from "@/hooks/useToastify";

import {
  Mail,
  Search,
  X,
  Download,
  Upload,
  Copy,
  FileSpreadsheet,
  FileText,
  ChevronDown,
  ServerIcon,
  Loader2,
  AlertCircle,
} from "lucide-react";
import AccessDenied from "@/components/common/AccessDenied";

// --- SECURITY HELPER: Prevent CSV Injection ---
const escapeCsvValue = (value) => {
  if (value === null || value === undefined) return "";
  let stringValue = String(value);

  // Prepend ' if value starts with =, +, -, @ to prevent formula execution
  if (/^[=+\-@]/.test(stringValue)) {
    stringValue = `'${stringValue}`;
  }

  // Escape quotes and wrap in quotes if necessary
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

const emailSchema = yup.object({
  emails: yup
    .string()
    .required("At least one email is required")
    .test("emails-array", "Invalid email format", (value) => {
      if (!value) return false;
      const emails = value
        .split(",")
        .map((e) => e.trim())
        .filter((e) => e);
      if (emails.length === 0) return false;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emails.every((email) => emailRegex.test(email));
    }),
});

function ServerDetails({ serverId, emails, onServerData }) {
  const { data: serverData, isLoading, isError } = useGetServer(serverId);

  React.useEffect(() => {
    if (serverData && onServerData) onServerData(serverId, serverData);
  }, [serverData, serverId, onServerData]);

  if (isLoading) {
    return (
      <div className="text-muted-foreground flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading server details...</span>
      </div>
    );
  }

  if (isError || !serverData) {
    return (
      <div className="text-destructive flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm">Error loading server</span>
      </div>
    );
  }

  const server = serverData;
  return (
    <Link
      to={`/server/${serverId}`}
      className="border-border min-w-lg bg-muted/30 hover:border-primary/50 hover:bg-accent/50 block rounded-lg border p-3 transition-all hover:shadow-sm"
    >
      <div className="space-y-1.5 text-sm">
        <div className="flex items-center gap-2">
          <div className="text-foreground font-semibold">
            {server.host_name || "Unnamed Server"}
          </div>
          <span className="text-muted-foreground">·</span>
          <div className="text-muted-foreground text-xs font-medium">
            ID: {serverId || "-"}
          </div>
        </div>
        <div className="text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 text-xs">
          {server.quota_allocated !== undefined &&
            server.quota_allocated !== null && (
              <span>
                Quota: {server.quota_utilized ?? 0} GB /{" "}
                {server.quota_allocated} GB
              </span>
            )}
          {server.is_active !== undefined && (
            <span
              className={server.is_active ? "text-success" : "text-destructive"}
            >
              {server.is_active ? "Active" : "Inactive"}
            </span>
          )}
          {server?.server_info?.ipv4 && (
            <span>IPv4: {server.server_info.ipv4}</span>
          )}
          {server?.server_info?.location && (
            <span>Location: {server.server_info.location}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

function EmailInputForm({
  register,
  errors,
  currentEmails,
  handleSubmit,
  onSubmit,
  isLoading,
  showSampleDropdown,
  setShowSampleDropdown,
  downloadSampleXLSX,
  downloadSampleCSV,
  handleFileImport,
  copyEmailsToClipboard,
  dropdownRef,
  fileInputRef,
  hasSearched,
  onCancel,
}) {
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <label
            htmlFor="emails"
            className="text-foreground text-sm font-semibold"
          >
            Email Addresses
          </label>
          <div className="flex gap-2">
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setShowSampleDropdown(!showSampleDropdown)}
                className="border-success/30 bg-success/10 text-success hover:bg-success/20 flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all"
              >
                <Download className="h-4 w-4" />
                Sample File
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {showSampleDropdown && (
                <div className="border-border bg-card absolute right-0 z-10 mt-2 w-52 rounded-lg border shadow-xl">
                  <div className="p-1">
                    <button
                      type="button"
                      onClick={downloadSampleXLSX}
                      className="text-foreground hover:bg-accent flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm transition-colors"
                    >
                      <FileSpreadsheet className="text-success h-4 w-4" />
                      <span>Download XLSX</span>
                    </button>
                    <button
                      type="button"
                      onClick={downloadSampleCSV}
                      className="text-foreground hover:bg-accent flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm transition-colors"
                    >
                      <FileText className="text-success h-4 w-4" />
                      <span>Download CSV</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            <label className="border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all">
              <Upload className="h-4 w-4" />
              Import File
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileImport}
                accept=".xlsx,.xls,.csv"
                className="hidden"
              />
            </label>
            {currentEmails && (
              <button
                type="button"
                onClick={copyEmailsToClipboard}
                className="border-border bg-accent text-accent-foreground hover:bg-accent/80 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all"
              >
                <Copy className="h-4 w-4" />
                Copy
              </button>
            )}
          </div>
        </div>
        <textarea
          id="emails"
          {...register("emails")}
          placeholder="Enter email addresses separated by commas&#10;Example: john@example.com, jane@example.com, bob@example.com"
          className="border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-primary w-full rounded-lg border-2 px-4 py-3 shadow-sm transition-all focus:ring-2 focus:outline-none"
          rows={6}
        />
        {errors.emails && (
          <div className="text-destructive mt-2 flex items-center gap-2 text-sm">
            <X className="h-4 w-4" />
            <span>{errors.emails.message}</span>
          </div>
        )}
        <div className="border-border bg-muted/30 mt-3 rounded-lg border p-3">
          <p className="text-muted-foreground text-xs leading-relaxed">
            <span className="text-foreground font-semibold">
              Supported formats:
            </span>{" "}
            CSV, XLSX, XLS
            <br />
            <span className="text-foreground font-semibold">Note:</span> Files
            should contain email addresses in any column.
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        {hasSearched && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="border-border bg-background text-foreground hover:bg-accent focus:ring-border flex-1 rounded-lg border px-4 py-3 text-base font-semibold transition-all focus:ring-2 focus:ring-offset-2 focus:outline-none"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary flex-1 rounded-lg px-4 py-3 text-base font-semibold shadow-lg transition-all hover:shadow-xl focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Fetching Server Details...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <ServerIcon className="h-5 w-5" />
              Fetch Server Details
            </span>
          )}
        </button>
      </div>
    </form>
  );
}

function MailboxServerMapping() {
  const [emailList, setEmailList] = React.useState({});
  const [searchTerm, setSearchTerm] = React.useState("");
  const [serverDetailsCache, setServerDetailsCache] = React.useState({});
  const [showSampleDropdown, setShowSampleDropdown] = React.useState(false);
  const [showExportDropdown, setShowExportDropdown] = React.useState(false);
  const [hasSearched, setHasSearched] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const fileInputRef = React.useRef(null);
  const dropdownRef = React.useRef(null);
  const exportDropdownRef = React.useRef(null);
  const tableRef = React.useRef(null);

  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const toast = useToastify();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(emailSchema),
  });

  const mailMappingMutation = useMailMapping();
  const currentEmails = watch("emails") || "";

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        setShowSampleDropdown(false);
      if (
        exportDropdownRef.current &&
        !exportDropdownRef.current.contains(event.target)
      )
        setShowExportDropdown(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Group emails by server
  const groupedByServer = React.useMemo(() => {
    const groups = {};
    Object.entries(emailList).forEach(([email, serverId]) => {
      if (!groups[serverId]) groups[serverId] = [];
      groups[serverId].push(email);
    });
    return groups;
  }, [emailList]);

  // Filter grouped data based on search
  const filteredGroups = React.useMemo(() => {
    if (!searchTerm) return groupedByServer;
    const term = searchTerm.toLowerCase();
    const filtered = {};
    Object.entries(groupedByServer).forEach(([serverId, emails]) => {
      const matchingEmails = emails.filter((e) =>
        e.toLowerCase().includes(term),
      );
      const serverMatch = serverId.toLowerCase().includes(term);
      const serverInfo = serverDetailsCache[serverId];
      const serverNameMatch = serverInfo?.host_name
        ?.toLowerCase()
        .includes(term);
      if (matchingEmails.length > 0 || serverMatch || serverNameMatch) {
        filtered[serverId] =
          serverMatch || serverNameMatch ? emails : matchingEmails;
      }
    });
    return filtered;
  }, [groupedByServer, searchTerm, serverDetailsCache]);

  const totalEmails = Object.values(emailList).length;
  const filteredEmailCount = Object.values(filteredGroups).flat().length;

  const sampleData = [
    "Email",
    "john.doe@example.com",
    "jane.smith@example.com",
    "bob.wilson@example.com",
    "alice.johnson@example.com",
    "charlie.brown@example.com",
  ];

  const downloadSampleXLSX = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Emails");

    // Add Header
    worksheet.addRow([sampleData[0]]);

    // Add Rows
    sampleData.slice(1).forEach((email) => {
      worksheet.addRow([email]);
    });

    worksheet.getColumn(1).width = 25;

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "sample_emails.xlsx";
    link.click();
    setShowSampleDropdown(false);
    toast("success", "Sample XLSX file downloaded");
  };

  const downloadSampleCSV = () => {
    const csv = sampleData.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "sample_emails.csv";
    link.click();
    setShowSampleDropdown(false);
    toast("success", "Sample CSV file downloaded");
  };

  const onSubmit = (data) => {
    const emailsArray = data.emails
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e);
    mailMappingMutation.mutate(
      { mailList: emailsArray },
      {
        onSuccess: (response) => {
          if (response?.data) {
            setEmailList(response.data || {});
            setServerDetailsCache({});
            setHasSearched(true);
            setIsModalOpen(false);
          }
        },
        onError: (error) => {
          toast("error", error.message || "Failed to fetch server details");
        },
      },
    );
    reset();
  };

  const handleServerData = React.useCallback((serverId, serverData) => {
    setServerDetailsCache((prev) => ({ ...prev, [serverId]: serverData }));
  }, []);

  const copyEmailsToClipboard = () => {
    if (currentEmails) {
      navigator.clipboard
        .writeText(currentEmails)
        .then(() => toast("success", "Emails copied to clipboard"))
        .catch(() => toast("error", "Failed to copy emails"));
    }
  };

  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const fileExtension = file.name.split(".").pop().toLowerCase();
      const emails = [];
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (fileExtension === "csv") {
        // Parse CSV using PapaParse
        Papa.parse(file, {
          complete: (results) => {
            results.data.forEach((row) => {
              if (Array.isArray(row)) {
                row.forEach((cell) => {
                  if (
                    typeof cell === "string" &&
                    cell.includes("@") &&
                    emailRegex.test(cell.trim())
                  ) {
                    emails.push(cell.trim());
                  }
                });
              }
            });
            processImportedEmails(emails);
          },
          error: (error) => {
            throw new Error(`CSV parsing error: ${error.message}`);
          },
        });
      } else {
        // Parse Excel using ExcelJS
        const buffer = await file.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);

        const worksheet = workbook.worksheets[0];
        if (worksheet) {
          worksheet.eachRow({ includeEmpty: false }, (row) => {
            // ExcelJS rows are 1-based, values array starts at 1
            const values = Array.isArray(row.values) ? row.values : [];
            values.forEach((cell) => {
              // Handle rich text objects or simple strings
              let cellValue = cell;
              if (cell && typeof cell === "object" && cell.text) {
                cellValue = cell.text;
              }

              if (
                typeof cellValue === "string" &&
                cellValue.includes("@") &&
                emailRegex.test(cellValue.trim())
              ) {
                emails.push(cellValue.trim());
              }
            });
          });
          processImportedEmails(emails);
        }
      }
    } catch (error) {
      console.error(error);
      toast(
        "error",
        "Error reading file. Please ensure it's a valid Excel or CSV file",
      );
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const processImportedEmails = (emails) => {
    if (emails.length > 0) {
      // Append to existing emails or replace? Usually import implies append or set.
      // Based on previous logic (setValue), it overwrites or appends to string.
      const current = watch("emails") || "";
      const separator = current ? ", " : "";
      setValue("emails", current + separator + emails.join(", "));
      toast("success", `Successfully imported ${emails.length} email(s)`);
    } else {
      toast("error", "No valid emails found in the file");
    }
  };

  const exportToCSV = () => {
    const allEmails = Object.entries(emailList);
    if (allEmails.length === 0) {
      toast("warning", "No data to export");
      return;
    }
    const headers = [
      "Email",
      "Server ID",
      "Server Name",
      "Quota Allocated (GB)",
      "Quota Utilized (GB)",
      "Server Status",
      "IPv4",
      "Location",
    ];
    const csv = [
      headers.join(","),
      ...allEmails.map(([email, serverId]) => {
        const s = serverDetailsCache[serverId] || {};
        // Use escapeCsvValue to prevent Injection and handle formatting
        return [
          escapeCsvValue(email),
          escapeCsvValue(serverId),
          escapeCsvValue(s.host_name || "Unknown"),
          escapeCsvValue(s.quota_allocated || 0),
          escapeCsvValue(s.quota_utilized || 0),
          escapeCsvValue(s.is_active ? "Active" : "Inactive"),
          escapeCsvValue(s?.server_info?.ipv4 || "-"),
          escapeCsvValue(s?.server_info?.location || "-"),
        ].join(",");
      }),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "mailbox_server_mapping.csv";
    link.click();
    toast("success", "CSV file exported successfully");
  };

  const exportToExcel = async () => {
    const allEmails = Object.entries(emailList);
    if (allEmails.length === 0) {
      toast("warning", "No data to export");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Mailbox Server Mapping");

    worksheet.columns = [
      { header: "Email", key: "email", width: 30 },
      { header: "Server ID", key: "serverId", width: 20 },
      { header: "Server Name", key: "serverName", width: 25 },
      { header: "Quota Allocated (GB)", key: "quotaAllocated", width: 20 },
      { header: "Quota Utilized (GB)", key: "quotaUtilized", width: 20 },
      { header: "Server Status", key: "status", width: 15 },
      { header: "IPv4", key: "ipv4", width: 20 },
      { header: "Location", key: "location", width: 25 },
    ];

    // Style Header
    worksheet.getRow(1).font = { bold: true };

    allEmails.forEach(([email, serverId]) => {
      const s = serverDetailsCache[serverId] || {};
      worksheet.addRow({
        email: email,
        serverId: serverId,
        serverName: s.host_name || "Unknown",
        quotaAllocated: s.quota_allocated || 0,
        quotaUtilized: s.quota_utilized || 0,
        status: s.is_active ? "Active" : "Inactive",
        ipv4: s?.server_info?.ipv4 || "-",
        location: s?.server_info?.location || "-",
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "mailbox_server_mapping.xlsx";
    link.click();
    toast("success", "Excel file exported successfully");
  };

  if (
    !permissions.includes("server:view") &&
    !permissions.includes("mailbox:view")
  ) {
    return (
      <AccessDenied content="You don't have access to view organization details" />
    );
  }

  return (
    <div className="bg-background min-h-screen p-6 text-left">
      <div className="mx-auto max-w-[1800px]">
        <div
          className={`${hasSearched ? "flex" : ""} mx-auto items-center justify-between`}
        >
          <div className="mb-10 text-center">
            <div className="mb-3 flex items-center justify-center gap-3">
              <div className="bg-primary/10 rounded-xl p-3">
                <Mail className="text-primary h-8 w-8" />
              </div>
              <h1 className="text-foreground text-4xl font-bold tracking-tight">
                Mailbox Server Mapping
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Find which mail server hosts specific email addresses
            </p>
          </div>
          {hasSearched && (
            <div className="mb-6 flex justify-center">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary flex items-center gap-2 rounded-lg px-6 py-3 text-base font-semibold shadow-lg transition-all hover:shadow-xl focus:ring-2 focus:ring-offset-2 focus:outline-none"
              >
                <Mail className="h-5 w-5" />
                New Mapping Search
              </button>
            </div>
          )}
        </div>

        {!hasSearched && (
          <div className="mb-10">
            <div className="border-border bg-card mx-auto max-w-3xl overflow-hidden rounded-xl border shadow-lg">
              <div className="border-border bg-muted/30 border-b px-6 py-4">
                <h2 className="text-foreground flex items-center gap-2 text-lg font-semibold">
                  <Mail className="text-primary h-5 w-5" />
                  Email Input
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Enter or import email addresses to find their server mappings
                </p>
              </div>
              <div className="p-6">
                <EmailInputForm
                  {...{
                    register,
                    errors,
                    currentEmails,
                    handleSubmit,
                    onSubmit,
                    isLoading: mailMappingMutation.isPending,
                    showSampleDropdown,
                    setShowSampleDropdown,
                    downloadSampleXLSX,
                    downloadSampleCSV,
                    handleFileImport,
                    copyEmailsToClipboard,
                    dropdownRef,
                    fileInputRef,
                    hasSearched,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="border-border bg-card relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border shadow-2xl">
              <div className="border-border bg-muted/30 sticky top-0 z-10 border-b px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-foreground flex items-center gap-2 text-lg font-semibold">
                      <Mail className="text-primary h-5 w-5" />
                      Email Input
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Enter or import email addresses to find their server
                      mappings
                    </p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-muted-foreground hover:bg-accent hover:text-foreground rounded-lg p-2 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <EmailInputForm
                  {...{
                    register,
                    errors,
                    currentEmails,
                    handleSubmit,
                    onSubmit,
                    isLoading: mailMappingMutation.isPending,
                    showSampleDropdown,
                    setShowSampleDropdown,
                    downloadSampleXLSX,
                    downloadSampleCSV,
                    handleFileImport,
                    copyEmailsToClipboard,
                    dropdownRef,
                    fileInputRef,
                    hasSearched,
                    onCancel: () => setIsModalOpen(false),
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {hasSearched && (
          <>
            {totalEmails > 0 ? (
              <div
                ref={tableRef}
                className="border-border bg-card mx-auto  overflow-hidden rounded-xl border shadow-lg"
              >
                <div className="border-border bg-card/50 border-b p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="max-w-md min-w-[300px] flex-1">
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <Search className="text-muted-foreground h-4 w-4" />
                        </div>
                        <input
                          type="text"
                          placeholder="Search email or server ID..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="border-border bg-background text-foreground focus:border-primary focus:ring-primary block w-full rounded-lg border py-2 pr-10 pl-10 text-sm transition-colors focus:ring-2 focus:outline-none"
                        />
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm("")}
                            className="hover:text-foreground absolute inset-y-0 right-0 flex items-center pr-3 transition-colors"
                          >
                            <X className="text-muted-foreground h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <div className="text-muted-foreground mt-2 text-sm font-medium">
                        Showing{" "}
                        <span className="text-foreground">
                          {filteredEmailCount}
                        </span>{" "}
                        of{" "}
                        <span className="text-foreground">{totalEmails}</span>{" "}
                        emails
                      </div>
                    </div>
                    <div className="relative" ref={exportDropdownRef}>
                      <button
                        onClick={() =>
                          setShowExportDropdown(!showExportDropdown)
                        }
                        className="bg-success text-success-foreground hover:bg-success/90 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        Export
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      {showExportDropdown && (
                        <div className="border-border bg-card absolute right-0 z-10 mt-2 w-48 rounded-lg border shadow-xl">
                          <div className="p-1">
                            <button
                              onClick={() => {
                                exportToCSV();
                                setShowExportDropdown(false);
                              }}
                              className="text-foreground hover:bg-accent flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm transition-colors"
                            >
                              <FileText className="text-success h-4 w-4" />
                              <span>Export as CSV</span>
                            </button>
                            <button
                              onClick={() => {
                                exportToExcel();
                                setShowExportDropdown(false);
                              }}
                              className="text-foreground hover:bg-accent flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm transition-colors"
                            >
                              <FileSpreadsheet className="text-success h-4 w-4" />
                              <span>Export as Excel</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  {Object.keys(filteredGroups).length > 0 ? (
                    <table className="divide-border min-w-full divide-y">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-muted-foreground px-6 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                            Email Addresses
                          </th>
                          <th className="text-muted-foreground px-6 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                            Server Details
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-border bg-card divide-y">
                        {Object.entries(filteredGroups).map(
                          ([serverId, emails]) => (
                            <tr
                              key={serverId}
                              className="hover:bg-accent/50 transition-colors"
                            >
                              <td className="px-6 py-4 align-top">
                                <div className="flex flex-wrap gap-2">
                                  {emails.map((email, idx) => (
                                    <span
                                      key={idx}
                                      className="bg-primary/5 text-foreground border-primary/20 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium"
                                    >
                                      <Mail className="text-primary h-3.5 w-3.5" />
                                      {email}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="text-foreground px-6 py-4 text-sm">
                                <ServerDetails
                                  serverId={serverId}
                                  emails={emails}
                                  onServerData={handleServerData}
                                />
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-muted-foreground py-12 text-center">
                      <Search className="text-muted-foreground/50 mx-auto mb-3 h-12 w-12" />
                      <p className="text-lg font-medium">
                        No emails found matching your search
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="border-border bg-card mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 rounded-xl border py-16 text-center shadow-sm">
                <div className="bg-muted/50 rounded-full p-4">
                  <AlertCircle className="text-muted-foreground h-12 w-12" />
                </div>
                <div>
                  <p className="text-foreground text-lg font-semibold">
                    No Servers Found
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    No mail servers were found for the provided email addresses
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MailboxServerMapping;
