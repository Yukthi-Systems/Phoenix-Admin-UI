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

import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export const AccordionNestedSection = ({ 
  title, 
  icon: Icon, 
  data, 
  emptyMessage, 
  sectionKey, 
  expandedSections, 
  toggleSection 
}) => {
  const [expandedInner, setExpandedInner] = useState({});
  const isExpanded = expandedSections[sectionKey];
  
  const totalCount = data ? Object.values(data).reduce((sum, reasons) => {
    return sum + Object.values(reasons).reduce((s, detail) => s + (detail?.total || 0), 0);
  }, 0) : 0;

  const toggleInner = (key) => {
    setExpandedInner(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-muted rounded-lg">
            <Icon size={20} className="text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-bold text-base text-foreground">{title}</h3>
            <p className="text-muted-foreground text-xs mt-1">{emptyMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon size={20} className="text-primary" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-base text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {totalCount.toLocaleString()} total entries
            </p>
          </div>
        </div>
        <div className="p-2 bg-muted rounded-lg shrink-0">
          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-border">
          <div className="p-4 max-h-[500px] overflow-y-auto custom-scrollbar">
            <div className="space-y-3">
              {Object.entries(data).map(([stage, reasons]) => {
                const stageTotal = Object.values(reasons).reduce((s, detail) => s + (detail?.total || 0), 0);
                const stageKey = `${sectionKey}-${stage}`;
                const isInnerExpanded = expandedInner[stageKey];

                return (
                  <div key={stage} className="border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleInner(stageKey)}
                      className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{stage}</span>
                        <span className="text-xs text-muted-foreground">({stageTotal} entries)</span>
                      </div>
                      <div className="shrink-0">
                        {isInnerExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </div>
                    </button>

                    {isInnerExpanded && (
                      <div className="p-3 bg-background space-y-3">
                        {Object.entries(reasons).map(([reason, details]) => (
                          <div key={reason} className="bg-muted/50 rounded-lg p-3 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <span className="text-sm font-medium text-foreground flex-1">{reason}</span>
                              <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded shrink-0">
                                {details?.total || 0}
                              </span>
                            </div>

                            {details?.sources && details.sources.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                  Sources ({details.sources.length}):
                                </p>
                                <div className="max-h-[150px] overflow-y-auto custom-scrollbar space-y-1">
                                  {details.sources.map((source, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between bg-background rounded px-3 py-1.5 hover:bg-muted/30 transition-colors"
                                    >
                                      <span className="text-foreground font-mono text-xs truncate flex-1 mr-3">
                                        {source?.value || "Unknown"}
                                      </span>
                                      <span className="text-muted-foreground font-semibold text-xs shrink-0">
                                        {source?.count || 0}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AccordionCategorySection = ({ 
  title, 
  icon: Icon, 
  data, 
  emptyMessage, 
  sectionKey, 
  expandedSections, 
  toggleSection 
}) => {
  const [expandedInner, setExpandedInner] = useState({});
  const isExpanded = expandedSections[sectionKey];
  const totalCount = data ? Object.values(data).reduce((sum, detail) => sum + (detail?.total || 0), 0) : 0;

  const toggleInner = (key) => {
    setExpandedInner(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-muted rounded-lg">
            <Icon size={20} className="text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-bold text-base text-foreground">{title}</h3>
            <p className="text-muted-foreground text-xs mt-1">{emptyMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-destructive/10 rounded-lg">
            <Icon size={20} className="text-destructive" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-base text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {totalCount.toLocaleString()} total entries
            </p>
          </div>
        </div>
        <div className="p-2 bg-muted rounded-lg shrink-0">
          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-border">
          <div className="p-4 max-h-[500px] overflow-y-auto custom-scrollbar">
            <div className="space-y-3">
              {Object.entries(data).map(([category, details]) => {
                const total = details?.total || 0;
                const entries = details?.entries || [];
                if (total === 0 && entries.length === 0) return null;

                const categoryKey = `${sectionKey}-${category}`;
                const isInnerExpanded = expandedInner[categoryKey];

                return (
                  <div key={category} className="border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleInner(categoryKey)}
                      className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{category}</span>
                        <span className="text-xs text-muted-foreground">({total} entries)</span>
                      </div>
                      <div className="shrink-0">
                        {isInnerExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </div>
                    </button>

                    {isInnerExpanded && entries.length > 0 && (
                      <div className="p-3 bg-background space-y-2">
                        {entries.map((entry, idx) => (
                          <div
                            key={idx}
                            className="bg-destructive/5 border border-destructive/20 rounded-lg p-2.5 flex items-start justify-between gap-3 hover:bg-destructive/10 transition-colors"
                          >
                            <span className="text-sm text-foreground flex-1 break-words leading-relaxed">
                              {entry?.message || "No message"}
                            </span>
                            <span className="text-xs font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded shrink-0">
                              {entry?.count || 0}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};