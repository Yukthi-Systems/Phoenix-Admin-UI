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
import { toast } from "react-toastify";
import {
  uploadTicketFile,
  getTicketFile,
  deleteTicketFile,
  createSupportTicket,
  addTicketFollowUp,
  getSupportTickets,
  getTicketFollowUps,
  getAdminSupportTickets,
  updateSupportTicketStatus,
  deleteSupportTicket,
  getTicktById,
} from "@/api/supportTickets";

// ----------------------------------------------------------------------
// User / General Hooks
// ----------------------------------------------------------------------

export const useUploadTicketFile = () =>
  useMutation({
    mutationFn: (formData) => uploadTicketFile(formData),
    retry: 3,
    networkMode: "always",
  });

export const useGetTicketFile = (file_id, enabled = true) =>
  useQuery({
    queryKey: ["support-ticket-file", file_id],
    queryFn: () => getTicketFile(file_id),
    enabled: enabled && !!file_id,
    staleTime: 10 * 60 * 1000,
    retry: 2,
  });

export const useDeleteTicketFile = () =>
  useMutation({
    mutationFn: (file_id) => deleteTicketFile(file_id),
  });

export const useCreateSupportTicket = () =>
  useMutation({
    mutationFn: (payload) => createSupportTicket(payload),
  });

export const useAddTicketFollowUp = () =>
  useMutation({
    mutationFn: ({ organization_id, ticket_id, payload }) =>
      addTicketFollowUp(organization_id, ticket_id, payload),
  });

export const useGetSupportTickets = (organization_id, page, size, query) =>
  useQuery({
    queryKey: ["support-tickets", organization_id, page, size, query],
    queryFn: () => getSupportTickets(organization_id, page, size, query),
    enabled: !!organization_id,
    keepPreviousData: true,
  });

export const useGetTicketFollowUps = (organization_id, ticket_id, page, size) =>
  useQuery({
    queryKey: [
      "support-ticket-followups",
      organization_id,
      ticket_id,
      page,
      size,
    ],
    queryFn: () => getTicketFollowUps(organization_id, ticket_id, page, size),
    enabled: !!organization_id && !!ticket_id,
    refetchInterval: 10000,
    refetchIntervalInBackground: false,
  });

export const useGetTicketByID = (organization_id, ticket_id) =>
  useQuery({
    queryKey: ["support-ticket-byid", organization_id, ticket_id],
    queryFn: () => getTicktById(organization_id, ticket_id),
    enabled: !!organization_id && !!ticket_id,
    refetchInterval: 10000,
    refetchIntervalInBackground: false,
  });

// ----------------------------------------------------------------------
// Admin Hooks
// ----------------------------------------------------------------------

export const useGetAdminSupportTickets = (page, size, payload) =>
  useQuery({
    queryKey: ["admin-support-tickets", page, size, payload],
    queryFn: () => getAdminSupportTickets(page, size, payload),
    placeholderData: (previousData) => previousData, // v5 equivalent of keepPreviousData
  });

export const useUpdateSupportTicketStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ organization_id, ticket_id, payload }) =>
      updateSupportTicketStatus(organization_id, ticket_id, payload),
    onSuccess: () => {
      toast.success("Ticket status updated successfully");
      queryClient.invalidateQueries(["admin-support-tickets"]);
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to update ticket status",
      );
    },
  });
};

export const useDeleteSupportTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ organization_id, ticket_id }) =>
      deleteSupportTicket(organization_id, ticket_id),
    onSuccess: () => {
      toast.success("Ticket deleted successfully");
      queryClient.invalidateQueries(["admin-support-tickets"]);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to delete ticket");
    },
  });
};
