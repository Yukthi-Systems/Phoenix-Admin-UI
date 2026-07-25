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
  createDepartment,
  deleteDepartment,
  getDepartment,
  getDepartments,
  updateDepartment,
} from "../api/department";

export function useGetDepartments(organization_id, page, pageSize, query = "") {
  return useQuery({
    queryKey: ["departments", organization_id, page, pageSize, query],
    queryFn: () => getDepartments(organization_id, page, pageSize, query),
    enabled: !!organization_id,
    staleTime: 1000 * 60,
    cacheTime: 1000 * 60,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    retry: 3,
  });
}

export function useGetDepartment(organization_id, department_id) {
  return useQuery({
    queryKey: ["department", organization_id, department_id],
    queryFn: () => getDepartment(organization_id, department_id),
    enabled: !!organization_id && !!department_id,
    staleTime: 1000 * 60,
    cacheTime: 1000 * 60,
    retry: 3,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create_department"],
    mutationFn: async ({ data, addLog = true }) =>
      createDepartment(data, addLog),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["departments"] }),
  });
}

export function useUpdateDepartment() {
  return useMutation({
    mutationKey: ["update_department"],
    mutationFn: async ({ department_id, data }) =>
      updateDepartment(department_id, data),
  });
}

export function useDeleteDepartment() {
  return useMutation({
    mutationKey: ["delete_department"],
    mutationFn: async ({ organization_id, department_id, department_name }) =>
      deleteDepartment(organization_id, department_id, department_name),
  });
}
