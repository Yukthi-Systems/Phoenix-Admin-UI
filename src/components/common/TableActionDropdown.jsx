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

import React, { useState, useRef, useEffect } from "react";
import { MoreVertical } from "lucide-react";

const TableActionsDropdown = ({ actions = [], height = 200 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: true, left: true });
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const timeoutRef = useRef(null);

  // Filter out separators for navigation
  const navigableActions = actions.filter((action) => !action.separator);

  const calculatePosition = () => {
    if (!triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // Check vertical position
    const spaceBelow = viewport.height - triggerRect.bottom;
    const dropdownHeight = height;
    const shouldOpenBelow = spaceBelow >= dropdownHeight;

    // Check horizontal position - prioritize left alignment
    const spaceLeft = triggerRect.right; // Space available to the left of trigger
    const dropdownWidth = 160;

    // Only open to right if not enough space on left
    const shouldOpenLeft = spaceLeft >= dropdownWidth;

    setPosition({
      top: shouldOpenBelow,
      left: shouldOpenLeft,
    });
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    calculatePosition();
    setIsOpen(true);
    setFocusedIndex(-1); // Reset focus when opening
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setFocusedIndex(-1);
    }, 150); // Small delay to prevent flickering
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setFocusedIndex((prev) => {
            const nextIndex = prev < navigableActions.length - 1 ? prev + 1 : 0;
            return nextIndex;
          });
          break;

        case "ArrowUp":
          event.preventDefault();
          setFocusedIndex((prev) => {
            const nextIndex = prev > 0 ? prev - 1 : navigableActions.length - 1;
            return nextIndex;
          });
          break;

        case "Enter":
          event.preventDefault();
          if (focusedIndex >= 0 && navigableActions[focusedIndex]) {
            const action = navigableActions[focusedIndex];
            if (!action.disabled) {
              handleActionClick(action);
            }
          }
          break;

        case "Escape":
          event.preventDefault();
          setIsOpen(false);
          setFocusedIndex(-1);
          break;
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, focusedIndex, navigableActions]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleActionClick = (action) => {
    if (action.onClick) {
      action.onClick();
    }
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  const getActionClasses = (variant) => {
    switch (variant) {
      case "danger":
        return "text-destructive hover:bg-destructive/10";
      case "success":
        return "text-success hover:bg-success/10";
      case "warning":
        return "text-warning hover:bg-warning/10";
      case "yellow":
        return "text-yellow-600 hover:bg-yellow-600/10 dark:text-yellow-400 dark:hover:bg-yellow-400/10";
      default:
        return "text-foreground hover:bg-accent";
    }
  };

  const getDropdownClasses = () => {
    const baseClasses =
      "absolute z-50 min-w-[160px] bg-card rounded-md shadow-lg border border-border overflow-hidden";

    let positionClasses = "";
    if (position.top) {
      positionClasses += "top-full mt-1 ";
    } else {
      positionClasses += "bottom-full mb-1 ";
    }

    if (position.left) {
      positionClasses += "right-0"; // Align right edge of dropdown to right edge of trigger
    } else {
      positionClasses += "left-0";
    }

    return `${baseClasses} ${positionClasses}`;
  };

  if (!actions || actions.length === 0) {
    return null;
  }

  return (
    <div
      className="relative inline-block text-left"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        ref={triggerRef}
        className={`inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors duration-200 ${
          isOpen
            ? "text-primary bg-primary/10 shadow-sm"
            : "text-muted-foreground hover:text-primary hover:bg-primary/10 hover:shadow-sm"
        }`}
        title="More actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div ref={dropdownRef} className={getDropdownClasses()}>
          <div className="py-1">
            {actions.map((action, index) => {
              if (action.separator) {
                return (
                  <div key={index} className="border-t border-border my-1" />
                );
              }

              // Calculate the focused index for navigable actions
              const navigableIndex = navigableActions.findIndex(
                (navAction) => navAction === action,
              );
              const isFocused = navigableIndex === focusedIndex;
              const isDisabled = action.disabled || false;
              const actionClasses = getActionClasses(action.variant);

              return (
                <button
                  key={index}
                  onClick={() => !isDisabled && handleActionClick(action)}
                  onMouseEnter={() => setFocusedIndex(navigableIndex)}
                  disabled={isDisabled}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors
                    ${
                      isDisabled
                        ? "text-muted-foreground cursor-not-allowed opacity-50"
                        : `${actionClasses} cursor-pointer`
                    }
                    ${isFocused && !isDisabled ? "bg-accent" : ""}
                  `}
                  title={action.tooltip || ""}
                >
                  {action.icon && (
                    <action.icon className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span className="truncate">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TableActionsDropdown;
