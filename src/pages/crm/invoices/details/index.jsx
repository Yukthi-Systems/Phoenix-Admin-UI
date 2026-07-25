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

import {
  useFetchInvoiceWithRevisions,
  useDownloadInvoiceRevision,
} from "@/hooks/useInvoice";
import { userInfoAtom } from "@/store/userInfo";
import { userProfileAtom } from "@/store/userProfile";
import { useAtomValue } from "jotai";
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { BackButton, IconButton, Button } from "@/components/common/Buttons";
import StatusBadge from "@/components/common/StatusBadge";
import DataFechError from "@/components/common/DataFechError";
import AccessDenied from "@/components/common/AccessDenied";
import { useToastify } from "@/hooks/useToastify";
import {
  FileText,
  DollarSign,
  Clock,
  Plus,
  Edit3,
  Info,
  Edit,
  Copy,
} from "lucide-react";
import RevisionCard from "./RevisionCard";
import { useUserTimezone } from "@/hooks/useTimezone";
import { InfoCard, InfoItem } from "@/components/common/InfoCard";
import DropdownButton from "@/components/common/DropdownButton";

const InvoiceDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userInfo = useAtomValue(userInfoAtom);
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const toast = useToastify();

  const [downloadingRevision, setDownloadingRevision] = useState(null);
  const { formatUserDateNice, formatUserDateOnly } = useUserTimezone();
  const searchParams = new URLSearchParams(location.search);
  const invoiceId = searchParams.get("invoice_id");

  const { data, isLoading, isError } = useFetchInvoiceWithRevisions(
    userInfo.organization_id,
    invoiceId,
  );
  const { mutate: downloadRevision } = useDownloadInvoiceRevision();
  const invoice = data?.data?.invoice;
  const revisions = data?.data?.revisions || [];
  const latestRevision = revisions[0];

  const actionOptions = useMemo(() => {
    const options = [];
    if (permissions?.includes("crm:invoice:create")) {
      options.push({
        label: "Create Copy",
        description: "Duplicate this invoice",
        icon: <Copy className="h-4 w-4" />,
        onClick: () =>
          navigate(
            `/crm/invoice/create-copy?invoice_id=${invoice?.invoice_id}`,
          ),
      });
      options.push({
        label: "Create New Revision",
        description: "Create a revised version",
        icon: <Plus className="h-4 w-4" />,
        onClick: () =>
          navigate(`/crm/invoice/revise?invoice_id=${invoice?.invoice_id}`),
      });
    }
    return options;
  }, [permissions, invoice?.invoice_id, navigate]);

  if (!permissions?.includes("crm:invoice:view")) {
    return <AccessDenied />;
  }

  if (isError) {
    return <DataFechError />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-6 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-48 bg-muted rounded"></div>
              <div className="h-48 bg-muted rounded"></div>
              <div className="h-48 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleDownloadRevision = (revisionId) => {
    setDownloadingRevision(revisionId);

    downloadRevision(
      { organization_id: userInfo.organization_id, revision_id: revisionId },
      {
        onSuccess: (response) => {
          toast("success", "Invoice revision downloaded successfully!");

          // Create blob and download
          const blob = new Blob([response], { type: "application/pdf" });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `invoice-revision-${revisionId}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);

          setDownloadingRevision(null);
        },
        onError: (error) => {
          toast(
            "error",
            error?.message || "Failed to download invoice revision",
          );
          setDownloadingRevision(null);
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full mx-auto px-2 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <BackButton />
            <Breadcrumbs
              items={[
                { name: "CRM" },
                { name: "Invoices", link: "/crm/invoice" },
                { name: "View Invoice" },
              ]}
            />
          </div>

          <div className="flex items-center gap-2">
            {permissions?.includes("crm:invoice:edit") && (
              <Button
                onClick={() =>
                  navigate(
                    `/crm/invoice/edit?invoice_id=${invoice?.invoice_id}`,
                  )
                }
                icon={Edit}
                size="md"
              >
                Edit Invoice
              </Button>
            )}
            {actionOptions.length > 0 && (
              <DropdownButton
                label="More Actions"
                variant="outline"
                options={actionOptions}
              />
            )}
          </div>
        </div>

        {/* Invoice Header Card */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Invoice {invoice?.invoice_id}
                </h1>
                <p className="text-sm text-muted-foreground text-left">
                  {formatUserDateOnly(invoice?.invoice_date)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Basic Information */}
          <InfoCard icon={Info} title="Basic Information">
            <InfoItem label="Invoice ID" value={invoice?.invoice_id} />
            <InfoItem
              label="Invoice Date"
              value={formatUserDateOnly(invoice?.invoice_date)}
            />
            <InfoItem
              label="Due Date"
              value={formatUserDateNice(invoice?.due_date)}
            />
            <InfoItem
              label="Organization"
              link={`/organization/${invoice.organization_id}`}
              value={invoice?.organization_id}
            />
          </InfoCard>

          {/* Financial Summary */}
          <InfoCard icon={DollarSign} title="Financial Summary">
            <InfoItem
              label="Currency"
              value={invoice?.invoice_details?.currency || "INR"}
            />
            <InfoItem
              label="Is Refundable"
              value={invoice?.invoice_details?.is_refundable ? "Yes" : "No"}
            />
            <InfoItem label="Is Paid" value={invoice?.is_paid ? "Yes" : "No"} />
            {latestRevision && (
              <>
                <InfoItem
                  label="Latest Amount"
                  value={`₹${latestRevision.revision_details?.amount?.toLocaleString() || 0}`}
                />
                <InfoItem
                  label="Tax Type"
                  value={
                    latestRevision.invoice_details?.tax_details?.tax_type ===
                    "igst"
                      ? "IGST"
                      : "SGST + CGST"
                  }
                />
              </>
            )}
          </InfoCard>

          {/* Timeline & Alerts */}
          <InfoCard icon={Clock} title="Timeline & Alerts">
            <InfoItem
              label="Created"
              value={formatUserDateNice(invoice?.created_at)}
            />
            <InfoItem
              label="Last Updated"
              value={formatUserDateNice(invoice?.updated_at)}
            />
            <InfoItem label="Total Revisions" value={revisions.length} />
            {invoice?.alerts?.send_notification && (
              <InfoItem
                label="Notifications"
                value="Enabled"
                sublabel={`${invoice.alerts.notification_period} days`}
              />
            )}
            {invoice?.alerts?.send_notification &&
              invoice?.alerts?.notify_users && (
                <InfoItem
                  label="Notify Users"
                  value={invoice?.alerts?.notify_users.join(", ")}
                />
              )}
          </InfoCard>
        </div>

        {/* Revisions Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Edit3 className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h2 className="text-xl font-semibold text-foreground">
                  Invoice Revisions
                </h2>
                <p className="text-sm text-muted-foreground">
                  {revisions.length} revision{revisions.length !== 1 ? "s" : ""}{" "}
                  found
                </p>
              </div>
            </div>
          </div>

          {/* Revisions Grid - 2 columns on large screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {revisions.length > 0 ? (
              revisions.map((revision, index) => (
                <RevisionCard
                  key={revision.revision_id}
                  revision={revision}
                  isLatest={false}
                  onDownload={handleDownloadRevision}
                  isDownloading={downloadingRevision === revision.revision_id}
                />
              ))
            ) : (
              <div className="col-span-full bg-card rounded-lg border border-border p-8 text-center">
                <div className="p-3 bg-muted/20 rounded-lg w-fit mx-auto mb-4">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No Revisions Found
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This invoice doesn't have any revisions yet.
                </p>
                {permissions?.includes("crm:invoice:create") && (
                  <Button
                    onClick={() =>
                      navigate(`/invoices/${invoice?.invoice_id}/revise`)
                    }
                    icon={Plus}
                    size="lg"
                  >
                    Create First Revision
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetails;
