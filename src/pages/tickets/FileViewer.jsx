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

import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Download, Loader2 } from "lucide-react";
import { useGetTicketFile } from "@/hooks/useSupportTickets";

const FileViewer = ({ isOpen, onClose, files, initialIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [fileUrls, setFileUrls] = useState({});
  const [loadingFiles, setLoadingFiles] = useState({});

  const currentFile = files[currentIndex];

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  // CRITICAL FIX: Only clean up URLs when the modal is fully closed/unmounted
  useEffect(() => {
    return () => {
      Object.values(fileUrls).forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []); // ← Empty array: runs only on unmount (when modal closes)

  const getMimeType = (extension) => {
    const ext = extension?.toLowerCase() || "";
    if (ext.includes("png")) return "image/png";
    if (ext.includes("jpg") || ext.includes("jpeg")) return "image/jpeg";
    if (ext.includes("gif")) return "image/gif";
    if (ext.includes("webp")) return "image/webp";
    if (ext.includes("svg")) return "image/svg+xml";
    if (ext.includes("pdf")) return "application/pdf";
    return "application/octet-stream";
  };

  if (!isOpen || !currentFile) return null;

  return (
    <>
      {files.map((file, idx) => (
        <FileLoader
          key={file.file_id}
          file={file}
          isActive={idx === currentIndex}
          onLoad={(url) => {
            setFileUrls((prev) => ({ ...prev, [file.file_id]: url }));
            setLoadingFiles((prev) => ({ ...prev, [file.file_id]: false }));
          }}
          onLoadStart={() => {
            setLoadingFiles((prev) => ({ ...prev, [file.file_id]: true }));
          }}
          getMimeType={getMimeType}
        />
      ))}

      <FileViewerUI
        currentFile={currentFile}
        currentIndex={currentIndex}
        files={files}
        fileUrls={fileUrls}
        isLoading={loadingFiles[currentFile.file_id] || false}
        onPrevious={() =>
          setCurrentIndex((prev) =>
            prev > 0 ? prev - 1 : files.length - 1
          )
        }
        onNext={() =>
          setCurrentIndex((prev) =>
            prev < files.length - 1 ? prev + 1 : 0
          )
        }
        onClose={onClose}
      />
    </>
  );
};

const FileLoader = ({
  file,
  isActive,
  onLoad,
  onLoadStart,
  getMimeType,
}) => {
  const { refetch } = useGetTicketFile(file.file_id, false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (isActive && !hasLoaded) {
      loadFile();
    }
  }, [isActive, hasLoaded]);

  const loadFile = async () => {
    if (hasLoaded) return;

    onLoadStart();
    try {
      const { data: fileBlob } = await refetch();
      if (!fileBlob) throw new Error("File not found");

      const blob = new Blob([fileBlob], { type: getMimeType(file.file_type) });
      const url = URL.createObjectURL(blob);
      onLoad(url);
      setHasLoaded(true);
    } catch (error) {
      console.error("Failed to load file:", error);
      setLoadingFiles((prev) => ({ ...prev, [file.file_id]: false }));
    }
  };

  return null;
};

const FileViewerUI = ({
  currentFile,
  currentIndex,
  files,
  fileUrls,
  isLoading,
  onPrevious,
  onNext,
  onClose,
}) => {
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleDownload = () => {
    const url = fileUrls[currentFile.file_id];
    if (url) {
      const a = document.createElement("a");
      a.href = url;
      a.download = currentFile.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const isImage = ["png", "jpg", "jpeg", "gif", "webp", "svg"].some((ext) =>
    currentFile?.file_type?.toLowerCase().includes(ext)
  );
  const isPdf = currentFile?.file_type?.toLowerCase().includes("pdf");

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center"
      onClick={handleBackdrop}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-4 z-10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="text-white">
            <h3 className="font-medium text-lg">{currentFile.file_name}</h3>
            <p className="text-sm text-white/70">
              {currentFile.file_size_mb} MB • {currentIndex + 1} of {files.length}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={!fileUrls[currentFile.file_id]}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white disabled:opacity-50"
              title="Download"
            >
              <Download size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {files.length > 1 && (
        <>
          <button
            onClick={onPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors z-10"
            title="Previous"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors z-10"
            title="Next"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Main Content */}
      <div className="max-w-7xl max-h-[90vh] w-full mx-auto px-16">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="animate-spin text-white" size={40} />
          </div>
        ) : isImage ? (
          <img
            src={fileUrls[currentFile.file_id]}
            alt={currentFile.file_name}
            className="max-w-full max-h-[90vh] mx-auto object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        ) : isPdf ? (
          <iframe
            src={fileUrls[currentFile.file_id]}
            className="w-full h-[90vh] bg-white rounded"
            title={currentFile.file_name}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-96 text-white">
            <p className="mb-4">Preview not available</p>
            <button
              onClick={handleDownload}
              disabled={!fileUrls[currentFile.file_id]}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Download size={16} />
              Download File
            </button>
          </div>
        )}
      </div>

      {/* Keyboard hint */}
      {files.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-xs">
          Use arrow icons to navigate
        </div>
      )}
    </div>
  );
};

export default FileViewer;