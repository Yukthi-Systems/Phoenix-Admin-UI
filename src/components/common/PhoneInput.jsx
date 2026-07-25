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

import { useState, useEffect, useRef, useMemo } from "react";
import { ChevronDown, Info } from "lucide-react";
import { useAtomValue } from "jotai";
import { userProfileAtom } from "@/store/userProfile";
import { countryCodes } from "@/constants/countriesWithFlags";

const FlagIcon = ({ code }) => (
  <img
    src={`/flags/${code}.svg`}
    alt={code}
    className="h-4 w-6 object-cover"
    loading="lazy"
  />
);

const PhoneInput = ({
  label,
  name,
  placeholder = "Enter phone number",
  register,
  errors = {},
  isRequired = false,
  defaultCountry, // Can still override via prop
  watch,
  setValue,
  info = "",
}) => {
  const userProfile = useAtomValue(userProfileAtom);

  // Get default country from profile or fallback to prop or India
  const getInitialCountry = () => {
    // Priority: 1. Prop, 2. Profile country, 3. India
    let countryCode = defaultCountry;

    if (!countryCode && userProfile?.user_details?.country) {
      // Match by code field (e.g., 'IN' -> 'in')
      const profileCountry = userProfile.user_details.country.toLowerCase();
      const matchedCountry = countryCodes.find(
        (c) => c.code.toLowerCase() === profileCountry,
      );
      if (matchedCountry) {
        return matchedCountry;
      }
    }

    // Fallback to India or find by value
    if (countryCode) {
      const match = countryCodes.find(
        (c) => c.value === countryCode && c.code !== "ca",
      );
      if (match) return match;
    }

    return countryCodes[3]; // Default to India
  };

  const [selectedCountry, setSelectedCountry] = useState(getInitialCountry);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  // New state for smart positioning
  const [dropdownPosition, setDropdownPosition] = useState("bottom"); 
  
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  const fullPhoneValue = watch ? watch(name) : "";
  const error = errors?.[name];

  // Memoize filtered countries for performance
  const filteredCountries = useMemo(() => {
    if (!searchTerm) return countryCodes;
    const search = searchTerm.toLowerCase();
    return countryCodes.filter(
      (country) =>
        country.label.toLowerCase().includes(search) ||
        country.value.includes(search) ||
        country.code.includes(search),
    );
  }, [searchTerm]);

  // Parse existing value
  useEffect(() => {
    if (fullPhoneValue && fullPhoneValue.startsWith("+")) {
      const matchingCountry = countryCodes
        .sort((a, b) => b.value.length - a.value.length)
        .find((country) => fullPhoneValue.startsWith(country.value));

      if (matchingCountry) {
        setSelectedCountry(matchingCountry);
        setPhoneNumber(fullPhoneValue.slice(matchingCountry.value.length));
      }
    }
  }, [fullPhoneValue]);

  // Update form value
  useEffect(() => {
    if (setValue) {
      const fullNumber = phoneNumber
        ? `${selectedCountry.value}${phoneNumber}`
        : "";
      
      // Only set value if it's different from current value to avoid loops
      if (fullNumber !== fullPhoneValue) {
        setValue(name, fullNumber, { shouldValidate: !!phoneNumber });
      }
    }
  }, [selectedCountry.value, phoneNumber, name, setValue, fullPhoneValue]);

  // Smart Positioning Logic
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = 320; // Approximate max height (search + list + padding)

      // If not enough space below AND there is more space above, flip to top
      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        setDropdownPosition("top");
      } else {
        setDropdownPosition("bottom");
      }
    }
  }, [isOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      setTimeout(() => searchRef.current?.focus(), 0);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setPhoneNumber(value);
  };

  return (
    <div className="w-full">
      <label className="text-card-foreground block text-left text-sm font-medium">
        {label}
        {isRequired && <span className="text-red-500"> *</span>}
      </label>

      <div className="relative mt-1">
        <div
          className={`flex w-full rounded-md border transition-colors duration-200 ${
            error
              ? "border-destructive focus-within:border-destructive"
              : "border-border focus-within:border-primary"
          }`}
        >
          {/* Country Code Selector */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="bg-muted text-card-foreground hover:bg-muted/80 border-border flex h-full items-center gap-1.5 rounded-l-md border-r px-3 transition-colors focus:outline-none"
            >
              <FlagIcon code={selectedCountry.code} />
              <span className="text-sm leading-none font-medium">
                {selectedCountry.value}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {/* Dropdown with Smart Positioning */}
            {isOpen && (
              <div 
                className={`bg-card border-border absolute left-0 z-[999] w-64 rounded-md border shadow-lg ${
                    dropdownPosition === "top" ? "bottom-full mb-1" : "top-full mt-1"
                }`}
              >
                <div className="border-border border-b p-2">
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search country..."
                    className="border-border bg-background text-card-foreground placeholder:text-muted-foreground focus:border-primary w-full rounded border px-2 py-1.5 text-sm focus:outline-none"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {filteredCountries.length > 0 ? (
                    filteredCountries.map((country) => (
                      <button
                        key={`${country.value}-${country.code}`}
                        type="button"
                        onClick={() => handleCountrySelect(country)}
                        className={`hover:bg-accent flex w-full items-center gap-2 px-3 py-3 text-left transition-colors ${
                          selectedCountry.code === country.code
                            ? "bg-accent"
                            : ""
                        }`}
                      >
                        <FlagIcon code={country.code} />
                        <span className="text-card-foreground flex-1 text-sm">
                          {country.label}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {country.value}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="text-muted-foreground px-3 py-4 text-center text-sm">
                      No countries found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Phone Number Input */}
          <input
            type="tel"
            id={name}
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            placeholder={placeholder}
            className="bg-card text-card-foreground placeholder:text-muted-foreground flex-1 rounded-r-md px-3 py-3 text-sm leading-none focus:outline-none"
          />
        </div>
      </div>

      {error && (
        <p className="text-destructive mt-1 text-left text-sm">
          {error.message}
        </p>
      )}
      {!error && info && (
        <p className="text-muted-foreground mt-1 flex items-center gap-1 text-left text-sm">
          <Info className="h-4 w-4" />
          {info}
        </p>
      )}
    </div>
  );
};

export const PhoneInputOnly = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  isRequired,
}) => {
  const userProfile = useAtomValue(userProfileAtom);

  const getInitialCountry = useMemo(() => {
    if (!value || !value.startsWith("+")) {
      // Get from profile if available
      if (userProfile?.user_details?.country) {
        const profileCountry = userProfile.user_details.country.toLowerCase();
        const match = countryCodes.find(
          (c) => c.code.toLowerCase() === profileCountry,
        );
        if (match) return match;
      }
      return countryCodes[3]; // India
    }

    const match = countryCodes
      .sort((a, b) => b.value.length - a.value.length)
      .find((c) => value.startsWith(c.value));
    return match || countryCodes[3];
  }, [value, userProfile]);

  const [selectedCountry, setSelectedCountry] = useState(getInitialCountry);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  // New state for smart positioning
  const [dropdownPosition, setDropdownPosition] = useState("bottom");

  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Parse value on mount/change
  useEffect(() => {
    if (value && value.startsWith("+")) {
      const match = countryCodes
        .sort((a, b) => b.value.length - a.value.length)
        .find((c) => value.startsWith(c.value));
      if (match) {
        setSelectedCountry(match);
        setPhoneNumber(value.slice(match.value.length));
      }
    }
  }, [value]);

  // Update parent when country/number changes
  useEffect(() => {
    const fullNumber = phoneNumber
      ? `${selectedCountry.value}${phoneNumber}`
      : "";
    
    // Only call onChange if the value actually changed and it's different from the prop value
    // This prevents the infinite loop when the prop value updates the internal state
    if (fullNumber !== value) {
      onChange({ target: { name, value: fullNumber } });
    }
  }, [selectedCountry.value, phoneNumber, name, value, onChange]);

  const filteredCountries = useMemo(() => {
    if (!searchTerm) return countryCodes;
    const search = searchTerm.toLowerCase();
    return countryCodes.filter(
      (c) => c.label.toLowerCase().includes(search) || c.value.includes(search),
    );
  }, [searchTerm]);

  // Smart Positioning Logic
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = 300; // Approximate max height

      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        setDropdownPosition("top");
      } else {
        setDropdownPosition("bottom");
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      setTimeout(() => searchRef.current?.focus(), 0);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="w-full text-left">
      <label className="text-card-foreground block text-left text-sm font-medium">
        {label}
        {isRequired && <span className="text-red-500"> *</span>}
      </label>
      <div className="relative mt-1">
        <div className="border-border focus-within:border-primary flex w-full rounded-md border">
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="bg-muted hover:bg-muted/80 border-border flex h-full items-center gap-1.5 rounded-l-md border-r px-3 py-2"
            >
              <FlagIcon code={selectedCountry.code} />
              <span className="text-sm font-medium">
                {selectedCountry.value}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>
            {isOpen && (
              <div 
                className={`bg-card border-border absolute left-0 z-[999] w-64 rounded-md border shadow-lg ${
                    dropdownPosition === "top" ? "bottom-full mb-1" : "top-full mt-1"
                }`}
              >
                <div className="border-border border-b p-2">
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search country..."
                    className="border-border bg-background focus:border-primary w-full rounded border px-2 py-1.5 text-sm"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {filteredCountries.map((country) => (
                    <button
                      key={`${country.value}-${country.code}`}
                      type="button"
                      onClick={() => {
                        setSelectedCountry(country);
                        setIsOpen(false);
                        setSearchTerm("");
                      }}
                      className={`hover:bg-accent flex w-full items-center gap-2 px-3 py-2 ${
                        selectedCountry.code === country.code ? "bg-accent" : ""
                      }`}
                    >
                      <FlagIcon code={country.code} />
                      <span className="flex-1 text-sm text-left">
                        {country.label}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {country.value}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) =>
              setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))
            }
            placeholder={placeholder}
            className="bg-card placeholder:text-muted-foreground flex-1 rounded-r-md px-3 py-2.5 text-sm focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};

export default PhoneInput;