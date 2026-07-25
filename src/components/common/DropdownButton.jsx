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
import { ChevronDown } from "lucide-react";

const DropdownButton = ({
  label = "Actions",
  options = [],
  className = "",
  variant = "primary", // primary, secondary, outline
  buttonText, // Optional: Override button text dynamically
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Get the display text for the button
  const displayText = buttonText || label;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOptionClick = (option) => {
    if (option.disabled) return;
    
    if (option.onClick) {
      option.onClick();
    }
    setIsOpen(false);
  };

  const getVariantClasses = () => {
    switch (variant) {
      case "secondary":
        return "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-card-foreground border-border";
      case "outline":
        return "bg-background text-card-foreground border-border hover:bg-muted";
      default:
        return "bg-primary text-primary-foreground hover:bg-primary/90 border-primary";
    }
  };

  // If only one option, render as a simple button without dropdown
  if (options.length === 1) {
    const singleOption = options[0];
    return (
      <button
        type="button"
        onClick={() => {
          if (!singleOption.disabled && singleOption.onClick) {
            singleOption.onClick();
          }
        }}
        disabled={singleOption.disabled}
        className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md border transition-all duration-200 ${getVariantClasses()} ${
          singleOption.disabled
            ? "opacity-50 cursor-not-allowed shadow-none translate-y-0 pointer-events-none"
            : "hover:shadow-md hover:-translate-y-0.5"
        } ${className}`}
      >
        {singleOption.icon && (
          <span className="flex-shrink-0">{singleOption.icon}</span>
        )}
        {displayText}
      </button>
    );
  }

  // If no options, render disabled button
  if (options.length === 0) {
    return (
      <button
        type="button"
        disabled
        className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md border opacity-50 cursor-not-allowed shadow-none ${getVariantClasses()} ${className}`}
      >
        {displayText}
        <ChevronDown className="w-4 h-4" />
      </button>
    );
  }

  // Regular dropdown for multiple options
  return (
    <div
      className={`relative inline-block text-left ${className}`}
      ref={dropdownRef}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex h-10 items-center gap-2 px-4 py-2 text-sm font-medium rounded-md border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${getVariantClasses()}`}
      >
        {displayText}
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-64 origin-top-right rounded-md bg-card shadow-lg ring-1 ring-border focus:outline-none border border-border">
          <div className="py-1">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionClick(option)}
                disabled={option.disabled}
                className={`group flex w-full items-start gap-3 px-4 py-2 text-sm transition-colors text-left ${
                  option.disabled
                    ? "text-muted-foreground opacity-50 cursor-not-allowed bg-muted/20"
                    : "text-card-foreground hover:bg-muted hover:text-card-foreground"
                } ${option.className || ""}`}
              >
                {option.icon && (
                  <span className={`flex-shrink-0 mt-0.5 ${option.disabled ? "opacity-70" : ""}`}>
                    {option.icon}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <div className={`font-medium ${option.disabled ? "text-muted-foreground" : ""}`}>
                    {option.label}
                  </div>
                  {option.description && (
                    <div className={`text-xs mt-0.5 ${option.disabled ? "text-muted-foreground/80" : "text-muted-foreground"}`}>
                      {option.description}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownButton;