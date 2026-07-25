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
import { Mail, AlertTriangle, CheckCircle2, Users } from "lucide-react";

const RecipientDetails = ({ recipients }) => {
  // Group recipients by status and delay reason
  const groupedRecipients = useMemo(() => {
    const groups = {
      active: [],
      deferred: {},
    };

    recipients.forEach((recipient) => {
      if (!recipient.delay_reason) {
        groups.active.push(recipient);
      } else {
        const reason = recipient.delay_reason;
        if (!groups.deferred[reason]) {
          groups.deferred[reason] = [];
        }
        groups.deferred[reason].push(recipient);
      }
    });

    return groups;
  }, [recipients]);

  const renderEmailGroup = (emails, title, count) => (
    <div className="text-sm">
      <div className=" flex flex-wrap gap-1">
        {emails.map((recipient, index) => (
          <span
            key={index}
            className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs"
            title={recipient.address}
          >
            {recipient.address}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div className="px-6 py-4">
      <h4 className="text-foreground mb-4 text-sm font-semibold flex items-center gap-2">
        <Users className="h-4 w-4" />
        Recipient Details ({recipients.length} total)
      </h4>

      <div className="space-y-4">
        {/* Active Recipients */}
        {groupedRecipients.active.length > 0 && (
          <div className="bg-background border-border rounded-lg border p-4">
            {renderEmailGroup(
              groupedRecipients.active,
              "Ready for delivery",
              groupedRecipients.active.length,
            )}
          </div>
        )}

        {/* Deferred Recipients grouped by reason */}
        {Object.entries(groupedRecipients.deferred).map(([reason, emails]) => (
          <div
            key={reason}
            className="bg-background border-border rounded-lg border p-4"
          >
            {renderEmailGroup(emails, "Affected recipients", emails.length)}

            <div className="bg-warning/5 border-warning/20 mt-3 rounded-md border p-3">
              <div className="text-muted-foreground text-xs leading-relaxed text-left">
                <span className="font-medium text-warning text-left">
                  Reason:
                </span>{" "}
                {reason}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipientDetails;
