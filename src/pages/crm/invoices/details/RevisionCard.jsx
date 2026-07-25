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
import StatusBadge from "@/components/common/StatusBadge";
import { IconButton } from "@/components/common/Buttons";
import {
  FileText,
  DollarSign,
  Download,
  Package,
  Receipt,
  ChevronDown,
} from "lucide-react";
import { useUserTimezone } from "@/hooks/useTimezone";

// Compact Revision Card Component
const RevisionCard = ({ revision, isLatest, onDownload, isDownloading }) => {
  const { formatUserDateOnly } = useUserTimezone();
  const formatCurrency = (amount) => `₹${amount?.toLocaleString() || 0}`;

  const taxDetails = revision.invoice_details?.tax_details;
  const items = revision.invoice_details?.items || [];

  return (
    <div
      className={`bg-card rounded-lg border ${isLatest ? "border-primary/50 bg-primary/5" : "border-border"} p-4 space-y-3 h-fit`}
    >
      {/* Revision Header - More Compact */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-md ${isLatest ? "bg-primary/20" : "bg-muted"}`}
          >
            <FileText
              className={`w-3 h-3 ${isLatest ? "text-primary" : "text-muted-foreground"}`}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">
                Revision #{revision.revision_number}
              </h3>
              {isLatest && (
                <StatusBadge status="success" label="Latest" size="sm" />
              )}
            </div>
            <p className="text-xs text-muted-foreground text-left">
              {formatUserDateOnly(revision.revision_date)}
            </p>
          </div>
        </div>

        <IconButton
          icon={Download}
          variant="outline"
          size="sm"
          handleClick={() => onDownload(revision.revision_id)}
          loading={isDownloading}
          className="text-primary hover:text-primary hover:bg-primary/10 h-7 w-7"
          title="Download PDF"
        />
      </div>

      {/* Compact Financial Summary */}
      <div className="bg-muted/20 rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-3 h-3 text-primary" />
          <span className="text-xs font-medium text-foreground">
            Financial Summary
          </span>
        </div>

        <div className="grid grid-cols-1 gap-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal:</span>
            <span className="font-medium text-foreground">
              {formatCurrency(revision.invoice_details?.total_amount)}
            </span>
          </div>

          {taxDetails?.tax_type === "igst" ? (
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                IGST ({taxDetails.igst_rate}%):
              </span>
              <span className="font-medium text-foreground">
                {formatCurrency(taxDetails.igst_amount)}
              </span>
            </div>
          ) : (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  SGST ({taxDetails?.sgst_rate}%):
                </span>
                <span className="font-medium text-foreground">
                  {formatCurrency(taxDetails?.sgst_amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  CGST ({taxDetails?.cgst_rate}%):
                </span>
                <span className="font-medium text-foreground">
                  {formatCurrency(taxDetails?.cgst_amount)}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="pt-2 border-t border-border">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-foreground">
              Total Amount:
            </span>
            <span className="text-sm font-bold text-primary">
              {formatCurrency(revision.revision_details?.amount)}
            </span>
          </div>
        </div>
      </div>

      {/* Compact Tax & Items Info */}
      <div className="grid grid-cols-2 gap-2">
        {/* Tax Type Badge */}
        <div className="bg-accent/20 rounded-md p-2">
          <div className="flex items-center gap-1 mb-1">
            <Receipt className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs font-medium text-foreground">Tax</span>
          </div>
          <div className="text-xs text-left">
            <p className="text-muted-foreground">
              {taxDetails?.tax_type === "igst" ? "IGST" : "SGST + CGST"}
            </p>
            <p className="font-medium text-foreground">
              {taxDetails?.tax_rate}% Total
            </p>
          </div>
        </div>

        {/* Items Count */}
        <div className="bg-accent/20 rounded-md p-2">
          <div className="flex items-center gap-1 mb-1">
            <Package className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs font-medium text-foreground">Items</span>
          </div>
          <div className="text-xs text-left">
            <p className="font-medium text-foreground">
              {items.length} Item{items.length !== 1 ? "s" : ""}
            </p>
            <p className="text-muted-foreground">
              {revision.revision_details?.currency || "INR"}
            </p>
          </div>
        </div>
      </div>

      {/* Collapsible Items List - Compact */}
      {items.length > 0 && (
        <details className="group">
          <summary className="flex items-center gap-2 text-xs font-medium text-primary cursor-pointer hover:text-primary/80 transition-colors">
            <Package className="w-3 h-3" />
            View Items ({items.length})
            <ChevronDown className="w-3 h-3 transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-2 bg-muted/30 rounded-md p-2 space-y-1">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-1.5 bg-background rounded text-xs border border-border/30"
              >
                <div className="flex-1 min-w-0 text-left">
                  <p
                    className="font-medium text-foreground truncate"
                    title={item.description}
                  >
                    {item.description}
                  </p>
                  <p className="text-muted-foreground">Rate: {item.rate}</p>
                </div>
                <div className="text-right ml-2">
                  <p className="font-semibold text-foreground">
                    {formatCurrency(item.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Description - if exists */}
      {revision.revision_details?.description && (
        <div className="bg-accent/10 rounded-md p-2">
          <p
            className="text-xs text-muted-foreground italic line-clamp-2"
            title={revision.revision_details.description}
          >
            "{revision.revision_details.description}"
          </p>
        </div>
      )}
    </div>
  );
};

export default RevisionCard;
