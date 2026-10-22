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

// hooks/maintenance.js
import {
  getMaintenanceStatus,
  createMaintenanceStatus,
  updateMaintenanceStatus,
  deleteMaintenanceStatus,
} from "@/api/maintenance";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Edits/deletes only mark the list + details cache stale (no refetch here):
// the next page that shows the data fetches it fresh on mount, instead of
// serving pre-edit data until staleTime runs out (e.g. an edited field "not
// updating" until several hard refreshes). Not refetching keeps this free -
// bulk import/edit/delete run these mutations once per row, and the list
// pages already refetch once when a batch or in-page action completes.
function invalidateMaintenanceQueries(queryClient) {
  queryClient.invalidateQueries({
    queryKey: ["maintenance_status"],
    refetchType: "none",
  });
}

export function useGetMaintenanceStatus(is_active = true) {
  return useQuery({
    queryKey: ["maintenance_status", is_active],
    queryFn: () => getMaintenanceStatus(is_active),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60 * 15,
  });
}

export function useCreateMaintenanceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMaintenanceStatus,
    onSuccess: () => {
      // Invalidate and refetch maintenance status queries
      queryClient.invalidateQueries({ queryKey: ["maintenance_status"] });
    },
    onError: (error) => {
      // Error handling is already done in the API layer
      console.error("Create maintenance status error:", error);
    },
  });
}

export function useUpdateMaintenanceStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update_maintenance_status"],
    mutationFn: ({ data, maintenance_id }) =>
      updateMaintenanceStatus({ data, maintenance_id }),
    onSuccess: () => invalidateMaintenanceQueries(queryClient),
  });
}

export function useDeleteMaintenanceStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, maintenance_title = "Unknown Maintenance" }) =>
      deleteMaintenanceStatus({ maintenance_id: id, maintenance_title }),
    mutationKey: ["delete_maintenance_status"],
    onSuccess: () => invalidateMaintenanceQueries(queryClient),
  });
}
