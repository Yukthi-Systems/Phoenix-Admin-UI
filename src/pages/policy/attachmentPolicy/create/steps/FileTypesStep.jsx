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

import { useState, useRef, useEffect } from "react";
import { X, Shield, GripVertical } from "lucide-react";
import { useDrag, useDrop } from "react-dnd";
import InfoBox from "@/components/common/InfoBox";
import { GLOBAL_BLOCKED } from "@/constants/blockedFileTypes";

const ITEM_TYPE = "FILE_TYPE";

// Draggable Tag Component
const DraggableTag = ({ type, onDelete, isAllowed }) => {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ITEM_TYPE,
      item: { type, sourceList: isAllowed ? "allowed" : "blocked" },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [type, isAllowed] // FIXED: Added dependencies so the item is always fresh
  );

  return (
    <span
      ref={drag}
      className={`${
        isAllowed
          ? "bg-success/20 text-success"
          : "bg-destructive/20 text-destructive"
      } inline-flex cursor-move items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-opacity ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      <GripVertical className="h-3 w-3 opacity-50" />
      {type}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(type);
        }}
        className={`${
          isAllowed
            ? "hover:text-success-foreground"
            : "hover:text-destructive-foreground"
        } ml-0.5 transition-colors`}
        title="Delete"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
};

// Drop Zone Component
const DropZone = ({
  children,
  onDrop,
  targetList,
  inputRef,
  className,
  count,
  label,
}) => {
  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: ITEM_TYPE,
      drop: (item) => {
        if (item.sourceList !== targetList) {
          onDrop(item.type, item.sourceList, targetList);
        }
      },
      canDrop: (item) => item.sourceList !== targetList,
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [onDrop, targetList] // FIXED: Added dependencies ensures onDrop is current
  );

  const borderClass =
    isOver && canDrop
      ? targetList === "allowed"
        ? "border-success ring-2 ring-success/50"
        : "border-destructive ring-2 ring-destructive/50"
      : className;

  return (
    <div className="space-y-2">
      <label className="text-foreground text-sm font-medium">
        {label} ({count})
      </label>
      <div
        ref={drop}
        className={`${borderClass} min-h-[80px] w-full rounded-md border p-2 transition-all`}
        onClick={() => inputRef.current?.focus()}
      >
        {children}
      </div>
    </div>
  );
};

const FileTypesStep = ({
  allowedFileTypes,
  setAllowedFileTypes,
  blockedFileTypes,
  setBlockedFileTypes,
}) => {
  const [allowedInput, setAllowedInput] = useState("");
  const [blockedInput, setBlockedInput] = useState("");
  const allowedInputRef = useRef(null);
  const blockedInputRef = useRef(null);

  // Auto-populate global blocked list on mount
  useEffect(() => {
    if (blockedFileTypes.length === 0) {
      setBlockedFileTypes([...GLOBAL_BLOCKED]);
    }
  }, []);

  const normalize = (text) => {
    return text.toLowerCase().replace(/^\./, "").trim();
  };

  const addToAllowed = (type) => {
    const normalized = normalize(type);
    if (!normalized || normalized.length > 10) return;

    if (blockedFileTypes.includes(normalized)) {
      setBlockedFileTypes((prev) => prev.filter((t) => t !== normalized));
    }

    if (!allowedFileTypes.includes(normalized)) {
      setAllowedFileTypes((prev) => [...prev, normalized]);
    }
  };

  const addToBlocked = (type) => {
    const normalized = normalize(type);
    if (!normalized || normalized.length > 10) return;

    if (allowedFileTypes.includes(normalized)) {
      setAllowedFileTypes((prev) => prev.filter((t) => t !== normalized));
    }

    if (!blockedFileTypes.includes(normalized)) {
      setBlockedFileTypes((prev) => [...prev, normalized]);
    }
  };

  // Delete from both lists
  const deleteFileType = (type) => {
    setAllowedFileTypes((prev) => prev.filter((t) => t !== type));
    setBlockedFileTypes((prev) => prev.filter((t) => t !== type));
  };

  // Handle drag and drop
  // FIXED: Using functional updates (prev => ...) prevents state wipes due to stale closures
  const handleDrop = (type, sourceList, targetList) => {
    if (sourceList === targetList) return;

    if (targetList === "allowed") {
      setBlockedFileTypes((prev) => prev.filter((t) => t !== type));
      setAllowedFileTypes((prev) => {
        if (!prev.includes(type)) return [...prev, type];
        return prev;
      });
    } else {
      setAllowedFileTypes((prev) => prev.filter((t) => t !== type));
      setBlockedFileTypes((prev) => {
        if (!prev.includes(type)) return [...prev, type];
        return prev;
      });
    }
  };

  const handleAllowedKeyDown = (e) => {
    if (e.key === "," || e.key === "Enter") {
      e.preventDefault();
      const value = allowedInput.trim();
      if (value) {
        addToAllowed(value);
        setAllowedInput("");
      }
    } else if (
      e.key === "Backspace" &&
      !allowedInput &&
      allowedFileTypes.length > 0
    ) {
      setAllowedFileTypes((prev) => prev.slice(0, -1));
    }
  };

  const handleBlockedKeyDown = (e) => {
    if (e.key === "," || e.key === "Enter") {
      e.preventDefault();
      const value = blockedInput.trim();
      if (value) {
        addToBlocked(value);
        setBlockedInput("");
      }
    } else if (
      e.key === "Backspace" &&
      !blockedInput &&
      blockedFileTypes.length > 0
    ) {
      setBlockedFileTypes((prev) => prev.slice(0, -1));
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div>
        <h3 className="text-foreground text-lg font-semibold">
          File Type Configuration
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage allowed and blocked file extensions
        </p>
      </div>

      {/* Global List Info */}
      <div className="border-primary/20 bg-primary/5 flex items-start gap-2 rounded-lg border p-3">
        <Shield className="text-primary h-4 w-4 flex-shrink-0" />
        <div className="text-muted-foreground text-xs">
          <strong className="text-foreground">Drag to move</strong> extensions
          between lists. <strong className="text-foreground">Click X</strong> to
          delete completely. Global dangerous extensions are pre-blocked for
          security.
        </div>
      </div>

      {/* Allowed File Types */}
      <DropZone
        onDrop={handleDrop}
        targetList="allowed"
        inputRef={allowedInputRef}
        className="border-border bg-background focus-within:border-primary focus-within:ring-primary focus-within:ring-1"
        count={allowedFileTypes.length}
        label="Allowed Extensions"
      >
        <div className="flex flex-wrap gap-1.5">
          {allowedFileTypes.map((type) => (
            <DraggableTag
              key={type}
              type={type}
              onDelete={deleteFileType}
              isAllowed={true}
            />
          ))}
          <input
            ref={allowedInputRef}
            type="text"
            value={allowedInput}
            onChange={(e) => setAllowedInput(e.target.value)}
            onKeyDown={handleAllowedKeyDown}
            placeholder={
              allowedFileTypes.length === 0
                ? "Type extension and press Enter or comma"
                : ""
            }
            className="text-foreground placeholder:text-muted-foreground min-w-[120px] flex-1 border-none bg-transparent p-1 text-sm outline-none"
          />
        </div>
      </DropZone>
      <p className="text-muted-foreground -mt-4 text-xs">
        Press Enter or comma to add • Backspace on empty to remove last
      </p>

      {/* Blocked File Types */}
      <DropZone
        onDrop={handleDrop}
        targetList="blocked"
        inputRef={blockedInputRef}
        className="border-border bg-background focus-within:border-destructive focus-within:ring-destructive focus-within:ring-1"
        count={blockedFileTypes.length}
        label="Blocked Extensions"
      >
        <div className="flex flex-wrap gap-1.5">
          {blockedFileTypes.map((type) => (
            <DraggableTag
              key={type}
              type={type}
              onDelete={deleteFileType}
              isAllowed={false}
            />
          ))}
          <input
            ref={blockedInputRef}
            type="text"
            value={blockedInput}
            onChange={(e) => setBlockedInput(e.target.value)}
            onKeyDown={handleBlockedKeyDown}
            placeholder={
              blockedFileTypes.length === 0
                ? "Type extension and press Enter or comma"
                : ""
            }
            className="text-foreground placeholder:text-muted-foreground min-w-[120px] flex-1 border-none bg-transparent p-1 text-sm outline-none"
          />
        </div>
      </DropZone>
      <p className="text-muted-foreground -mt-4 text-xs">
        Press Enter or comma to add • Backspace on empty to remove last
      </p>

      {/* Info */}
      <InfoBox
        title="How It Works"
        description="Drag tags between lists to move them. Click X to permanently delete. Extensions auto-normalize (lowercase, no dots). Visual feedback shows valid drop zones."
      />
    </div>
  );
};

export default FileTypesStep;