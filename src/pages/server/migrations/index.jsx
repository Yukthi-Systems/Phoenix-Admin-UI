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

import { selectedServersAtom } from "@/store/server";
import { useAtomValue } from "jotai";
import React, { useState } from "react";
import ServerSelector from "./ServerMultiSelector";
import ServerMigrationKanban from "./Kanban";
import { Switch } from "@/components/common/Switch";
import { useForm } from "react-hook-form";
import { Zap, Hand, Info } from "lucide-react";

const ServerMigrations = () => {
  const [selectedServers, setSelectedServers] = useState([]);
  const serverList = useAtomValue(selectedServersAtom);

  const { control, watch } = useForm({
    defaultValues: {
      isManualMode: false,
    },
  });

  const isManualMode = watch("isManualMode");

  const handleServersChange = (servers) => {
    setSelectedServers(servers);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-6">
        {/* Server Selection & Mode Control Card */}
        <div className="bg-card border flex items-start justify-center border-border rounded-lg p-5 shadow-sm relative">
          <div className="flex flex-col gap-4 items-center">
            <label className="text-sm text-center font-semibold text-foreground">
              Select Servers for Migration Management (Max 4)
            </label>

            <ServerSelector
              selectedServers={selectedServers}
              setSelectedServers={handleServersChange}
              maxSelection={4}
              disabled={false}
              mailboxOnly
              className="min-w-[300px]"
            />

            {selectedServers.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 p-2 rounded border border-border/50">
                <Info className="w-3.5 h-3.5" />
                <span>
                  <span className="font-semibold">Selected Sources:</span>{" "}
                  {selectedServers.map((s) => s.host_name).join(", ")}
                </span>
              </div>
            )}
          </div>
          
          <div
            className={`absolute top-5 right-5 flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-full border transition-all duration-300 ${
              isManualMode
                ? "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-400"
                : "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/30 dark:border-blue-900 dark:text-blue-400"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide">
                {isManualMode ? "Manual Mode" : "Auto Mode"}
              </span>
            </div>

            <div className="h-4 w-px bg-current opacity-20 mx-1" />

            <div className="flex items-center">
              <Switch name="isManualMode" control={control} />
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <ServerMigrationKanban
          selectedServers={selectedServers}
          isManualMode={isManualMode}
        />
      </div>
    </div>
  );
};

export default ServerMigrations;