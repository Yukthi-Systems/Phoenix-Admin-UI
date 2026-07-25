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

import React, { useMemo } from "react";
import { normalizePflogsumTotals } from "./normalizedMetrics";

const AdditionalMetrics = ({ totals }) => {
  const data = totals;

  if (!data) return null;

  const metrics = [
    { label: "Senders", value: data.messages.senders },
    { label: "Recipients", value: data.messages.recipients },
    { label: "Sending Domains", value: data.domains.sendingDomains },
    { label: "Recipient Domains", value: data.domains.recipientDomains },
    {
      label: "Deferred",
      value: data.messages.deferred,
      className: "text-warning",
    },
    { label: "Forwarded", value: data.messages.forwarded },
    {
      label: "Held",
      value: data.messages.held,
      className: data.messages.held > 0 ? "text-warning" : "",
    },
    {
      label: "Discarded",
      value: data.messages.discardedCount,
      className: data.messages.discardedCount > 0 ? "text-warning" : "",
    },
    {
      label: "Reject Warnings",
      value: data.messages.rejectWarnings,
      className: data.messages.rejectWarnings > 0 ? "text-warning" : "",
    },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 shadow-sm">
      {metrics.map((metric, idx) => (
        <div key={idx} className="flex flex-col space-y-1.5">
          <span className="text-muted-foreground text-[10px] font-extrabold uppercase tracking-widest">
            {metric.label}
          </span>
          <p
            className={`font-mono text-xl font-bold truncate ${
              metric.className || "text-foreground"
            }`}
          >
            {metric.value.toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
};

export default AdditionalMetrics;
