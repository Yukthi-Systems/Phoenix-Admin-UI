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
  useDeleteOrganization,
  useGetOrganizationDetail,
  useUpdateOrganizationStatus,
  useRenameOrganizationStatus,
  useUpdateOrganizationSpace,
  useUpdateOrganizationIdentityQuota,
} from "@/hooks/useOrganization";
import DataFechError from "@/components/common/DataFechError";
import AccessDenied from "@/components/common/AccessDenied";
import { BackButton, Button } from "@/components/common/Buttons";
import DropdownButton from "@/components/common/DropdownButton";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import DataLoading from "@/components/common/DataLoading";
import { useState, useMemo } from "react";
import { useToastify } from "@/hooks/useToastify";
import DeleteModelBox from "@/components/common/DeleteModelBox";
import DeleteBlockedModal from "@/components/common/DeleteBlockedModal";
import EditModelBox from "@/components/common/EditModelBox";
import SpaceAllocationModal from "../list/SpaceAllocation";
import IdentityAllocationModal from "../list/IdentityAllocation";
import { usePreDeleteCheck } from "@/hooks/usePreDeleteCheck";
import { getOrganizations } from "@/api/organizations";
import { getDomains } from "@/api/domain";
import {
  HardDrive,
  Globe,
  Phone,
  MapPin,
  Mail,
  Check,
  X,
  Users,
  UserCog,
  FileText,
  ExternalLink,
  SquarePen,
  XCircle,
  CheckCircle,
  ChartPie,
  Trash2,
  Edit,
  MessageSquare,
  LayoutGrid,
} from "lucide-react";
import OrganizationLogo from "@/components/shared/OrgLogo";
import CopyButton from "@/components/common/CopyId";
import { InfoCard, InfoItem } from "@/components/common/InfoCard";

