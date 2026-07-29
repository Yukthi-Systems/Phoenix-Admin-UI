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

import { useAtomValue } from "jotai";
import { Link, useNavigate, useParams } from "react-router-dom";
import { userProfileAtom } from "@/store/userProfile";
import {
  useDeleteDomain,
  useGetDomain,
  useGetDomainTxtKey,
  useUpdateDomainSpace,
  useUpdateDomainStatus,
  useVerifyDomainDns,
} from "@/hooks/useDomain";
import DataFechError from "@/components/common/DataFechError";
import AccessDenied from "@/components/common/AccessDenied";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import {
  BackButton,
  Button,
  DeleteButton,
  EditButton,
} from "@/components/common/Buttons";
import DataLoading from "@/components/common/DataLoading";
import {
  Globe,
  Shield,
  HardDrive,
  Users,
  Mail,
  Check,
  X,
  XCircle,
  CheckCircle,
  ChartPie,
  Trash2,
  SquarePen,
  Database,
  Network,
  Key,
  Clock,
  Timer,
  FileCheck,
  AlertTriangle,
  Copy,
  Building2,
  MessageSquareWarning,
  FileText,
} from "lucide-react";
import DataErrorWithReload from "@/components/common/DataErrorWithReload";
import { useMemo, useState } from "react";
import DeleteModelBox from "@/components/common/DeleteModelBox";
import { useToastify } from "@/hooks/useToastify";
import { userInfoAtom } from "@/store/userInfo";
import { InfoCard, InfoItem } from "@/components/common/InfoCard";
import { useQueryClient } from "@tanstack/react-query";
import DNSRecordsModal from "../list/DNSRecord";
import EditModelBox from "@/components/common/EditModelBox";
import DropdownButton from "@/components/common/DropdownButton";
import { useGetOrganizationDetail } from "@/hooks/useOrganization";
import { useUserTimezone } from "@/hooks/useTimezone";

