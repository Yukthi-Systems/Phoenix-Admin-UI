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
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import {
  Server,
  RefreshCw,
  AlertCircle,
  Download,
  Mail,
  Send,
  AlertTriangle,
  BarChart3,
  Search,
  XCircle,
  Clock,
  Shield,
  Inbox,
  TrendingUp,
  Database,
  Globe,
} from "lucide-react";
import { useAtomValue } from "jotai";
import { userProfileAtom } from "@/store/userProfile";
import { useGetPflogsumReport } from "@/hooks/useServer";
import { useToastify } from "@/hooks/useToastify";
import AccessDenied from "@/components/common/AccessDenied";
import TableWithoutPagination from "@/components/shared/TableWithoutPagination";
import ServerSelector from "../mailQ/searchMailQ/ServerSelector";

// Import modular components
import MetricsCard from "./MetricsCard";
import AdditionalMetrics from "./AdditionalMetrics";
import {
  AccordionNestedSection,
  AccordionCategorySection,
} from "./AccordionSection";
import { normalizePflogsumTotals } from "./normalizedMetrics";

const PFLogSum = () => {
  const [selectedServer, setSelectedServer] = useState("");
  const [fromWhen, setFromWhen] = useState("today");
  const [expandedSection, setExpandedSection] = useState("overview");
  const [expandedAccordions, setExpandedAccordions] = useState({});

  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const notify = useToastify();

  const { data, isLoading, isError, error, refetch, isFetching } =
    useGetPflogsumReport(selectedServer, fromWhen);

  const handleFetchReport = () => {
    if (selectedServer) refetch();
  };

  const toggleAccordion = (key) => {
    setExpandedAccordions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Column definitions
  const senderColumns = useMemo(
    () => [
      {
        header: "Sender Address",
        accessorKey: "value",
        meta: { align: "left" },
      },
      { header: "Count", accessorKey: "count", meta: { align: "right" } },
    ],
    [],
  );

  const recipientColumns = useMemo(
    () => [
      {
        header: "Recipient Address",
        accessorKey: "value",
        meta: { align: "left" },
      },
      { header: "Count", accessorKey: "count", meta: { align: "right" } },
    ],
    [],
  );

  const hostDomainColumns = useMemo(
    () => [
      {
        header: "Host/Domain",
        accessorKey: "host_domain",
        meta: { align: "left" },
      },
      {
        header: "Message Count",
        accessorKey: "message_count",
        meta: { align: "right" },
      },
      { header: "Bytes", accessorKey: "bytes", meta: { align: "right" } },
    ],
    [],
  );

  const senderTable = useReactTable({
    data: data?.parsed_report?.senders_by_message_count || [],
    columns: senderColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const recipientTable = useReactTable({
    data: data?.parsed_report?.recipients_by_message_count || [],
    columns: recipientColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const hostDomainTable = useReactTable({
    data: data?.parsed_report?.host_domain_summary_received || [],
    columns: hostDomainColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (!permissions.includes("server:view")) {
    return (
      <AccessDenied content="Access Denied: Server View permission required." />
    );
  }

  const handleDownloadLog = () => {
    if (!data?.raw_report) return;
    const blob = new Blob([data.raw_report], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pflogsum-${selectedServer}-${fromWhen}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    notify("success", "Log file download started");
  };

  const rawTotals = data?.parsed_report?.grand_totals;
  const totals = normalizePflogsumTotals(rawTotals);
  const primaryMetrics = totals
    ? [
        {
          label: "Received",
          value: totals.messages.received,
          icon: <Mail className="text-blue-500" />,
          variant: "info",
          sub: {
            label: "Traffic In",
            value: totals.traffic.receivedBytes,
            tone: "info",
          },
        },
        {
          label: "Delivered",
          value: totals.messages.delivered,
          icon: <Send className="text-success" />,
          variant: "success",
          sub: {
            label: "Traffic Out",
            value: totals.traffic.deliveredBytes,
            tone: "success",
          },
        },
        {
          label: "Bounced",
          value: totals.messages.bounced,
          icon: <AlertTriangle className="text-warning" />,
          variant: "warning",
        },
        {
          label: "Rejected",
          value: totals.messages.rejectedCount,
          icon: <AlertCircle className="text-destructive" />,
          variant: "destructive",
          sub: {
            label: "Rejection Rate",
            value: `${totals.messages.rejectedPercent}%`,
            tone: "destructive",
          },
        },
      ]
    : [];

  const isLoadingOrFetching = isLoading || isFetching;

  // Calculate counts for sections
  const issuesCount = (() => {
    let count = 0;
    const report = data?.parsed_report;
    if (!report) return 0;

    const sections = [
      report.message_reject_detail,
      report.message_discard_detail,
      report.message_deferral_detail,
      report.message_reject_warning_detail,
      report.message_hold_detail,
      report.warnings,
      report.smtp_delivery_failures,
      report.fatal_errors,
      report.panics,
      report.master_daemon_messages,
    ];

    sections.forEach((section) => {
      if (section && Object.keys(section).length > 0) {
        count++;
      }
    });

    return count;
  })();

  const sections = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    {
      id: "traffic",
      label: "Traffic Analysis",
      icon: TrendingUp,
      count: data?.parsed_report?.host_domain_summary_received?.length || 0,
    },
    {
      id: "issues",
      label: "Issues & Warnings",
      icon: AlertTriangle,
      count: issuesCount,
    },
  ];

  return (
    <div className="bg-background text-left min-h-screen p-6">
      <div className="mx-auto max-w-[1800px]">
        {/* Header */}
        {/* <div className="mb-8 text-center">
          <h1 className="text-foreground text-3xl font-bold mb-4">
            Pflogsum Report
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl">
            Monitor Postfix traffic delivery statistics including sent,
            received, bounced, and rejected messages.
          </p>
        </div> */}

        {/* Server Selection */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <ServerSelector
              selectedServer={selectedServer}
              setSelectedServer={setSelectedServer}
              onFetch={handleFetchReport}
              isLoading={isLoadingOrFetching}
              fetchText="Fetch Report"
            />
          </div>
        </div>

        <div className="flex items-center justify-between ">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {data?.parsed_report?.heading || " Pflogsum Report Summary"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Detailed breakdown of mail server activities and traffic metrics.
            </p>
          </div>
          <div className="flex mb-6 justify-end">
            <div className="flex self-end flex-col gap-2 max-w-[200px]">
              <label className="text-muted-foreground text-sm font-medium">
                Report Period
              </label>
              <select
                value={fromWhen}
                onChange={(e) => setFromWhen(e.target.value)}
                className="bg-card border-border text-foreground rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
              </select>
            </div>
          </div>
        </div>
        {/* Report Period */}

        {/* Content Area */}
        {!selectedServer ? (
          <div className="bg-card border-border border-dashed rounded-2xl border-2 py-32 text-center shadow-sm">
            <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Server className="text-muted-foreground/60 h-10 w-10" />
            </div>
            <h3 className="text-foreground text-xl font-semibold">
              Ready to Analyze
            </h3>
            <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
              Select a mail server and a reporting period to generate high-level
              log summaries.
            </p>
          </div>
        ) : isLoadingOrFetching ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-32 bg-card border border-border rounded-xl animate-pulse"
                />
              ))}
            </div>
            <div className="h-[500px] bg-card border border-border rounded-xl animate-pulse" />
          </div>
        ) : isError ? (
          <div className="bg-card border-border rounded-xl border py-16 text-center shadow-sm">
            <AlertCircle className="text-destructive mx-auto mb-4 h-16 w-16" />
            <h3 className="text-foreground text-lg font-medium">
              Failed to retrieve logs
            </h3>
            <p className="text-muted-foreground mb-6">
              {error?.message || "Internal server connection error"}
            </p>
            <button
              onClick={() => refetch()}
              className="bg-primary text-primary-foreground rounded-lg px-8 py-2.5 font-medium transition-all hover:opacity-90 flex items-center gap-2 mx-auto"
            >
              <RefreshCw size={18} /> Retry Connection
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* All Metrics - Combined Compact View */}
            <div className="space-y-4">
              {/* Primary Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {primaryMetrics.map((m, idx) => (
                  <MetricsCard key={idx} {...m} />
                ))}
              </div>

              <AdditionalMetrics totals={totals} />
            </div>

            {/* Main Report Container */}
            <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
              {/* Tab Header */}
              <div className="flex flex-col sm:flex-row items-center justify-between border-b border-border px-6 py-4 bg-muted/10 gap-4">
                <h2 className="text-xl font-bold text-foreground">
                  Visual Analytics
                </h2>
                <button
                  onClick={handleDownloadLog}
                  className="w-full sm:w-auto bg-accent hover:bg-accent/80 text-accent-foreground flex items-center justify-center gap-2 rounded-xl px-5 py-2 text-sm font-bold transition-all border border-border shadow-sm active:scale-95"
                >
                  <Download size={18} /> Download Log
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Section Navigation */}
                <div className="flex gap-2 border-b border-border pb-4 overflow-x-auto mb-8">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setExpandedSection(section.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                          expandedSection === section.id
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        <Icon size={16} />
                        {section.label}
                        {section.count !== undefined && (
                          <span
                            className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                              expandedSection === section.id
                                ? "bg-primary-foreground/20 text-primary-foreground"
                                : "bg-muted text-foreground"
                            }`}
                          >
                            {section.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Overview Section */}
                {expandedSection === "overview" && (
                  <div className="space-y-8">
                    {/* Top Senders & Recipients */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <BarChart3 size={20} className="text-primary" />
                          </div>
                          <h3 className="font-bold text-lg text-foreground">
                            Top Senders by Count
                          </h3>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <TableWithoutPagination
                            table={senderTable}
                            isLoading={isLoadingOrFetching}
                            cellPadding="py-3"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Search size={20} className="text-primary" />
                          </div>
                          <h3 className="font-bold text-lg text-foreground">
                            Top Recipients by Count
                          </h3>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <TableWithoutPagination
                            table={recipientTable}
                            isLoading={isLoadingOrFetching}
                            cellPadding="py-3"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Traffic Analysis Section */}
                {expandedSection === "traffic" && (
                  <div className="space-y-8">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Globe size={20} className="text-primary" />
                        </div>
                        <h3 className="font-bold text-lg text-foreground">
                          Host/Domain Summary (Received)
                        </h3>
                      </div>
                      <div className="overflow-hidden">
                        <TableWithoutPagination
                          table={hostDomainTable}
                          isLoading={isLoadingOrFetching}
                          cellPadding="py-3"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Issues & Warnings Section with Accordions */}
                {expandedSection === "issues" && (
                  <div className="space-y-4">
                    <AccordionNestedSection
                      title="Message Reject Detail"
                      icon={XCircle}
                      data={data?.parsed_report?.message_reject_detail}
                      emptyMessage="No message rejections found"
                      sectionKey="reject"
                      expandedSections={expandedAccordions}
                      toggleSection={toggleAccordion}
                    />

                    <AccordionNestedSection
                      title="Message Discard Detail"
                      icon={Inbox}
                      data={data?.parsed_report?.message_discard_detail}
                      emptyMessage="No message discards found"
                      sectionKey="discard"
                      expandedSections={expandedAccordions}
                      toggleSection={toggleAccordion}
                    />

                    <AccordionNestedSection
                      title="Message Deferral Detail"
                      icon={Clock}
                      data={data?.parsed_report?.message_deferral_detail}
                      emptyMessage="No message deferrals found"
                      sectionKey="deferral"
                      expandedSections={expandedAccordions}
                      toggleSection={toggleAccordion}
                    />

                    <AccordionNestedSection
                      title="Message Reject Warning Detail"
                      icon={Shield}
                      data={data?.parsed_report?.message_reject_warning_detail}
                      emptyMessage="No reject warnings found"
                      sectionKey="reject_warning"
                      expandedSections={expandedAccordions}
                      toggleSection={toggleAccordion}
                    />

                    <AccordionNestedSection
                      title="Message Hold Detail"
                      icon={Database}
                      data={data?.parsed_report?.message_hold_detail}
                      emptyMessage="No held messages found"
                      sectionKey="hold"
                      expandedSections={expandedAccordions}
                      toggleSection={toggleAccordion}
                    />

                    <AccordionCategorySection
                      title="Warnings"
                      icon={AlertTriangle}
                      data={data?.parsed_report?.warnings}
                      emptyMessage="No warnings found"
                      sectionKey="warnings"
                      expandedSections={expandedAccordions}
                      toggleSection={toggleAccordion}
                    />

                    <AccordionCategorySection
                      title="SMTP Delivery Failures"
                      icon={XCircle}
                      data={data?.parsed_report?.smtp_delivery_failures}
                      emptyMessage="No SMTP delivery failures"
                      sectionKey="smtp_failures"
                      expandedSections={expandedAccordions}
                      toggleSection={toggleAccordion}
                    />

                    <AccordionCategorySection
                      title="Fatal Errors"
                      icon={AlertCircle}
                      data={data?.parsed_report?.fatal_errors}
                      emptyMessage="No fatal errors"
                      sectionKey="fatal_errors"
                      expandedSections={expandedAccordions}
                      toggleSection={toggleAccordion}
                    />

                    <AccordionCategorySection
                      title="Panics"
                      icon={AlertTriangle}
                      data={data?.parsed_report?.panics}
                      emptyMessage="No panics detected"
                      sectionKey="panics"
                      expandedSections={expandedAccordions}
                      toggleSection={toggleAccordion}
                    />

                    <AccordionCategorySection
                      title="Master Daemon Messages"
                      icon={Server}
                      data={data?.parsed_report?.master_daemon_messages}
                      emptyMessage="No master daemon messages"
                      sectionKey="master_daemon"
                      expandedSections={expandedAccordions}
                      toggleSection={toggleAccordion}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PFLogSum;
