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
  getApiKeys,
  getApiKeyDetails,
  createApiKey,
  deleteApiKey,
  editApiKey,
} from "../api/apiKeys";

// Query Keys
export const apiKeyKeys = {
  all: ["api-keys"],
  lists: () => [...apiKeyKeys.all, "list"],
  list: (orgId, page, limit) => [...apiKeyKeys.lists(), orgId, page, limit],
  details: () => [...apiKeyKeys.all, "detail"],
  detail: (orgId, keyId) => [...apiKeyKeys.details(), orgId, keyId],
};

/**
 * Hook to fetch paginated API keys
 */
export const useApiKeys = (organizationId, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["api-keys", organizationId, page, limit],
    queryFn: () => getApiKeys(organizationId, page, limit),
    enabled: !!organizationId,
    keepPreviousData: true,
  });
};

/**
 * Hook to fetch single API key details
 */
export const useApiKeyDetails = (organizationId, apiKeyId) => {
  return useQuery({
    queryKey: apiKeyKeys.detail(organizationId, apiKeyId),
    queryFn: () => getApiKeyDetails(organizationId, apiKeyId),
    enabled: !!organizationId && !!apiKeyId,
  });
};

/**
 * Hook to create a new API Key
 */
export const useCreateApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ organizationId, data }) => createApiKey(organizationId, data),
    onSuccess: (_, variables) => {
      toast.success("API Key created successfully");
      queryClient.invalidateQueries({
        queryKey: apiKeyKeys.lists(),
      });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to create API Key");
    },
  });
};

/**
 * Hook to edit/activate an API Key
 */
export const useEditApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ organizationId, apiKeyId, activate, data }) =>
      editApiKey(organizationId, apiKeyId, activate, data),
    onSuccess: (_, variables) => {
      toast.success("API Key updated successfully");
      queryClient.invalidateQueries({
        queryKey: apiKeyKeys.detail(variables.organizationId, variables.apiKeyId),
      });
      queryClient.invalidateQueries({
        queryKey: apiKeyKeys.lists(),
      });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update API Key");
    },
  });
};

/**
 * Hook to delete an API Key
 */
export const useDeleteApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ organizationId, apiKeyId, keyName }) =>
      deleteApiKey(organizationId, apiKeyId, keyName),
    onSuccess: () => {
      toast.success("API Key deleted successfully");
      queryClient.invalidateQueries({
        queryKey: apiKeyKeys.lists(),
      });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to delete API Key");
    },
  });
};