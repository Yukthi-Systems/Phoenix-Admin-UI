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

import { useState, useCallback, useMemo } from "react";
import { useAtomValue } from "jotai";
import { userInfoAtom } from "@/store/userInfo";
import { createExportConfig } from "@/utils/exportUtils";
import { useToastify } from "./useToastify";

/**
 * Custom hook for handling export functionality
 * @param {string} entityType - Type of entity (cautions, departments, etc.)
 * @param {Function} fetchFunction - API function to fetch data
 * @param {Object} additionalParams - Additional parameters for the fetch function
 * @param {Array} customFieldMapping - Custom field mapping (optional)
 * @returns {Object} Export state and handlers
 */
export const useExport = (
  entityType,
  fetchFunction,
  additionalParams = {},
  customFieldMapping = null,
) => {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const { organization_id } = useAtomValue(userInfoAtom);
  const toast = useToastify();

  const exportConfig = useMemo(() => {
    if (!organization_id || !fetchFunction) return null;

    try {
      return createExportConfig(
        entityType,
        fetchFunction,
        { organization_id, ...additionalParams },
        customFieldMapping,
      );
    } catch (error) {
      console.error("Error creating export config:", error);
      return null;
    }
  }, [
    entityType,
    fetchFunction,
    organization_id,
    additionalParams,
    customFieldMapping,
  ]);

  const handleExport = useCallback(() => {
    if (!exportConfig) {
      toast("error", "Export configuration is not available");
      return;
    }
    setIsExportModalOpen(true);
  }, [exportConfig, toast]);

  const handleExportModalClose = useCallback(() => {
    setIsExportModalOpen(false);
  }, []);

  return {
    isExportModalOpen,
    exportConfig,
    handleExport,
    handleExportModalClose,
    isExportAvailable: !!exportConfig,
  };
};

export default useExport;
