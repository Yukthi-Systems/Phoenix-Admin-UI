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
  addCRMPO,
  addCRMPOLink,
  deleteCRMPO,
  deleteCRMPOLink,
  editCRMPO,
  editCRMPOLink,
  getCRMPO,
  getCRMPOItem,
} from "@/api/crmPurchaseOrder";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useGetCRMPO({ organization_id, page, limit }) {
  return useQuery({
    queryKey: ["crm_purchase_order", organization_id, page, limit],
    queryFn: () => getCRMPO(organization_id, page, limit),
    staleTime: 1000 * 60,
    cacheTime: 1000 * 60,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    keepPreviousData: false,
    retry: 3,
  });
}

export function useAddCRMPO() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["add_crm_purchase_order"],
    mutationFn: async ({ data }) => addCRMPO(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["crm_purchase_order"] }),
  });
}

export function useGetCRMPOItem({ organization_id, po_id }) {
  return useQuery({
    queryKey: ["get_crm_purchase_order_item", organization_id, po_id],
    queryFn: () => getCRMPOItem(organization_id, po_id),
    staleTime: 1000 * 60,
    keepPreviousData: true,
    cacheTime: 1000 * 60,
    retry: 3,
  });
}

export function useEditCRMPO() {
  return useMutation({
    mutationKey: ["edit_crm_purchase_order"],
    mutationFn: async ({ po_id, data }) => editCRMPO(po_id, data),
  });
}

export function useDeleteCRMPO() {
  return useMutation({
    mutationKey: ["delete_crm_purchase_order"],
    mutationFn: async ({ organization_id, po_id, po_name }) =>
      deleteCRMPO(organization_id, po_id, po_name),
  });
}

export function useAddCRMPOLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["add_crm_purchase_order_link"],
    mutationFn: async ({ organization_id, po_id, service_code, data }) =>
      addCRMPOLink(organization_id, po_id, service_code, data),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["get_crm_purchase_order_item"],
      }),
  });
}

export function useDeleteCRMPOLink() {
  return useMutation({
    mutationKey: ["delete_crm_purchase_order_link"],
    mutationFn: async ({ organization_id, po_id, assignment_id }) =>
      deleteCRMPOLink(organization_id, po_id, assignment_id),
  });
}

export function useEditCRMPOLink() {
  return useMutation({
    mutationKey: ["edit_crm_purchase_order_link"],
    mutationFn: async ({
      organization_id,
      po_id,
      service_code,
      assignment_id,
      data,
    }) =>
      editCRMPOLink(organization_id, po_id, service_code, assignment_id, data),
  });
}
