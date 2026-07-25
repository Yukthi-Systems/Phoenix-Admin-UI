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

import { doMailQueueAction, SearchMailQueue } from "@/api/mailQ";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useMailQueue(selectedServer) {
  return useQuery({
    queryKey: ["search_mail_queue", selectedServer],
    queryFn: () => SearchMailQueue(selectedServer),
    enabled: false,
    staleTime: 1000 * 60,
    cacheTime: 1000 * 60,
    keepPreviousData: true,
    retry: 3,
  });
}

export function useMailQueueAction() {
  return useMutation({
    mutationKey: ["mailQueueAction"],
    mutationFn: async ({ server_host_id, action, data }) => {
      return await doMailQueueAction(server_host_id, action, data);
    },
  });
}
