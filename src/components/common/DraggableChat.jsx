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

import React, { useEffect, useRef, useState } from "react";
import AIChatInterface from "@/pages/help";
import { useSyncedUiInfo } from "@/hooks/useSyncedUiInfo"; // Assumed location for the provided hook

const DraggableChat = () => {
  const { uiInfo, updateUiInfo, isSynced } = useSyncedUiInfo();
  
  // Derive position from the synced UI info object
  const position = uiInfo?.chatPosition || null;

  const [isDragging, setIsDragging] = useState(false);
  
  // Temporary coordinates during drag (always relative to top-left for simplicity)
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);

  const ref = useRef(null);
  
  // Constants for dimensions
  const BUTTON_SIZE = 56; 
  const MARGIN = 16; 

  // 1. Initialize Default Position (Only if synced and missing)
  useEffect(() => {
    if (isSynced && !position) {
      updateUiInfo({
        chatPosition: {
          x: 72,
          y: 92,
          anchorX: "right",
          anchorY: "bottom",
        }
      });
    }
  }, [isSynced, position, updateUiInfo]);

  // 2. Handle Mouse Down (Start Drag)
  const handleMouseDown = (e) => {
    // Prevent dragging if not initialized or if right-click
    if (e.button !== 0 || !position) return;
    
    // Calculate current absolute pixel position for smooth dragging
    const rect = ref.current.getBoundingClientRect();
    setDragPos({ x: rect.left, y: rect.top });
    
    setIsDragging(true);
    setHasMoved(false);
    setDragStart({ x: e.clientX, y: e.clientY });
    
    e.preventDefault();
  };

  // 3. Global Mouse Events (Dragging & End)
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;

      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;

      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        setHasMoved(true);
      }

      // Update temporary drag position
      setDragPos((prev) => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }));

      // Update start for next frame delta
      setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
      if (!isDragging) return;
      setIsDragging(false);

      if (hasMoved) {
        // --- SMART ANCHORING LOGIC ---
        const { x, y } = dragPos;
        const winW = window.innerWidth;
        const winH = window.innerHeight;

        // Ensure bounds
        const clampedX = Math.min(Math.max(0, x), winW - BUTTON_SIZE);
        const clampedY = Math.min(Math.max(0, y), winH - BUTTON_SIZE);

        // Determine horizontal anchor (Left vs Right)
        const distLeft = clampedX;
        const distRight = winW - clampedX - BUTTON_SIZE;
        const anchorX = distRight < distLeft ? "right" : "left";
        const finalX = anchorX === "right" ? distRight : distLeft;

        // Determine vertical anchor (Top vs Bottom)
        const distTop = clampedY;
        const distBottom = winH - clampedY - BUTTON_SIZE;
        const anchorY = distBottom < distTop ? "bottom" : "top";
        const finalY = anchorY === "bottom" ? distBottom : distTop;

        // Save to API via Hook
        updateUiInfo({
          chatPosition: {
            x: Math.max(MARGIN, finalX),
            y: Math.max(MARGIN, finalY),
            anchorX,
            anchorY
          }
        });
      }
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragPos, dragStart, hasMoved, updateUiInfo]);

  // 4. Calculate Style based on State
  const getStyle = () => {
    // If dragging, use the raw absolute pixels for smoothness
    if (isDragging) {
      return {
        left: `${dragPos.x}px`,
        top: `${dragPos.y}px`,
      };
    }

    // If idle, use the anchored position from API data
    if (position) {
      const { x, y, anchorX, anchorY } = position;
      const isLegacy = !anchorX || !anchorY; 
      
      if (isLegacy) {
        return { left: `${x}px`, top: `${y}px` };
      }

      return {
        left: anchorX === "left" ? `${x}px` : "auto",
        right: anchorX === "right" ? `${x}px` : "auto",
        top: anchorY === "top" ? `${y}px` : "auto",
        bottom: anchorY === "bottom" ? `${y}px` : "auto",
      };
    }

    return { display: "none" }; // Hide until initialized
  };

  // Wait for data sync before rendering to avoid jumping
  if (!position) return null;

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        zIndex: 100,
        touchAction: "none",
        cursor: isDragging ? "grabbing" : "pointer",
        ...getStyle(),
      }}
      onMouseDown={handleMouseDown}
      className="transition-opacity duration-100"
    >
      <AIChatInterface 
        customPositionClass="relative" 
        preventClick={hasMoved}
      />
    </div>
  );
};

export default DraggableChat;