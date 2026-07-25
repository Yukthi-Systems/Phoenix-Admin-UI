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
import { Link } from "react-router-dom";
import { Info, Settings } from "lucide-react";

const DistributionWarning = ({
  policyStats,
  data,
  permissions,
  policy_distribution_id,
}) => {
  if (policyStats?.totalMembers !== 0) return null;

  return (
    <div
      className="bg-warning/10 border border-warning/30 rounded-lg p-5 transition-all shadow-sm"
      role="alert"
    >
      <div className="flex flex-start gap-3">
        {/* Icon with direct warning color mapping */}
        <div className="mt-0.5">
          <Info className="w-5 h-5 text-warning shrink-0" />
        </div>

        <div className="flex-1 space-y-2">
          {/* Header using standard foreground for readability on light backgrounds */}
          <h3 className="text-sm font-bold text-foreground leading-none">
            No Distribution Members Configured
          </h3>

          {/* Description text using muted-foreground for visual hierarchy */}
          <div className="text-sm text-muted-foreground leading-relaxed">
            <p>
              This policy is currently inactive because no distribution members
              have been configured.
            </p>

            {data?.is_active && (
              <p className="mt-1 font-medium text-warning italic">
                The policy is active but won't distribute any messages until
                members are added.
              </p>
            )}
          </div>

          {/* Action Button - Uses standard button patterns from v3 spec */}
          {permissions?.includes("policy:distribution:edit") && (
            <div className="pt-2">
              <Link
                to={`/policies/distribution/edit/${policy_distribution_id}`}
                className="
                  inline-flex items-center gap-2 px-4 py-2 
                  bg-warning text-warning-foreground 
                  hover:opacity-90 active:scale-[0.98] 
                  text-xs font-semibold uppercase tracking-wider 
                  rounded-md transition-all shadow-sm
                "
              >
                <Settings className="w-3.5 h-3.5" />
                Configure Distribution Members
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DistributionWarning;
