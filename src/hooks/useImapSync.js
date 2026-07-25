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

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createImapSyncJob, listImapSyncJobs } from "@/api/imapSync";

// Hook to create a new IMAP Sync Job
export const useCreateImapSyncJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createImapSyncJob(data),
    onSuccess: (data) => {
      if (data.to_email) {
        const [, domain] = data.to_email.trim().split("@");
        queryClient.invalidateQueries({
          queryKey: ["imap-sync-jobs", domain],
        });
      }
    },
  });
};

// Hook to list IMAP Sync Jobs
export const useListImapSyncJobs = (domain_name, page, limit) => {
  return useQuery({
    queryKey: ["imap-sync-jobs", domain_name, page, limit],
    queryFn: () => listImapSyncJobs(domain_name, page, limit),
    enabled: !!domain_name,
    keepPreviousData: true, 
  });
};
