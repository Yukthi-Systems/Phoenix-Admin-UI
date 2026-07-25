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

/**
 * Custom hook for managing bulk selection with persistence across pagination
 * @param {Array} data - Current page data
 * @param {string} idKey - Key to use as unique identifier (default: 'id')
 * @param {string} labelKey - Key to use as display label (default: 'name')
 */
export function useBulkSelection(data = [], idKey = "id", labelKey = "name") {
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [selectedItemsData, setSelectedItemsData] = useState(new Map()); // Store full item data

  // Get current page item IDs
  const currentPageIds = useMemo(
    () => data.map((item) => item[idKey]),
    [data, idKey],
  );

  // Check if all current page items are selected
  const isAllCurrentPageSelected = useMemo(
    () =>
      currentPageIds.length > 0 &&
      currentPageIds.every((id) => selectedItems.has(id)),
    [currentPageIds, selectedItems],
  );

  // Check if some (but not all) current page items are selected
  const isSomeCurrentPageSelected = useMemo(
    () =>
      currentPageIds.some((id) => selectedItems.has(id)) &&
      !isAllCurrentPageSelected,
    [currentPageIds, selectedItems, isAllCurrentPageSelected],
  );

  // Get selected items with their labels for display (from stored data)
  const selectedItemsWithLabels = useMemo(() => {
    const result = [];

    // Add current page items that are selected
    data.forEach((item) => {
      if (selectedItems.has(item[idKey])) {
        result.push({
          id: item[idKey],
          label: item[labelKey] || item[idKey],
        });
      }
    });

    // Add items from other pages that are still selected
    selectedItemsData.forEach((itemData, itemId) => {
      if (selectedItems.has(itemId) && !currentPageIds.includes(itemId)) {
        result.push({
          id: itemId,
          label: itemData[labelKey] || itemId,
        });
      }
    });

    return result;
  }, [data, selectedItems, selectedItemsData, idKey, labelKey, currentPageIds]);

  // Toggle single item selection
  const toggleItem = useCallback(
    (itemId) => {
      const item = data.find((item) => item[idKey] === itemId);

      setSelectedItems((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(itemId)) {
          newSet.delete(itemId);
        } else {
          newSet.add(itemId);
        }
        return newSet;
      });

      // Store item data for cross-page persistence
      if (item) {
        setSelectedItemsData((prev) => {
          const newMap = new Map(prev);
          if (selectedItems.has(itemId)) {
            newMap.delete(itemId);
          } else {
            newMap.set(itemId, item);
          }
          return newMap;
        });
      }
    },
    [data, idKey, selectedItems],
  );

  // Toggle all current page items
  const toggleAllCurrentPage = useCallback(() => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);

      if (isAllCurrentPageSelected) {
        // Deselect all current page items
        currentPageIds.forEach((id) => newSet.delete(id));
      } else {
        // Select all current page items
        currentPageIds.forEach((id) => newSet.add(id));
      }

      return newSet;
    });

    // Update stored data
    setSelectedItemsData((prev) => {
      const newMap = new Map(prev);

      if (isAllCurrentPageSelected) {
        // Remove current page items from stored data
        currentPageIds.forEach((id) => newMap.delete(id));
      } else {
        // Add current page items to stored data
        data.forEach((item) => {
          if (!selectedItems.has(item[idKey])) {
            newMap.set(item[idKey], item);
          }
        });
      }

      return newMap;
    });
  }, [currentPageIds, isAllCurrentPageSelected, data, idKey, selectedItems]);

  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
    setSelectedItemsData(new Map());
  }, []);

  // Select all items from current page
  const selectAllCurrentPage = useCallback(() => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      currentPageIds.forEach((id) => newSet.add(id));
      return newSet;
    });

    // Store current page items data
    setSelectedItemsData((prev) => {
      const newMap = new Map(prev);
      data.forEach((item) => {
        newMap.set(item[idKey], item);
      });
      return newMap;
    });
  }, [currentPageIds, data, idKey]);

  // Deselect all items from current page
  const deselectAllCurrentPage = useCallback(() => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      currentPageIds.forEach((id) => newSet.delete(id));
      return newSet;
    });

    // Remove current page items from stored data
    setSelectedItemsData((prev) => {
      const newMap = new Map(prev);
      currentPageIds.forEach((id) => newMap.delete(id));
      return newMap;
    });
  }, [currentPageIds]);

  // Check if specific item is selected
  const isItemSelected = useCallback(
    (itemId) => {
      return selectedItems.has(itemId);
    },
    [selectedItems],
  );

  // Remove items from selection (useful after successful deletion)
  const removeFromSelection = useCallback((itemIds) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      itemIds.forEach((id) => newSet.delete(id));
      return newSet;
    });

    setSelectedItemsData((prev) => {
      const newMap = new Map(prev);
      itemIds.forEach((id) => newMap.delete(id));
      return newMap;
    });
  }, []);

  return {
    selectedItems,
    selectedCount: selectedItems.size,
    selectedItemsWithLabels,
    isAllCurrentPageSelected,
    isSomeCurrentPageSelected,
    toggleItem,
    toggleAllCurrentPage,
    clearSelection,
    selectAllCurrentPage,
    deselectAllCurrentPage,
    isItemSelected,
    removeFromSelection,
  };
}
