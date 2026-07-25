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
  Send,
  Paperclip,
  Loader2,
  Trash2,
  FileText,
  CheckCircle,
  Lock,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { MarkdownEditor } from "@/components/common/MarkdownEditor";
import { Button } from "@/components/common/Buttons";
import { formatFileSize } from "@/utils/fileSize";

export const MessageInput = ({
  isResolved,
  selectedFiles,
  message,
  setMessage,
  isSending,
  isUploading,
  fileInputRef,
  handleFileSelect,
  removeAttachment,
  handleSendMessage,
  onFilesAdded, // New prop to handle file addition from parent
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const processFiles = (files) => {
    if (!files || files.length === 0) return;
    
    // Create synthetic event for compatibility with existing handleFileSelect
    const event = {
      target: {
        files: files
      }
    };
    handleFileSelect(event);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading && !isSending && !isResolved) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (isUploading || isSending || isResolved) return;

    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const files = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file') {
        const file = items[i].getAsFile();
        if (file) files.push(file);
      }
    }

    if (files.length > 0) {
      processFiles(files);
    }
  };

  return (
    <div 
      className={`shrink-0 p-4 bg-card border-t z-10 transition-all ${
        isDragging 
          ? "border-primary border-2 bg-primary/5" 
          : "border-border"
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {isResolved ? (
        <div className="flex flex-col items-center justify-center py-4 text-muted-foreground bg-muted/20 rounded-lg border border-border border-dashed">
          <div className="flex items-center gap-2 mb-1 text-foreground font-medium">
            <CheckCircle size={18} className="text-green-600" />
            <span>This ticket has been marked as Resolved</span>
          </div>
          <p className="text-xs flex items-center gap-1">
            <Lock size={12} />
            Replies are disabled for resolved tickets.
          </p>
        </div>
      ) : (
        <>
          {selectedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="group flex items-center gap-2 bg-background border border-border px-3 py-1.5 rounded-md text-xs shadow-sm"
                >
                  <div className="bg-primary/10 p-1 rounded text-primary">
                    <FileText size={12} />
                  </div>
                  <div className="flex flex-col">
                    <span className="max-w-[120px] truncate font-medium">
                      {file.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                  <button
                    onClick={() => removeAttachment(idx)}
                    className="text-muted-foreground hover:text-destructive transition-colors ml-1"
                    disabled={isUploading}
                    type="button"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <div className="relative">
              <MarkdownEditor
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onPaste={handlePaste}
                placeholder={isDragging ? "Drop files here..." : "Add a comment..."}
                rows={isExpanded ? 12 : 4}
                disabled={isSending || isUploading}
                className="w-full"
              />
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                disabled={isSending || isUploading}
                className="absolute top-2 right-52 p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors disabled:opacity-50 z-10"
                title={isExpanded ? "Collapse editor" : "Expand editor"}
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            </div>

            <div className="flex justify-between items-center gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  multiple
                  onChange={handleFileSelect}
                  disabled={isUploading || isSending}
                />
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || isSending}
                  className="text-foreground hover:bg-accent flex items-center border-border hover:border-primary/50 h-9 px-4 gap-2 font-medium"
                >
                  <div className="flex items-center gap-2 text-nowrap">
                    <Paperclip className="h-4 w-4" />
                    <span className="text-sm">
                      Attach Files
                      {selectedFiles.length > 0 && (
                        <span className="ml-1.5 bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs font-semibold">
                          {selectedFiles.length}
                        </span>
                      )}
                    </span>
                  </div>
                </Button>
              </div>

              <Button
                onClick={handleSendMessage}
                disabled={
                  isSending ||
                  isUploading ||
                  (!message && selectedFiles.length === 0)
                }
                variant="primary"
                size="sm"
                className="px-6 h-9 shadow-md hover:shadow-lg transition-all font-medium"
              >
                <div className="flex items-center gap-2">
                  {isUploading || isSending ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4" />
                      {isUploading ? "Uploading..." : "Posting..."}
                    </>
                  ) : (
                    <>
                      Post Comment
                      <Send className="h-4 w-4" />
                    </>
                  )}
                </div>
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};