const DomainDetails = () => {
  const toast = useToastify();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusValue, setStatusValue] = useState(false);
  const [statusId, setStatusId] = useState("");
  const [showSpaceModal, setShowSpaceModal] = useState(false);
  const [spaceValue, setSpaceValue] = useState("");
  const [spaceId, setSpaceId] = useState("");
  const [currentDomainData, setCurrentDomainData] = useState(null);
  const [showDNSModal, setShowDNSModal] = useState(false);
  const [selectedDomainForDNS, setSelectedDomainForDNS] = useState(null);
  const [dnsRecords, setDnsRecords] = useState([]);
  const [isLoadingDNS, setIsLoadingDNS] = useState(false);
  const [txtCopySuccess, setTxtCopySuccess] = useState(false);
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const { organization_id } = useAtomValue(userInfoAtom);
  const { domain_name: rawDomainName } = useParams();
  const domain_name = decodeURIComponent(rawDomainName);
  const { mutate, isPending } = useDeleteDomain();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useGetDomain(domain_name);
  const domain = data?.domain_details ?? null;
  const { mutate: statusUpdate, isPending: statusLoad } =
    useUpdateDomainStatus();
  const { mutate: spaceUpdate, isPending: spaceLoad } = useUpdateDomainSpace();
  const { mutate: verifyDns, isPending: verifyLoad } = useVerifyDomainDns();
  const { data: txtKeyData, isLoading: txtKeyLoading } = useGetDomainTxtKey(
    domain && !domain.is_dns_txt_verified ? domain_name : undefined,
  );
  const { data: managingOrg } = useGetOrganizationDetail(domain?.managed_by);
  const { formatUserDateNice } = useUserTimezone();
  const [phishingCodeCopied, setPhishingCodeCopied] = useState(false);

  const handleCopyPhishingCode = async () => {
    try {
      await navigator.clipboard.writeText(
        domain?.anti_phishing_secret_code || "",
      );
      setPhishingCodeCopied(true);
      setTimeout(() => setPhishingCodeCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleCopyTxtKey = async () => {
    try {
      await navigator.clipboard.writeText(
        txtKeyData?.dns_txt_verification_key || "",
      );
      setTxtCopySuccess(true);
      setTimeout(() => setTxtCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleVerifyDns = () => {
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
                queryClient.invalidateQueries(["domain", domain_name]);
                queryClient.invalidateQueries(["domain_txt_key", domain_name]);
              },
              onError: (error) => {
                toast(
                  "warning",
                  "Domain was verified, but activating it failed. Please activate it manually from More Actions.",
                );
                console.error(error);
                queryClient.invalidateQueries(["domain", domain_name]);
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
          queryClient.invalidateQueries(["domain", domain_name]);
          queryClient.invalidateQueries(["domain_txt_key", domain_name]);
        },
      },
    );
  };

  const handleDNSModalClose = () => {
    setShowDNSModal(false);
    setSelectedDomainForDNS(null);
    setDnsRecords([]);
  };

  const handleViewDNS = (row) => {
    setSelectedDomainForDNS(row.domain_name);
    setShowDNSModal(true);
  };

  const refreshDNSRecords = () => {
    if (selectedDomainForDNS) {
      // loadDNSRecords(selectedDomainForDNS);
    }
  };

  const handleStatus = (row) => {
    setStatusId(row.domain_name);
    setStatusValue(!row.is_active);
    setShowStatusModal(true);
  };

  const handleStatusClose = () => {
    setStatusId("");
    setStatusValue(false);
    setShowStatusModal(false);
  };

  const handleSpace = (row) => {
    setSpaceId(row.domain_name);
    setSpaceValue(row.quota_allocated);
    setShowSpaceModal(true);
    setCurrentDomainData(row);
  };

  const handleSpaceClose = () => {
    setSpaceId("");
    setSpaceValue("");
    setShowSpaceModal(false);
  };

  const OnStatusChange = () => {
    if (statusId) {
      statusUpdate(
        { organization_id, domain_name: statusId, status: statusValue },
        {
          onSuccess: () => {
            toast("success", "Successfully update domain status");
            queryClient.invalidateQueries(["domain", domain_name]);
            setShowStatusModal(false);
            setStatusId("");
            setStatusValue(false);
          },
          onError: (error) => {
            const message =
              error.response?.data?.message || error.message || "Unknown error";
            const tracebackId = error.response?.data?.traceback_id;
            toast(
              "error",
              `Message: ${message}${tracebackId ? `\nTraceback ID: ${tracebackId}` : ""}`,
            );
            console.error(error);
          },
        },
      );
    } else {
      toast("error", `Message: 'Unknown error'`);
    }
  };

  const OnSpaceChange = () => {
    if (spaceId) {
      spaceUpdate(
        { organization_id, domain_name: spaceId, space: spaceValue },
        {
          onSuccess: () => {
            toast("success", "Successfully update domain status");
            queryClient.invalidateQueries(["domain", domain_name]);
            setSpaceId("");
            setSpaceValue("");
            setShowSpaceModal(false);
          },
          onError: (error) => {
            const message =
              error.response?.data?.message || error.message || "Unknown error";
            const tracebackId = error.response?.data?.traceback_id;
            toast(
              "error",
              `Message: ${message}${tracebackId ? `\nTraceback ID: ${tracebackId}` : ""}`,
            );
            console.error(error);
          },
        },
      );
    } else {
      toast("error", `Message: 'Unknown error'`);
    }
  };

  const OnDelete = (deleteId) => {
    if (deleteId) {
      mutate(
        { organization_id, domain_name: deleteId },
        {
          onSuccess: () => {
            toast("success", "Domain deleted successfully");
            navigate(-1);
          },
          onError: (error) => {
            const message =
              error.response?.data?.message ||
              error?.message ||
              "Unknown error";
            const tracebackId = error.response?.data?.traceback_id;
            toast(
              "error",
              `Message: ${message}${tracebackId ? `\nTraceback ID: ${tracebackId}` : ""}`,
            );
            console.error(error);
          },
        },
      );
      setShowDeleteModal(false);
    } else {
      toast("error", `Message:'Unknown error'`);
    }
  };

  const OnCancel = () => {
    setShowDeleteModal(false);
  };

  const actionOptions = useMemo(() => {
    const options = [];

    if (permissions.includes("domain:edit") && !isLoading) {
      const canToggleActivation = domain?.is_active || domain?.is_dns_txt_verified;

      options.push({
        label: domain?.is_active ? "Deactivate Domain" : "Activate Domain",
        description: !canToggleActivation
          ? "Verify the domain's DNS TXT record before activating"
          : domain?.is_active
            ? "Deactivate this domain"
            : "Activate this domain",
        icon: domain?.is_active ? (
          <XCircle className="h-4 w-4 text-destructive" />
        ) : (
          <CheckCircle className="h-4 w-4 text-success" />
        ),
        disabled: !canToggleActivation,
        onClick: () => handleStatus(domain),
      });

      options.push({
        label: "View DNS Records",
        description: domain?.is_dns_txt_verified
          ? "View domain DNS configuration"
          : "Verify the domain's DNS TXT record first",
        icon: <Globe className="h-4 w-4" />,
        disabled: !domain?.is_dns_txt_verified,
        onClick: () => handleViewDNS(domain),
      });
    }

    if (permissions.includes("domain:delete") && !isLoading) {
      options.push({
        label: "Delete Domain",
        description: "Permanently remove this domain",
        icon: <Trash2 className="h-4 w-4 text-destructive" />,
        onClick: () => setShowDeleteModal(true),
      });
    }

    return options;
  }, [permissions, isLoading, domain]);

  const isServerError =
    !error?.response?.status || error?.response?.status >= 500;

  if (isError && isServerError)
    return <DataFechError content="Failed to fetch domains." />;
  if (!permissions.includes("domain:view"))
    return <AccessDenied content="Don't have access to view domain details." />;

  const StatusBadge = ({ active }) => (
    <div
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium ${active
        ? "bg-success/10 text-success border-success/20 border"
        : "bg-destructive/10 text-destructive border-destructive/20 border"
        }`}
    >
      {active ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <X className="h-3.5 w-3.5" />
      )}
      {active ? "Active" : "Inactive"}
    </div>
  );

  const BooleanIndicator = ({ value }) => (
    <div
      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ${value ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
        }`}
    >
      {value ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      {value ? "Yes" : "No"}
    </div>
  );

  const formatSessionTimeout = (minutes) => {
    if (minutes < 60) return `${minutes} minutes`;
    const hours = minutes / 60;
    return `${hours} hour${hours !== 1 ? "s" : ""}`;
  };

  // Helper function to display notification periods
  const NotificationPeriods = ({ notifyAt }) => {
    if (!notifyAt || !Array.isArray(notifyAt) || notifyAt.length === 0) {
      return (
        <div className="bg-muted/20 mt-2 rounded p-2 text-center">
          <span className="text-muted-foreground text-xs">
            No notification periods set
          </span>
        </div>
      );
    }

    return (
      <div className="mt-2 flex flex-wrap gap-1">
        {notifyAt.map((days, index) => (
          <div
            key={index}
            className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium"
          >
            <Clock className="h-3 w-3" />
            {days} days
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="h-full w-full px-2">
        <div className="mb-3 flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButton />
            <Breadcrumbs
              items={[
                { name: "Domain", link: `/domain` },
                { name: "View Domain" },
              ]}
            />
          </div>

          <div className="flex flex-row gap-2 justify-center items-center">
            {permissions.includes("domain:edit") && !isLoading && (
              domain?.is_dns_txt_verified ? (
                <Link to={`/domain/edit/${domain_name}`}>
                  <Button variant="primary" icon={SquarePen}>
                    Edit Domain
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="primary"
                  icon={SquarePen}
                  disabled
                  title="Verify the domain's DNS TXT record before editing"
                >
                  Edit Domain
                </Button>
              )
            )}

            {actionOptions.length > 0 && (
              <DropdownButton
                label="More Actions"
                variant="outline"
                options={actionOptions}
              />
            )}
          </div>
        </div>

        <div className="no-scrollbar h-[calc(100vh-150px)] w-full">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <DataLoading content="Loading domain details." />
            </div>
          ) : isError && !isServerError ? (
            <DataErrorWithReload content={error?.response?.data?.message} />
          ) : (
            <div className="space-y-4 pb-4">
              <div className="from-primary/8 to-primary/3 border-border rounded-lg border bg-gradient-to-r p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/15 rounded-lg p-2">
                      <Globe className="text-primary h-6 w-6" />
                    </div>
                    <div>
                      <h1 className="text-card-foreground text-left text-xl font-bold">
                        {domain.domain_name}
                      </h1>
                      <p className="text-muted-foreground text-left text-sm">
                        Domain Configuration
                      </p>
                    </div>
                  </div>
                  <StatusBadge active={domain.is_active} />
                </div>
              </div>

              {!domain.is_dns_txt_verified && (
                <div className="border-warning/30 bg-warning/5 rounded-lg border p-5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="text-warning h-5 w-5 shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-card-foreground text-left font-semibold">
                          Domain not verified
                        </h3>
                        <p className="text-muted-foreground text-left text-sm">
                          Add the TXT record below to this domain's DNS
                          settings at your registrar, then click Validate to
                          verify ownership and activate the domain.
                        </p>
                      </div>

                      <div className="bg-background border-border flex items-center gap-2 rounded-md border p-3">
                        {txtKeyLoading ? (
                          <span className="text-muted-foreground text-sm">
                            Loading TXT record...
                          </span>
                        ) : (
                          <>
                            <code className="flex-1 break-all text-left font-mono text-sm">
                              {txtKeyData?.dns_txt_verification_key}
                            </code>
                            <button
                              onClick={handleCopyTxtKey}
                              className="hover:bg-accent shrink-0 rounded p-1.5 transition-colors"
                              title="Copy to clipboard"
                            >
                              {txtCopySuccess ? (
                                <CheckCircle className="text-success h-4 w-4" />
                              ) : (
                                <Copy className="text-muted-foreground h-4 w-4" />
                              )}
                            </button>
                          </>
                        )}
                      </div>

                      <Button
                        variant="primary"
                        size="sm"
                        loading={verifyLoad || statusLoad}
                        disabled={txtKeyLoading}
                        onClick={handleVerifyDns}
                      >
                        Validate
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <InfoCard icon={Building2} title="Domain Information">
                  <InfoItem
                    label="Managed By"
                    value={
                      managingOrg?.organization_name || domain?.managed_by
                    }
                    link={
                      domain?.managed_by
                        ? `/organization/${domain.managed_by}`
                        : undefined
                    }
                  />
                  <InfoItem
                    label="Created"
                    value={
                      domain?.created_at
                        ? formatUserDateNice(domain.created_at)
                        : "Unknown"
                    }
                  />
                  <InfoItem
                    label="Address"
                    value={domain?.details?.address || "Not set"}
                  />
                  <InfoItem
                    label="Description"
                    value={domain?.details?.description || "Not set"}
                  />
                  <InfoItem
                    label="Anti-Phishing Code"
                    value={
                      <button
                        onClick={handleCopyPhishingCode}
                        className="group flex items-center justify-end gap-1.5 p-0 m-0 bg-transparent border-none cursor-pointer text-right"
                        title="Copy to clipboard"
                      >
                        <span className="text-sm font-medium text-card-foreground text-right break-all">
                          {domain?.anti_phishing_secret_code || "Not set"}
                        </span>
                        {phishingCodeCopied ? (
                          <CheckCircle className="h-3.5 w-3.5 text-success shrink-0" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                        )}
                      </button>
                    }
                  />
                </InfoCard>

                <InfoCard icon={MessageSquareWarning} title="Caution Message">
                  {domain?.caution_id ? (
                    <>
                      <InfoItem
                        label="Status"
                        value={<BooleanIndicator value={true} />}
                      />
                      <InfoItem
                        label="Caution ID"
                        link={`/caution/${domain.caution_id}`}
                        value={domain.caution_id}
                      />
                    </>
                  ) : (
                    <>
                      <InfoItem
                        label="Status"
                        value={<BooleanIndicator value={false} />}
                      />
                      <div className="bg-muted/20 mt-2 rounded p-2 text-center">
                        <span className="text-muted-foreground text-xs">
                          No caution message configured
                        </span>
                      </div>
                    </>
                  )}
                </InfoCard>

                <InfoCard icon={FileText} title="Disclaimer">
                  {domain?.disclaimer_id ? (
                    <>
                      <InfoItem
                        label="Status"
                        value={<BooleanIndicator value={true} />}
                      />
                      <InfoItem
                        label="Disclaimer ID"
                        link={`/disclaimer/${domain.disclaimer_id}`}
                        value={domain.disclaimer_id}
                      />
                    </>
                  ) : (
                    <>
                      <InfoItem
                        label="Status"
                        value={<BooleanIndicator value={false} />}
                      />
                      <div className="bg-muted/20 mt-2 rounded p-2 text-center">
                        <span className="text-muted-foreground text-xs">
                          No disclaimer configured
                        </span>
                      </div>
                    </>
                  )}
                </InfoCard>

                <InfoCard icon={Shield} title="Spam Protection">
                  <InfoItem
                    label="Destination"
                    value={domain.spam_destination}
                  />
                  <InfoItem
                    label="Description"
                    value={domain.spam_destination_properties.description}
                  />
                  <InfoItem
                    label="Folder"
                    value={domain.spam_destination_properties.folder_name ? decodeURIComponent(domain.spam_destination_properties.folder_name) : ""}
                  />
                </InfoCard>

                <InfoCard icon={Mail} title="Email Forwarding">
                  <InfoItem
                    label="Catch All"
                    value={<BooleanIndicator value={domain?.catch_all} />}
                  />
                  {domain?.catch_all && (
                    <InfoItem
                      label="Forward To"
                      value={domain?.catch_all_forward_to_email}
                    />
                  )}
                  {!domain?.catch_all && (
                    <div className="bg-muted/20 mt-2 rounded p-2 text-center">
                      <span className="text-muted-foreground text-left text-xs">
                        Catch all forwarding is disabled
                      </span>
                    </div>
                  )}
                </InfoCard>

                <InfoCard icon={Key} title="Password Policy">
                  <InfoItem
                    label="Max Age"
                    value={
                      domain.max_password_age > 0
                        ? `${domain.max_password_age} days`
                        : "Disabled"
                    }
                  />

                  {domain.max_password_age > 0 ? (
                    <div className="space-y-2">
                      <div className="border-border mt-3 border-t pt-3">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-foreground text-xs font-medium">
                            Notification Schedule
                          </span>
                          <BooleanIndicator
                            value={
                              domain?.max_password_age_properties
                                ?.enable_max_password_age || false
                            }
                          />
                        </div>
                        <NotificationPeriods
                          notifyAt={
                            domain?.max_password_age_properties?.notify_at
                          }
                        />
                      </div>
                      <div className="text-muted-foreground mt-2 text-xs">
                        Users will be notified at the specified days before
                        password expiry
                      </div>
                    </div>
                  ) : (
                    <div className="bg-muted/20 mt-2 rounded p-2 text-center">
                      <span className="text-muted-foreground text-xs">
                        Password age restrictions are disabled
                      </span>
                    </div>
                  )}
                </InfoCard>

                <InfoCard icon={Timer} title="Session Timeout">
                  <InfoItem
                    label="Timeout Duration"
                    value={formatSessionTimeout(domain?.session_timeout || 720)}
                  />
                  <div className="border-border mt-3 border-t pt-3">
                    <div className="text-muted-foreground flex items-center gap-2 text-xs">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="text-left">
                        User sessions expire after this period of inactivity
                      </span>
                    </div>
                  </div>
                </InfoCard>

                {/* Filter Policy Card - NEW */}
                <InfoCard icon={FileCheck} title="Filter Policy">
                  {domain?.filter_policy_id ? (
                    <>
                      <InfoItem
                        label="Policy Status"
                        value={<BooleanIndicator value={true} />}
                      />
                      <InfoItem
                        label="Policy ID"
                        link={`/policies/filters/${domain.filter_policy_id}`}
                        value={domain.filter_policy_id}
                      />
                      <div className="border-border mt-3 border-t pt-3">
                        <div className="text-primary flex items-center gap-2 text-xs">
                          <Shield className="h-3.5 w-3.5" />
                          <span className="text-left">
                            Active filtering policy applied
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <InfoItem
                        label="Policy Status"
                        value={<BooleanIndicator value={false} />}
                      />
                      <div className="bg-muted/20 mt-2 rounded p-2 text-center">
                        <span className="text-muted-foreground text-xs">
                          No filter policy configured
                        </span>
                      </div>
                    </div>
                  )}
                </InfoCard>

                <InfoCard icon={FileCheck} title="Attachment Policy">
                  {domain?.attachment_policy_id ? (
                    <>
                      <InfoItem
                        label="Policy Status"
                        value={<BooleanIndicator value={true} />}
                      />
                      <InfoItem
                        label="Policy ID"
                        link={`/policies/attachments/${domain.attachment_policy_id}/${domain.domain_name}`}
                        value={domain.attachment_policy_id}
                      />
                      <div className="border-border mt-3 border-t pt-3">
                        <div className="text-primary flex items-center gap-2 text-xs">
                          <Shield className="h-3.5 w-3.5" />
                          <span className="text-left">
                            Active attachment policy applied
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <InfoItem
                        label="Policy Status"
                        value={<BooleanIndicator value={false} />}
                      />
                      <div className="bg-muted/20 mt-2 rounded p-2 text-center">
                        <span className="text-muted-foreground text-xs">
                          No attachement policy configured
                        </span>
                      </div>
                    </div>
                  )}
                </InfoCard>

                {domain?.is_hybrid && (
                  <InfoCard icon={Network} title="Hybrid Connector">
                    <InfoItem
                      label="Description"
                      value={domain.connector_properties.description}
                    />
                    <InfoItem
                      label="FQDN"
                      value={domain.connector_properties.fqdn}
                    />
                    <InfoItem
                      label="IPv4 Address"
                      value={domain.connector_properties.ipv4}
                    />
                    <InfoItem
                      label="IPv6 Address"
                      value={
                        domain.connector_properties.ipv6 || "Not configured"
                      }
                    />
                    <InfoItem
                      label="Port"
                      value={domain.connector_properties.port}
                    />
                  </InfoCard>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <DeleteModelBox
        isOpen={showDeleteModal}
        handleCancel={OnCancel}
        handleDelete={() => OnDelete(domain_name)}
        value={domain_name || ""}
        isLoading={isPending}
        requireConfirmation={true}
        confirmationText={domain_name}
        confirmationPlaceholder={`Type "${domain_name}" to confirm`}
        confirmationLabel="Please type the domain name exactly to confirm deletion:"
        title="Delete Domain"
        description="This action cannot be undone and will remove all domain data."
      />

      {showStatusModal && (
        <EditModelBox
          isOpen={showStatusModal}
          label="Change Status"
          handleCancel={handleStatusClose}
        >
          <div className="w-xl">
            <p className="mb-3 text-lg font-medium">Are you sure?</p>
            <p className="mb-3 text-base">
              You want{" "}
              <>
                {statusValue ? (
                  <span className="font-medium text-green-400">Active</span>
                ) : (
                  <span className="font-medium text-red-400">In-active</span>
                )}
              </>{" "}
              {statusId} .
            </p>
            <div className="mx-4 my-2 mt-12 flex items-center justify-end gap-3">
              <Button
                disabled={statusLoad}
                onClick={handleStatusClose}
                variant="outline"
                size="md"
              >
                Cancel
              </Button>

              <Button
                disabled={statusLoad}
                onClick={OnStatusChange}
                variant="primary"
                size="md"
              >
                Confirm
              </Button>
            </div>
          </div>
        </EditModelBox>
      )}

      <DNSRecordsModal
        isOpen={showDNSModal}
        onClose={handleDNSModalClose}
        domainName={selectedDomainForDNS}
        dnsRecords={dnsRecords}
        isLoading={isLoadingDNS}
        onRefresh={refreshDNSRecords}
      />
    </>
  );
};

export default DomainDetails;
