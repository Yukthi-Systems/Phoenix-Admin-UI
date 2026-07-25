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
import { FileText, Download, Loader2 } from "lucide-react";
import { useGetTicketFile } from "@/hooks/useSupportTickets";

const FileAttachment = ({ file, onPreview }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { refetch } = useGetTicketFile(file.file_id, false);

  const extension = file.file_type?.toLowerCase() || "";
  const isImage = ["png", "jpg", "jpeg", "gif", "webp", "svg"].some((ext) =>
    extension.includes(ext)
  );

  const getMimeType = () => {
    if (extension.includes("png")) return "image/png";
    if (extension.includes("jpg") || extension.includes("jpeg")) return "image/jpeg";
    if (extension.includes("gif")) return "image/gif";
    if (extension.includes("webp")) return "image/webp";
    if (extension.includes("svg")) return "image/svg+xml";
    if (extension.includes("pdf")) return "application/pdf";
    return "application/octet-stream";
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    setIsDownloading(true);

    try {
      const { data: fileBlob } = await refetch();
      if (!fileBlob) throw new Error("File not found");

      const blob = new Blob([fileBlob], { type: getMimeType() });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      onClick={onPreview}
      className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-card hover:bg-accent/50 transition-all group w-full shadow-sm hover:shadow-md cursor-pointer relative"
    >
      <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded flex items-center justify-center text-primary">
        <FileText size={18} />
      </div>

      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-sm font-medium truncate text-foreground" title={file.file_name}>
          {file.file_name}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {file.file_size_mb} MB • {extension.toUpperCase()}
        </span>
      </div>

      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="p-2 rounded-full hover:bg-background text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 z-10"
        title="Download"
      >
        {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
      </button>
    </div>
  );
};

export default FileAttachment;