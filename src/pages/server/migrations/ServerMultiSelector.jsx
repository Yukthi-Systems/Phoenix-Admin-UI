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

import { useState, useEffect, useRef } from "react";
import { useAtom } from "jotai";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Server,
  Check,
  Minus,
  AlertCircle,
} from "lucide-react";
import { useGetServers } from "@/hooks/useServer";
import { selectedServersAtom } from "@/store/server";

const ServerSelector = ({
  selectedServers = [],
  setSelectedServers,
  maxSelection = 5,
  disabled = false,
  isOpen: externalIsOpen,
  onOpenChange,
  className = "",
  placeholder = "Select Servers",
  mailboxOnly = false,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const dropdownRef = useRef(null);
  const [storedServers, setStoredServers] = useAtom(selectedServersAtom);

  // Determine if we're using external control or internal control
  const isControlled =
    externalIsOpen !== undefined && onOpenChange !== undefined;
  const isOpen = isControlled ? externalIsOpen : internalIsOpen;

  const setIsOpen = (value) => {
    if (isControlled) {
      onOpenChange(value);
    } else {
      setInternalIsOpen(value);
    }
  };

  const pageSize = 80;
  const { data, isLoading, isError } = useGetServers(page, pageSize);

  const nonMonitoringServers =
    data?.servers?.filter((server) => server.is_monitoring === false) || [];
  const mailboxOnlyServers =
    data?.servers?.filter((server) => server.is_mailbox_server === true) || [];

  const servers = mailboxOnly ? mailboxOnlyServers : nonMonitoringServers;
  const totalPages = data?.total_pages ?? 1;

  // Handle server selection/deselection
  const handleServerToggle = (server) => {
    let updatedServers;

    const isSelected = selectedServers.some(
      (s) => s.server_id === server.server_id,
    );

    if (isSelected) {
      // Remove server
      updatedServers = selectedServers.filter(
        (s) => s.server_id !== server.server_id,
      );
    } else {
      // Add server if under max limit
      if (selectedServers.length >= maxSelection) {
        return; // Don't add if limit reached
      }
      updatedServers = [...selectedServers, server];
    }

    setSelectedServers(updatedServers);
    setStoredServers({
      servers: updatedServers,
      selected_at: Date.now(),
    });
  };

  // Clear Jotai state on component unmount
  useEffect(() => {
    return () => {
      setStoredServers(null);
      setSelectedServers([]);
    };
  }, []);

  // Select all visible servers
  const handleSelectAll = () => {
    const availableServers = servers.filter(
      (server) =>
        !selectedServers.some((s) => s.server_id === server.server_id),
    );

    const remainingSlots = maxSelection - selectedServers.length;
    const serversToAdd = availableServers.slice(0, remainingSlots);

    const updatedServers = [...selectedServers, ...serversToAdd];
    setSelectedServers(updatedServers);
    setStoredServers({
      servers: updatedServers,
      selected_at: Date.now(),
    });
  };

  // Deselect all visible servers
  const handleDeselectAll = () => {
    const visibleServerIds = servers.map((s) => s.server_id);
    const updatedServers = selectedServers.filter(
      (s) => !visibleServerIds.includes(s.server_id),
    );

    setSelectedServers(updatedServers);
    setStoredServers({
      servers: updatedServers,
      selected_at: Date.now(),
    });
  };

  // Clear all selections
  const handleClearAll = () => {
    setSelectedServers([]);
    setStoredServers(null);
  };

  // Load stored servers on mount
  useEffect(() => {
    if (storedServers?.servers && Array.isArray(storedServers.servers)) {
      if (selectedServers.length === 0) {
        setSelectedServers(storedServers.servers);
      }
    }
  }, [storedServers, selectedServers.length, setSelectedServers]);

  // Click outside handler (only for uncontrolled mode)
  useEffect(() => {
    if (isControlled) return; // Skip if externally controlled

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, isControlled]);

  const handleClose = () => {
    setIsOpen(false);
    setPage(1);
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const getSelectionText = () => {
    const count = selectedServers.length;
    if (count === 0) return placeholder;
    if (count === 1) return `${selectedServers[0].host_name}`;
    return `${count} servers selected`;
  };

  const getVisibleSelectedCount = () => {
    return servers.filter((server) =>
      selectedServers.some((s) => s.server_id === server.server_id),
    ).length;
  };

  const canSelectAll = () => {
    const unselectedVisible = servers.filter(
      (server) =>
        !selectedServers.some((s) => s.server_id === server.server_id),
    ).length;

    return unselectedVisible > 0 && selectedServers.length < maxSelection;
  };

  if (isLoading) {
    return (
      <div className="flex">
        <div className={`relative w-full max-w-sm ${className}`}>
          <div className="w-full text-center border border-border bg-muted px-3 py-2 rounded-md shadow animate-pulse">
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 bg-muted-foreground/20 rounded w-24"></div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex">
        <div className={`relative w-full max-w-sm ${className}`}>
          <div className="w-full text-center border border-destructive/20 bg-destructive/10 px-3 py-2 rounded-md text-destructive text-sm flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Failed to load servers
          </div>
        </div>
      </div>
    );
  }

  if (servers?.length === 0) {
    return (
      <div className="flex">
        <div className={`relative w-full max-w-sm ${className}`}>
          <div className="w-full text-center border border-border bg-muted/50 px-3 py-2 rounded-md text-muted-foreground text-sm flex items-center justify-center gap-2">
            <Server className="w-4 h-4" />
            No servers available
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex ">
      <div
        className={`relative w-full max-w-sm ${className}`}
        ref={dropdownRef}
      >
        <button
          onClick={handleToggle}
          disabled={disabled}
          className={`w-full text-center border px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 inline-flex justify-center items-center gap-2 cursor-pointer transition-all duration-200 ${
            disabled
              ? "border-border bg-muted/30 text-muted-foreground cursor-not-allowed"
              : selectedServers.length > 0
                ? "border-primary/20 bg-primary/10 hover:bg-primary/20 text-primary focus:ring-primary/20 font-medium hover:shadow-md"
                : "border-border bg-background hover:bg-accent text-foreground focus:ring-primary/20 hover:shadow-md"
          }`}
        >
          <Server className="w-4 h-4" />
          <span className="truncate">{getSelectionText()}</span>

          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-2 w-full bg-card border border-border rounded-md shadow-lg ring-1 ring-border/20">
            {/* Header */}
            <div className="px-4 py-3 flex justify-between items-center border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">
                  Choose servers
                </span>
                <span className="text-xs text-muted-foreground">
                  ({selectedServers.length}/{maxSelection})
                </span>
              </div>
              <button
                onClick={handleClose}
                className="text-muted-foreground hover:text-destructive transition-colors duration-200 p-1 hover:bg-destructive/10 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selection Controls */}
            <div className="px-4 py-2 border-b border-border bg-muted/10 flex justify-between items-center">
              <div className="flex gap-2">
                {canSelectAll() && (
                  <button
                    onClick={handleSelectAll}
                    className="text-xs px-2 py-1 bg-primary/10 text-primary hover:bg-primary/20 rounded transition-colors duration-200"
                  >
                    Select All
                  </button>
                )}
                {getVisibleSelectedCount() > 0 && (
                  <button
                    onClick={handleDeselectAll}
                    className="text-xs px-2 py-1 bg-muted text-muted-foreground hover:bg-accent rounded transition-colors duration-200"
                  >
                    Deselect All
                  </button>
                )}
              </div>
              {selectedServers.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs px-2 py-1 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded transition-colors duration-200"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Server List */}
            <div className="max-h-60 overflow-y-auto">
              {servers.length > 0 ? (
                <ul className="p-2 space-y-1">
                  {servers.map((server) => {
                    const isSelected = selectedServers.some(
                      (s) => s.server_id === server.server_id,
                    );
                    const canSelect =
                      !isSelected && selectedServers.length < maxSelection;

                    return (
                      <li key={server.server_id}>
                        <button
                          className={`w-full text-left px-3 py-2 rounded-md transition-all duration-200 flex items-center gap-2 ${
                            isSelected
                              ? "bg-primary/20 text-primary border border-primary/30"
                              : canSelect
                                ? "hover:bg-muted text-foreground"
                                : "text-muted-foreground/50 cursor-not-allowed"
                          }`}
                          onClick={() =>
                            (isSelected || canSelect) &&
                            handleServerToggle(server)
                          }
                          disabled={!isSelected && !canSelect}
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <Server className="w-4 h-4 flex-shrink-0" />
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="truncate text-sm font-medium">
                                {server.host_name}
                              </span>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-xs ${
                                    server.is_active
                                      ? "bg-success/20 text-success"
                                      : "bg-destructive/20 text-destructive"
                                  }`}
                                >
                                  {server.is_active ? "Active" : "Inactive"}
                                </span>
                                <span>
                                  {server.quota_utilized}/
                                  {server.quota_allocated} GB
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex-shrink-0">
                            {isSelected ? (
                              <div className="w-5 h-5 bg-primary text-primary-foreground rounded flex items-center justify-center">
                                <Check className="w-3 h-3" />
                              </div>
                            ) : canSelect ? (
                              <div className="w-5 h-5 border-2 border-muted-foreground/30 rounded"></div>
                            ) : (
                              <div className="w-5 h-5 border-2 border-muted-foreground/20 rounded bg-muted/50 flex items-center justify-center">
                                <Minus className="w-3 h-3 text-muted-foreground/50" />
                              </div>
                            )}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No servers found
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center px-4 py-3 border-t border-border bg-muted/30">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  title="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="text-sm text-muted-foreground font-medium">
                  Page {page} of {totalPages}
                </span>

                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  title="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Selection Limit Warning */}
            {selectedServers.length >= maxSelection && (
              <div className="px-4 py-2 bg-warning/10 border-t border-warning/20 text-warning text-xs flex items-center gap-2">
                <AlertCircle className="w-3 h-3" />
                <span>Maximum {maxSelection} servers can be selected</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServerSelector;
