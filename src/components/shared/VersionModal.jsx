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
import { Info, X, Calendar, Code, User, Clock, Server } from "lucide-react";
import { BUILD_INFO } from "@/constants/constants";
import { useApiVersion } from "@/hooks/useApiInfo";
import { useUserTimezone } from "@/hooks/useTimezone";

const VersionModal = ({ isOpen, onClose, isCollapsed }) => {
  if (!isOpen) return null;
  const { data: apiData, isLoading, isError } = useApiVersion();
  const { formatUserDateDash } = useUserTimezone();
  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
        onClick={onClose}
      />

      <div className="fixed z-[9999] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-lg shadow-2xl p-6 transition-all duration-200 w-96 max-w-[90vw]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              Build Information
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded-md transition-colors"
            title="Close"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Application Version
              </span>
            </div>
            <span className="text-sm font-mono text-primary bg-primary/10 px-2 py-1 rounded">
              v{BUILD_INFO.version}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                API Version
              </span>
            </div>
            <span className="text-sm font-mono text-primary bg-primary/10 px-2 py-1 rounded">
              {apiData?.version_full || "N/A"}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Api Build Date
              </span>
            </div>
            <span className="text-sm font-mono text-primary bg-primary/10 px-2 py-1 rounded">
              {formatUserDateDash(apiData?.updated_at) || "N/A"}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Build Date
              </span>
            </div>
            <span className="text-sm font-mono text-primary bg-primary/10 px-2 py-1 rounded">
              {BUILD_INFO.buildDate}
            </span>
          </div>
        </div>

        <div className="mt-4 p-">
          <p className="text-xs text-primary text-center leading-relaxed">
            {apiData?.description}
          </p>
          <p className="text-xs text-primary text-center leading-relaxed">
            {apiData?.code_name}
          </p>
        </div>
      </div>
    </>
  );
};

export default VersionModal;
