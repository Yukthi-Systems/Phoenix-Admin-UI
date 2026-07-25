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

import {
  MoveRight,
  Download,
  Printer,
  Shield,
  AlertTriangle,
  Copy,
  Check,
} from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import BackupCodePDF from "./BackupCodePDF";
import BackupCodePrint from "./BackupCodePrint";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";

const StepBackupCode = ({ onNext, backupCode = [] }) => {
  const componentRef = useRef(null);
  const [copiedCodes, setCopiedCodes] = useState(new Set());

  const printFn = useReactToPrint({
    contentRef: componentRef,
    documentTitle: "Mail Service 25 - Backup Codes",
  });

  const copyToClipboard = async (code, index) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodes((prev) => new Set([...prev, index]));
      setTimeout(() => {
        setCopiedCodes((prev) => {
          const newSet = new Set(prev);
          newSet.delete(index);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const copyAllCodes = async () => {
    try {
      const allCodes = backupCode.join("\n");
      await navigator.clipboard.writeText(allCodes);
      const allIndices = backupCode.map((_, index) => index);
      setCopiedCodes(new Set(allIndices));
      setTimeout(() => {
        setCopiedCodes(new Set());
      }, 2000);
    } catch (err) {
      console.error("Failed to copy all codes: ", err);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 mb-2">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">
            Backup Verification Codes
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Save these codes safely. You'll need them if you lose your device.
        </p>
      </div>

      {/* Warning */}
      <div className="bg-warning/10 border border-warning/20 rounded-md p-3 mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
          <p className="text-sm text-warning-foreground">
            Print or download these codes and keep them safe. Each code can only
            be used once.
          </p>
        </div>
      </div>

      {/* Backup Codes */}
      <div className="bg-card border border-border rounded-md p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-foreground">
            Your Backup Codes
          </h3>
          {backupCode.length > 0 && (
            <button
              onClick={copyAllCodes}
              className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              Copy All
            </button>
          )}
        </div>

        {backupCode.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {backupCode.map((code, index) => (
              <div
                key={index}
                className="group bg-muted/50 border border-border rounded px-3 py-2 hover:bg-muted/70 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-medium text-foreground">
                    {code || "-"}
                  </span>
                  <button
                    onClick={() => copyToClipboard(code, index)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-background rounded transition-all"
                  >
                    {copiedCodes.has(index) ? (
                      <Check className="w-3 h-3 text-success" />
                    ) : (
                      <Copy className="w-3 h-3 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              No backup codes available
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={printFn}
            className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm px-3 py-2 rounded transition-colors"
          >
            <Printer className="w-3 h-3" />
            Print
          </button>

          {backupCode.length > 0 && (
            <PDFDownloadLink
              document={<BackupCodePDF data={backupCode} />}
              fileName="mail_service_25_backup_codes.pdf"
              className="inline-flex items-center gap-1 bg-primary text-primary-foreground hover:bg-primary/90 text-sm px-3 py-2 rounded transition-colors"
            >
              {({ loading }) => (
                <>
                  <Download className="w-3 h-3" />
                  {loading ? "Generating..." : "Download"}
                </>
              )}
            </PDFDownloadLink>
          )}
        </div>

        <button
          onClick={onNext}
          className="inline-flex items-center gap-1 bg-success text-success-foreground hover:bg-success/90 font-medium text-sm px-4 py-2 rounded transition-colors"
        >
          Complete
          <MoveRight className="w-3 h-3" />
        </button>
      </div>

      {/* Hidden Print Component */}
      <div className="hidden">
        <BackupCodePrint ref={componentRef} codes={backupCode} />
      </div>
    </div>
  );
};

export default StepBackupCode;
