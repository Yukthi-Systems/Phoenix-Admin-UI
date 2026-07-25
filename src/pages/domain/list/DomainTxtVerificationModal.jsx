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

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { parse as parseDomain } from "tldts";
import { AlertTriangle, Copy, CheckCircle, Globe } from "lucide-react";
import {
  useGetDomainTxtKey,
  useVerifyDomainDns,
  useUpdateDomainStatus,
} from "@/hooks/useDomain";
import { useToastify } from "@/hooks/useToastify";
import { Button } from "@/components/common/Buttons";

// Most DNS providers ask for the record's host/name separately from its
// value. A root domain's records live at its own zone apex ("@"), but a
// subdomain's records live in its parent zone under just the subdomain
// label - "@" would be wrong there and is what confuses people.
//
// This has to be public-suffix-aware (via tldts), not a naive dot-count
// heuristic - a domain like "mail25.co.in" has 3 labels but is a root
// domain, not a subdomain of "co.in" ("co.in" is a public suffix, same
// class of thing as "co.uk"/"com.au", not a real registrable zone).
const getDomainHostInfo = (domain) => {
  const trimmed = (domain || "").trim().toLowerCase();
  if (!trimmed) return { host: "@", isSubdomain: false, parentZone: "" };

  const parsed = parseDomain(trimmed);
  if (!parsed.domain || !parsed.subdomain) {
    return { host: "@", isSubdomain: false, parentZone: parsed.domain || trimmed };
  }

  return {
    host: parsed.subdomain,
    isSubdomain: true,
    parentZone: parsed.domain,
  };
};

const DomainTxtVerificationModal = ({
  isOpen,
  onClose,
  domain_name,
  organization_id,
  initialTxtKey,
  onVerified,
}) => {
  const [copiedField, setCopiedField] = useState(null);
  const toast = useToastify();
  const queryClient = useQueryClient();

  const { data: txtKeyData, isLoading: txtKeyLoading } = useGetDomainTxtKey(
    isOpen && !initialTxtKey ? domain_name : undefined,
  );
  const { mutate: verifyDns, isPending: verifyLoad } = useVerifyDomainDns();
  const { mutate: statusUpdate, isPending: statusLoad } =
    useUpdateDomainStatus();

  if (!isOpen) return null;

  const txtValue = initialTxtKey || txtKeyData?.dns_txt_verification_key || "";
  const { host, isSubdomain, parentZone } = getDomainHostInfo(domain_name);

  const handleCopy = async (field, value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const invalidateAll = () => {
    queryClient.invalidateQueries(["domain", domain_name]);
    queryClient.invalidateQueries(["domain_txt_key", domain_name]);
    queryClient.invalidateQueries(["domains"]);
  };

  const handleValidate = () => {
    verifyDns(
      { domain_name },
      {
        onSuccess: () => {
          // Verifying only clears the DNS-verified flag server-side, it never
          // flips is_active on by itself - do that explicitly here.
          statusUpdate(
            { organization_id, domain_name, status: true },
            {
              onSuccess: () => {
                toast(
                  "success",
                  "Domain DNS TXT record verified and domain activated successfully",
                );
                invalidateAll();
                onVerified?.();
                onClose();
              },
              onError: (error) => {
                toast(
                  "warning",
                  "Domain was verified, but activating it failed. Please activate it manually from More Actions.",
                );
                console.error(error);
                invalidateAll();
              },
            },
          );
        },
        onError: (error) => {
          if (error?.isVerificationMismatch) {
            toast(
              "warning",
              error.message ||
                "TXT record not found or doesn't match yet. Please double-check your DNS settings and try again (DNS changes can take time to propagate).",
            );
          } else {
            const message =
              error.response?.data?.message ||
              error.message ||
              "Unknown error";
            const tracebackId = error.response?.data?.traceback_id;
            toast(
              "error",
              `Message: ${message}${tracebackId ? `\nTraceback ID: ${tracebackId}` : ""}`,
            );
            console.error(error);
          }
          invalidateAll();
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative text-left bg-background border border-border rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3 p-6 border-b border-border">
          <div className="bg-primary/15 rounded-lg p-2">
            <Globe className="text-primary h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Verify Domain Ownership
            </h2>
            <p className="text-sm text-muted-foreground">{domain_name}</p>
          </div>
        </div>

        <div className="p-6">
          <div className="from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/10 border-amber-300 dark:border-amber-800 mb-5 rounded-xl border bg-gradient-to-r p-4">
            <div className="flex gap-3 items-start">
              <AlertTriangle
                className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5"
                size={20}
              />
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <p className="font-semibold mb-1">
                  Domain inactive until verified
                </p>
                <p>
                  Add the TXT record below to this domain's DNS settings at
                  your registrar, then click Validate to verify ownership and
                  activate the domain.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-muted/30 border-border mb-5 rounded-xl border p-5 space-y-5">
            <div className="space-y-3">
              <label className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Record Type
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 bg-background border-border rounded-lg border">
                  <code className="font-mono text-sm text-foreground">TXT</code>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Host / Name
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 bg-background border-border rounded-lg border">
                  <code className="font-mono text-sm break-all text-foreground">
                    {host}
                  </code>
                </div>
                <button
                  onClick={() => handleCopy("host", host)}
                  className="p-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
                  title="Copy to clipboard"
                >
                  {copiedField === "host" ? (
                    <CheckCircle size={18} />
                  ) : (
                    <Copy size={18} />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {isSubdomain ? (
                  <>
                    <strong>{domain_name}</strong> is a subdomain, so add this
                    record in your <strong>{parentZone}</strong> DNS zone
                    using host <strong>"{host}"</strong> — not "@".
                  </>
                ) : (
                  <>
                    Add this record directly on <strong>{domain_name}</strong>{" "}
                    using host <strong>"@"</strong> (some providers call this
                    "root" or leave the host field blank).
                  </>
                )}
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Value
              </label>
              <div className="flex items-center gap-2">
                {txtKeyLoading ? (
                  <span className="text-muted-foreground text-sm">
                    Loading TXT record...
                  </span>
                ) : (
                  <>
                    <div className="flex-1 p-3 bg-background border-border rounded-lg border">
                      <code className="font-mono text-sm break-all text-foreground">
                        {txtValue}
                      </code>
                    </div>
                    <button
                      onClick={() => handleCopy("value", txtValue)}
                      className="p-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
                      title="Copy to clipboard"
                    >
                      {copiedField === "value" ? (
                        <CheckCircle size={18} />
                      ) : (
                        <Copy size={18} />
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-border">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg font-medium border border-border text-foreground hover:bg-accent transition-colors"
            >
              Close
            </button>
            <Button
              variant="primary"
              loading={verifyLoad || statusLoad}
              disabled={txtKeyLoading || !txtValue}
              onClick={handleValidate}
            >
              Validate
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DomainTxtVerificationModal;
