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

import { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { uiInfoAtom } from "@/store/uiInfo";
import { useGetUserUiInfo, useStoreUserUiInfo } from "@/hooks/useUser";

export const useSyncedUiInfo = () => {
  const [localUiInfo, setLocalUiInfo] = useAtom(uiInfoAtom);
  const { data: serverData, isLoading: isFetching } = useGetUserUiInfo();
  const { mutate: serverMutate, isPending: isSaving } = useStoreUserUiInfo();

  const [isSynced, setIsSynced] = useState(false);

  useEffect(() => {
    if (serverData?.ui_info && !isSynced) {
      if (Object.keys(localUiInfo).length === 0) {
        setLocalUiInfo(serverData.ui_info);
      }
      setIsSynced(true);
    }
  }, [serverData, isSynced, localUiInfo, setLocalUiInfo]);

  const updateUiInfo = (partialData, options = {}) => {
    const baseData = serverData?.ui_info || localUiInfo || {};

    const mergedData = {
      ...baseData,
      ...partialData,
      lastUpdated: new Date().toISOString(),
    };

    setLocalUiInfo(mergedData);

    if (!options.localOnly) {
      serverMutate(mergedData, {
        onSuccess: options.onSuccess,
        onError: (err) => {
          console.error("Sync failed:", err);
          options.onError?.(err);
        },
      });
    }
  };

  return {
    uiInfo: localUiInfo,
    updateUiInfo,
    isLoading: isFetching && !isSynced,
    isSaving,
    isSynced,
  };
};
