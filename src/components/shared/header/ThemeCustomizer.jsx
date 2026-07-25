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
import { useAtom } from "jotai";
import {
  ChevronDown,
  Palette,
  Sun,
  Moon,
  Check,
  Hash,
  Sparkles,
} from "lucide-react";
import { themeAtom } from "@/store/theme";
import { sanitizeInput } from "@/utils/purify";
import { useToastify } from "@/hooks/useToastify";
import { useSyncedUiInfo } from "@/hooks/useSyncedUiInfo";
import PaletteModal from "./PalleteModal";
import { colorPalettes, getPaletteById } from "@/constants/colorPallete";

const colorOptions = [
  { name: "Purple", value: "250 47% 60%", darkValue: "250 65% 65%" },
  { name: "Blue", value: "221 83% 53%", darkValue: "221 83% 63%" },
  { name: "Green", value: "142 76% 36%", darkValue: "142 71% 45%" },
  { name: "Orange", value: "25 95% 53%", darkValue: "25 95% 63%" },
  { name: "Red", value: "0 84% 60%", darkValue: "0 72% 50%" },
  { name: "Pink", value: "330 81% 60%", darkValue: "330 81% 70%" },
  { name: "Indigo", value: "243 75% 59%", darkValue: "243 75% 69%" },
  { name: "Teal", value: "173 80% 40%", darkValue: "173 80% 50%" },
  { name: "Cyan", value: "189 94% 43%", darkValue: "189 94% 53%" },
  { name: "Yellow", value: "48 96% 53%", darkValue: "48 96% 63%" },
];

// Helper function to convert hex to HSL
const hexToHsl = (hex) => {
  hex = hex.replace("#", "");

  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l;

  l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `${h} ${s}% ${l}%`;
};

