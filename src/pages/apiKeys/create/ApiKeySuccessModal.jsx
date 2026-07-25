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
import { PDFDownloadLink } from "@react-pdf/renderer";
import { AlertTriangle, Download, CheckCircle, Eye, EyeOff, Copy, X } from "lucide-react";
import ApiKeyPDF from "./ApiKeypdf";

const ApiKeySuccessModal = ({ isOpen, onClose, data }) => {
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  if (!isOpen || !data) return null;

  const apiKeySecret = data.api_key || "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKeySecret);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const maskKey = (key) => {
    if (key.length <= 8) return "••••••••";
    return key.substring(0, 8) + "•".repeat(Math.max(key.length - 8, 20));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop - doesn't close on click */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative text-left bg-background border border-border rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            API Key Created Successfully
          </h2>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Warning Banner */}
          <div className="from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/10 border-amber-300 dark:border-amber-800 mb-5 rounded-xl border bg-gradient-to-r p-4">
            <div className="flex gap-3 items-start">
              <AlertTriangle
                className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5"
                size={20}
              />
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <p className="font-semibold mb-1">Save your API key now</p>
                <p>
                  This key will only be displayed once. After closing this window, you won't be able to view it again.
                </p>
              </div>
            </div>
          </div>

          {/* Key Display Area */}
          <div className="bg-muted/30 border-border mb-5 rounded-xl border p-5">
            <div className="space-y-3">
              <label className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Your API Key
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 bg-background border-border rounded-lg border">
                  <code className="font-mono text-sm break-all text-foreground">
                    {isKeyVisible ? apiKeySecret : maskKey(apiKeySecret)}
                  </code>
                </div>
                <button
                  onClick={() => setIsKeyVisible(!isKeyVisible)}
                  className="p-3 bg-secondary hover:bg-secondary/80 border-border rounded-lg border transition-colors"
                  title={isKeyVisible ? "Hide key" : "Show key"}
                >
                  {isKeyVisible ? (
                    <EyeOff size={18} className="text-muted-foreground" />
                  ) : (
                    <Eye size={18} className="text-muted-foreground" />
                  )}
                </button>
                <button
                  onClick={handleCopy}
                  className="p-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
                  title="Copy to clipboard"
                >
                  {copySuccess ? (
                    <CheckCircle size={18} />
                  ) : (
                    <Copy size={18} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="mb-5 grid grid-cols-2 gap-5">
            <div className="border-border rounded-lg border p-4 bg-card">
              <p className="text-muted-foreground mb-2 text-xs tracking-wide uppercase">
                Key Name
              </p>
              <p className="text-foreground text-base font-semibold">
                {data?.key_name || "N/A"}
              </p>
            </div>
            <div className="border-border rounded-lg border p-4 bg-card">
              <p className="text-muted-foreground mb-2 text-xs tracking-wide uppercase">
                Created By
              </p>
              <p className="text-foreground text-base font-semibold">
                {data?.created_by || "N/A"}
              </p>
            </div>
          </div>

          {/* Actions Footer */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 mt-2 border-t border-border">
            <PDFDownloadLink
              document={<ApiKeyPDF data={data} />}
              fileName={`api-key-${data?.key_name || "export"}.pdf`}
              className="flex-1"
            >
              {({ loading }) => (
                <button
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg transition-colors font-medium border border-border disabled:opacity-50"
                >
                  <Download size={16} />
                  {loading ? "Generating..." : "Download PDF"}
                </button>
              )}
            </PDFDownloadLink>

            <button
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors font-medium"
            >
              <CheckCircle size={16} />
              I have saved my key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeySuccessModal;