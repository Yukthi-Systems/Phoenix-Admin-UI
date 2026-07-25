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
import {
  X,
  Archive,
  Calendar,
  MessageSquare,
  Clock,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { formatMarkdownContent, detectLinks } from "./utils";

const ArchiveView = ({
  archivedChats,
  onClose,
  onRestore,
  onDelete,
}) => {
  const [selectedArchive, setSelectedArchive] = useState(null);

  return (
    <div className="absolute inset-0 bg-card border-l border-border shadow-2xl flex flex-col z-10">
      {/* Archive Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
            <Archive className="w-4 h-4 text-accent-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-left">
              Chat Archives
            </h3>
            <p className="text-xs text-muted-foreground text-left">
              {archivedChats.length} archived conversation
              {archivedChats.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            onClose();
            setSelectedArchive(null);
          }}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Archive List or Archive Viewer */}
      {selectedArchive ? (
        // Single Archive Viewer
        <div className="flex-1 flex flex-col">
          {/* Archive Details Header */}
          <div className="p-4 border-b border-border bg-accent/20">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground text-left">
                  {selectedArchive.title}
                </h4>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(selectedArchive.archivedAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {selectedArchive.messageCount} messages
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onRestore(selectedArchive)}
                  className="flex items-center gap-1 px-3 py-1 text-xs bg-primary text-primary-foreground rounded transition-colors hover:bg-primary/90"
                  title="Restore this chat"
                >
                  <RotateCcw className="w-3 h-3" />
                  Restore
                </button>
                <button
                  onClick={() => setSelectedArchive(null)}
                  className="p-1 hover:bg-accent rounded transition-colors"
                  title="Back to archives"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Archive Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10 max-h-[80vh]">
            {selectedArchive.messages.map((message, index) => (
              <div
                key={`archive-${selectedArchive.id}-${index}`}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] ${message.type === "user" ? "order-2" : "order-1"}`}
                >
                  <div
                    className={`p-3 rounded-2xl break-words overflow-hidden ${
                      message.type === "user"
                        ? "bg-primary text-primary-foreground ml-auto"
                        : message.isError
                          ? "bg-destructive/10 text-destructive border border-destructive/20"
                          : "bg-muted text-foreground"
                    }`}
                  >
                    {message.type === "user" ? (
                      <p className="text-sm text-left whitespace-pre-wrap break-words">
                        {detectLinks(message.content)}
                      </p>
                    ) : (
                      <div className="text-sm text-left">
                        <div className="whitespace-pre-wrap break-words overflow-x-auto max-w-full">
                          {formatMarkdownContent(message.content)}
                        </div>
                      </div>
                    )}
                  </div>
                  <p
                    className={`text-xs text-muted-foreground mt-1 ${message.type === "user" ? "text-right" : "text-left"}`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Archive List
        <div className="flex-1 overflow-y-auto p-4">
          {archivedChats.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Archive className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-sm">No archived chats yet</p>
              <p className="text-xs mt-2">
                Archive chats to save them for later reference
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {archivedChats.map((archive) => (
                <div
                  key={archive.id}
                  className="p-4 bg-accent/30 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedArchive(archive)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground text-left truncate">
                        {archive.title}
                      </h4>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(archive.archivedAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(archive.archivedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {archive.messageCount} messages
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRestore(archive);
                        }}
                        className="p-1 hover:bg-primary/20 rounded transition-colors"
                        title="Restore chat"
                      >
                        <RotateCcw className="w-3 h-3 text-primary" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(archive.id);
                        }}
                        className="p-1 hover:bg-destructive/20 rounded transition-colors"
                        title="Delete archive"
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ArchiveView;