const ThemeCustomizer = () => {
  const [theme, setTheme] = useAtom(themeAtom);
  const { uiInfo, updateUiInfo, isLoading, isSaving } = useSyncedUiInfo();

  const [isOpen, setIsOpen] = useState(false);
  const [isPaletteModalOpen, setIsPaletteModalOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState(colorOptions[0]);
  const [currentPalette, setCurrentPalette] = useState(colorPalettes[0].id);
  const [customHex, setCustomHex] = useState("");
  const [showHexInput, setShowHexInput] = useState(false);

  const isLoadedRef = useRef(false);
  const dropdownRef = useRef(null);
  const toast = useToastify();

  // Apply color palette to CSS variables
  const applyColorPalette = (paletteId, themeMode = theme) => {
    const palette = getPaletteById(paletteId);
    const colors = themeMode === "dark" ? palette.dark : palette.light;
    const root = document.documentElement;

    Object.entries(colors).forEach(([key, value]) => {
      // Convert camelCase to kebab-case
      const cssVar = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      root.style.setProperty(`--${cssVar}`, value);
    });
  };

  const applyPrimaryColor = (color) => {
    const root = document.documentElement;
    const valueToApply = theme === "dark" ? color.darkValue : color.value;
    root.style.setProperty("--primary", valueToApply);
  };

  // Store theme data
  const storeThemeData = (colorData, paletteId, themeMode = theme) => {
    const themeSettings = {
      mode: themeMode,
      paletteId: paletteId,
      primaryColor: {
        name: colorData.name,
        value: colorData.value,
        darkValue: colorData.darkValue,
        isCustom: colorData.isCustom || false,
        hexCode: colorData.hexCode || null,
        updatedAt: new Date().toISOString(),
      },
    };

    updateUiInfo(
      { theme: themeSettings },
      {
        onError: (error) => {
          console.error("Failed to save theme preferences:", error);
          toast("warning", "Theme applied locally. Server sync failed.");
        },
      },
    );
  };

  // Sync from server
  useEffect(() => {
    if (isLoading && !isLoadedRef.current) return;

    const storedTheme = uiInfo?.theme;

    if (storedTheme) {
      // Load palette
      const paletteId = storedTheme.paletteId || colorPalettes[0].id;
      if (paletteId !== currentPalette) {
        setCurrentPalette(paletteId);
        applyColorPalette(paletteId, theme);
      }

      // Load primary color
      const storedColor = storedTheme.primaryColor;
      if (storedColor) {
        const foundColor = colorOptions.find(
          (c) => c.name === storedColor.name,
        );
        const targetColor =
          foundColor || (storedColor.isCustom ? storedColor : colorOptions[0]);

        if (
          targetColor.name !== currentColor.name ||
          targetColor.value !== currentColor.value
        ) {
          setCurrentColor(targetColor);
          applyPrimaryColor(targetColor);
        }
      }

      isLoadedRef.current = true;
    }
  }, [uiInfo, isLoading]);

  // Sync theme mode
  useEffect(() => {
    const savedMode = uiInfo?.theme?.mode;
    if (savedMode && savedMode !== theme) {
      setTheme(savedMode);
    }
  }, [uiInfo?.theme?.mode, theme, setTheme]);

  // Apply colors when theme mode changes
  useEffect(() => {
    applyColorPalette(currentPalette, theme);
    applyPrimaryColor(currentColor);
  }, [theme, currentPalette, currentColor]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleColorChange = (color) => {
    setCurrentColor(color);
    applyPrimaryColor(color);
    storeThemeData(color, currentPalette, theme);
    setIsOpen(false);
    setShowHexInput(false);
  };

  const handlePaletteChange = (palette) => {
    setCurrentPalette(palette.id);
    applyColorPalette(palette.id, theme);
    storeThemeData(currentColor, palette.id, theme);
    toast("success", `${palette.name} palette applied!`);
  };

  const handleHexSubmit = () => {
    const cleanHex = sanitizeInput(customHex.trim().replace("#", ""));

    if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
      toast(
        "error",
        "Please enter a valid 6-digit hex color code (e.g., FF5733)",
      );
      return;
    }

    const hslValue = hexToHsl(cleanHex);
    const hslParts = hslValue.split(" ");
    const lightness = parseInt(hslParts[2].replace("%", ""));
    const darkModeHsl = `${hslParts[0]} ${hslParts[1]} ${Math.min(lightness + 10, 90)}%`;

    const customColor = {
      name: `Custom (#${cleanHex.toUpperCase()})`,
      value: hslValue,
      darkValue: darkModeHsl,
      isCustom: true,
      hexCode: `#${cleanHex.toUpperCase()}`,
    };

    handleColorChange(customColor);
    setCustomHex("");
    toast("success", "Custom color applied successfully!");
  };

  const handleThemeToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    storeThemeData(currentColor, currentPalette, newTheme);
  };

  if (isLoading && !isLoadedRef.current && !uiInfo?.theme) {
    return (
      <div className="flex items-center gap-2 rounded-lg p-2 opacity-50">
        <div className="flex items-center gap-1">
          <div className="bg-muted h-5 w-5 animate-pulse rounded" />
          <div className="bg-muted h-4 w-4 animate-pulse rounded" />
        </div>
        <div className="bg-muted h-3 w-3 animate-pulse rounded" />
      </div>
    );
  }

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="hover:bg-accent relative flex items-center gap-2 rounded-lg p-2 transition-colors"
          title="Customize theme"
          disabled={isSaving}
        >
          <div className="flex items-center gap-1">
            {theme === "dark" ? (
              <Moon className="h-5 w-5" strokeWidth={1.5} />
            ) : (
              <Sun className="h-5 w-5" strokeWidth={1.5} />
            )}
            <Palette className="h-4 w-4" strokeWidth={1.5} />
          </div>
          <ChevronDown
            size={14}
            strokeWidth={1.5}
            className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />

          {isSaving && (
            <div className="bg-primary absolute -top-1 -right-1 h-2 w-2 animate-pulse rounded-full" />
          )}
        </button>

        {isOpen && (
          <div className="bg-card border-border animate-in slide-in-from-top-2 absolute top-full right-0 z-50 mt-2 w-72 rounded-lg border p-4 shadow-lg duration-200">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="text-primary h-4 w-4" />
                <h3 className="text-card-foreground font-medium">
                  Theme Customizer
                </h3>
              </div>
              {isSaving && (
                <div className="text-muted-foreground flex items-center gap-1 text-xs">
                  <div className="bg-primary h-2 w-2 animate-pulse rounded-full" />
                  Syncing...
                </div>
              )}
            </div>

            {/* Theme Mode Toggle */}
            <div className="mb-4">
              <label className="text-card-foreground mb-2 block text-left text-sm font-medium">
                Theme Mode
              </label>
              <button
                onClick={handleThemeToggle}
                disabled={isSaving}
                className="border-border hover:bg-accent flex w-full items-center justify-between rounded-lg border p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  {theme === "dark" ? (
                    <>
                      <Moon size={16} />
                      <span className="text-sm">Dark Mode</span>
                    </>
                  ) : (
                    <>
                      <Sun size={16} />
                      <span className="text-sm">Light Mode</span>
                    </>
                  )}
                </div>
              </button>
            </div>

            {/* Primary Color Selection */}
            <div className="mb-4">
              <label className="text-card-foreground mb-2 block text-left text-sm font-medium">
                Primary Color
              </label>
              <div className="grid grid-cols-5 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => handleColorChange(color)}
                    disabled={isSaving}
                    className="group relative disabled:cursor-not-allowed disabled:opacity-50"
                    title={color.name}
                  >
                    <div
                      className="border-border hover:border-foreground h-10 w-10 rounded-lg border-2 transition-colors"
                      style={{
                        backgroundColor: `hsl(${theme === "dark" ? color.darkValue : color.value})`,
                      }}
                    >
                      {currentColor.name === color.name && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check
                            size={16}
                            className="text-white drop-shadow-lg"
                            strokeWidth={2}
                          />
                        </div>
                      )}
                    </div>
                    <div className="bg-foreground text-background pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 transform rounded px-2 py-1 text-xs whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      {color.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Hex Color Input */}
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-card-foreground text-sm font-medium">
                  Custom Color
                </label>
                <button
                  onClick={() => setShowHexInput(!showHexInput)}
                  disabled={isSaving}
                  className="text-primary hover:text-primary/80 text-xs transition-colors disabled:opacity-50"
                >
                  {showHexInput ? "Hide" : "Use Hex Code"}
                </button>
              </div>

              {showHexInput && (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Hash className="text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 transform" />
                    <input
                      type="text"
                      value={customHex}
                      onChange={(e) =>
                        setCustomHex(sanitizeInput(e.target.value))
                      }
                      placeholder="FF5733"
                      maxLength={7}
                      disabled={isSaving}
                      className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-primary/20 focus:border-primary w-full rounded-lg border py-2 pr-3 pl-8 text-sm focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !isSaving) handleHexSubmit();
                      }}
                    />
                  </div>
                  <button
                    onClick={handleHexSubmit}
                    disabled={!customHex.trim() || isSaving}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-3 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : "Apply"}
                  </button>
                </div>
              )}
            </div>

            {/* Color Palette Button */}
            <div className="mb-4">
              <label className="text-card-foreground mb-2 block text-left text-sm font-medium">
                Color Palette
              </label>
              <button
                onClick={() => {
                  setIsPaletteModalOpen(true);
                  setIsOpen(false);
                }}
                disabled={isSaving}
                className="border-border hover:bg-accent group flex w-full items-center justify-between rounded-lg border p-3 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-primary" />
                  <span className="text-sm">
                    {getPaletteById(currentPalette).name}
                  </span>
                </div>
                <ChevronDown
                  size={14}
                  className="text-muted-foreground group-hover:text-foreground transition-colors"
                />
              </button>
            </div>

            {/* Current Selection Display */}
            <div className="border-border border-t pt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Current:</span>
                <div className="flex items-center gap-2">
                  <div
                    className="h-4 w-4 rounded border"
                    style={{
                      backgroundColor: `hsl(${
                        theme === "dark"
                          ? currentColor.darkValue
                          : currentColor.value
                      })`,
                    }}
                  />
                  <span className="text-card-foreground text-xs font-medium">
                    {currentColor.name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Palette Modal */}
      <PaletteModal
        isOpen={isPaletteModalOpen}
        onClose={() => setIsPaletteModalOpen(false)}
        currentPalette={currentPalette}
        onSelectPalette={handlePaletteChange}
        theme={theme}
        isSaving={isSaving}
      />
    </>
  );
};

export default ThemeCustomizer;
