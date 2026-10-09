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
import {
  getTasksServiceConfig,
  updateTasksServiceConfig,
  getTasksUsers,
  createTasksUser,
  toggleTasksUserStatus,
  deleteTasksUser,
} from "../api/calendar";

export function useGetTasksServiceConfig(organization_id) {
  return useQuery({
    queryKey: ["tasks_service_config", organization_id],
    queryFn: () => getTasksServiceConfig(organization_id),
    enabled: !!organization_id,
  });
}

export function useUpdateTasksServiceConfig() {
  return useMutation({
    mutationKey: ["update_tasks_service_config"],
    mutationFn: (data) => updateTasksServiceConfig(data),
  });
}

export function useGetTasksUsers(domain, page, perPage) {
  return useQuery({
    queryKey: ["tasks_users", page, perPage, domain],
    queryFn: () => getTasksUsers(domain, perPage, page),
    enabled: !!domain,
    staleTime: 1000 * 10,
  });
}

export function useCreateTasksUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ domain, email, enable }) =>
      createTasksUser(domain, email, enable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks_users"] });
      queryClient.invalidateQueries({ queryKey: ["identities"] });
    },
  });
}

export function useToggleTasksUserStatus() {
  return useMutation({
    mutationFn: ({ domain, email }) => toggleTasksUserStatus(domain, email),
  });
}

export function useDeleteTasksUser() {
  return useMutation({
    mutationFn: ({ domain, email }) => deleteTasksUser(domain, email),
  });
}
