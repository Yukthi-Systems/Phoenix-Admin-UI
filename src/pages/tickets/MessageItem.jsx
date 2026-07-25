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
import { Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "react-toastify";
import { MarkdownView } from "@/components/common/MarkDownViewer";
import FileAttachment from "./FileAttachment";
import FileViewer from "./FileViewer";

export const MessageItem = ({
  item,
  index,
  isLastItem,
  creatorName,
  formatUserDateNice,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const MESSAGE_PREVIEW_LENGTH = 800;

  const shouldTruncate = item.message && item.message.length > MESSAGE_PREVIEW_LENGTH;
  const displayMessage =
    shouldTruncate && !isExpanded
      ? item.message.substring(0, MESSAGE_PREVIEW_LENGTH) + "..."
      : item.message;

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(item.message || "");
      setIsCopied(true);
      toast.success("Message copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy message");
    }
  };

  const handleFilePreview = (fileIndex) => {
    setSelectedFileIndex(fileIndex);
    setViewerOpen(true);
  };

  return (
    <div
      className={`flex gap-3 pb-4 border-border border-b ${
        isLastItem ? "border-b-0" : ""
      }`}
    >
      <div
        className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm ${getAvatarColor(
          creatorName
        )}`}
        title={creatorName}
      >
        {getInitials(creatorName)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="font-semibold text-sm text-foreground">
            {creatorName}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatUserDateNice(item.created_at)}
          </span>
          {item.isInitialTicket && (
            <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-medium">
              Original Request
            </span>
          )}
          {item.message && (
            <button
              onClick={handleCopy}
              className="ml-auto p-1.5 hover:bg-accent rounded transition-colors group"
              title="Copy message"
            >
              {isCopied ? (
                <Check size={14} className="text-success" />
              ) : (
                <Copy
                  size={14}
                  className="text-muted-foreground group-hover:text-foreground"
                />
              )}
            </button>
          )}
        </div>

        {item.message && (
          <div className="text-sm text-foreground mb-2">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <MarkdownView content={displayMessage} />
            </div>

            {shouldTruncate && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1 transition-colors"
              >
                {isExpanded ? (
                  <>
                    Show Less <ChevronUp size={16} />
                  </>
                ) : (
                  <>
                    Show More <ChevronDown size={16} />
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {item.details?.attachments?.length > 0 && (
          <>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {item.details.attachments.map((file, idx) => (
                <FileAttachment
                  key={`${file.file_id || idx}`}
                  file={file}
                  onPreview={() => handleFilePreview(idx)}
                />
              ))}
            </div>

            <FileViewer
              isOpen={viewerOpen}
              onClose={() => setViewerOpen(false)}
              files={item.details.attachments}
              initialIndex={selectedFileIndex}
            />
          </>
        )}
      </div>
    </div>
  );
};