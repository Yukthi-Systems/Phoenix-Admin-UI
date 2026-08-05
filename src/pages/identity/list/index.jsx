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
import { userProfileAtom } from "@/store/userProfile";
import { userInfoAtom } from "@/store/userInfo";
import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect, useRef } from "react";
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import Table from "@/components/shared/Table";
import {
  useAddIdentity,
  useDeleteIdentity,
  useGetIdentities,
  useUpdateIdentity,
  useUpdateIdentityPassword,
} from "@/hooks/useIdentities";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import {
  Button,
  DeleteButton,
  TableDeleteButton,
  TableEditButton,
} from "@/components/common/Buttons";
import NoDataFound from "@/components/common/NoDataFound";
import AccessDenied from "@/components/common/AccessDenied";
import DataFechError from "@/components/common/DataFechError";
import DeleteModelBox from "@/components/common/DeleteModelBox";
import BulkDeleteModal from "@/components/common/BulkDeleteModal";
import ExportModal from "@/components/common/ExportModal";
import BulkImportModal from "@/components/common/BulkImport";
import DropdownButton from "@/components/common/DropdownButton";
import { useToastify } from "@/hooks/useToastify";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import {
  Trash2,
  Download,
  Plus,
  Upload,
  Edit,
  Copy,
  CheckCircle,
  XCircle,
  Lock,
} from "lucide-react";
import { PasswordInput } from "@/components/common/Inputs";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import useBulkImport, { useBulkEdit } from "@/hooks/useImport";
import { PER_PAGE } from "@/constants/constants";
import DataErrorWithReload from "@/components/common/DataErrorWithReload";
import { useUserTimezone } from "@/hooks/useTimezone";
import TableActionsDropdown from "@/components/common/TableActionDropdown";
import MultiDelete from "@/components/shared/MultiDelete";
import SearchBar from "@/components/shared/SearchBar";
import useExport from "@/hooks/useExport";
import { FIELD_MAPPINGS } from "@/constants/export";
import { exportIdentities, getIdentity } from "@/api/identities";
import { useAddMailbox } from "@/hooks/useMailbox";
import { useCreateChatUser } from "@/hooks/useChat";
import { useCreateFileUser } from "@/hooks/useFiles";
import CopyModal from "@/components/common/CopyModal";
import { useUrlParam } from "@/hooks/useUrlParam";
import { ImportActionLog } from "@/utils/importActionLog";
import { useTablePagination } from "@/hooks/useTablePagination";
import DomainSelector from "@/components/shared/DomainSelector";
import StatusBadge from "@/components/common/StatusBadge";
import EditModelBox from "@/components/common/EditModelBox";
import { useGetOrganizationDetail } from "@/hooks/useOrganization";

const ProvisionBadge = ({ service, present, enabled }) => {
  if (!present) {
    return (
      <span
        title={`No ${service} service has been created for this identity yet.`}
      >
        <StatusBadge status="inactive" customText="Not Provisioned" />
      </span>
    );
  }
  return enabled ? (
    <span title={`${service} service exists and is enabled.`}>
      <StatusBadge status="active" customText="Enabled" />
    </span>
  ) : (
    <span title={`${service} service exists but is currently disabled.`}>
      <StatusBadge status="warning" customText="Disabled" />
    </span>
  );
};

