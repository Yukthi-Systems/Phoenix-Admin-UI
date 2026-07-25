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

import EditModelBox from "@/components/common/EditModelBox";
import StatusBadge from "@/components/common/StatusBadge";
import { useUserTimezone } from "@/hooks/useTimezone";
import {
  Smartphone,
  Mail,
  Phone,
  Clock,
  Cpu,
  HardDrive,
  Hash,
} from "lucide-react";

const AppSessionDetailsModal = ({ isOpen, handleClose, session }) => {
  const { formatUserDateNice } = useUserTimezone();

  if (!session) return null;

  const deviceDetails = session.device_details || {};

  return (
    <EditModelBox
      isOpen={isOpen}
      label="Mail25 App Session Details"
      handleCancel={handleClose}
    >
      <div className="w-full max-w-5xl min-w-[920px] text-left">
        {/* Header Section - Email, Phone & Status */}
        <div className="from-primary/5 to-primary/10 border-primary/20 mt-4 mb-5 rounded-xl border bg-gradient-to-r p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-muted-foreground mb-1.5 text-left text-xs tracking-wide uppercase">
                  Email Address
                </p>
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-primary" />
                  <p className="text-foreground text-lg font-semibold">
                    {session.email || "N/A"}
                  </p>
                </div>
              </div>
              {session.phone && (
                <>
                  <div className="bg-border/60 h-12 w-px"></div>
                  <div>
                    <p className="text-muted-foreground mb-1.5 text-xs tracking-wide uppercase">
                      Phone Number
                    </p>
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-primary" />
                      <p className="text-foreground text-base font-medium font-mono">
                        {session.phone}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
            {/* <div className="flex items-center gap-4">
              <StatusBadge status={session.is_active} />
            </div> */}
          </div>
        </div>

        {/* Two Column Grid Layout */}
        <div className="mb-5 grid grid-cols-2 gap-8">
          {/* Left Column - Device Information */}
          <div className="space-y-5">
            {/* Device Details */}
            <div>
              <h4 className="text-foreground mb-3 flex items-center gap-2 text-sm font-semibold">
                <Smartphone size={16} className="text-primary" />
                Device Information
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-xs">Brand</p>
                  <p className="text-foreground text-sm font-semibold capitalize">
                    {deviceDetails.brand || "Unknown"}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-xs">Model</p>
                  <p className="text-foreground text-sm font-semibold">
                    {deviceDetails.model || "N/A"}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-xs">Manufacturer</p>
                  <p className="text-foreground text-sm font-semibold capitalize">
                    {deviceDetails.manufacturer || "Unknown"}
                  </p>
                </div>
              </div>
            </div>

            {/* System Information */}
            <div>
              <h4 className="text-foreground mb-3 flex items-center gap-2 text-sm font-semibold">
                <Cpu size={16} className="text-primary" />
                System Information
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-xs">OS Version</p>
                  <p className="text-foreground text-sm font-semibold">
                    Android {deviceDetails.systemVersion || "Unknown"}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-xs">Build Number</p>
                  <p className="text-foreground font-mono text-sm font-semibold">
                    {deviceDetails.buildNumber || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Session Details */}
          <div className="space-y-5">
            {/* Device Identifier */}
            <div>
              <h4 className="text-foreground mb-3 flex items-center gap-2 text-sm font-semibold">
                <Hash size={16} className="text-primary" />
                Device Identifier
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-xs">Unique ID</p>
                  <p className="text-foreground font-mono text-xs font-semibold break-all">
                    {deviceDetails.uniqueId || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Session Information */}
            <div>
              <h4 className="text-foreground mb-3 flex items-center gap-2 text-sm font-semibold">
                <Clock size={16} className="text-primary" />
                Session Information
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-xs">Session ID</p>
                  <p className="text-foreground font-mono text-xs font-semibold break-all">
                    {session.session_id || "N/A"}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-xs">Last Active At</p>
                  <p className="text-foreground text-sm font-semibold">
                    {formatUserDateNice(session.last_active_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full Width Device Summary */}
        <div className="bg-muted/30 border-border mt-5 rounded-lg border p-4">
          <h4 className="text-foreground mb-3 flex items-center gap-2 text-sm font-semibold">
            <HardDrive size={16} className="text-primary" />
            Device Summary
          </h4>
          <p className="text-muted-foreground text-sm">
            This session is using a{" "}
            <span className="text-foreground font-semibold capitalize">
              {deviceDetails.brand || "Unknown"}
            </span>{" "}
            <span className="text-foreground font-semibold">
              {deviceDetails.model || "device"}
            </span>{" "}
            manufactured by{" "}
            <span className="text-foreground font-semibold capitalize">
              {deviceDetails.manufacturer || "Unknown"}
            </span>
            , running Android{" "}
            <span className="text-foreground font-semibold">
              {deviceDetails.systemVersion || "Unknown"}
            </span>
            {deviceDetails.uniqueId && (
              <>
                {" "}
                with unique identifier{" "}
                <span className="text-foreground font-mono text-xs font-semibold">
                  {deviceDetails.uniqueId}
                </span>
              </>
            )}
            .
          </p>
        </div>
      </div>
    </EditModelBox>
  );
};

export default AppSessionDetailsModal;
