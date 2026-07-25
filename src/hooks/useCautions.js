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
  createCaution,
  getCautionDetails,
  updateCaution,
  deleteCaution,
  getCautionsList,
} from "../api/cautions";

export function useGetCautions(organization_id, page, pageSize, query = "") {
  return useQuery({
    queryKey: ["cautions", organization_id, page, pageSize, query],
    queryFn: () => getCautionsList(organization_id, page, pageSize, query),
    enabled: !!organization_id,
    staleTime: 1000 * 60,
    cacheTime: 1000 * 60,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
}

export function useGetCautionDetails(organization_id, caution_id) {
  return useQuery({
    queryKey: ["caution_details", organization_id, caution_id],
    queryFn: () => getCautionDetails(organization_id, caution_id),
    enabled: !!organization_id && !!caution_id,
    staleTime: 1000 * 60,
    cacheTime: 1000 * 60,
    keepPreviousData: true,
  });
}

export function useCreateCaution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create_caution"],
    mutationFn: async ({ data, addLog = true }) => createCaution(data, addLog),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cautions"] }),
  });
}

export function useUpdateCaution() {
  return useMutation({
    mutationKey: ["update_caution"],
    mutationFn: async ({ organization_id, caution_id, data }) =>
      updateCaution(organization_id, caution_id, data),
  });
}

export function useDeleteCaution() {
  return useMutation({
    mutationKey: ["delete_caution"],
    mutationFn: async ({ organization_id, caution_id, caution_name = "Unknown" }) =>
      deleteCaution(organization_id, caution_id, caution_name),
  });
}
