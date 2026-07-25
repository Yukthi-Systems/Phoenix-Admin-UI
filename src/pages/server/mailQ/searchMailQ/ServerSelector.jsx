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
import { Server, RefreshCw, Search } from "lucide-react";
import Select from "react-select";
import { Button } from "@/components/common/Buttons";

export const servers = [
  // Relay In
  { name: "Relay In - 1", url: "ri1", id: "ri1", category: "Relay In" },
  { name: "Relay In - 2", url: "ri2", id: "ri2", category: "Relay In" },
  { name: "Relay In - 3", url: "ri3", id: "ri3", category: "Relay In" },
  { name: "Relay In - 4", url: "ri4", id: "ri4", category: "Relay In" },
  { name: "Relay In - 7", url: "ri7", id: "ri7", category: "Relay In" },
  { name: "Relay In - 8", url: "ri8", id: "ri8", category: "Relay In" },
  { name: "Relay In - 11", url: "ri11", id: "ri11", category: "Relay In" },

  // Cloud
  { name: "Cloud - 17", url: "c17", id: "c17", category: "Cloud" },
  { name: "Cloud - 19", url: "c19", id: "c19", category: "Cloud" },
  { name: "Cloud - 21", url: "c21", id: "c21", category: "Cloud" },
  { name: "Cloud - 22", url: "c22", id: "c22", category: "Cloud" },
  { name: "Cloud - 23", url: "c23", id: "c23", category: "Cloud" },
  { name: "Cloud - 24", url: "c24", id: "c24", category: "Cloud" },
  { name: "Cloud - 25", url: "c25", id: "c25", category: "Cloud" },
  { name: "Cloud - 26", url: "c26", id: "c26", category: "Cloud" },
  { name: "Cloud - 27", url: "c27", id: "c27", category: "Cloud" },

  // Cloud Store
  { name: "Cloud Store - 1", url: "cs1", id: "cs1", category: "Cloud Store" },
  { name: "Cloud Store - 2", url: "cs2", id: "cs2", category: "Cloud Store" },

  // Relay Out
  { name: "Relay Out - 1", url: "ro1", id: "ro1", category: "Relay Out" },
  { name: "Relay Out - 2", url: "ro2", id: "ro2", category: "Relay Out" },

  // SMTP
  { name: "SMTP Proxy - 1", url: "sp1", id: "sp1", category: "SMTP" },
  { name: "SMTP EU - 2", url: "se2", id: "se2", category: "SMTP" },
  { name: "SMTP - 5", url: "s5", id: "s5", category: "SMTP" },
  { name: "SMTP - 6", url: "s6", id: "s6", category: "SMTP" },
  { name: "SMTP - 7", url: "s7", id: "s7", category: "SMTP" },
  { name: "SMTP - 8", url: "s8", id: "s8", category: "SMTP" },
  { name: "SMTP - 9", url: "s9", id: "s9", category: "SMTP" },

  // Webmail / Mail Protocols
  {
    name: "Webmail 52",
    url: "wm52",
    id: "wm52",
    category: "Webmail",
  },
  {
    name: "POP 52",
    url: "pop52",
    id: "pop52",
    category: "POP",
  },
  {
    name: "IMAP 52",
    url: "imap52",
    id: "imap52",
    category: "IMAP",
  },

  // Storage
  {
    name: "Nextcloud - 1",
    url: "nc1",
    id: "nc1",
    category: "Storage",
  },

  // Database
  { name: "PgSQL - 1", url: "pgsql1", id: "pgsql1", category: "Database" },
  { name: "PgSQL - 2", url: "pgsql2", id: "pgsql2", category: "Database" },
  { name: "PgSQL - 3", url: "pgsql3", id: "pgsql3", category: "Database" },
  { name: "PgSQL - 4", url: "pgsql4", id: "pgsql4", category: "Database" },
  { name: "PgSQL - 5", url: "pgsql5", id: "pgsql5", category: "Database" },
];

