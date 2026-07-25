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

import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Server,
  Check,
  AlertCircle,
  Search,
  Loader2,
} from "lucide-react";
import { useGetServersForSelector } from "@/hooks/useServer";

const SingleServerSelector = ({ onChange, disabled = false, value = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedServer, setSelectedServer] = useState(value);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  const { data, isLoading, isError } = useGetServersForSelector();
  const servers = data?.servers || [];

  // Filter servers locally
  const filteredServers = servers.filter((server) =>
    server.host_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  useEffect(() => {
    if (servers.length && !selectedServer && !value) {
      setSelectedServer(servers[0]);
      onChange?.(servers[0]);
    }
  }, [servers]);

  useEffect(() => {
    if (value && value !== selectedServer) {
      setSelectedServer(value);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSelect = (server) => {
    setSelectedServer(server);
    setIsOpen(false);
    setSearchQuery("");
    onChange?.(server);
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-sm">
        <div className="w-full border px-3 py-2 rounded-md shadow animate-pulse bg-muted">
          <div className="flex items-center justify-center gap-2">
            <div className="h-4 bg-muted-foreground/20 rounded w-24" />
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full max-w-sm">
        <div className="w-full border border-destructive/20 bg-destructive/10 px-3 py-2 rounded-md text-destructive text-sm flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Failed to load servers
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-sm" ref={dropdownRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full border px-3 py-2 rounded-md shadow-sm flex items-center justify-between gap-2 transition-colors ${
          disabled
            ? "bg-muted/30 text-muted-foreground cursor-not-allowed"
            : "bg-background hover:bg-accent"
        }`}
      >
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4" />
          <span className="truncate">
            {selectedServer?.host_name || "Select a server"}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-card border border-border rounded-md shadow-lg">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search servers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filteredServers.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No servers found
              </div>
            ) : (
              <ul className="p-2 space-y-1">
                {filteredServers.map((server) => (
                  <li key={server.server_id}>
                    <button
                      onClick={() => handleSelect(server)}
                      className={`w-full text-left px-3 py-2 rounded-md flex items-center justify-between gap-2 hover:bg-muted transition-all ${
                        selectedServer?.server_id === server.server_id
                          ? "bg-primary/10 text-primary"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4" />
                        <span className="truncate text-sm">
                          {server.host_name}
                        </span>
                      </div>
                      {selectedServer?.server_id === server.server_id && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleServerSelector;
