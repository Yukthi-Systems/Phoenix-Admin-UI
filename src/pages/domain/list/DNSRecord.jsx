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

import React, { useState, useMemo } from "react";
import {
  X,
  Globe,
  Copy,
  Check,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Server,
  Shield,
  Database,
  GitCompare,
} from "lucide-react";
import { useGetDNSRecord } from "@/hooks/useDomain";
import { DNS_API_KEY } from "@/constants/constants";

const DNSRecordsModal = ({ isOpen, onClose, domainName = "nekonik.com" }) => {
  const [copiedValue, setCopiedValue] = useState(null);
  const [activeTab, setActiveTab] = useState("comparison");
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState(null);
  const { data, isLoading, isError, error } = useGetDNSRecord(domainName);

  const dnsURL = import.meta.env.VITE_DNS_URL || "";

  const mailServerRecords = data?.dns_records || [];

  React.useEffect(() => {
    if (isOpen && domainName) {
      handleValidation();
    }
  }, [isOpen, domainName]);

  const copyToClipboard = async (text, recordId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedValue(recordId);
      setTimeout(() => setCopiedValue(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
      setValidationResults(null);
    }
  };

  const handleValidation = async () => {
    setIsValidating(true);

    try {
      const response = await fetch(
        `${dnsURL}/api/dns/validate?domain=${encodeURIComponent(domainName)}`,
        {
          headers: {
            "x-api-key": DNS_API_KEY,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Validation API request failed: ${response.status}`);
      }

      const apiResponse = await response.json();

      if (apiResponse.success && apiResponse.data) {
        const results = [
          {
            recordName: apiResponse.data.results.mx.recordName,
            recordData: apiResponse.data.results.mx.recordData,
            isActive: apiResponse.data.results.mx.isActive,
          },
          {
            recordName: apiResponse.data.results.spf.recordName,
            recordData: apiResponse.data.results.spf.recordData,
            isActive: apiResponse.data.results.spf.isActive,
          },
          {
            recordName: apiResponse.data.results.dkim.recordName,
            recordData: apiResponse.data.results.dkim.recordData,
            isActive: apiResponse.data.results.dkim.isActive,
          },
          {
            recordName: apiResponse.data.results.dmarc.recordName,
            recordData: apiResponse.data.results.dmarc.recordData,
            isActive: apiResponse.data.results.dmarc.isActive,
          },
          {
            recordName: apiResponse.data.results.bimi.recordName,
            recordData: apiResponse.data.results.bimi.recordData,
            isActive: apiResponse.data.results.bimi.isActive,
          },
        ];

        setValidationResults(results);
      } else {
        throw new Error("API returned unsuccessful response");
      }
    } catch (error) {
      console.error("DNS validation failed:", error);
      setValidationResults([
        {
          recordName: "Validation Error",
          recordData:
            "Unable to perform DNS lookup. Please check domain or try again.",
          isActive: false,
        },
      ]);
    } finally {
      setIsValidating(false);
    }
  };

  // Helper to normalize DKIM record for comparison
  const normalizeDkimRecord = (str) => {
    if (!str) return "";

    return str
      .toLowerCase()
      .trim()
      .replace(/→.*$/, "") // Remove arrow and anything after
      .replace(/\s+/g, ""); // Remove whitespace
  };

  // Improved comparison logic
  const comparisonData = useMemo(() => {
    if (!validationResults || !mailServerRecords?.length) return null;

    const normalize = (str) =>
      String(str || "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ")
        .replace(/^"|"$/g, "");

    const comparisons = [];

    /** ---------------- MX RECORDS ---------------- **/
    const mxValidation = validationResults.find(
      (r) => r.recordName === "MX-Record",
    );
    const mxRecords = mailServerRecords.filter((r) => r.type === "MX");

    if (mxValidation && mxRecords.length > 0) {
      let validatedMxRecords = [];

      try {
        const parsed = JSON.parse(mxValidation.recordData);
        validatedMxRecords = parsed.map((line) => {
          const [priority, ...rest] = line.trim().split(/\s+/);
          return {
            priority: parseInt(priority),
            exchange: normalize(rest.join(" ")),
          };
        });
      } catch {
        validatedMxRecords = [];
      }

      const apiMxRecords = mxRecords.map((r) => ({
        priority: r.priority,
        exchange: normalize(r.value),
      }));

      const matchedRecords = [];
      const missingRecords = [];

      validatedMxRecords.forEach((valRec) => {
        const found = apiMxRecords.find(
          (apiRec) =>
            apiRec.exchange === valRec.exchange ||
            apiRec.exchange.includes(valRec.exchange) ||
            valRec.exchange.includes(apiRec.exchange),
        );

        if (found) {
          matchedRecords.push(valRec);
        } else {
          missingRecords.push(valRec);
        }
      });

      const extraRecords = apiMxRecords.filter(
        (apiRec) =>
          !validatedMxRecords.some(
            (valRec) =>
              apiRec.exchange === valRec.exchange ||
              apiRec.exchange.includes(valRec.exchange) ||
              valRec.exchange.includes(apiRec.exchange),
          ),
      );

      comparisons.push({
        type: "MX",
        recordName: "MX Records",
        apiData: apiMxRecords
          .map((r) => `${r.priority} ${r.exchange}`)
          .join(", "),
        validatedData: validatedMxRecords
          .map((r) => `${r.priority} ${r.exchange}`)
          .join(", "),
        matches: missingRecords.length === 0,
        isActive: mxValidation.isActive,
        details: {
          matched: matchedRecords.length,
          missing: missingRecords,
          extra: extraRecords,
          total: validatedMxRecords.length,
        },
      });
    }

    /** ---------------- SPF ---------------- **/
    const spfValidation = validationResults.find(
      (r) => r.recordName === "SPF-Record",
    );
    const spfApi = mailServerRecords.find(
      (r) => r.type === "TXT" && r.value.includes("v=spf1"),
    );

    if (spfValidation && (spfApi || spfValidation.recordData)) {
      const apiVal = normalize(spfApi?.value || "");
      const valVal = normalize(spfValidation.recordData);

      // Only compare if both have data
      const matches =
        apiVal && valVal
          ? apiVal.replace(/\s+/g, "") === valVal.replace(/\s+/g, "")
          : false;

      comparisons.push({
        type: "TXT",
        recordName: "SPF Record",
        apiData: spfApi?.value || "Not configured",
        validatedData: spfValidation.recordData || "Not configured",
        matches,
        isActive: spfValidation.isActive,
        hasData: !!(apiVal && valVal),
      });
    }

    /** ---------------- DKIM ---------------- **/
    const dkimValidation = validationResults.find(
      (r) => r.recordName === "DKIM-Record",
    );
    const dkimApi = mailServerRecords.find(
      (r) => r.type === "CNAME" && r.name.includes("_domainkey"),
    );

    if (dkimValidation && (dkimApi || dkimValidation.recordData)) {
      const apiVal = normalizeDkimRecord(dkimApi?.value || "");
      const valVal = normalizeDkimRecord(dkimValidation.recordData || "");

      // Compare the full normalized DKIM records - they should match exactly
      // or the API value should end with the validated value (CNAME target)
      const matches =
        apiVal && valVal
          ? apiVal === valVal || apiVal.endsWith(valVal) || valVal.endsWith(apiVal)
          : false;

      comparisons.push({
        type: "CNAME",
        recordName: "DKIM Record",
        apiData: dkimApi?.value || "Not configured",
        validatedData: dkimValidation.recordData || "Not configured",
        matches,
        isActive: dkimValidation.isActive,
        hasData: !!(apiVal && valVal),
      });
    }

    /** ---------------- DMARC ---------------- **/
    const dmarcValidation = validationResults.find(
      (r) => r.recordName === "DMARC-Record",
    );
    const dmarcApi = mailServerRecords.find(
      (r) => r.type === "TXT" && r.name.includes("_dmarc"),
    );

    if (dmarcValidation && (dmarcApi || dmarcValidation.recordData)) {
      const apiVal = normalize(dmarcApi?.value || "");
      const valVal = normalize(dmarcValidation.recordData);

      const matches =
        apiVal && valVal
          ? apiVal.replace(/\s+/g, "") === valVal.replace(/\s+/g, "")
          : false;

      comparisons.push({
        type: "TXT",
        recordName: "DMARC Record",
        apiData: dmarcApi?.value || "Not configured",
        validatedData: dmarcValidation.recordData || "Not configured",
        matches,
        isActive: dmarcValidation.isActive,
        hasData: !!(apiVal && valVal),
      });
    }

    /** ---------------- BIMI ---------------- **/
    const bimiValidation = validationResults.find(
      (r) => r.recordName === "BIMI-Record",
    );
    const bimiApi = mailServerRecords.find(
      (r) => r.type === "TXT" && r.name.includes("_bimi"),
    );

    if (bimiValidation && (bimiApi || bimiValidation.recordData)) {
      const apiVal = normalize(bimiApi?.value || "");
      const valVal = normalize(bimiValidation.recordData);

      const matches =
        apiVal && valVal
          ? apiVal.replace(/\s+/g, "") === valVal.replace(/\s+/g, "")
          : false;

      comparisons.push({
        type: "TXT",
        recordName: "BIMI Record",
        apiData: bimiApi?.value || "Not configured",
        validatedData: bimiValidation.recordData || "Not configured",
        matches,
        isActive: bimiValidation.isActive,
        hasData: !!(apiVal && valVal),
      });
    }

    // Filter out comparisons where both don't have data
    return comparisons.filter((c) => c.hasData !== false);
  }, [validationResults, mailServerRecords]);

  const tabs = [
    { id: "comparison", label: "Comparison", icon: GitCompare },
    { id: "records", label: "Actual Records", icon: Server },
    { id: "lookup", label: "DNS Lookup", icon: Shield },
  ];

  const getRecordTypeColor = (type) => {
    const colors = {
      MX: "bg-purple-100/20 text-purple-900 border-purple-300 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-700",
      TXT: "bg-yellow-100 text-yellow-900 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700",
      CNAME:
        "bg-green-100 text-green-900 border-green-300 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700",
    };
    return (
      colors[type] ||
      "bg-gray-100 text-gray-900 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
    );
  };

  const formatRecordName = (name) => name;
  const formatPriority = (priority) =>
    priority !== null && priority !== undefined ? priority : "-";

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-card text-left border-border fixed top-1/2 left-1/2 z-[9999] max-h-[90vh] w-full max-w-5xl -translate-x-1/2 -translate-y-1/2 transform overflow-hidden rounded-lg border shadow-lg">
        {/* Header */}
        <div className="border-border bg-muted/30 flex items-center justify-between border-b p-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-full">
              <Globe className="text-primary-foreground h-5 w-5" />
            </div>
            <div>
              <h2 className="text-card-foreground text-left text-xl font-semibold">
                Mail Service DNS Records
              </h2>
              <p className="text-muted-foreground text-left text-sm">
                Domain:{" "}
                <span className="text-foreground font-medium">
                  {domainName}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleValidation}
              disabled={isValidating}
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${isValidating ? "animate-spin" : ""}`}
              />
              {isValidating ? "Validating..." : "Revalidate"}
            </button>
            <button
              onClick={onClose}
              className="hover:bg-accent rounded-lg p-2 transition-colors"
              aria-label="Close modal"
            >
              <X className="text-muted-foreground hover:text-foreground h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-border bg-muted/10 border-b">
          <div className="flex px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "text-muted-foreground hover:text-foreground hover:border-border border-transparent"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-180px)] overflow-y-auto p-6">
          {/* Comparison Tab */}
          {activeTab === "comparison" && (
            <div className="space-y-4">
              {isValidating || !comparisonData ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="text-primary h-5 w-5 animate-spin" />
                    <span className="text-muted-foreground">
                      {isValidating
                        ? "Validating DNS records..."
                        : "Loading comparison..."}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Summary Stats */}
                  <div className="flex items-center gap-3">
                    <div className="bg-muted/30 border-border flex items-center gap-2 rounded-lg border px-3 py-2">
                      <span className="text-muted-foreground text-sm">
                        Total:
                      </span>
                      <span className="text-foreground text-sm font-semibold">
                        {comparisonData.length}
                      </span>
                    </div>
                    <div className="bg-success/10 border-success/20 flex items-center gap-2 rounded-lg border px-3 py-2">
                      <CheckCircle className="text-success h-4 w-4" />
                      <span className="text-success text-sm font-semibold">
                        {comparisonData.filter((c) => c.matches).length} Matched
                      </span>
                    </div>
                    {comparisonData.filter((c) => !c.matches).length > 0 && (
                      <div className="bg-warning/10 border-warning/20 flex items-center gap-2 rounded-lg border px-3 py-2">
                        <AlertCircle className="text-warning h-4 w-4" />
                        <span className="text-warning text-sm font-semibold">
                          {comparisonData.filter((c) => !c.matches).length}{" "}
                          Missing
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Comparison Cards */}
                  <div className="space-y-3">
                    {comparisonData.map((comparison, index) => (
                      <div
                        key={index}
                        className={`rounded-lg border p-4 ${
                          comparison.matches
                            ? "bg-success/5 border-success/20"
                            : "bg-warning/5 border-warning/20"
                        }`}
                      >
                        {/* Header */}
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${getRecordTypeColor(comparison.type)}`}
                            >
                              {comparison.type}
                            </span>
                            <span className="text-foreground text-sm font-medium">
                              {comparison.recordName}
                            </span>
                            {comparison.type === "MX" && comparison.details && (
                              <span className="text-muted-foreground text-xs">
                                ({comparison.details.matched}/
                                {comparison.details.total} matched)
                              </span>
                            )}
                          </div>
                          <div
                            className={`flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ${
                              comparison.matches
                                ? "bg-success/10 text-success"
                                : "bg-warning/10 text-warning"
                            }`}
                          >
                            {comparison.matches ? (
                              <>
                                <CheckCircle className="h-3 w-3" />
                                Matched
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-3 w-3" />
                                Missing
                              </>
                            )}
                          </div>
                        </div>

                        {/* Data Display */}
                        <div className="space-y-2">
                          <div className="grid grid-cols-12 gap-2 text-xs">
                            <div className="text-muted-foreground col-span-2 flex items-center">
                              Expected:
                            </div>
                            <div className="bg-card border-border text-foreground col-span-10 rounded border px-3 py-2 text-left font-mono text-xs break-all">
                              {comparison.validatedData}
                            </div>
                          </div>
                          <div className="grid grid-cols-12 gap-2 text-xs">
                            <div className="text-muted-foreground col-span-2 flex items-center">
                              Actual:
                            </div>
                            <div className="bg-card border-border text-foreground col-span-10 rounded border px-3 py-2 text-left font-mono text-xs break-all">
                              {comparison.apiData}
                            </div>
                          </div>
                        </div>

                        {/* Missing/Extra Records for MX */}
                        {comparison.type === "MX" && comparison.details && (
                          <>
                            {comparison.details.missing?.length > 0 && (
                              <div className="bg-warning/10 border-warning/20 mt-3 rounded border p-3">
                                <div className="text-warning mb-1 flex items-center gap-1 text-xs font-medium">
                                  <AlertCircle className="h-3 w-3" />
                                  Missing Expected Records:
                                </div>
                                <div className="text-warning/80 text-left text-xs">
                                  {comparison.details.missing
                                    .map((r) => `${r.priority} ${r.exchange}`)
                                    .join(", ")}
                                </div>
                              </div>
                            )}
                            {comparison.details.extra?.length > 0 && (
                              <div className="mt-3 rounded border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/10">
                                <div className="mb-1 flex items-center gap-1 text-xs font-medium text-blue-700 dark:text-blue-400">
                                  <Database className="h-3 w-3" />
                                  Additional Records in DNS:
                                </div>
                                <div className="text-xs text-blue-600 dark:text-blue-300">
                                  {comparison.details.extra
                                    .map((r) => `${r.priority} ${r.exchange}`)
                                    .join(", ")}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Expected Records Tab */}
          {activeTab === "records" && (
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="text-primary h-5 w-5 animate-spin" />
                    <span className="text-muted-foreground">
                      Loading DNS records...
                    </span>
                  </div>
                </div>
              ) : isError ? (
                <div className="py-12 text-center">
                  <AlertCircle className="text-destructive mx-auto mb-4 h-12 w-12" />
                  <p className="text-destructive">Failed to load DNS records</p>
                  <p className="text-muted-foreground mt-2 text-sm">
                    {error?.message}
                  </p>
                </div>
              ) : mailServerRecords.length === 0 ? (
                <div className="py-12 text-center">
                  <Database className="text-muted-foreground/50 mx-auto mb-4 h-12 w-12" />
                  <p className="text-muted-foreground">
                    No DNS records found for this domain
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-full">
                    <div className="border-border bg-muted/20 text-muted-foreground grid grid-cols-12 gap-4 rounded-t-lg border-b px-4 py-3 text-sm font-medium">
                      <div className="col-span-2">Type</div>
                      <div className="col-span-3">Name</div>
                      <div className="col-span-1">Priority</div>
                      <div className="col-span-6">Value</div>
                    </div>

                    <div className="space-y-1">
                      {mailServerRecords.map((record, index) => (
                        <div
                          key={index}
                          className="hover:bg-muted/50 hover:border-border/50 grid grid-cols-12 gap-4 rounded-lg border border-transparent px-4 py-3 transition-colors"
                        >
                          <div className="col-span-2">
                            <span
                              className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium ${getRecordTypeColor(record.type)}`}
                            >
                              {record.type}
                            </span>
                          </div>
                          <div className="col-span-3">
                            <span className="text-muted-foreground text-sm break-all">
                              {formatRecordName(record.name)}
                            </span>
                          </div>
                          <div className="col-span-1">
                            <span className="text-foreground font-mono text-sm">
                              {formatPriority(record.priority)}
                            </span>
                          </div>
                          <div className="col-span-6">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-foreground flex-1 text-sm break-all">
                                {record.value}
                              </span>
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    record.value,
                                    `record-${index}`,
                                  )
                                }
                                className="hover:bg-accent flex-shrink-0 rounded p-1 transition-colors"
                                title="Copy value"
                              >
                                {copiedValue === `record-${index}` ? (
                                  <Check className="text-success h-3 w-3" />
                                ) : (
                                  <Copy className="text-muted-foreground hover:text-foreground h-3 w-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DNS Lookup Tab */}
          {activeTab === "lookup" && (
            <div className="space-y-4">
              {isValidating ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="text-primary h-5 w-5 animate-spin" />
                    <span className="text-muted-foreground">
                      Validating DNS records...
                    </span>
                  </div>
                </div>
              ) : !validationResults ? (
                <div className="py-12 text-center">
                  <Shield className="text-muted-foreground/50 mx-auto mb-4 h-12 w-12" />
                  <p className="text-muted-foreground">
                    Click "Revalidate" to fetch DNS lookup data
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-full">
                    <div className="border-border bg-muted/20 text-muted-foreground grid grid-cols-12 gap-4 rounded-t-lg border-b px-4 py-3 text-sm font-medium">
                      <div className="col-span-3">Record Name</div>
                      <div className="col-span-7">Record Data</div>
                      <div className="col-span-2">Status</div>
                    </div>

                    <div className="space-y-1">
                      {validationResults.map((result, index) => (
                        <div
                          key={index}
                          className="hover:bg-muted/50 hover:border-border/50 grid grid-cols-12 gap-4 rounded-lg border border-transparent px-4 py-3 transition-colors"
                        >
                          <div className="col-span-3">
                            <span className="text-foreground text-sm font-medium">
                              {result.recordName}
                            </span>
                          </div>
                          <div className="col-span-7">
                            <div className="flex items-center gap-2">
                              <span className="text-foreground flex-1 rounded px-2 py-1 font-mono text-xs break-all">
                                {result.recordData}
                              </span>
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    result.recordData,
                                    `lookup-${index}`,
                                  )
                                }
                                className="hover:bg-accent flex-shrink-0 rounded p-1 transition-colors"
                                title="Copy record data"
                              >
                                {copiedValue === `lookup-${index}` ? (
                                  <Check className="text-success h-3 w-3" />
                                ) : (
                                  <Copy className="text-muted-foreground hover:text-foreground h-3 w-3" />
                                )}
                              </button>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div
                              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${
                                result.isActive
                                  ? "bg-success/10 text-success border-success/20 border"
                                  : "bg-destructive/10 text-destructive border-destructive/20 border"
                              }`}
                            >
                              {result.isActive ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : (
                                <AlertCircle className="h-3 w-3" />
                              )}
                              {result.isActive ? "Active" : "Inactive"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DNSRecordsModal;