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

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createInitialInvoice,
  createInvoiceRevision,
  getAllInvoices,
  fetchInvoiceWithRevisions,
  getLatestInvoiceId,
  downloadInvoiceRevision,
  uploadInvoice,
  updateInitialInvoice,
  getAllGlobalInvoices,
} from "@/api/invoice";

function invalidateInvoiceQueries(queryClient) {
  queryClient.invalidateQueries({ queryKey: ["all_invoices"] });
  queryClient.invalidateQueries({ queryKey: ["invoices-global"] });
  queryClient.invalidateQueries({ queryKey: ["invoice_with_revisions"] });
  queryClient.invalidateQueries({ queryKey: ["latest_invoice_id"] });
}

// Create Initial Invoice
export function useCreateInitialInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create_initial_invoice"],
    mutationFn: ({ organization_id, payload }) =>
      createInitialInvoice(organization_id, payload),
    onSuccess: () => invalidateInvoiceQueries(queryClient),
  });
}

// Create Invoice Revision
export function useCreateInvoiceRevision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create_invoice_revision"],
    mutationFn: ({ organization_id, payload }) =>
      createInvoiceRevision(organization_id, payload),
    onSuccess: () => invalidateInvoiceQueries(queryClient),
  });
}

// Get All Invoices for Org
export function useGetAllInvoices({
  organization_id,
  page,
  page_Size,
  query = "",
}) {
  return useQuery({
    queryKey: ["all_invoices", organization_id, page_Size, page, query],
    queryFn: () => getAllInvoices(organization_id, page, page_Size, query),
    enabled: !!organization_id,
    staleTime: 0,
  });
}

export const useGetGlobalInvoices = ({
  page,
  page_Size,
  query,
  enabled = true,
}) => {
  return useQuery({
    queryKey: ["invoices-global", page, page_Size, query],
    queryFn: () => getAllGlobalInvoices(page, page_Size, query),
    keepPreviousData: true,
    enabled,
    staleTime: 1000 * 60 * 5,
  });
};

// Get Invoice with Revisions
export function useFetchInvoiceWithRevisions(organization_id, invoice_id) {
  return useQuery({
    queryKey: ["invoice_with_revisions", organization_id, invoice_id],
    queryFn: () => fetchInvoiceWithRevisions(organization_id, invoice_id),
    enabled: !!organization_id && !!invoice_id,
    staleTime: 1000 * 60 * 5,
  });
}

// Get Latest Invoice ID
export function useGetLatestInvoiceId() {
  return useQuery({
    queryKey: ["latest_invoice_id"],
    queryFn: getLatestInvoiceId,
    staleTime: 0,
  });
}

// Download Invoice PDF
export function useDownloadInvoiceRevision() {
  return useMutation({
    mutationKey: ["download_invoice_revision"],
    mutationFn: ({ organization_id, revision_id }) =>
      downloadInvoiceRevision(organization_id, revision_id),
  });
}

export function useUploadInvoice() {
  return useMutation({
    mutationKey: ["invoice_upload"],
    mutationFn: ({ organization_id, revision_id, formData }) =>
      uploadInvoice(organization_id, revision_id, formData),
  });
}

export function useUpdateInitialInvoice() {
  return useMutation({
    mutationKey: ["update_initial_invoice"],
    mutationFn: ({ organization_id, payload }) =>
      updateInitialInvoice(organization_id, payload),
  });
}
