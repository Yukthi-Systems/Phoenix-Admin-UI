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

// src/components/common/LinkSearchbar.jsx - Improved with keyboard shortcuts
import { Search, X } from "lucide-react";
import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAtomValue } from "jotai";
import { userProfileAtom } from "@/store/userProfile";
import { navItems } from "../shared/Aside";

const NavSearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef();
  const dropdownRef = useRef();
  const containerRef = useRef();

  const { permissions = [] } = useAtomValue(userProfileAtom) || {};

  // Flatten all navigation items for search with permission checking
  const searchableItems = useMemo(() => {
    const flattenItems = (items) => {
      const flattened = [];

      items.forEach((item) => {
        const hasUserPermission = item.permissionValue
          ? permissions.includes(item.permissionValue)
          : true;

        if (!hasUserPermission) return;

        if (item.link) {
          flattened.push({
            name: item.name,
            link: item.link,
            type: "parent",
          });
        }

        if (item.children && item.hasChildren) {
          item.children.forEach((child) => {
            const hasChildPermission = child.permissionValue
              ? permissions.includes(child.permissionValue)
              : true;

            if (hasChildPermission && child.link) {
              flattened.push({
                name: child.name,
                link: child.link,
                type: "child",
                parent: item.name,
              });
            }
          });
        }
      });

      return flattened;
    };

    return flattenItems(navItems);
  }, [permissions]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    return searchableItems.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        (item.parent && item.parent.toLowerCase().includes(query)),
    );
  }, [searchQuery, searchableItems]);

  const handleItemClick = (link) => {
    navigate(link);
    setSearchQuery("");
    setIsDropdownOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    setIsDropdownOpen(true);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!isDropdownOpen && searchQuery && filteredItems.length > 0) {
      setIsDropdownOpen(true);
    }

    if (!filteredItems.length) {
      if (e.key === "Escape") {
        handleClearSearch();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredItems.length - 1 ? prev + 1 : 0,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredItems.length - 1,
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && filteredItems[selectedIndex]) {
          handleItemClick(filteredItems[selectedIndex].link);
        } else if (filteredItems.length === 1) {
          handleItemClick(filteredItems[0].link);
        }
        break;
      case "Escape":
        e.preventDefault();
        if (isDropdownOpen) {
          setIsDropdownOpen(false);
          setSelectedIndex(-1);
        } else {
          handleClearSearch();
        }
        break;
    }
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    if (searchQuery && filteredItems.length > 0) {
      setIsDropdownOpen(true);
    }
  };

  const handleInputBlur = () => {
    setIsFocused(false);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setIsDropdownOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Global keyboard shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && dropdownRef.current) {
      const selectedElement = dropdownRef.current.children[selectedIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [selectedIndex]);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search
            size={16}
            className={`transition-colors duration-200 ${
              isFocused ? "text-primary" : "text-muted-foreground"
            }`}
          />
        </div>

        {/* Search Input */}
        <input
          ref={inputRef}
          type="text"
          placeholder="Search navigation..."
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className={`
                        w-full pl-10 pr-20 py-2 text-sm
                        border rounded-lg 
                        bg-background text-foreground
                        placeholder:text-muted-foreground
                        focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                        hover:border-border/80
                        transition-all duration-200 hover:shadow-sm
                        ${isFocused ? "border-primary" : "border-border"}
                    `}
        />

        {/* Right side buttons */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="p-1 text-muted-foreground hover:text-foreground 
                                     hover:bg-accent rounded transition-colors duration-200"
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}

          {!searchQuery && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-muted/50 rounded text-xs text-muted-foreground">
              <span>Ctrl</span>
              <span>K</span>
            </div>
          )}
        </div>

        {/* Dropdown Results */}
        {isDropdownOpen && filteredItems.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-80 overflow-y-auto"
          >
            {filteredItems.map((item, index) => (
              <div
                key={`${item.link}-${index}`}
                onClick={() => handleItemClick(item.link)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`
                                    px-3 py-2.5 cursor-pointer border-b border-border/50 last:border-b-0
                                    transition-colors duration-150 text-left
                                    ${
                                      index === selectedIndex
                                        ? "bg-primary/10 border-primary/20"
                                        : "hover:bg-accent"
                                    }
                                `}
              >
                <div className="font-medium text-sm text-card-foreground text-left">
                  {item.name}
                </div>
                {item.parent && (
                  <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1 text-left">
                    <span>{item.parent}</span>
                    <span className="text-accent-foreground">›</span>
                    <span className="text-primary">{item.name}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* No results message */}
        {isDropdownOpen && searchQuery && filteredItems.length === 0 && (
          <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg">
            <div className="px-4 py-3 text-sm text-muted-foreground text-center">
              No navigation items found
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavSearchBar;
