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
  addUser,
  changePassword,
  changePermission,
  deleteUser,
  deleteUserAppSession,
  getProfilePictureUrl,
  getUserAppSessions,
  getUsers,
  getUserUiInfo,
  storeUserUiInfo,
  updateUser,
  uploadProfilePicture,
  validateUsername,
  getSSOSessions,
  deleteSSOSession,
  updateSSOSessionStatus,
} from "../api/user";
import { profile } from "../api/auth";
import { useDebounce } from "./useDebounce";
import { useAtom } from "jotai";
import { uiInfoAtom } from "@/store/uiInfo";

export function useGetUsers(organization_id, page, pageSize) {
  return useQuery({
    queryKey: ["users", organization_id, page, pageSize],
    queryFn: () => getUsers(organization_id, page, pageSize),
    enabled: !!organization_id,
    staleTime: 1000 * 60,
    cacheTime: 1000 * 60,
    keepPreviousData: true,
    retry: 3,
  });
}

export function useGetUser(organization_id, user_id) {
  return useQuery({
    queryKey: ["user", organization_id, user_id],
    queryFn: () => profile(user_id, organization_id),
    enabled: !!organization_id && !!user_id,
    staleTime: 1000 * 60, // 60 Seconds
    cacheTime: 1000 * 60, // 60 Seconds
    keepPreviousData: true,
    retry: 3,
  });
}

export function useAddUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["add_user"],
    mutationFn: async (data) => addUser(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useUpdateUser() {
  return useMutation({
    mutationKey: ["update_user"],
    mutationFn: async ({ orgId, body, queryParams }) =>
      updateUser(orgId, body, queryParams),
  });
}

export function useDeleteUser() {
  return useMutation({
    mutationKey: ["delete_user"],
    mutationFn: async ({ orgId, queryParams }) =>
      deleteUser(orgId, queryParams),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationKey: ["change_password"],
    mutationFn: async ({ orgId, data, userName }) =>
      changePassword(orgId, data, userName),
  });
}

export function useChangePermission() {
  return useMutation({
    mutationKey: ["change_permission"],
    mutationFn: async ({ orgId, user_id, data, userName }) =>
      changePermission(orgId, user_id, data, userName),
  });
}

export function useValidateUsername(username) {
  const debouncedUsername = useDebounce(username, 500);

  const result = useQuery({
    queryKey: ["validate_username", debouncedUsername],
    queryFn: () => validateUsername(debouncedUsername),
    enabled: !!debouncedUsername && debouncedUsername.length >= 3,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  return {
    ...result,
    isValid: !result.data?.user_name_exists,
    isDebouncing: username !== debouncedUsername,
    originalValue: username,
    debouncedValue: debouncedUsername,
  };
}

export function useUploadProfilePicture() {
  return useMutation({
    mutationKey: ["upload_profile_picture"],
    mutationFn: async ({ organization_id, user_id, file }) =>
      uploadProfilePicture(organization_id, user_id, file),
  });
}

export function useGetProfilePictureUrl(organization_id, user_id) {
  return useQuery({
    queryKey: ["profile_picture_url", organization_id, user_id],
    queryFn: () => getProfilePictureUrl(organization_id, user_id),
    enabled: !!organization_id && !!user_id,
    staleTime: 0, // Always consider data stale
    cacheTime: 0, // Don't cache the data
    retry: false,
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: true, //
    // Clean up blob URLs when data changes or component unmounts
    onSuccess: (oldData, newData) => {
      if (
        oldData?.url &&
        oldData.url.startsWith("blob:") &&
        oldData.url !== newData?.url
      ) {
        URL.revokeObjectURL(oldData.url);
      }
    },
  });
}

export function useGetUserUiInfo() {
  return useQuery({
    queryKey: ["user_ui_info"],
    queryFn: getUserUiInfo,
    staleTime: 1000 * 60 * 10,
    cacheTime: 1000 * 60 * 15,
    retry: 1, // Reduce retries
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    enabled: true,
  });
}

export function useStoreUserUiInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["store_user_ui_info"],
    mutationFn: async (data) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return storeUserUiInfo(data);
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["user_ui_info"], data);
    },
    onError: (error) => {
      console.error("Failed to store user UI info:", error);
    },
  });
}

export function useGetUserAppSession(domain, page, perPage) {
  return useQuery({
    queryKey: ["app_session", page, perPage, domain],
    queryFn: () => getUserAppSessions(domain, perPage, page),
    enabled: !!domain,
    staleTime: 1000 * 10,
  });
}

export function useDeleteUserAppSession() {
  return useMutation({
    mutationFn: ({ domain, sessionId }) =>
      deleteUserAppSession(domain, sessionId),
  });
}

export function useGetSSOSessions(domain, page, perPage) {
  return useQuery({
    queryKey: ["sso_session", page, perPage, domain],
    queryFn: () => getSSOSessions(domain, perPage, page),
    enabled: !!domain,
    staleTime: 1000 * 10,
  });
}

export function useDeleteSSOSession() {
  return useMutation({
    mutationFn: ({ domain, sessionId }) =>
      deleteSSOSession(domain, sessionId),
  });
}

export function useUpdateSSOSessionStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ domain, sessionId, isActive }) =>
      updateSSOSessionStatus(domain, sessionId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sso_session"] });
    },
  });
}

