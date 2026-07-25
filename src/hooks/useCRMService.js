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

import {
  addCRMService,
  deleteCRMService,
  editCRMService,
  getCRMService,
  getCRMServiceItem,
} from "@/api/crmService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useGetCRMService() {
  return useQuery({
    queryKey: ["crm_service"],
    queryFn: () => getCRMService(),
    staleTime: 1000 * 60,
    cacheTime: 1000 * 60,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    keepPreviousData: false,
    retry: 3,
  });
}

export function useAddCRMService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["add_crm_service"],
    mutationFn: async ({ data }) => addCRMService(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["crm_service"] }),
  });
}

export function useGetCRMServiceItem({ service_code }) {
  return useQuery({
    queryKey: ["get_crm_service_item"],
    queryFn: () => getCRMServiceItem(service_code),
    staleTime: 1000 * 60, // 60 seconds
    cacheTime: 1000 * 60, // 60 seconds
    // refetchOnMount: true,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    retry: 3,
  });
}

export function useEditCRMService() {
  return useMutation({
    mutationKey: ["edit_crm_service"],
    mutationFn: async ({ service_code, data }) =>
      editCRMService(service_code, data),
  });
}

export function useDeleteCRMService() {
  return useMutation({
    mutationKey: ["delete_crm_service"],
    mutationFn: async ({ service_code }) => deleteCRMService(service_code),
  });
}
