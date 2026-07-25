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

import React, { useState, useEffect } from "react";
import { X, Check, Palette } from "lucide-react";
import { colorPalettes } from "@/constants/colorPallete";

const PaletteModal = ({
  isOpen,
  onClose,
  currentPalette,
  onSelectPalette,
  theme,
  isSaving,
}) => {
  const [selectedPalette, setSelectedPalette] = useState(currentPalette);

  useEffect(() => {
    setSelectedPalette(currentPalette);
  }, [currentPalette]);

  if (!isOpen) return null;

  const handleSelect = (palette) => {
    setSelectedPalette(palette.id);
    onSelectPalette(palette);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 text-left top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 animate-in zoom-in-95 fade-in duration-200">
        <div className="bg-card border-border m-4 max-h-[85vh] overflow-hidden rounded-xl border shadow-2xl">
          {/* Header */}
          <div className="border-border flex items-center justify-between border-b p-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary rounded-lg p-2">
                <Palette className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-card-foreground text-lg font-semibold">
                  Color Palettes
                </h2>
                <p className="text-muted-foreground text-sm">
                  Choose a complete color scheme
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isSaving}
              className="hover:bg-accent text-muted-foreground hover:text-foreground rounded-lg p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Palette Grid */}
          <div className="max-h-[calc(85vh-120px)] overflow-y-auto p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {colorPalettes.map((palette) => {
                const isSelected = selectedPalette === palette.id;
                const colors = theme === "dark" ? palette.dark : palette.light;

                return (
                  <button
                    key={palette.id}
                    onClick={() => handleSelect(palette)}
                    disabled={isSaving}
                    className={`group relative overflow-hidden rounded-xl border-2 text-left transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                      isSelected
                        ? "border-primary shadow-lg scale-[1.02]"
                        : "border-border hover:border-primary/50 hover:shadow-md"
                    }`}
                  >
                    {/* Color Preview */}
                    <div className="flex h-20 overflow-hidden">
                      <div
                        className="flex-1"
                        style={{ backgroundColor: `hsl(${colors.background})` }}
                      />
                      <div
                        className="flex-1"
                        style={{ backgroundColor: `hsl(${colors.card})` }}
                      />
                      <div
                        className="flex-1"
                        style={{ backgroundColor: `hsl(${colors.primary})` }}
                      />
                      <div
                        className="flex-1"
                        style={{ backgroundColor: `hsl(${colors.accent})` }}
                      />
                      <div
                        className="flex-1"
                        style={{ backgroundColor: `hsl(${colors.muted})` }}
                      />
                    </div>

                    {/* Palette Info */}
                    <div className="bg-card border-border border-t p-4">
                      <div className="mb-1 flex items-center justify-between">
                        <h3 className="text-card-foreground font-semibold">
                          {palette.name}
                        </h3>
                        {isSelected && (
                          <div className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full">
                            <Check className="h-4 w-4" strokeWidth={2.5} />
                          </div>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {palette.description}
                      </p>
                    </div>

                    {/* Hover Effect */}
                    {!isSelected && (
                      <div className="bg-primary/5 pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          {isSaving && (
            <div className="border-border bg-muted/50 flex items-center justify-center gap-2 border-t p-4">
              <div className="bg-primary h-2 w-2 animate-pulse rounded-full" />
              <span className="text-muted-foreground text-sm">
                Saving palette...
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PaletteModal;
