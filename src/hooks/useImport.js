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
import { useToastify } from "./useToastify";
import { createImportConfig } from "@/utils/importUtils";

/**
 * Custom hook for handling bulk import functionality
 * @param {string} entityType - Type of entity (cautions, departments, etc.)
 * @param {Function} createFunction - API function to create single item
 * @param {Object} additionalParams - Additional parameters for the create function
 * @param {Array} customFieldMapping - Custom field mapping (optional)
 * @returns {Object} Import state and handlers
 */
export const useBulkImport = (
  entityType,
  createFunction,
  additionalParams = {},
  customFieldMapping = null,
) => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const { organization_id } = useAtomValue(userInfoAtom);
  const toast = useToastify();

  // Create import configuration
  const importConfig = useMemo(() => {
    if (!organization_id || !createFunction) return null;

    try {
      // Wrap the create function to include organization_id and additional params
      const wrappedCreateFunction = async (itemData) => {
        const data = {
          ...itemData,
          associated_organization_id: organization_id,
          organization_id: organization_id,
          ...additionalParams,
        };
        return await createFunction(data);
      };

      return createImportConfig(
        entityType,
        wrappedCreateFunction,
        customFieldMapping,
      );
    } catch (error) {
      console.error("Error creating import config:", error);
      return null;
    }
  }, [
    entityType,
    createFunction,
    organization_id,
    additionalParams,
    customFieldMapping,
  ]);

  // Handle import button click
  const handleImport = useCallback(() => {
    if (!importConfig) {
      toast("error", "Import configuration is not available");
      return;
    }
    setIsImportModalOpen(true);
  }, [importConfig, toast]);

  // Handle import modal close
  const handleImportModalClose = useCallback(() => {
    setIsImportModalOpen(false);
  }, []);

  // Handle import completion
  const handleImportComplete = useCallback(
    (results) => {
      const { successful, failed, total } = results;

      if (failed.length === 0) {
        toast(
          "success",
          `Successfully imported ${successful.length} ${entityType}${successful.length !== 1 ? "s" : ""}`,
        );
      } else if (successful.length === 0) {
        toast("error", `Failed to import all ${entityType}s`);
      } else {
        toast(
          "warning",
          `Imported ${successful.length} ${entityType}${successful.length !== 1 ? "s" : ""}. ${failed.length} failed.`,
        );
      }

      // Keep modal open so user can see results
      // They can close it manually after reviewing
    },
    [entityType, toast],
  );

  return {
    isImportModalOpen,
    importConfig,
    handleImport,
    handleImportModalClose,
    handleImportComplete,
    isImportAvailable: !!importConfig,
  };
};

export default useBulkImport;