const ListIdentities = () => {
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const { organization_id } = useAtomValue(userInfoAtom);
  const { data: orgDetails } = useGetOrganizationDetail(organization_id);
  const navigate = useNavigate();
  const [domainName, setDomainName] = useState(null);
  const [searchQuery, setSearchQuery] = useUrlParam("search", "");
  const { mutate: createIdentityMutation } = useAddIdentity();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [deleteValue, setDeleteValue] = useState("");
  const { formatUserDateNice } = useUserTimezone();
  const [deleteId, setDeleteId] = useState("");
  const { pagination, onPaginationChange: setPagination } =
    useTablePagination();
  const { mutate: deleteMutate, isPending: deletePending } =
    useDeleteIdentity();
  const { mutate: updateMutate, isPending: updatePending } =
    useUpdateIdentity();
  const toast = useToastify();
  const queryClient = useQueryClient();

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusValue, setStatusValue] = useState(false);
  const [statusId, setStatusId] = useState("");

  const { data, isLoading, isError, error, refetch } = useGetIdentities(
    domainName,
    pagination.pageIndex + 1,
    pagination.pageSize,
    searchQuery,
  );

  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyingIdentity, setCopyingIdentity] = useState(null);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordEmail, setPasswordEmail] = useState("");
  const { mutate: updatePassword, isPending: passwordPending } =
    useUpdateIdentityPassword();

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm({
    defaultValues: {
      password: "",
      confirm_password: "",
    },
    resolver: yupResolver(
      yup.object().shape({
        password: yup
          .string()
          .required("Password is required")
          .min(8, "Password must be at least 8 characters"),
        confirm_password: yup
          .string()
          .oneOf([yup.ref("password"), null], "Passwords must match")
          .required("Confirm password is required"),
      }),
    ),
    mode: "onChange",
  });

  const onPasswordSubmit = (formData) => {
    if (!passwordEmail) return;
    const [prefix, domName] = passwordEmail.split("@");
    updatePassword(
      {
        domain_name: domName,
        email_prefix: prefix,
        password: btoa(formData.password),
      },
      {
        onSuccess: () => {
          toast("success", "Successfully updated identity password");
          setShowPasswordModal(false);
          resetPasswordForm();
        },
        onError: (error) => {
          const message =
            error.response?.data?.message || error.message || "Unknown error";
          toast("error", `Failed to update password: ${message}`);
        },
      },
    );
  };

  const handlePasswordClick = (identity) => {
    setPasswordEmail(identity.email);
    resetPasswordForm();
    setShowPasswordModal(true);
  };

  const handleCopy = (identity) => {
    setCopyingIdentity(identity);
    setShowCopyModal(true);
  };

  const fetchIdentitiesForExport = async ({ domain_name, page, pageSize }) => {
    return await exportIdentities(domain_name, page, pageSize);
  };

  const handleSearch = (query) => {
    if (query) {
      setSearchQuery(query);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  // Reset pagination when domain changes
  useEffect(() => {
    if (domainName) {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }
  }, [domainName]);

  const { mutate: createMailboxMutation } = useAddMailbox();
  const { mutate: createChatMutation } = useCreateChatUser();
  const { mutate: createFileUserMutation } = useCreateFileUser();
  const importProvisioningFailuresRef = useRef([]);

  // Chat provisioning is chained off a successful mailbox creation, mirroring
  // the single Add Identity flow (creatingMailbox/creatingChatUser in identity/add).
  // Failures here don't fail the identity row itself - the identity already
  // exists - they're collected and surfaced as a separate warning toast.
  const provisionMailboxAndChat = ({
    email_prefix,
    email_domain,
    allocate_quota,
    isChatEnabled,
  }) => {
    const email_identity = `${email_prefix}@${email_domain}`;
    return new Promise((resolve) => {
      createMailboxMutation(
        {
          data: {
            allocate_quota: allocate_quota || 0.1,
            distribution_policy_id: null,
            email_identity,
            enabled: true,
            forwarding_policy_id: null,
            general_policy_id: null,
          },
        },
        {
          onSuccess: () => {
            if (!isChatEnabled) {
              resolve();
              return;
            }
            createChatMutation(
              { domain: email_domain, email: email_identity },
              {
                onSuccess: () => resolve(),
                onError: (err) => {
                  importProvisioningFailuresRef.current.push(
                    `${email_identity}: chat user creation failed - ${err?.response?.data?.message || err.message}`,
                  );
                  resolve();
                },
              },
            );
          },
          onError: (err) => {
            importProvisioningFailuresRef.current.push(
              `${email_identity}: mailbox creation failed - ${err?.response?.data?.message || err.message}`,
            );
            resolve();
          },
        },
      );
    });
  };

  // Files has no dependency on mailbox (unlike chat), so it's provisioned
  // independently in parallel with provisionMailboxAndChat - one failing
  // shouldn't block or wait on the other, mirroring identity/add's
  // independent creatingMailbox/creatingChatUser/creatingFileUser calls.
  const provisionFileUser = ({
    email_prefix,
    email_domain,
    files_quota_allocated,
  }) => {
    const email_identity = `${email_prefix}@${email_domain}`;
    return new Promise((resolve) => {
      createFileUserMutation(
        {
          domain_name: email_domain,
          email_identity,
          quota_allocated: files_quota_allocated || 0.1,
          enable_user: true,
        },
        {
          onSuccess: () => resolve(),
          onError: (err) => {
            importProvisioningFailuresRef.current.push(
              `${email_identity}: file user creation failed - ${err?.response?.data?.message || err.message}`,
            );
            resolve();
          },
        },
      );
    });
  };

  const {
    isImportModalOpen,
    importConfig,
    handleImport,
    handleImportModalClose,
    handleImportComplete,
    isImportAvailable,
  } = useBulkImport(
    "identities",
    async (identityData) => {
      const {
        is_mailbox_enabled,
        is_chat_enabled,
        allocate_quota,
        is_files_enabled,
        files_quota_allocated,
        ...rest
      } = identityData;

      const payload = {
        email_prefix: rest.email_prefix,
        email_domain: rest.email_domain,
        first_name: rest.first_name,
        last_name: rest.last_name || "",
        primary_phone_number: rest.primary_phone_number,
        secondary_email: rest.secondary_email || "",
        base64_password: rest.base64_password,
        is_enabled: rest.is_enabled ?? true,
        is_app_2fa_enabled: rest.is_app_2fa_enabled ?? false,
        is_sms_2fa_enabled: rest.is_sms_2fa_enabled ?? false,
        is_email_2fa_enabled: rest.is_email_2fa_enabled ?? false,
        restriction_policy_id: rest.restriction_policy_id || null,
        department_id: rest.department_id || null,
      };

      const result = await new Promise((resolve, reject) => {
        createIdentityMutation(
          { data: payload, addLog: false },
          {
            onSuccess: (res) => resolve(res),
            onError: (error) => {
              console.error("Failed to create identity:", error);
              reject(error);
            },
          },
        );
      });

      const provisioningTasks = [];

      if (is_mailbox_enabled || is_chat_enabled) {
        provisioningTasks.push(
          provisionMailboxAndChat({
            email_prefix: payload.email_prefix,
            email_domain: payload.email_domain,
            allocate_quota,
            isChatEnabled: !!is_chat_enabled,
          }),
        );
      }

      if (is_files_enabled) {
        provisioningTasks.push(
          provisionFileUser({
            email_prefix: payload.email_prefix,
            email_domain: payload.email_domain,
            files_quota_allocated,
          }),
        );
      }

      if (provisioningTasks.length > 0) {
        await Promise.all(provisioningTasks);
      }

      return result;
    },
    { email_domain: domainName },
  );

  // Mirrors identity/edit/index.jsx's onSubmit exactly: only the identity's
  // own core fields go through updateIdentity - mailbox/chat/file
  // provisioning are separate resources with their own endpoints, not part
  // of this payload, and are intentionally not editable via bulk edit here.
  // base64_password MUST always be "" - update_identity's backend schema is
  // shared with create's (password is a required field there), and an
  // empty string is the sentinel the backend treats as "leave the password
  // alone"; a real edit-identity form value here would silently overwrite
  // it, and exported files never contain a password anyway.
  const handleBulkEditIdentity = async (identityData) => {
    const {
      organization_id: _rowOrgId,
      email_domain,
      email_prefix,
      ...rest
    } = identityData;

    const payload = {
      email_prefix,
      email_domain,
      first_name: rest.first_name,
      last_name: rest.last_name || "",
      primary_phone_number: rest.primary_phone_number,
      secondary_email: rest.secondary_email || "",
      base64_password: "",
      is_enabled: rest.is_enabled ?? true,
      is_app_2fa_enabled: rest.is_app_2fa_enabled ?? false,
      is_sms_2fa_enabled: rest.is_sms_2fa_enabled ?? false,
      is_email_2fa_enabled: rest.is_email_2fa_enabled ?? false,
      restriction_policy_id: rest.restriction_policy_id || null,
      department_id: rest.department_id || null,
    };

    return new Promise((resolve, reject) => {
      updateMutate(
        { data: payload },
        {
          onSuccess: (result) => resolve(result),
          onError: (error) => reject(error),
        },
      );
    });
  };

  const {
    isEditModalOpen,
    editConfig,
    handleBulkEdit,
    handleEditModalClose,
    handleEditComplete,
    isEditAvailable,
  } = useBulkEdit("identities", handleBulkEditIdentity, "email_prefix", {
    email_domain: domainName,
  });

  const identities = data?.data?.identities ?? [];
  const totalCount = data?.data?.total_count ?? 0;
  const totalPages = Math.ceil(totalCount / pagination.pageSize) || 1;

  const {
    selectedCount,
    selectedItemsWithLabels,
    isAllCurrentPageSelected,
    isSomeCurrentPageSelected,
    toggleItem,
    toggleAllCurrentPage,
    clearSelection,
    isItemSelected,
    removeFromSelection,
  } = useBulkSelection(identities, "email", "email");

  const {
    isExportModalOpen,
    exportConfig,
    handleExport,
    handleExportModalClose,
    isExportAvailable,
  } = useExport(
    "identities",
    fetchIdentitiesForExport,
    { domain_name: domainName },
    FIELD_MAPPINGS.identities,
  );

  const columns = useMemo(() => {
    const baseColumns = [
      {
        id: "select",
        header: ({ table }) => (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isAllCurrentPageSelected}
              ref={(el) => {
                if (el) el.indeterminate = isSomeCurrentPageSelected;
              }}
              onChange={toggleAllCurrentPage}
              className="text-primary bg-background border-border focus:ring-primary h-4 w-4 rounded focus:ring-2"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isItemSelected(row.original.email)}
              onChange={() => toggleItem(row.original.email)}
              className="text-primary bg-background border-border focus:ring-primary h-4 w-4 rounded focus:ring-2"
            />
          </div>
        ),
        size: 50,
      },
      {
        accessorKey: "email",
        header: "Email Identity",
        cell: ({ row }) => (
          <Link
            className="main-col font-medium"
            to={`/identities/${encodeURIComponent(row.original.email)}`}
          >
            {row.original.email}
          </Link>
        ),
        meta: {
          align: "left",
        },
      },
      {
        id: "name",
        header: "Name",
        accessorFn: (row) =>
          [row.first_name, row.last_name].filter(Boolean).join(" "),
        cell: ({ getValue }) => getValue() || "--",
        meta: {
          align: "left",
        },
      },
      {
        accessorKey: "primary_phone",
        header: "Phone Number",
        meta: {
          align: "left",
        },
      },
      {
        accessorKey: "is_enabled",
        header: "Status",
        cell: ({ getValue }) => {
          return <StatusBadge status={getValue()} />;
        },
      },
      {
        accessorKey: "is_mailbox_present",
        header: "Mailbox",
        cell: ({ row }) => (
          <ProvisionBadge
            service="Mailbox"
            present={row.original.is_mailbox_present}
            enabled={row.original.is_mailbox_enabled}
          />
        ),
      },
      {
        accessorKey: "is_chat_user_present",
        header: "Chat",
        cell: ({ row }) => (
          <ProvisionBadge
            service="Chat"
            present={row.original.is_chat_user_present}
            enabled={row.original.is_chat_user_enabled}
          />
        ),
      },
      {
        accessorKey: "is_file_user_present",
        header: "Files",
        cell: ({ row }) => (
          <ProvisionBadge
            service="Files"
            present={row.original.is_file_user_present}
            enabled={row.original.is_file_user_enabled}
          />
        ),
      },
    ];

    if (
      permissions.includes("identity:edit") ||
      permissions.includes("identity:delete")
    ) {
      baseColumns.push({
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const actions = [];

          if (permissions.includes("identity:edit")) {
            actions.push({
              label: "Edit Identity",
              icon: Edit,
              variant: "default",
              onClick: () =>
                navigate(
                  `/identities/edit/${encodeURIComponent(row.original.email)}`,
                ),
              tooltip: "Edit identity",
            });

            actions.push({
              label: row.original.is_enabled ? "Deactivate" : "Activate",
              icon: row.original.is_enabled ? XCircle : CheckCircle,
              variant: row.original.is_enabled ? "danger" : "success",
              onClick: () => handleStatus(row.original),
              tooltip: "Toggle status",
            });

            actions.push({
              label: "Change Password",
              icon: Lock,
              variant: "default",
              onClick: () => handlePasswordClick(row.original),
              tooltip: "Change password",
            });
          }

          // if (permissions.includes("identity:create")) {
          //   actions.push({
          //     label: "Copy Identity",
          //     icon: Copy,
          //     variant: "default",
          //     onClick: () => handleCopy(row.original),
          //     tooltip: "Copy identity",
          //   });
          // }

          if (permissions.includes("identity:delete")) {
            if (actions.length > 0) {
              actions.push({ separator: true });
            }
            actions.push({
              label: "Delete Identity",
              icon: Trash2,
              variant: "danger",
              onClick: () =>
                handleDelete({
                  name: row?.original?.email,
                  id: row?.original?.email,
                }),
              tooltip: "Delete identity",
            });
          }

          return (
            <div className="flex justify-center">
              <TableActionsDropdown actions={actions} />
            </div>
          );
        },
      });
    }

    return baseColumns;
  }, [
    permissions,
    isAllCurrentPageSelected,
    isSomeCurrentPageSelected,
    toggleAllCurrentPage,
    toggleItem,
    isItemSelected,
  ]);

  function handleDelete({ name, id }) {
    setShowDeleteModal(true);
    setDeleteId(id);
    setDeleteValue(name);
  }

  const handleStatus = (row) => {
    setStatusId(row.email);
    setStatusValue(!row.is_enabled);
    setShowStatusModal(true);
  };

  const handleStatusClose = () => {
    setStatusId("");
    setStatusValue(false);
    setShowStatusModal(false);
  };

  const handleBulkModalClose = () => {
    setShowBulkDeleteModal(false);
  };

  const handleAddIdentity = () => {
    navigate(`/identities/add/${domainName}`);
  };

  const handleImportCompleteWithRefresh = (results) => {
    handleImportComplete(results);

    const provisioningFailures = importProvisioningFailuresRef.current;
    if (provisioningFailures.length > 0) {
      toast(
        "warning",
        `${provisioningFailures.length} ${provisioningFailures.length !== 1 ? "identities" : "identity"} imported but mailbox/chat provisioning failed: ${provisioningFailures.slice(0, 3).join("; ")}${provisioningFailures.length > 3 ? `; and ${provisioningFailures.length - 3} more` : ""}`,
      );
    }
    importProvisioningFailuresRef.current = [];

    const ActionLog = {
      action_type: "import_identities",
      message: `Imported identities via bulk import`,
      payload: {
        ...results,
        total_imported: results.successful.length || 0,
        total_failed: results.failed.length || 0,
        mailbox_chat_provisioning_failures: provisioningFailures,
      },
      organization_id: organization_id,
      details: {
        domain_name: domainName,
      },
    };
    ImportActionLog({ values: ActionLog });
    queryClient.invalidateQueries(["identities", domainName]);
  };

  const handleEditCompleteWithRefresh = (results) => {
    handleEditComplete(results);
    const ActionLog = {
      action_type: "bulk_edit_identities",
      message: `Updated identities via bulk edit`,
      payload: {
        ...results,
        total_updated: results.successful.length || 0,
        total_failed: results.failed.length || 0,
      },
      organization_id: organization_id,
      details: {
        domain_name: domainName,
      },
    };
    ImportActionLog({ values: ActionLog });
    queryClient.invalidateQueries(["identities", domainName]);
  };

  const OnDelete = () => {
    if (deleteId) {
      const [email_prefix, domain_name] = deleteId.split("@");
      deleteMutate(
        { domain_name, email_prefix, identity_name: deleteValue },
        {
          onSuccess: () => {
            toast("success", "Successfully deleted identity");
            queryClient.invalidateQueries(["identities", domainName]);
            removeFromSelection([deleteId]);
            setShowDeleteModal(false);
            setDeleteId("");
            setDeleteValue("");
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

  const OnStatusChange = () => {
    if (statusId) {
      const [email_prefix, domain_name] = statusId.split("@");

      // Fetch current info first or prepare details payload
      getIdentity(domain_name, email_prefix)
        .then((res) => {
          const currentData = res.data || {};
          const payload = {
            email_prefix,
            email_domain: domain_name,
            first_name: currentData.first_name,
            last_name: currentData.last_name || "",
            primary_phone_number: currentData.primary_phone,
            secondary_email: currentData.secondary_email || "",
            base64_password: "", // Keep unchanged
            restriction_policy_id: currentData.restriction_policy_id || null,
            is_enabled: statusValue,
            is_app_2fa_enabled: currentData.is_app_2fa_enabled ?? false,
            is_sms_2fa_enabled: currentData.is_sms_2fa_enabled ?? false,
            is_email_2fa_enabled: currentData.is_email_2fa_enabled ?? false,
          };

          updateMutate(
            { data: payload },
            {
              onSuccess: () => {
                toast("success", "Successfully updated identity status");
                queryClient.invalidateQueries(["identities", domainName]);
                setShowStatusModal(false);
                setStatusId("");
                setStatusValue(false);
              },
              onError: (error) => {
                const message =
                  error.response?.data?.message ||
                  error.message ||
                  "Unknown error";
                toast("error", `Status update failed: ${message}`);
              },
            },
          );
        })
        .catch((err) => {
          console.error(err);
          toast("error", "Failed to retrieve identity details for update");
        });
    }
  };

  const handleBulkDelete = async (itemId, itemName = "Unknown Identity") => {
    return new Promise((resolve, reject) => {
      const [email_prefix, domain_name] = itemId.split("@");
      deleteMutate(
        { domain_name, email_prefix, identity_name: itemName },
        {
          onSuccess: () => {
            resolve();
          },
          onError: (error) => {
            reject(error);
          },
        },
      );
    });
  };

  const handleBulkDeleteComplete = (results) => {
    queryClient.invalidateQueries(["identities", domainName]);
    if (results.successful.length > 0) {
      removeFromSelection(results.successful);
    }
    if (results.failed.length === 0) {
      toast(
        "success",
        `Successfully deleted ${results.successful.length} identity${results.successful.length !== 1 ? "s" : ""}`,
      );
    } else if (results.successful.length === 0) {
      toast("error", "Failed to delete selected identities");
    } else {
      toast(
        "warning",
        `Deleted ${results.successful.length} identity/identities. ${results.failed.length} failed.`,
      );
    }
  };

  const OnCancel = () => {
    setShowDeleteModal(false);
    setDeleteId("");
    setDeleteValue("");
  };

  const table = useReactTable({
    data: identities,
    columns,
    pageCount: totalPages,
    manualPagination: true,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
    getCoreRowModel: getCoreRowModel(),
  });

  const createOptions = useMemo(() => {
    if (!domainName) return [];
    const options = [];

    const isIdentityQuotaFull = orgDetails
      ? Number(orgDetails.allocated_email_identities) !== -1 &&
        Number(orgDetails.utilized_email_identities || 0) >=
          Number(orgDetails.allocated_email_identities || 0)
      : false;

    const fullMessage = "Organization has no email identities left";

    if (permissions.includes("identity:create")) {
      options.push({
        label: "Add Single Identity",
        description: isIdentityQuotaFull
          ? fullMessage
          : "Create one identity blueprint",
        icon: <Plus className="h-4 w-4" />,
        onClick: handleAddIdentity,
        disabled: isIdentityQuotaFull,
      });
    }

    if (permissions.includes("identity:create") && isImportAvailable) {
      options.push({
        label: "Import",
        description: isIdentityQuotaFull
          ? fullMessage
          : "Import multiple identities from file",
        icon: <Upload className="h-4 w-4" />,
        onClick: handleImport,
        disabled: isIdentityQuotaFull,
      });
    }

    if (permissions.includes("identity:edit") && isEditAvailable) {
      options.push({
        label: "Bulk Edit",
        description:
          "Export, edit the file, then re-upload to update multiple identities",
        icon: <Edit className="h-4 w-4" />,
        onClick: handleBulkEdit,
      });
    }

    if (permissions.includes("identity:view") && isExportAvailable) {
      options.push({
        label: "Export",
        description: "Download all identities as Excel file",
        icon: <Download className="h-4 w-4" />,
        onClick: handleExport,
      });
    }

    return options;
  }, [
    permissions,
    isImportAvailable,
    domainName,
    isEditAvailable,
    handleBulkEdit,
    isExportAvailable,
    orgDetails,
  ]);

  const identityCopyConfig = {
    type: "identity",
    title: "Copy Identity",
    itemDisplayName: "Identity",
    copyRoute: (id) => `/identities/copy/${id}`,
    fetchDetails: async (domainName, id) => {
      const [email_prefix, domain] = id.split("@");
      const response = await getIdentity(domain, email_prefix);
      return response.data || response;
    },
    transformData: (identity) => ({
      email_prefix: identity.email?.split("@")[0] || "",
      email_domain: identity.domain_name || "",
      first_name: identity.first_name || "",
      last_name: identity.last_name || "",
      primary_phone_number: identity.primary_phone || "",
      secondary_email: identity.secondary_email || "",
      restriction_policy_id: identity.restriction_policy_id || null,
      is_enabled: identity.is_enabled ?? true,
      is_app_2fa_enabled: identity.is_app_2fa_enabled ?? false,
      is_sms_2fa_enabled: identity.is_sms_2fa_enabled ?? false,
      is_email_2fa_enabled: identity.is_email_2fa_enabled ?? false,
    }),
  };

  const isServerError =
    !error?.response?.status || error?.response?.status >= 500;

  if (!permissions.includes("identity:view"))
    return (
      <AccessDenied content="Don't have access to list email identities." />
    );

  if (isError && isServerError)
    return <DataFechError content="Error while listing the identities" />;

  return (
    <>
      <div className="h-full w-full px-2">
        <div className="mb-2.5 flex w-full items-center justify-between gap-6">
          <Breadcrumbs items={[{ name: "Identity Management" }]} />

          <div className="flex flex-1 gap-2">
            <SearchBar
              placeholder="Search identities..."
              onSearch={handleSearch}
              onClear={handleClearSearch}
              onRefresh={refetch}
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            {selectedCount > 0 && (
              <MultiDelete
                permission="identity:delete"
                selectedCount={selectedCount}
                handleClear={clearSelection}
                handleClick={() => setShowBulkDeleteModal(true)}
              />
            )}

            <DomainSelector
              domainName={domainName}
              setDomainName={setDomainName}
            />

            {createOptions.length > 0 && (
              <DropdownButton
                label="Actions"
                options={createOptions}
                variant="primary"
              />
            )}
          </div>
        </div>

        {!domainName ? (
          <NoDataFound content="Please select a domain to view email identities." />
        ) : identities.length !== 0 || isLoading ? (
          <Table table={table} isLoading={isLoading} totalCount={totalCount} />
        ) : isError && !isServerError ? (
          <DataErrorWithReload content={error?.response?.data?.message} />
        ) : (
          <NoDataFound content="There is no email identity found in this domain." />
        )}
      </div>

      <DeleteModelBox
        isOpen={showDeleteModal}
        handleCancel={OnCancel}
        handleDelete={OnDelete}
        value={deleteValue}
        isLoading={deletePending}
        requireConfirmation={true}
        confirmationText={deleteValue}
        confirmationPlaceholder={`Type "${deleteValue}" to confirm`}
        confirmationLabel="Please type the identity email exactly to confirm deletion:"
        title="Delete E-Mail Identity"
        description="This action cannot be undone and will permanently remove this E-Mail Identity."
      />

      {showStatusModal && (
        <EditModelBox
          isOpen={showStatusModal}
          label={`${statusValue ? "Activate" : "Deactivate"} E-Mail Identity`}
          handleCancel={handleStatusClose}
        >
          <div className="w-[380px] p-1 text-left">
            <p className="mb-4 text-base text-card-foreground">
              Are you sure you want to{" "}
              <span
                className={
                  statusValue
                    ? "font-semibold text-success"
                    : "font-semibold text-destructive"
                }
              >
                {statusValue ? "activate" : "deactivate"}
              </span>{" "}
              the email identity{" "}
              <span className="font-semibold text-foreground">{statusId}</span>?
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
              <Button
                type="button"
                variant="outline"
                disabled={updatePending}
                onClick={handleStatusClose}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant={statusValue ? "success" : "danger"}
                disabled={updatePending}
                onClick={OnStatusChange}
              >
                {updatePending ? "Updating..." : "Confirm"}
              </Button>
            </div>
          </div>
        </EditModelBox>
      )}

      <BulkDeleteModal
        isOpen={showBulkDeleteModal}
        items={selectedItemsWithLabels}
        onDelete={handleBulkDelete}
        onClose={handleBulkModalClose}
        onComplete={handleBulkDeleteComplete}
        title="Bulk Delete E-Mail Identities"
        description="Are you sure you want to delete the selected E-Mail Identities?"
        itemName="identity"
      />

      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={handleImportModalClose}
        importConfig={importConfig}
        title="Bulk Import E-Mail Identities"
        description="Upload a CSV or Excel file to create multiple identities at once."
        onComplete={handleImportCompleteWithRefresh}
      />

      <BulkImportModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        importConfig={editConfig}
        mode="edit"
        title="Bulk Edit E-Mail Identities"
        description="Export identities, edit the fields you want to change, then upload the file here to update them. Passwords are never touched by bulk edit."
        onComplete={handleEditCompleteWithRefresh}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={handleExportModalClose}
        exportConfig={exportConfig}
        title="Export E-Mail Identities"
        description="Export all identities under this domain to Excel format."
      />

      <CopyModal
        isOpen={showCopyModal}
        onClose={() => {
          setShowCopyModal(false);
          setCopyingIdentity(null);
        }}
        itemId={copyingIdentity?.email}
        itemName={copyingIdentity?.email}
        config={identityCopyConfig}
      />

      <EditModelBox
        isOpen={showPasswordModal}
        label="Change Password"
        handleCancel={() => {
          setShowPasswordModal(false);
          resetPasswordForm();
        }}
      >
        <form
          onSubmit={handleSubmitPassword(onPasswordSubmit)}
          className="w-[380px] space-y-4 p-1 text-left"
        >
          <p className="text-sm text-muted-foreground mb-4">
            Enter a new password for{" "}
            <span className="font-semibold text-foreground">
              {passwordEmail}
            </span>
            .
          </p>
          <PasswordInput
            label="New Password"
            name="password"
            register={registerPassword}
            errors={passwordErrors}
            placeholder="Enter new password"
            isRequired={true}
          />
          <PasswordInput
            label="Confirm New Password"
            name="confirm_password"
            register={registerPassword}
            errors={passwordErrors}
            placeholder="Confirm new password"
            isRequired={true}
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
            <Button
              type="button"
              variant="outline"
              disabled={passwordPending}
              onClick={() => {
                setShowPasswordModal(false);
                resetPasswordForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={passwordPending}>
              {passwordPending ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>
      </EditModelBox>
    </>
  );
};

export default ListIdentities;
