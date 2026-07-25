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
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ServerColumn from "./ServerColumn";
import { Server } from "lucide-react";
import {
  useStartMailboxMigration,
  useStartManualMailboxMigration,
} from "@/hooks/useServer";
import { useToastify } from "@/hooks/useToastify";
import { useQueryClient } from "@tanstack/react-query";

const ServerMigrationKanban = ({ selectedServers, isManualMode }) => {
  const [selectedMailboxes, setSelectedMailboxes] = useState({});
  const [selectedMailboxQuotas, setSelectedMailboxQuotas] = useState({});
  const [migrationQueue, setMigrationQueue] = useState([]);
  const [activeMigrations, setActiveMigrations] = useState(new Set());

  // Hooks for both Automatic and Manual migration
  const { mutateAsync: startAutoMigration } = useStartMailboxMigration();
  const { mutateAsync: startManualMigration } = useStartManualMailboxMigration();

  const toast = useToastify();
  const queryClient = useQueryClient();

  // Handle mailbox selection for migration
  const handleMailboxSelection = (
    serverId,
    mailboxEmail,
    quotaAllocated,
    isSelected,
  ) => {
    setSelectedMailboxes((prev) => ({
      ...prev,
      [serverId]: {
        ...prev[serverId],
        [mailboxEmail]: isSelected,
      },
    }));

    setSelectedMailboxQuotas((prev) => {
      const next = { ...prev };
      if (isSelected) {
        next[mailboxEmail] = Number(quotaAllocated);
      } else {
        delete next[mailboxEmail];
      }
      return next;
    });
  };

  // Handle multiple mailbox migrations
  const handleMailboxMigration = async (
    emailsArray,
    sourceServerId,
    targetServerId,
    mailboxQuotas = {},
  ) => {
    if (sourceServerId === targetServerId) return;

    const emails = Array.isArray(emailsArray) ? emailsArray : [emailsArray];
    const targetServer = selectedServers.find(
      (server) => server.server_id === targetServerId,
    );
    const migrationQuotas = emails.map((email) =>
      Number(mailboxQuotas[email] ?? selectedMailboxQuotas[email]),
    );
    const requiredQuota = migrationQuotas.reduce((total, quota) => total + quota, 0);
    const availableQuota =
      Number(targetServer?.quota_allocated) -
      Number(targetServer?.quota_utilized);

    if (
      !targetServer ||
      !Number.isFinite(availableQuota) ||
      migrationQuotas.some((quota) => !Number.isFinite(quota))
    ) {
      toast("error", "Unable to verify the target server quota.");
      return;
    }

    if (requiredQuota > availableQuota) {
      toast(
        "error",
        `Migration blocked: ${targetServer.host_name} has ${availableQuota.toFixed(2)} GB available, but the selected mailbox${emails.length === 1 ? " requires" : "es require"} ${requiredQuota.toFixed(2)} GB.`,
      );
      return;
    }

    const newMigrations = emails.map((email) => ({
      id: `${email}-${Date.now()}-${Math.random()}`,
      email,
      sourceServerId,
      targetServerId,
      quotaAllocated: Number(
        mailboxQuotas[email] ?? selectedMailboxQuotas[email],
      ),
      status: "PENDING",
      mode: isManualMode ? "MANUAL" : "AUTO",
    }));

    setMigrationQueue((prev) => [...prev, ...newMigrations]);

    // Process migrations sequentially to ensure stability
    for (const migration of newMigrations) {
      await processSingleMigration(migration);
    }

    // Clear selections after initiating migration
    setSelectedMailboxes((prev) => ({
      ...prev,
      [sourceServerId]: {},
    }));
    setSelectedMailboxQuotas((prev) => {
      const next = { ...prev };
      emails.forEach((email) => delete next[email]);
      return next;
    });
  };

  const processSingleMigration = async (migration) => {
    try {
      setMigrationQueue((prev) =>
        prev.map((m) =>
          m.id === migration.id ? { ...m, status: "INITIALIZING" } : m,
        ),
      );

      setActiveMigrations((prev) => new Set([...prev, migration.email]));

      const migrationPayload = {
        source_server_id: migration.sourceServerId,
        target_server_id: migration.targetServerId,
        email: migration.email,
      };

      // Select the API based on the passed prop (isManualMode from parent)
      const migrationPromise = isManualMode
        ? startManualMigration(migrationPayload)
        : startAutoMigration(migrationPayload);

      await migrationPromise;

      // SUCCESS HANDLING
      setMigrationQueue((prev) =>
        prev.map((m) =>
          m.id === migration.id ? { ...m, status: "IN_PROGRESS" } : m,
        ),
      );

      toast(
        "success",
        `[${isManualMode ? "Manual" : "Auto"}] Migration started for ${migration.email}`,
      );

      // Invalidate queries to refresh lists
      queryClient.invalidateQueries({
        queryKey: ["mailboxes_from_server", migration.sourceServerId],
      });
      queryClient.invalidateQueries({
        queryKey: ["mailboxes_from_server", migration.targetServerId],
      });
    } catch (error) {
      // ERROR HANDLING
      setMigrationQueue((prev) =>
        prev.map((m) =>
          m.id === migration.id
            ? { ...m, status: "FAILED", error: error.message }
            : m,
        ),
      );

      const message =
        error.response?.data?.message || error.message || "Unknown error";
      const tracebackId = error.response?.data?.traceback_id;

      toast(
        "error",
        `Migration failed for ${migration.email}: ${message}${tracebackId ? ` (Trace: ${tracebackId})` : ""}`,
      );
    } finally {
      // CLEANUP
      setActiveMigrations((prev) => {
        const newSet = new Set(prev);
        newSet.delete(migration.email);
        return newSet;
      });

      // Remove from queue UI after 5 seconds
      setTimeout(() => {
        setMigrationQueue((prev) => prev.filter((m) => m.id !== migration.id));
      }, 5000);
    }
  };

  const clearServerSelection = (serverId) => {
    const selectedEmails = Object.keys(selectedMailboxes[serverId] || {}).filter(
      (email) => selectedMailboxes[serverId][email],
    );
    setSelectedMailboxes((prev) => ({
      ...prev,
      [serverId]: {},
    }));
    setSelectedMailboxQuotas((prev) => {
      const next = { ...prev };
      selectedEmails.forEach((email) => delete next[email]);
      return next;
    });
  };

  const getSelectedCount = (serverId) => {
    const serverSelections = selectedMailboxes[serverId] || {};
    return Object.values(serverSelections).filter(Boolean).length;
  };

  if (!selectedServers || selectedServers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted/30 rounded-lg border-2 border-dashed border-border">
        <div className="text-center">
          <Server className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No Servers Selected
          </h3>
          <p className="text-muted-foreground">
            Please select servers from the server selector above to start
            managing mailbox migrations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="w-full space-y-6">
        {/* Kanban Columns */}
        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: `repeat(${Math.min(selectedServers.length, 4)}, 1fr)`,
          }}
        >
          {selectedServers.map((server) => (
            <ServerColumn
              key={server.server_id}
              server={server}
              selectedMailboxes={selectedMailboxes[server.server_id] || {}}
              selectedMailboxQuotas={selectedMailboxQuotas}
              onMailboxSelection={(email, quotaAllocated, isSelected) =>
                handleMailboxSelection(
                  server.server_id,
                  email,
                  quotaAllocated,
                  isSelected,
                )
              }
              onMailboxMigration={handleMailboxMigration}
              onClearSelection={() => clearServerSelection(server.server_id)}
              selectedCount={getSelectedCount(server.server_id)}
              allServers={selectedServers}
              isManualMode={isManualMode} // Pass through prop to columns if needed for UI feedback
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
};

export default ServerMigrationKanban;
