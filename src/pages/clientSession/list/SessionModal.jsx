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
  MapPin,
  Monitor,
  Globe,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import SessionTimer from "./sessionTimer";

const SessionDetailsModal = ({ isOpen, handleClose, session }) => {
  const { formatUserDateNice } = useUserTimezone();

  if (!session) return null;

  const geoLocation = session.geo_ip_location || {};

  return (
    <EditModelBox
      isOpen={isOpen}
      label="Session Details"
      handleCancel={handleClose}
    >
      <div className="w-full max-w-5xl min-w-[920px]">
        {/* Header Section - Email, Status & Timer */}
        <div className="from-primary/5 to-primary/10 border-primary/20 mt-4 mb-5 rounded-xl border bg-gradient-to-r p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-muted-foreground mb-1.5 text-left text-xs tracking-wide uppercase">
                  Email Address
                </p>
                <p className="text-foreground text-lg font-semibold">
                  {session.attempted_by}
                </p>
              </div>
              {session.primary_phone && (
                <>
                  <div className="bg-border/60 h-12 w-px"></div>
                  <div>
                    <p className="text-muted-foreground mb-1.5 text-xs tracking-wide uppercase">
                      Primary Phone
                    </p>
                    <p className="text-foreground text-base font-medium">
                      {session.primary_phone}
                    </p>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-4">
              <SessionTimer
                attemptedAt={session.attempted_at}
                expiresAt={session.session_expires_at}
              />
              <StatusBadge status={session.is_active} />
            </div>
          </div>
        </div>

        {/* Two Column Grid Layout */}
        <div className="mb-5 grid grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-5">
            {/* Network Information */}
            <div>
              <h4 className="text-foreground mb-3 flex items-center gap-2 text-sm font-semibold">
                <Monitor size={16} className="text-primary" />
                Network Information
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-xs">
                    Origin IP Address
                  </p>
                  <p className="text-foreground font-mono text-sm font-semibold">
                    {session.origin_ip}
                  </p>
                </div>
              </div>
            </div>

            {/* Geographic Location */}
            <div>
              <h4 className="text-foreground mb-3 flex items-center gap-2 text-sm font-semibold">
                <Globe size={16} className="text-primary" />
                Geographic Location
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-xs">Country</p>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-primary" />
                    <p className="text-foreground text-sm font-semibold">
                      {geoLocation.country || "Unknown"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-xs">ISO Code</p>
                  <p className="text-foreground text-sm font-semibold">
                    {geoLocation.iso_code || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            {/* Security Status */}
            <div>
              <h4 className="text-foreground mb-3 flex items-center gap-2 text-sm font-semibold">
                <Shield size={16} className="text-primary" />
                Security Status
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-xs">IP Whitelist</p>
                  <div className="flex items-center gap-3">
                    {geoLocation.ip_in_whitelist ? (
                      <CheckCircle size={18} className="text-success" />
                    ) : (
                      <XCircle size={18} className="text-muted-foreground" />
                    )}
                    <p
                      className={`text-sm font-semibold ${geoLocation.ip_in_whitelist ? "text-success" : "text-foreground"}`}
                    >
                      {geoLocation.ip_in_whitelist
                        ? "Whitelisted"
                        : "Not Listed"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-xs">
                    Country Whitelist
                  </p>
                  <div className="flex items-center gap-3">
                    {geoLocation.iso_code_in_whitelist ? (
                      <CheckCircle size={18} className="text-success" />
                    ) : (
                      <XCircle size={18} className="text-muted-foreground" />
                    )}
                    <p
                      className={`text-sm font-semibold ${geoLocation.iso_code_in_whitelist ? "text-success" : "text-foreground"}`}
                    >
                      {geoLocation.iso_code_in_whitelist
                        ? "Whitelisted"
                        : "Not Listed"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Session Timing */}
            <div>
              <h4 className="text-foreground mb-3 flex items-center gap-2 text-sm font-semibold">
                <Clock size={16} className="text-primary" />
                Session Timing
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-xs">
                    Session Started
                  </p>
                  <p className="text-foreground text-sm font-semibold">
                    {formatUserDateNice(session.attempted_at)}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-xs">
                    Session Expires At
                  </p>
                  <p className="text-foreground text-sm font-semibold">
                    {formatUserDateNice(session.session_expires_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </EditModelBox>
  );
};

export default SessionDetailsModal;