const OrganizationDetails = () => {
  const { org_id } = useParams();
  const { permissions = [], organization_id } =
    useAtomValue(userProfileAtom) || {};

  const navigate = useNavigate();
  const toast = useToastify();

  // State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showSpaceModal, setShowSpaceModal] = useState(false);
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [orgName, setOrgName] = useState("");
  const {
    runCheck: runDeleteCheck,
    checkingId: checkingDeleteId,
    blockInfo: deleteBlockInfo,
    clearBlock: clearDeleteBlock,
  } = usePreDeleteCheck();

  // Queries & Mutations
  const { data, isLoading, isError, refetch } =
    useGetOrganizationDetail(org_id);
  const organization_details = data ?? null;

  const { mutate: deleteOrg, isPending: isDeletePending } =
    useDeleteOrganization();
  const { mutate: statusUpdate, isPending: statusLoad } =
    useUpdateOrganizationStatus();
  const { mutate: spaceUpdate, isPending: spaceLoad } =
    useUpdateOrganizationSpace();
  const { mutate: identityUpdate, isPending: identityLoad } =
    useUpdateOrganizationIdentityQuota();
  const { mutate: renameOrg, isPending: renameLoad } =
    useRenameOrganizationStatus();

  const { data: defaultOrgDetails } = useGetOrganizationDetail(organization_id);
  const { data: parentOrgDetails } = useGetOrganizationDetail(
    organization_details?.parent_organization_id,
  );
  const parentIsActive =
    !organization_details?.parent_organization_id || !!parentOrgDetails?.is_active;
  const rootParentAvailableSpace =
    defaultOrgDetails?.quota_allocated - defaultOrgDetails?.quota_utilized;
  const rootParentAvailableIdentities =
    defaultOrgDetails?.allocated_email_identities === -1
      ? -1
      : (defaultOrgDetails?.allocated_email_identities ?? 0) -
        (defaultOrgDetails?.utilized_email_identities ?? 0);
  // Actions
  const OnDelete = () => {
    if (organization_details?.organization_id) {
      deleteOrg(
        { organization_id: organization_details.organization_id },
        {
          onSuccess: () => {
            toast("success", "Successfully deleted organization");
            navigate("/organization");
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
      setShowDeleteModal(false);
    }
  };

  const handleDeleteClick = () => {
    const id = organization_details?.organization_id;
    if (!id) return;
    runDeleteCheck({
      id,
      name: organization_details?.organization_name,
      checks: [
        {
          label: "sub-organization",
          fn: async (orgId) => (await getOrganizations(1, 1, orgId))?.total_count ?? 0,
        },
        {
          label: "domain",
          fn: async (orgId) => (await getDomains(orgId, 1, 1))?.domains?.total_count ?? 0,
        },
      ],
      onClear: () => setShowDeleteModal(true),
    });
  };

  const OnStatusChange = () => {
    if (organization_details?.organization_id) {
      statusUpdate(
        {
          organization_id: organization_details.organization_id,
          status: !organization_details.is_active,
        },
        {
          onSuccess: () => {
            toast("success", "Successfully updated organization status");
            refetch();
            setShowStatusModal(false);
          },
          onError: (error) => {
            const message =
              error.response?.data?.message || error.message || "Unknown error";
            toast("error", `Message: ${message}`);
          },
        },
      );
    }
  };

  const OnRename = () => {
    if (organization_details?.organization_id && orgName) {
      renameOrg(
        {
          organization_id: organization_details.organization_id,
          name: orgName,
        },
        {
          onSuccess: () => {
            toast("success", "Successfully renamed organization");
            refetch();
            setShowRenameModal(false);
            setOrgName("");
          },
          onError: (error) => {
            const message =
              error.response?.data?.message || error.message || "Unknown error";
            toast("error", `Message: ${message}`);
          },
        },
      );
    }
  };

  const OnSpaceChange = (allocationData) => {
    spaceUpdate(allocationData, {
      onSuccess: () => {
        toast("success", "Successfully updated organization space allocation");
        refetch();
        setShowSpaceModal(false);
      },
      onError: (error) => {
        const message =
          error.response?.data?.message || error.message || "Unknown error";
        toast("error", `Message: ${message}`);
      },
    });
  };

  const OnIdentityChange = (allocationData) => {
    identityUpdate(allocationData, {
      onSuccess: () => {
        toast("success", "Successfully updated organization identity allocation");
        refetch();
        setShowIdentityModal(false);
      },
      onError: (error) => {
        const message =
          error.response?.data?.message || error.message || "Unknown error";
        toast("error", `Message: ${message}`);
      },
    });
  };

  // Handler Openers
  const handleRenameOpen = () => {
    setOrgName(organization_details?.organization_name || "");
    setShowRenameModal(true);
  };

  const handleStatusOpen = () => {
    setShowStatusModal(true);
  };

  const handleSpaceOpen = () => {
    setShowSpaceModal(true);
  };

  const handleIdentityOpen = () => {
    setShowIdentityModal(true);
  };

  // Dropdown Options
  const actionOptions = useMemo(() => {
    const options = [];

    if (permissions.includes("organization:edit") && !isLoading) {
      const activateBlocked =
        !organization_details?.is_active && !parentIsActive;

      options.push({
        label: organization_details?.is_active ? "Deactivate" : "Activate",
        description: organization_details?.is_active
          ? "Deactivate this organization"
          : activateBlocked
            ? "Parent organization is inactive"
            : "Activate this organization",
        icon: organization_details?.is_active ? (
          <XCircle className="h-4 w-4 text-destructive" />
        ) : (
          <CheckCircle className="h-4 w-4 text-success" />
        ),
        onClick: handleStatusOpen,
        disabled: activateBlocked,
      });

      options.push({
        label: "Manage Quota",
        description: "Adjust storage allocation",
        icon: <ChartPie className="h-4 w-4" />,
        onClick: handleSpaceOpen,
      });

      options.push({
        label: "Manage Identities",
        description: "Adjust email identity allocation",
        icon: <UserCog className="h-4 w-4" />,
        onClick: handleIdentityOpen,
      });

      options.push({
        label: "Rename Organization",
        description: "Change organization name",
        icon: <Edit className="h-4 w-4" />,
        onClick: handleRenameOpen,
      });
    }

    if (permissions.includes("organization:delete") && !isLoading) {
      const isChecking =
        checkingDeleteId === organization_details?.organization_id;
      options.push({
        label: isChecking ? "Checking..." : "Delete Organization",
        description: "Permanently remove this organization",
        icon: <Trash2 className="h-4 w-4 text-destructive" />,
        onClick: handleDeleteClick,
        disabled: isChecking,
        variant: "destructive",
      });
    }

    return options;
  }, [permissions, isLoading, organization_details, checkingDeleteId, parentIsActive]);

  // Access Control & Error Handling
  if (!permissions.includes("organization:view"))
    return (
      <AccessDenied content="Don't have access to view organization details." />
    );

  if (isError)
    return <DataFechError content="Organization details getting error...!" />;

  // Components
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

  const ContactDisplay = ({ contacts }) => {
    if (!contacts || Object.keys(contacts).length === 0) {
      return (
        <div className="bg-muted/20 rounded p-3 text-center">
          <span className="text-muted-foreground text-xs">
            No contact information
          </span>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {Object.entries(contacts).map(([key, contact]) => (
          <div
            key={key}
            className="bg-muted/30 border-border rounded border p-3"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-card-foreground text-sm font-medium">
                {contact.name}
              </span>
              <span className="bg-primary/10 text-primary rounded px-2 py-1 text-xs capitalize">
                {contact.type}
              </span>
            </div>
            <div className="text-muted-foreground space-y-1 text-xs">
              {contact.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  <span>{contact.email}</span>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <span>{contact.phone}</span>
                </div>
              )}
              {contact.notes && (
                <div className="mt-1 flex items-start gap-1">
                  <FileText className="mt-0.5 h-3 w-3" />
                  <span className="text-left">{contact.notes}</span>
                </div>
              )}
            </div>
          </div>
        ))}
        <div className="border-border mt-3 border-t pt-3">
          <div className="text-primary flex items-center gap-2 text-xs">
            <Users className="h-3.5 w-3.5" />
            <span className="text-left">
              {Object.keys(contacts).length} contact
              {Object.keys(contacts).length !== 1 ? "s" : ""} configured
            </span>
          </div>
        </div>
      </div>
    );
  };

  const BranchDisplay = ({ branches }) => {
    if (!branches || Object.keys(branches).length === 0) {
      return (
        <div className="bg-muted/20 rounded p-3 text-center">
          <span className="text-muted-foreground text-xs">
            No branches configured
          </span>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {Object.entries(branches).map(([key, branch]) => (
          <div
            key={key}
            className="bg-muted/30 border-border rounded border p-3"
          >
            <div className="text-card-foreground mb-2 text-left text-sm font-medium">
              {branch.name}
            </div>
            <div className="text-muted-foreground space-y-1 text-xs">
              <div className="text-left">
                {branch.address_one && <div>{branch.address_one}</div>}
                {branch.address_two && <div>{branch.address_two}</div>}
                <div>
                  {[branch.city, branch.state, branch.pincode, branch.country]
                    .filter(Boolean)
                    .join(", ")}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div className="border-border mt-3 border-t pt-3">
          <div className="text-primary flex items-center gap-2 text-xs">
            <MapPin className="h-3.5 w-3.5" />
            <span className="text-left">
              {Object.keys(branches).length} branch
              {Object.keys(branches).length !== 1 ? "es" : ""} configured
            </span>
          </div>
        </div>
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
                { name: "Organization", link: `/organization` },
                { name: "View Organization" },
              ]}
            />
          </div>

          <div className="flex flex-row items-center justify-center gap-2">
            {permissions.includes("organization:edit") && organization_id !== organization_details?.organization_id &&
              !isLoading &&
              !isError && (
                <Link
                  to={`/organization/edit/${organization_details?.organization_id}`}
                >
                  <Button variant="primary" icon={SquarePen}>
                    Edit Organization
                  </Button>
                </Link>
              )}

            {actionOptions.length > 0 && organization_id !== organization_details?.organization_id && (
              <DropdownButton
                label="More Actions"
                variant="outline"
                options={actionOptions}
              />
            )}
          </div>
        </div>

        <div className="no-scrollbar h-[calc(100vh-140px)] w-full overflow-y-auto">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <DataLoading content="Loading organization details." />
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {/* Header Section */}
              <div className="from-primary/8 to-primary/3 border-border rounded-lg border bg-gradient-to-r p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <OrganizationLogo
                      organizationId={organization_details?.organization_id}
                      organizationName={organization_details?.organization_name}
                      rounded={false}
                      showUpload
                      size="lg"
                    />

                    <div>
                      <h1 className="text-card-foreground text-left text-xl font-bold">
                        <span className="mr-1">
                          {organization_details?.organization_name ||
                            "Organization Name"}{" "}
                        </span>
                        •
                        <span>
                          {" "}
                          {organization_details?.hierarchy_path?.length ||
                            0}{" "}
                          {organization_details?.hierarchy_path?.length == 1
                            ? "Level"
                            : "Levels"}{" "}
                        </span>
                      </h1>

                      <CopyButton
                        text={organization_details?.organization_id}
                      />
                    </div>
                  </div>
                  <StatusBadge active={organization_details?.is_active} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {/* Storage Quota */}
                <InfoCard icon={HardDrive} title="Storage Quota">
                  <InfoItem
                    label="Allocated"
                    value={`${organization_details?.quota_allocated || 0} GB`}
                  />
                  <InfoItem
                    label="Utilized"
                    value={`${organization_details?.quota_utilized || 0} GB`}
                  />
                  <div className="border-border mt-3 border-t pt-3">
                    <div className="text-muted-foreground mb-1 flex justify-between text-xs">
                      <span className="text-left">Usage</span>
                      <span className="text-right">
                        {organization_details?.quota_allocated > 0
                          ? Math.round(
                            (organization_details?.quota_utilized /
                              organization_details.quota_allocated) *
                            100,
                          )
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="bg-muted h-1.5 w-full rounded-full">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all duration-300"
                        style={{
                          width: `${organization_details?.quota_allocated > 0
                            ? Math.min(
                              (organization_details?.quota_utilized /
                                organization_details.quota_allocated) *
                              100,
                              100,
                            )
                            : 0
                            }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </InfoCard>

                {/* Email Identities */}
                <InfoCard icon={UserCog} title="Email Identities">
                  <InfoItem
                    label="Allocated"
                    value={
                      organization_details?.allocated_email_identities === -1
                        ? "Unlimited"
                        : (organization_details?.allocated_email_identities ?? 0).toLocaleString()
                    }
                  />
                  <InfoItem
                    label="Utilized"
                    value={(organization_details?.utilized_email_identities || 0).toLocaleString()}
                  />
                  {organization_details?.allocated_email_identities !== -1 && (
                    <div className="border-border mt-3 border-t pt-3">
                      <div className="text-muted-foreground mb-1 flex justify-between text-xs">
                        <span className="text-left">Usage</span>
                        <span className="text-right">
                          {organization_details?.allocated_email_identities > 0
                            ? Math.round(
                              (organization_details?.utilized_email_identities /
                                organization_details.allocated_email_identities) *
                              100,
                            )
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="bg-muted h-1.5 w-full rounded-full">
                        <div
                          className="bg-primary h-1.5 rounded-full transition-all duration-300"
                          style={{
                            width: `${organization_details?.allocated_email_identities > 0
                              ? Math.min(
                                (organization_details?.utilized_email_identities /
                                  organization_details.allocated_email_identities) *
                                100,
                                100,
                              )
                              : 0
                              }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </InfoCard>

                {/* Organization Information */}
                <InfoCard icon={Globe} title="Organization Information">
                  <InfoItem
                    label="Type"
                    value={
                      organization_details?.details?.type || "Not specified"
                    }
                  />
                  <InfoItem
                    label="GST Number"
                    value={
                      organization_details?.details?.gst_number ||
                      "Not provided"
                    }
                  />
                  {organization_details?.details?.website && (
                    <InfoItem
                      label="Website"
                      value={
                        <a
                          href={organization_details.details.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary inline-flex items-center gap-1 hover:underline"
                        >
                          Visit
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      }
                    />
                  )}
                  {organization_details?.details?.description && (
                    <div className="border-border mt-3 border-t pt-3">
                      <span className="text-muted-foreground mb-1 block text-left text-xs font-medium">
                        Description:
                      </span>
                      <p className="text-card-foreground text-left text-sm">
                        {organization_details.details.description}
                      </p>
                    </div>
                  )}
                </InfoCard>

                {/* Contact Information */}
                <InfoCard
                  icon={Users}
                  title="Contact Information"
                  className="md:col-span-1"
                >
                  <ContactDisplay
                    contacts={organization_details?.details?.contact_info}
                  />
                </InfoCard>

                {/* Branch Information */}
                <InfoCard icon={MapPin} title="Branch Information">
                  <BranchDisplay
                    branches={organization_details?.details?.branches}
                  />
                </InfoCard>

                {/* Services */}
                <InfoCard icon={LayoutGrid} title="Services">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-border/50 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 text-primary rounded-md p-1.5">
                          <Mail className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-sm font-medium">Email Service</span>
                      </div>
                      {organization_details?.email_service_enabled ? (
                        <div className="bg-success/10 text-success flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                          <Check className="h-2.5 w-2.5" /> Enabled
                        </div>
                      ) : (
                        <div className="bg-destructive/10 text-destructive flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                          <X className="h-2.5 w-2.5" /> Disabled
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-b border-border/50 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 text-primary rounded-md p-1.5">
                          <MessageSquare className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-sm font-medium">Chat Service</span>
                      </div>
                      {organization_details?.chat_service_enabled ? (
                        <div className="bg-success/10 text-success flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                          <Check className="h-2.5 w-2.5" /> Enabled
                        </div>
                      ) : (
                        <div className="bg-destructive/10 text-destructive flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                          <X className="h-2.5 w-2.5" /> Disabled
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 text-primary rounded-md p-1.5">
                          <FileText className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-sm font-medium">File Service</span>
                      </div>
                      {organization_details?.file_service_enabled ? (
                        <div className="bg-success/10 text-success flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                          <Check className="h-2.5 w-2.5" /> Enabled
                        </div>
                      ) : (
                        <div className="bg-destructive/10 text-destructive flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                          <X className="h-2.5 w-2.5" /> Disabled
                        </div>
                      )}
                    </div>
                  </div>
                </InfoCard>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteModelBox
        isOpen={showDeleteModal}
        handleCancel={() => setShowDeleteModal(false)}
        handleDelete={OnDelete}
        value={organization_details?.organization_name || ""}
        isLoading={isDeletePending}
        requireConfirmation={true}
        confirmationText={organization_details?.organization_name || ""}
        confirmationPlaceholder={`Type "${organization_details?.organization_name || ""}" to confirm`}
        confirmationLabel="Please type the organization name exactly to confirm deletion:"
        title="Delete Organization"
        description="This action cannot be undone and will remove all organization data."
      />

      <DeleteBlockedModal
        isOpen={!!deleteBlockInfo}
        name={deleteBlockInfo?.name}
        reasons={deleteBlockInfo?.reasons}
        onClose={clearDeleteBlock}
        title="Can't Delete Organization"
        entityLabel="organization"
      />

      {/* Rename Modal */}
      {showRenameModal && (
        <EditModelBox
          isOpen={showRenameModal}
          label="Rename Organization"
          handleCancel={() => setShowRenameModal(false)}
        >
          <div className="w-xl">
            <label className="text-foreground mb-1 mt-6 block text-left text-sm font-medium">
              Organization Name *
            </label>
            <input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className={`border-border bg-card text-card-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary mt-1 w-full rounded-md border p-2 pr-12 transition-colors duration-200 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-50`}
              placeholder="Enter organization name"
              disabled={renameLoad}
            />
            <div className="mx-2 mt-6 flex items-center justify-end gap-3">
              <Button
                variant="secondary"
                disabled={renameLoad}
                onClick={() => setShowRenameModal(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" loading={renameLoad} onClick={OnRename}>
                Rename
              </Button>
            </div>
          </div>
        </EditModelBox>
      )}

      {/* Status Modal */}
      {showStatusModal && (
        <EditModelBox
          isOpen={showStatusModal}
          label="Change Status"
          handleCancel={() => setShowStatusModal(false)}
        >
          <div className="w-xl">
            <p className="text-foreground mb-3 text-lg font-medium">
              Are you sure?
            </p>
            <p className="text-foreground mb-3 text-base">
              You want to{" "}
              {organization_details?.is_active ? (
                <span className="font-medium text-red-500">Deactivate</span>
              ) : (
                <span className="font-medium text-green-500">Activate</span>
              )}{" "}
              <span className="font-medium">
                {organization_details?.organization_name}
              </span>
              .
            </p>
            <div className="m-2 flex items-center justify-end gap-3">
              <Button
                variant="secondary"
                disabled={statusLoad}
                onClick={() => setShowStatusModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                loading={statusLoad}
                onClick={OnStatusChange}
              >
                Confirm
              </Button>
            </div>
          </div>
        </EditModelBox>
      )}

      {/* Space Allocation Modal */}
      {showSpaceModal && (
        <SpaceAllocationModal
          isOpen={showSpaceModal}
          organization={organization_details}
          // Note: If you need parent's available space, you would need to fetch parent org details.
          // For now, passing a large number or undefined will likely skip client-side strict max validation
          // or you can rely on backend validation.
          parentAvailableSpace={rootParentAvailableSpace}
          onClose={() => setShowSpaceModal(false)}
          onConfirm={OnSpaceChange}
          isLoading={spaceLoad}
        />
      )}

      {/* Identity Allocation Modal */}
      {showIdentityModal && (
        <IdentityAllocationModal
          isOpen={showIdentityModal}
          organization={organization_details}
          parentAvailableIdentities={rootParentAvailableIdentities}
          onClose={() => setShowIdentityModal(false)}
          onConfirm={OnIdentityChange}
          isLoading={identityLoad}
        />
      )}
    </>
  );
};

export default OrganizationDetails;
