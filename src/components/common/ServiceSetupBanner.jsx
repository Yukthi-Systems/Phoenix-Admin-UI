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

import { useAtomValue } from "jotai";
import { Link } from "react-router-dom";
import { Settings, ArrowRight } from "lucide-react";
import { selectedOrganizationAtom } from "@/store/userInfo";
import { userProfileAtom } from "@/store/userProfile";
import { useGetChatConfig } from "@/hooks/useChat";
import { useGetFileServiceConfig } from "@/hooks/useFiles";
import { useGetTasksServiceConfig } from "@/hooks/useCalendar";

// Chat, Files and Tasks & Calendar each need an org-level config that only
// exists once someone saves it from the service's settings page. Pages like
// Users don't show that, so admins who land there first never learn setup is
// missing. Chat additionally refuses to create users until it exists.
const SERVICES = {
  chat: {
    label: "Chat",
    useConfig: useGetChatConfig,
    settingsPath: "/chat/preference",
    editPermission: "chat:edit",
    blocksUsers: true,
  },
  files: {
    label: "File service",
    useConfig: useGetFileServiceConfig,
    settingsPath: "/files/preferences",
    editPermission: "file:edit",
    blocksUsers: false,
  },
  tasks: {
    label: "Tasks & Calendar",
    useConfig: useGetTasksServiceConfig,
    settingsPath: "/calendar/preference",
    editPermission: "tasks_calendar:edit",
    blocksUsers: false,
  },
};

// The config APIs return defaults with updated_at: null when nothing has been
// saved yet (see api/chat.js, api/files.js, api/calendar.js). Shares the same
// React Query cache as the settings page, so it adds no extra request there.
export const useServiceSetupStatus = (service) => {
  const { label, useConfig, settingsPath, editPermission, blocksUsers } =
    SERVICES[service];
  const { organization_id } = useAtomValue(selectedOrganizationAtom) || {};
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const { data } = useConfig(organization_id);

  return {
    label,
    settingsPath,
    blocksUsers,
    canConfigure: permissions.includes(editPermission),
    isNotConfigured: !!data && !data?.data?.updated_at,
  };
};

const ServiceSetupBanner = ({ service }) => {
  const { label, settingsPath, blocksUsers, canConfigure, isNotConfigured } =
    useServiceSetupStatus(service);

  if (!isNotConfigured) return null;

  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm">
      <div className="flex items-start gap-2 text-left">
        <Settings size={16} className="mt-0.5 shrink-0 text-warning" />
        <div>
          <p className="font-semibold text-foreground">
            {label} isn&apos;t set up for this organization yet
          </p>
          <p className="text-xs text-muted-foreground">
            {blocksUsers
              ? "Users can't be added until the organization settings are created."
              : "It's running on default settings until the organization settings are saved."}{" "}
            {!canConfigure && "Ask an admin with edit access to set it up."}
          </p>
        </div>
      </div>

      {canConfigure && (
        <Link
          to={settingsPath}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow hover:bg-primary/90"
        >
          Set up now
          <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
};

export default ServiceSetupBanner;
