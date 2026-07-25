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

export const normalizePflogsumTotals = (totals) => {
  if (!totals) return null;

  const { messages = {}, traffic = {}, counts = {} } = totals;


  // Extract deferred safely
  const deferredEntry = Object.entries(counts).find(([key]) =>
    key.startsWith("deferred__")
  );

  const deferred = deferredEntry ? deferredEntry[1] : 0;

  return {
    messages: {
      received: messages.received ?? 0,
      delivered: messages.delivered ?? 0,
      forwarded: messages.forwarded ?? 0,
      bounced: messages.bounced ?? 0,
      rejectedCount: messages.rejected?.count ?? 0,
      rejectedPercent: messages.rejected?.percent ?? 0,
      rejectWarnings: messages.reject_warnings ?? 0,
      held: messages.held ?? 0,
      discardedCount: messages.discarded?.count ?? 0,
      discardedPercent: messages.discarded?.percent ?? 0,
      senders: messages.senders ?? 0,
      recipients: messages.recipients ?? 0,
      deferred,
    },
    traffic: {
      receivedBytes: traffic.bytes_received ?? "0",
      deliveredBytes: traffic.bytes_delivered ?? "0",
    },
    domains: {
      sendingDomains: counts.sending_hosts_domains ?? 0,
      recipientDomains: counts.recipient_hosts_domains ?? 0,
    },
  };
};
