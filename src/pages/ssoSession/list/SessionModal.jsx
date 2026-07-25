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

import { useState } from "react";
import EditModelBox from "@/components/common/EditModelBox";
import { useUserTimezone } from "@/hooks/useTimezone";
import {
  Smartphone,
  Mail,
  Clock,
  Cpu,
  HardDrive,
  Hash,
  Globe,
  Shield,
  Laptop,
  Network,
  Activity,
  Copy,
  Check,
  Layout,
} from "lucide-react";

const SsoSessionDetailsModal = ({ isOpen, handleClose, session }) => {
  const { formatUserDateNice } = useUserTimezone();
  const [activeTab, setActiveTab] = useState("overview");
  const [copiedField, setCopiedField] = useState(null);

  if (!session) return null;

  const deviceDetails = session.device_details || {};

  // Parse details
  const browserName = deviceDetails.browser || deviceDetails.browserName || "Unknown Browser";
  const osName = deviceDetails.os || deviceDetails.osName || "Unknown OS";
  const deviceType = deviceDetails.deviceType || deviceDetails.device || (deviceDetails.isMobile ? "Mobile" : "Desktop/Web");
  const ipAddress = deviceDetails.ip || "N/A";

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: Layout },
    { id: "browser_hardware", label: "Browser & Hardware", icon: Cpu },
    { id: "locale_network", label: "Locale & Network", icon: Globe },
    { id: "security_features", label: "Security & Features", icon: Shield },
  ];

  const DetailRow = ({ label, value, isMonospace = false, isCopyable = false, copyText = "" }) => {
    let displayValue = "N/A";
    if (value !== undefined && value !== null && value !== "") {
      if (typeof value === "boolean") {
        displayValue = value ? "Yes" : "No";
      } else {
        displayValue = String(value);
      }
    }

    return (
      <div className="flex items-center justify-between py-2 border-b border-border/40 last:border-0 hover:bg-muted/10 px-2 rounded-md transition-colors">
        <p className="text-muted-foreground text-xs font-medium">{label}</p>
        <div className="flex items-center gap-2 max-w-[70%]">
          <p className={`text-foreground text-sm font-semibold truncate ${isMonospace ? "font-mono text-xs" : ""}`}>
            {displayValue}
          </p>
          {isCopyable && displayValue !== "N/A" && (
            <button
              onClick={() => handleCopy(copyText || displayValue, label)}
              className="text-muted-foreground hover:text-foreground p-1 transition-colors rounded hover:bg-muted/30"
              title={`Copy ${label}`}
            >
              {copiedField === label ? (
                <Check size={13} className="text-emerald-500" />
              ) : (
                <Copy size={13} />
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  const SectionCard = ({ title, icon: Icon, children }) => (
    <div className="bg-muted/10 border border-border/60 rounded-xl p-4 space-y-3">
      <h5 className="text-foreground flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-2">
        {Icon && <Icon size={14} className="text-primary" />}
        {title}
      </h5>
      <div className="space-y-1">{children}</div>
    </div>
  );

  return (
    <EditModelBox
      isOpen={isOpen}
      label="SSO Session Details"
      handleCancel={handleClose}
    >
      <div className="w-full max-w-5xl min-w-[920px] text-left">
        {/* Header Section - Email & Status */}
        <div className="from-primary/5 to-primary/10 border-primary/20 mt-4 mb-5 rounded-xl border bg-gradient-to-r p-5">
          <div className="flex items-center justify-between">
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
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b border-border/80 mb-6 gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? "border-primary text-primary font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="min-h-[380px]">
          {activeTab === "overview" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-8">
                {/* Device & Browser Card */}
                <SectionCard title="Device & Browser" icon={Smartphone}>
                  <DetailRow label="Browser" value={browserName} />
                  <DetailRow label="Operating System" value={osName} />
                  <DetailRow label="Device Type" value={deviceType} />
                  <DetailRow label="IP Address" value={ipAddress} isCopyable />
                </SectionCard>

                {/* Session Card */}
                <SectionCard title="Session Timestamps" icon={Clock}>
                  <DetailRow label="Session ID" value={session.session_id} isMonospace isCopyable />
                  <DetailRow label="Created At" value={formatUserDateNice(session.created_at)} />
                  <DetailRow label="Last Authenticated At" value={formatUserDateNice(session.last_auth_at)} />
                </SectionCard>
              </div>

              {/* Full Width Device Summary */}
              <div className="bg-muted/30 border border-border rounded-lg p-4 mt-5">
                <h4 className="text-foreground mb-3 flex items-center gap-2 text-sm font-semibold">
                  <HardDrive size={16} className="text-primary" />
                  Session Summary
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  This SSO session is authenticated using{" "}
                  <span className="text-foreground font-semibold capitalize">
                    {browserName}
                  </span>{" "}
                  on a{" "}
                  <span className="text-foreground font-semibold capitalize">
                    {osName}
                  </span>{" "}
                  system. The session was initialized at{" "}
                  <span className="text-foreground font-semibold">
                    {formatUserDateNice(session.created_at)}
                  </span>{" "}
                  and last verified at{" "}
                  <span className="text-foreground font-semibold">
                    {formatUserDateNice(session.last_auth_at)}
                  </span>
                  .
                </p>
              </div>
            </div>
          )}

          {activeTab === "browser_hardware" && (
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-5">
                <SectionCard title="Browser Engine" icon={Globe}>
                  <DetailRow label="Vendor" value={deviceDetails.vendor} />
                  <DetailRow label="Product" value={deviceDetails.product} />
                  <DetailRow label="Product Sub" value={deviceDetails.productSub} />
                </SectionCard>

                <SectionCard title="Hardware Specifications" icon={Cpu}>
                  <DetailRow label="Platform" value={deviceDetails.platform} />
                  <DetailRow label="Device Memory" value={deviceDetails.deviceMemory ? `${deviceDetails.deviceMemory} GB` : null} />
                  <DetailRow label="CPU Cores" value={deviceDetails.hardwareConcurrency} />
                  <DetailRow label="Max Touch Points" value={deviceDetails.maxTouchPoints} />
                </SectionCard>
              </div>

              <div className="space-y-5">
                <SectionCard title="Display & Screen" icon={Laptop}>
                  <DetailRow label="Screen Resolution" value={deviceDetails.screenResolution} />
                  <DetailRow label="Viewport Resolution" value={deviceDetails.viewportResolution} />
                  <DetailRow label="Pixel Ratio" value={deviceDetails.pixelRatio} />
                  <DetailRow label="Color Depth" value={deviceDetails.colorDepth ? `${deviceDetails.colorDepth}-bit` : null} />
                </SectionCard>
              </div>
            </div>
          )}

          {activeTab === "locale_network" && (
            <div className="grid grid-cols-2 gap-8">
              <SectionCard title="Network Details" icon={Network}>
                <DetailRow label="IP Address" value={deviceDetails.ip} isCopyable />
                <DetailRow label="Connection Type" value={deviceDetails.connectionType} />
              </SectionCard>

              <SectionCard title="Locale & Timezone" icon={Activity}>
                <DetailRow label="Language" value={deviceDetails.language} />
                <DetailRow label="Accept Language" value={deviceDetails.acceptLanguage} />
                <DetailRow label="Time Zone" value={deviceDetails.timeZone} />
                <DetailRow label="Timezone Offset" value={deviceDetails.timezoneOffset ? `${deviceDetails.timezoneOffset} min` : null} />
              </SectionCard>
            </div>
          )}

          {activeTab === "security_features" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-8">
                <SectionCard title="Browser Capabilities" icon={Shield}>
                  <DetailRow label="Cookie Enabled" value={deviceDetails.cookieEnabled} />
                  <DetailRow label="Local Storage" value={deviceDetails.localStorageEnabled} />
                  <DetailRow label="Session Storage" value={deviceDetails.sessionStorageEnabled} />
                  <DetailRow label="Java Enabled" value={deviceDetails.javaEnabled} />
                  <DetailRow label="PDF Viewer Enabled" value={deviceDetails.pdfViewerEnabled} />
                  <DetailRow label="Webdriver (Automated)" value={deviceDetails.webdriver} />
                  <DetailRow label="Do Not Track" value={deviceDetails.doNotTrack} />
                </SectionCard>

                <SectionCard title="Client Hints (sec-ch-ua)" icon={Laptop}>
                  <DetailRow label="Browser Brand Hints" value={deviceDetails.secChUa} />
                  <DetailRow label="Mobile Device Hint" value={deviceDetails.secChUaMobile} />
                  <DetailRow label="Platform Hint" value={deviceDetails.secChUaPlatform} />
                </SectionCard>
              </div>

              {/* User Agent Monospace block */}
              <div className="bg-muted/10 border border-border/60 rounded-xl p-4 mt-2">
                <div className="flex items-center justify-between border-b border-border/40 pb-2 mb-3">
                  <h5 className="text-foreground flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <HardDrive size={14} className="text-primary" />
                    User Agent & App Version
                  </h5>
                  <button
                    onClick={() => handleCopy(deviceDetails.userAgent || "", "User Agent")}
                    className="text-xs flex items-center gap-1.5 text-muted-foreground hover:text-foreground px-2 py-1 bg-muted/40 rounded transition-colors"
                  >
                    {copiedField === "User Agent" ? (
                      <>
                        <Check size={12} className="text-emerald-500" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        Copy User Agent
                      </>
                    )}
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">User Agent String</p>
                    <pre className="bg-background/80 border border-border/40 text-muted-foreground p-3 rounded-lg text-[11px] font-mono whitespace-pre-wrap break-all leading-normal">
                      {deviceDetails.userAgent || "N/A"}
                    </pre>
                  </div>
                  {deviceDetails.appVersion && (
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">App Version String</p>
                      <pre className="bg-background/80 border border-border/40 text-muted-foreground p-3 rounded-lg text-[11px] font-mono whitespace-pre-wrap break-all leading-normal">
                        {deviceDetails.appVersion}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </EditModelBox>
  );
};

export default SsoSessionDetailsModal;

