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

import React, { useState, useMemo } from "react";
import { X, Search, BarChart3, Globe, TrendingUp, Copy } from "lucide-react";

const DomainStatsModal = ({ isOpen, onClose, domainStats, totalMessages }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter domain stats based on search
  const filteredStats = useMemo(() => {
    if (!searchTerm.trim()) return domainStats;

    const query = searchTerm.toLowerCase();
    return domainStats.filter((stat) =>
      stat.domain.toLowerCase().includes(query),
    );
  }, [domainStats, searchTerm]);

  // Calculate percentage for each domain
  const statsWithPercentage = useMemo(() => {
    return filteredStats.map((stat) => ({
      ...stat,
      percentage:
        totalMessages > 0 ? ((stat.count / totalMessages) * 100).toFixed(1) : 0,
    }));
  }, [filteredStats, totalMessages]);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const getBarWidth = (count) => {
    const maxCount = domainStats[0]?.count || 1;
    return (count / maxCount) * 100;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm  transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground text-left">
                  Domain Statistics
                </h3>
                <p className="text-sm text-muted-foreground">
                  {domainStats.length} unique domains across {totalMessages}{" "}
                  messages
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          <div className="p-4 border-b border-border">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder="Search domains..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 text-sm text-foreground bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
              />
            </div>
            {searchTerm && (
              <p className="mt-2 text-xs text-muted-foreground">
                Showing {filteredStats.length} of {domainStats.length} domains
              </p>
            )}
          </div>

          <div className="overflow-y-auto max-h-96">
            {statsWithPercentage.length === 0 ? (
              <div className="p-8 text-center">
                <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  {searchTerm
                    ? "No domains found matching your search."
                    : "No domain data available."}
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {statsWithPercentage.map((stat, index) => (
                  <div
                    key={stat.domain}
                    className="group flex items-center justify-between p-3 bg-background/40 hover:bg-muted/50 rounded-lg border border-border/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-foreground font-mono text-sm truncate"
                            title={stat.domain}
                          >
                            {stat.domain}
                          </span>
                          <button
                            onClick={() => copyToClipboard(stat.domain)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-all"
                            title="Copy domain"
                          >
                            <Copy className="h-3 w-3 text-muted-foreground" />
                          </button>
                        </div>
                        {/* Progress bar */}
                        <div className="mt-1 w-full bg-muted rounded-full h-1.5">
                          <div
                            className="bg-primary h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${getBarWidth(stat.count)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground font-semibold">
                          {stat.count}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          ({stat.percentage}%)
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DomainStatsModal;
