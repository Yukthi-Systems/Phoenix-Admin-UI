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

import React, { useState } from "react";
import {
  Search,
  Lock,
  Unlock,
  Globe,
  Server,
  AlertCircle,
  Loader2,
  RefreshCw,
  Activity,
  CheckCircle,
  X,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/common/Buttons";
import { useToastify } from "@/hooks/useToastify";
import { useLockDomain } from "@/hooks/useServer";
import { getDomainLockStatus, getDomainMigrationStatus } from "@/api/servers";
import ServerSelector from "../migrations/ServerMultiSelector";
import { useAtomValue } from "jotai";
import { userProfileAtom } from "@/store/userProfile";
import AccessDenied from "@/components/common/AccessDenied";
import { useNavigate } from "react-router-dom";

const DomainMigration = () => {
  const [domainName, setDomainName] = useState("");
  const [selectedServers, setSelectedServers] = useState([]);
  const [domainStatus, setDomainStatus] = useState(null);
  const [showServerModal, setShowServerModal] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const toast = useToastify();
  const { mutate: lockDomain, isPending: isLockingDomain } = useLockDomain();
  const navigate = useNavigate();
  const isLoading = isCheckingStatus || isLockingDomain;

  const handleCheckStatus = async () => {
    if (!domainName.trim()) {
      toast("error", "Please enter a domain name");
      return;
    }

    setIsCheckingStatus(true);
    setCurrentAction("checking");
    setDomainStatus(null);
    setShowServerModal(false);
    setSelectedServers([]);

    try {
      const [lockResponse, migrationResponse] = await Promise.all([
        getDomainLockStatus(domainName),
        getDomainMigrationStatus(domainName),
      ]);

      const lockData = lockResponse?.data || {};
      const migrationData = migrationResponse?.data || {};

      setDomainStatus({
        domain: domainName,
        isLocked: lockData.is_locked || false,
        lockedServers: lockData.locked_servers_group || [],
        migrationInProgress: migrationData.migration_in_progress || false,
        migrationCount: migrationData.migration_count || 0,
        lockInfo: lockData,
        migrationInfo: migrationData,
        lastChecked: new Date(),
      });

      toast("success", "Domain status fetched successfully");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch domain status";
      toast("error", message);
      console.error("Error checking domain status:", error);
    } finally {
      setIsCheckingStatus(false);
      setCurrentAction(null);
    }
  };

  const handleLockAction = (willLock) => {
    if (willLock) {
      setSelectedServers([]);
      setShowServerModal(true);
    } else {
      handleLockToggle(false, []);
    }
  };

  const handleLockToggle = async (willLock, servers = []) => {
    if (!domainStatus) return;

    setCurrentAction(willLock ? "locking" : "unlocking");
    const actionText = willLock ? "lock" : "unlock";

    lockDomain(
      {
        domain_name: domainName,
        is_locked: willLock,
        servers: servers.map((item) => item.server_id),
      },
      {
        onSuccess: () => {
          setDomainStatus((prev) => ({
            ...prev,
            isLocked: willLock,
            lockedServers: willLock ? servers.map((s) => s.server_id) : [],
            lastUpdated: new Date(),
          }));

          setShowServerModal(false);
          setSelectedServers([]);
          toast("success", `Domain ${actionText}ed successfully`);
          setCurrentAction(null);
        },
        onError: (error) => {
          const message =
            error.response?.data?.message ||
            error.message ||
            `Failed to ${actionText} domain`;
          toast("error", message);
          console.error(`Error ${actionText}ing domain:`, error);
          setCurrentAction(null);
        },
      },
    );
  };

  const handleModalLock = () => {
    if (selectedServers.length === 0) {
      toast("error", "Please select at least one server");
      return;
    }
    handleLockToggle(true, selectedServers);
  };

  const closeModal = () => {
    if (isLockingDomain) return;
    setShowServerModal(false);
    setSelectedServers([]);
    setCurrentAction(null);
  };

  const resetForm = () => {
    setDomainName("");
    setSelectedServers([]);
    setDomainStatus(null);
    setShowServerModal(false);
    setCurrentAction(null);
  };

  const handleServerClick = (serverId) => {
    navigate(`/server/${serverId}`);
  };

  if (!permissions.includes("domain:migration:view"))
    return (
      <AccessDenied content="Don't have the access to list the incoming policies." />
    );

  return (
    <>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Domain Status
          </h1>
          <p className="text-muted-foreground">
            Check domain status and manage domain locking across servers
          </p>
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-4">
          <div className="space-y-4">
            <div className="space-y-2 flex flex-col">
              <label className="text-sm font-medium text-foreground text-left">
                Domain Name
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={domainName}
                    onChange={(e) => setDomainName(e.target.value)}
                    placeholder="Enter domain name (e.g., example.com)"
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
                    onKeyPress={(e) =>
                      e.key === "Enter" && !isLoading && handleCheckStatus()
                    }
                  />
                </div>
                <Button
                  onClick={handleCheckStatus}
                  disabled={isLoading || !domainName.trim()}
                  className="px-6"
                  icon={currentAction === "checking" ? Loader2 : Search}
                >
                  {currentAction === "checking"
                    ? "Checking..."
                    : "Check Status"}
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetForm}
                disabled={isLoading}
              >
                Reset
              </Button>
              {domainStatus && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCheckStatus}
                  disabled={isLoading}
                  icon={RefreshCw}
                >
                  Refresh Status
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Domain Status Display */}
        {domainStatus && (
          <div className="bg-card border rounded-lg p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Domain Status - {domainStatus.domain}
              </h2>
              <span className="text-xs text-muted-foreground">
                Last checked: {domainStatus.lastChecked?.toLocaleTimeString()}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground">
                  Lock Status
                </h3>
                <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg border">
                  {domainStatus.isLocked ? (
                    <Lock className="w-5 h-5 text-destructive" />
                  ) : (
                    <Unlock className="w-5 h-5 text-success" />
                  )}
                  <div className="flex-1">
                    <p
                      className={`font-medium ${domainStatus.isLocked ? "text-destructive" : "text-success"}`}
                    >
                      {domainStatus.isLocked ? "Locked" : "Unlocked"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Domain is currently{" "}
                      {domainStatus.isLocked
                        ? "locked"
                        : "available for migration"}
                    </p>
                    {domainStatus.isLocked &&
                      domainStatus.lockedServers.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Locked on {domainStatus.lockedServers.length}{" "}
                          server(s)
                        </p>
                      )}
                  </div>
                </div>

                {domainStatus.isLocked &&
                  domainStatus.lockedServers.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Locked Servers
                      </h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {domainStatus.lockedServers.map((serverId, index) => (
                          <button
                            key={index}
                            onClick={() => handleServerClick(serverId)}
                            className="w-full flex items-center gap-2 p-2 text-xs bg-muted/50 hover:bg-muted border rounded-md transition-colors group"
                          >
                            <Server className="w-3 h-3 text-muted-foreground" />
                            <span className="flex-1 text-left font-mono text-foreground">
                              {serverId}
                            </span>
                            <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground">
                  Migration Status
                </h3>
                <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg border">
                  {domainStatus.migrationInProgress ? (
                    <Activity className="w-5 h-5 text-warning animate-pulse" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-success" />
                  )}
                  <div className="flex-1">
                    <p
                      className={`font-medium ${domainStatus.migrationInProgress ? "text-warning" : "text-success"}`}
                    >
                      {domainStatus.migrationInProgress
                        ? "Migration In Progress"
                        : "No Active Migration"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {domainStatus.migrationInProgress
                        ? `${domainStatus.migrationCount} active migration(s)`
                        : "Ready for migration operations"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              {!permissions.includes("domain:migration:edit") && (
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => handleLockAction(!domainStatus.isLocked)}
                    disabled={isLoading || domainStatus.migrationInProgress}
                    variant={domainStatus.isLocked ? "destructive" : "primary"}
                    icon={
                      currentAction === "locking" ||
                      currentAction === "unlocking"
                        ? Loader2
                        : domainStatus.isLocked
                          ? Unlock
                          : Lock
                    }
                  >
                    {currentAction === "locking"
                      ? "Locking..."
                      : currentAction === "unlocking"
                        ? "Unlocking..."
                        : domainStatus.isLocked
                          ? "Unlock Domain"
                          : "Lock Domain"}
                  </Button>
                </div>
              )}

              {domainStatus.migrationInProgress && (
                <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-warning-foreground">
                      Migration In Progress
                    </p>
                    <p className="text-xs text-warning-foreground/80">
                      Cannot modify domain lock status while migration is
                      active.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showServerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />

          <div className="relative bg-background border border-border rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border bg-muted/20">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Lock Domain on Servers
                </h2>
                <p className="text-sm text-muted-foreground">
                  Select servers where{" "}
                  <span className="font-medium text-foreground">
                    "{domainName}"
                  </span>{" "}
                  should be locked
                </p>
              </div>
              <button
                onClick={closeModal}
                disabled={isLockingDomain}
                className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="flex flex-col justify-center min-h-[340px] overflow-y-auto max-h-[calc(85vh-140px)]">
              <div className="flex-1 self-center overflow-y-auto p-6">
                <ServerSelector
                  selectedServers={selectedServers}
                  setSelectedServers={setSelectedServers}
                  maxSelection={10}
                  disabled={isLockingDomain}
                  isOpen={showServerModal}
                  onOpenChange={setShowServerModal}
                  mailboxOnly={true}
                  className="min-w-[300px]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-6 border-t border-border bg-muted/10">
              <div className="text-sm text-muted-foreground">
                {selectedServers.length > 0 ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    {selectedServers.length} server(s) selected
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-muted-foreground" />
                    No servers selected
                  </span>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={closeModal}
                  disabled={isLockingDomain}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleModalLock}
                  disabled={isLockingDomain || selectedServers.length === 0}
                  icon={currentAction === "locking" ? Loader2 : Lock}
                >
                  {currentAction === "locking"
                    ? "Locking Domain..."
                    : selectedServers.length > 0
                      ? `Lock Domain on ${selectedServers.length} Server${selectedServers.length > 1 ? "s" : ""}`
                      : "Lock Domain"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DomainMigration;