const ServerSelector = ({
  selectedServer,
  setSelectedServer,
  onFetch,
  isLoading,
  fetchText = "Fetch Queue",
}) => {
  const groupedOptions = useMemo(() => {
    const groups = {};

    servers.forEach((server) => {
      if (!groups[server.category]) {
        groups[server.category] = [];
      }
      groups[server.category].push({
        value: server.url,
        label: server.name,
        server: server,
      });
    });

    return Object.entries(groups).map(([category, options]) => ({
      label: category,
      options: options.sort((a, b) => a.label.localeCompare(b.label)),
    }));
  }, []);

  const selectedOption = useMemo(() => {
    if (!selectedServer) return null;

    for (const group of groupedOptions) {
      const option = group.options.find((opt) => opt.value === selectedServer);
      if (option) return option;
    }
    return null;
  }, [selectedServer, groupedOptions]);

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: "hsl(var(--background))",
      borderColor: state.isFocused
        ? "hsl(var(--primary))"
        : "hsl(var(--border))",
      color: "hsl(var(--foreground))",
      minHeight: "44px",
      borderRadius: "8px",
      boxShadow: state.isFocused
        ? "0 0 0 2px hsl(var(--primary) / 0.2)"
        : "none",
      "&:hover": {
        borderColor: "hsl(var(--border) / 0.8)",
      },
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: "0 12px",
      textAlign: "left",
    }),
    input: (provided) => ({
      ...provided,
      color: "hsl(var(--foreground))",
      margin: 0,
      padding: 0,
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "hsl(var(--muted-foreground))",
      textAlign: "left",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "hsl(var(--foreground))",
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "hsl(var(--background))",
      border: "1px solid hsl(var(--border))",
      borderRadius: "8px",
      boxShadow:
        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      zIndex: 50,
    }),
    menuList: (provided) => ({
      ...provided,
      padding: "4px",
    }),
    group: (provided) => ({
      ...provided,
      paddingTop: "8px",
      paddingBottom: "8px",
    }),
    groupHeading: (provided) => ({
      ...provided,
      color: "hsl(var(--muted-foreground))",
      fontSize: "12px",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      padding: "1px 12px",
      margin: "0 0 4px 0",
      borderRadius: "6px",
      textAlign: "left",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "hsl(var(--primary))"
        : state.isFocused
          ? "hsl(var(--accent))"
          : "transparent",
      color: state.isSelected
        ? "hsl(var(--primary-foreground))"
        : "hsl(var(--foreground))",
      padding: "8px 12px",
      borderRadius: "4px",
      margin: "2px 0",
      cursor: "pointer",
      "&:active": {
        backgroundColor: state.isSelected
          ? "hsl(var(--primary))"
          : "hsl(var(--accent))",
      },
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: "hsl(var(--muted-foreground))",
      "&:hover": {
        color: "hsl(var(--foreground))",
      },
    }),
    indicatorSeparator: (provided) => ({
      ...provided,
      backgroundColor: "hsl(var(--border))",
    }),
    clearIndicator: (provided) => ({
      ...provided,
      color: "hsl(var(--muted-foreground))",
      "&:hover": {
        color: "hsl(var(--foreground))",
      },
    }),
    noOptionsMessage: (provided) => ({
      ...provided,
      color: "hsl(var(--muted-foreground))",
      padding: "12px",
    }),
    loadingMessage: (provided) => ({
      ...provided,
      color: "hsl(var(--muted-foreground))",
    }),
  };

  const CustomOption = ({ children, ...props }) => (
    <div
      {...props.innerProps}
      className={`flex cursor-pointer items-center gap-2 rounded px-3 py-2 transition-colors ${
        props.isSelected
          ? "bg-primary text-primary-foreground"
          : props.isFocused
            ? "bg-accent text-accent-foreground"
            : "text-foreground hover:bg-accent/50"
      }`}
    >
      <Server className="h-4 w-4 flex-shrink-0" />
      <span className="truncate">{children}</span>
      {/* <span className="text-xs text-muted-foreground ml-auto">
                {props.data.server.url}
            </span> */}
    </div>
  );

  return (
    <div className="bg-card border-border mb-8 rounded-xl border p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <div className="col-span-4">
          <label className="text-foreground mb-2 block text-left text-sm font-medium">
            Select Mail Server
          </label>
          <Select
            value={selectedOption}
            onChange={(option) => setSelectedServer(option ? option.value : "")}
            options={groupedOptions}
            styles={customStyles}
            placeholder="Choose a server..."
            isClearable
            isSearchable
            isDisabled={isLoading}
            components={{
              Option: CustomOption,
            }}
            noOptionsMessage={() => "No servers found"}
            loadingMessage={() => "Loading servers..."}
            className="react-select-container"
            classNamePrefix="react-select"
            menuPlacement="auto"
            maxMenuHeight={300}
            filterOption={(option, inputValue) => {
              const searchValue = inputValue.toLowerCase();
              return (
                option.label.toLowerCase().includes(searchValue) ||
                option.data.server.url.toLowerCase().includes(searchValue) ||
                option.data.server.category.toLowerCase().includes(searchValue)
              );
            }}
          />
        </div>

        {/* Fetch Button */}
        <div className="mt-[26px] flex">
          <Button
            onClick={onFetch}
            variant="primary"
            size="md"
            disabled={!selectedServer || isLoading}
            loading={isLoading}
            className="h-11 w-full"
            icon={RefreshCw}
          >
            {fetchText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServerSelector;
