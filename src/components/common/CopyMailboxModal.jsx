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

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAtomValue, useSetAtom } from "jotai";
import { userInfoAtom } from "@/store/userInfo";
import { copyDataAtom } from "@/store/copy";
import { Copy, X, Loader2 } from "lucide-react";
import { useToastify } from "@/hooks/useToastify";
import DomainSelector from "../shared/DomainSelector";

const CopyDomainModal = ({
  isOpen,
  onClose,
  itemId,
  itemName,
  sourceDomain, // Add this prop to receive the current domain
  config, // { type, title, itemDisplayName, fetchDetails, transformData, copyRoute }
}) => {
  const navigate = useNavigate();
  const toast = useToastify();
  const { organization_id } = useAtomValue(userInfoAtom);
  const setCopyData = useSetAtom(copyDataAtom);

  const [selectedDomain, setSelectedDomain] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Set the source domain as default when modal opens
  useEffect(() => {
    if (isOpen && sourceDomain) {
      setSelectedDomain(sourceDomain);
    }
  }, [isOpen, sourceDomain]);

  const handleCopy = async () => {
    if (!selectedDomain || !itemId) return;

    setIsLoading(true);

    try {
      // Fetch full details using config's fetch function
      // For mailbox, we need to pass the email (itemId)
      const [email_prefix, source_domain] = itemId.split("@");
      const details = await config.fetchDetails(source_domain, email_prefix);

      // Transform data using config function
      const transformedData = config.transformData(details);

      setCopyData({
        type: config.type,
        data: transformedData,
        sourceId: itemId,
        sourceName: itemName,
        sourceDomain: source_domain,
        targetDomain: selectedDomain,
        isLoading: false,
        error: null,
      });

      navigate(config.copyRoute(selectedDomain));
      onClose();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch details";
      toast("error", message);
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card border-border mx-4 w-full max-w-2xl rounded-lg border text-left shadow-lg">
        {/* Header */}
        <div className="border-border flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary rounded-lg p-2">
              <Copy className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-card-foreground text-lg font-semibold">
                {config.title}
              </h2>
              <p className="text-muted-foreground text-sm">
                Create a copy in selected domain
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 px-6 py-6">
          {/* Source Info */}
          <div className="bg-muted/30 border-border/50 rounded-lg border p-4">
            <label className="text-card-foreground mb-2 block text-sm font-medium">
              Source {config.itemDisplayName}
            </label>
            <div className="text-foreground text-base font-medium">
              {itemName}
            </div>
            <div className="text-muted-foreground mt-1 text-sm">
              From: {sourceDomain}
            </div>
          </div>

          {/* Domain Selector */}
          <div className="bg-muted/30 border-border/50 rounded-lg border p-4">
            <label className="text-card-foreground mb-3 block text-sm font-medium">
              Target Domain
              <span className="text-destructive"> *</span>
            </label>
            <div className="min-w-lg flex justify-items-start">
              <DomainSelector
                domainName={selectedDomain}
                setDomainName={setSelectedDomain}
              />
            </div>
            <p className="text-muted-foreground mt-2 text-xs">
              Select the domain where you want to copy this{" "}
              {config.itemDisplayName.toLowerCase()}
            </p>
          </div>

          {/* Info Note */}
          <div className="bg-primary/5 border-primary/20 rounded-lg border p-4">
            <p className="text-card-foreground text-sm">
              <strong>Note:</strong> All content and settings will be copied.
              You can modify them before saving.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-border flex items-center justify-end gap-3 border-t px-6 py-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="hover:bg-accent border-border rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCopy}
            disabled={!selectedDomain || isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Continue to Edit
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CopyDomainModal;
