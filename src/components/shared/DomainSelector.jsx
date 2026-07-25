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

import { useState, useEffect, useRef } from "react";
import { useAtom, useAtomValue } from "jotai";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Globe,
  Plus,
  Search,
} from "lucide-react";
import { useGetDomains } from "@/hooks/useDomain";
import { userInfoAtom } from "@/store/userInfo";
import { domainAtom } from "@/store/domain";
import { PER_PAGE } from "@/constants/constants";
import { Link } from "react-router-dom";
import { useDebounce } from "@/hooks/useDebounce";
import { useUrlParam } from "@/hooks/useUrlParam";

const DomainSelector = ({ domainName, setDomainName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [domainParam, setDomainParam] = useUrlParam("domain", "");

  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  const [storedDomain, setStoredDomain] = useAtom(domainAtom);

  useEffect(() => {
    if (domainParam && domainParam !== domainName) {
      setDomainName(domainParam);
    }
  }, [domainParam]);

  const pageSize = PER_PAGE;
  const { organization_id } = useAtomValue(userInfoAtom);

  // Debounce the search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const { data, isLoading, isError } = useGetDomains(
    organization_id,
    page,
    pageSize,
    debouncedSearchQuery,
  );

  const domains = data?.domains?.domains || [];
  const totalPages = data?.domains?.total_pages ?? 1;

  const handleDomainSelect = (domain) => {
    setDomainName(domain.domain_name);
    setDomainParam(domain.domain_name);
    setStoredDomain({
      ...domain,
      organization_id,
      selected_at: Date.now(),
    });
    setIsOpen(false);
    setSearchQuery(""); // Clear search on selection
  };

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Auto-scroll to selected domain when dropdown opens
  useEffect(() => {
    if (
      isOpen &&
      domainName &&
      scrollContainerRef.current &&
      domains.length > 0
    ) {
      const timer = setTimeout(() => {
        const selectedIndex = domains.findIndex(
          (domain) => domain.domain_name === domainName,
        );
        if (selectedIndex !== -1) {
          const listContainer = scrollContainerRef.current.querySelector("ul");
          if (listContainer && listContainer.children[selectedIndex]) {
            listContainer.children[selectedIndex].scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "nearest",
            });
          }
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isOpen, domainName, domains]);

  // Sync stored domain with fetched domains
  useEffect(() => {
    if (domains?.length > 0 && storedDomain?.domain_name) {
      const updatedDomain = domains.find(
        (d) => d.domain_name === storedDomain.domain_name,
      );

      if (
        updatedDomain &&
        storedDomain.organization_id === organization_id &&
        JSON.stringify(updatedDomain) !==
        JSON.stringify({
          ...storedDomain,
          organization_id: undefined,
          selected_at: undefined,
        })
      ) {
        setStoredDomain({
          ...updatedDomain,
          organization_id,
          selected_at: storedDomain.selected_at,
        });
      }
    }
  }, [domains, storedDomain, organization_id, setStoredDomain]);

  // Reset domain when organization changes
  useEffect(() => {
    if (
      organization_id &&
      storedDomain?.organization_id &&
      storedDomain.organization_id !== organization_id
    ) {
      setStoredDomain(null);
      setDomainName(null);
    }
  }, [organization_id, storedDomain, setStoredDomain, setDomainName]);

  // Set default domain
  useEffect(() => {
    if (domains?.length > 0) {
      if (
        storedDomain?.domain_name &&
        storedDomain.organization_id === organization_id
      ) {
        // Trust the stored selection as soon as the organization matches -
        // don't require it to appear on the currently loaded page, since
        // `domains` here is only the current page's slice and a previously
        // selected domain living on page 2+ would otherwise look "missing"
        // on every remount (page always starts back at 1) and get silently
        // replaced with domains[0].
        if (!domainName || domainName !== storedDomain.domain_name) {
          setDomainName(storedDomain.domain_name);
        }
      } else if (!domainName) {
        const firstSelectableDomain = domains.find(
          (d) => d.is_active && d.is_dns_txt_verified,
        );
        // Only auto-select when there's an actual selectable domain - never
        // fall back to domains[0], since that could be inactive/unverified.
        if (firstSelectableDomain) {
          setDomainName(firstSelectableDomain.domain_name);
          setStoredDomain({
            domain_name: firstSelectableDomain.domain_name,
            organization_id,
            selected_at: Date.now(),
          });
        }
      }
    } else if (domains?.length === 0 && !isLoading && !isError) {
      setDomainName(null);
      setStoredDomain(null);
    }
  }, [
    domains,
    domainName,
    setDomainName,
    organization_id,
    storedDomain,
    setStoredDomain,
    isLoading,
    isError,
  ]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery(""); // Clear search when closing
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Reset page when search query changes
  useEffect(() => {
    if (debouncedSearchQuery) {
      setPage(1);
    }
  }, [debouncedSearchQuery]);

  const handleClose = () => {
    setIsOpen(false);
    setPage(1);
    setSearchQuery("");
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    searchInputRef.current?.focus();
  };

  if (isLoading && !isOpen) {
    return (
      <div className="flex justify-center">
        <div className="relative w-full max-w-sm">
          <div className="w-full text-center border border-border bg-muted px-3 py-2 rounded-md shadow animate-pulse">
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 bg-muted-foreground/20 rounded w-24"></div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError && !isOpen) {
    return (
      <div className="flex justify-center">
        <div className="relative w-full max-w-sm">
          <div className="w-full text-center border border-destructive/20 bg-destructive/10 px-3 py-2 rounded-md text-destructive text-sm">
            Failed to load domains
          </div>
        </div>
      </div>
    );
  }

  if (domains?.length === 0 && !debouncedSearchQuery && !isLoading) {
    return (
      <div className="flex justify-center">
        <div className="relative w-full max-w-sm">
          <div className="w-full flex items-center gap-2 mb-3 text-center border border-border bg-muted/50 px-3 py-2 rounded-md text-muted-foreground text-sm">
            <div className="flex items-center justify-center gap-2 ">
              <Globe className="w-4 h-4" />
              No domains available
            </div>
            <Link
              to={"/domain/add/"}
              className="inline-flex items-center px-1 py-0.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors duration-200"
            >
              <Plus className="w-3 h-3" />
              Add Domain
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <div className="relative w-full max-w-sm" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full text-center border border-primary/20 bg-primary/10 hover:bg-primary/20 px-3 py-2 rounded-md shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-primary font-medium inline-flex justify-center items-center gap-2 cursor-pointer transition-all duration-200"
        >
          <Globe className="w-4 h-4" />
          <span className="truncate">{domainName || "Select Domain"}</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <div className="absolute min-w-[200px] z-50 mt-2 w-full bg-card border border-border rounded-md shadow-lg ring-1 ring-border/20">
            <div className="px-4 py-3 flex justify-between items-center border-b border-border bg-muted/30">
              <span className="font-semibold text-foreground">
                Choose a domain
              </span>
              <button
                onClick={handleClose}
                className="text-muted-foreground hover:text-destructive transition-colors duration-200 p-1 hover:bg-destructive/10 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="px-4 py-3 border-b border-border bg-background">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search domains..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-8 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto" ref={scrollContainerRef}>
              {isLoading ? (
                <div className="p-4 space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-10 bg-muted/50 rounded-md animate-pulse"
                    ></div>
                  ))}
                </div>
              ) : domains.length > 0 ? (
                <ul className="p-2 space-y-1">
                  {domains.map((domain) => {

                    const isSelectable = domain.is_active && domain.is_dns_txt_verified;
                    const disabledReason = !domain.is_active
                      ? "Domain is inactive"
                      : "Domain DNS TXT record not verified";

                    return (
                      <li key={domain.domain_name}>
                        <button
                          disabled={!isSelectable}
                          title={isSelectable ? undefined : disabledReason}
                          className={`w-full text-left px-3 py-2 rounded-md transition-all duration-200 flex items-center gap-2 ${!isSelectable
                              ? "opacity-50 cursor-not-allowed text-muted-foreground"
                              : domainName === domain.domain_name
                                ? "bg-primary/20 text-primary border border-primary/30"
                                : "hover:bg-muted text-foreground"
                            }`}
                          onClick={() =>
                            isSelectable && handleDomainSelect(domain)
                          }
                        >
                          <Globe className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">
                            {domain.domain_name}
                          </span>
                          {!isSelectable && (
                            <span className="ml-auto flex-shrink-0 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                              {!domain.is_active ? "Inactive" : "Unverified"}
                            </span>
                          )}
                          {isSelectable &&
                            domainName === domain.domain_name && (
                              <div className="w-2 h-2 bg-primary rounded-full ml-auto flex-shrink-0"></div>
                            )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  {debouncedSearchQuery ? (
                    <div className="space-y-2">
                      <p>No domains found matching "{debouncedSearchQuery}"</p>
                      <button
                        onClick={handleClearSearch}
                        className="text-sm text-primary hover:underline"
                      >
                        Clear search
                      </button>
                    </div>
                  ) : (
                    "No domains found"
                  )}
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-between items-center px-4 py-3 border-t border-border bg-muted/30">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  title="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="text-sm text-muted-foreground font-medium">
                  Page {page} of {totalPages}
                </span>

                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  title="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DomainSelector;
