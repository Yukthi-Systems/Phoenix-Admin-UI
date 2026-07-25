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

import { Link, useNavigate, useParams } from "react-router-dom";
import {
  useDeleteServer,
  useGetServer,
  useUpdateServerStatus,
} from "@/hooks/useServer";
import { useAtomValue } from "jotai";
import { userProfileAtom } from "@/store/userProfile";
import AccessDenied from "@/components/common/AccessDenied";
import DataFechError from "@/components/common/DataFechError";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import {
  BackButton,
  Button,
  DeleteButton,
  EditButton,
} from "@/components/common/Buttons";
import { useMemo, useState } from "react";
import { useToastify } from "@/hooks/useToastify";
import DataLoading from "@/components/common/DataLoading";
import DeleteModelBox from "@/components/common/DeleteModelBox";
import {
  Server,
  HardDrive,
  Network,
  Calendar,
  Info,
  Check,
  X,
  Database,
  Globe,
  MapPin,
  Monitor,
  FolderOpen,
  CheckIcon,
  ClipboardIcon,
  SquarePen,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import CopyButton from "@/components/common/CopyId";
import { useUserTimezone } from "@/hooks/useTimezone";
import { InfoCard, InfoItem } from "@/components/common/InfoCard";
import { useQueryClient } from "@tanstack/react-query";
import EditModelBox from "@/components/common/EditModelBox";
import DropdownButton from "@/components/common/DropdownButton";

const ServerDetails = () => {
  const { server_id: rawServerId } = useParams();
  const server_id = decodeURIComponent(rawServerId);
  const queryClient = useQueryClient();
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const navigate = useNavigate();
  const { data: server, isLoading, isError } = useGetServer(server_id);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusValue, setStatusValue] = useState(false);
  const [statusId, setStatusId] = useState("");
  const [statusName, setStatusName] = useState("");
  const { mutate, isPending } = useDeleteServer();
  const toast = useToastify();
  const { formatUserDateNice } = useUserTimezone();
  const { mutate: statusUpdate, isPending: statusLoad } =
    useUpdateServerStatus();

  const OnDelete = (deleteId) => {
    if (deleteId) {
      mutate(deleteId, {
        onSuccess: () => {
          toast("success", "Server deleted successfully");
          navigate(-1);
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
      });
      setShowDeleteModal(false);
    } else {
      toast("error", `Message:'Unknown error'`);
    }
  };

  const OnCancel = () => {
    setShowDeleteModal(false);
  };

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

  const handleStatus = (row) => {
    setStatusId(row.server_id);
    setStatusName(row.host_name);
    setStatusValue(!row.is_active);
    setShowStatusModal(true);
  };

  const handleStatusClose = () => {
    setStatusId("");
    setStatusName("");
    setStatusValue(false);
    setShowStatusModal(false);
  };

  const OnStatusChange = () => {
    if (statusId) {
      statusUpdate(
        { server_id: statusId, status: statusValue, server_name: statusName },
        {
          onSuccess: () => {
            toast("success", "Successfully update server status");
            queryClient.invalidateQueries({
              queryKey: ["server", server_id],
            });
            setShowStatusModal(false);
            setStatusId("");
            setStatusName("");
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

  const actionOptions = useMemo(() => {
    const options = [];

    if (permissions?.includes("server:edit") && !isLoading) {
      options.push({
        label: server?.is_active ? "Deactivate Server" : "Activate Server",
        description: server?.is_active
          ? "Deactivate this server"
          : "Activate this server",
        icon: server?.is_active ? (
          <XCircle className="h-4 w-4 text-destructive" />
        ) : (
          <CheckCircle className="h-4 w-4 text-success" />
        ),
        onClick: () => handleStatus(server),
      });
    }

    if (permissions?.includes("server:delete") && !isLoading) {
      options.push({
        label: "Delete Server",
        description: "Permanently remove this server",
        icon: <Trash2 className="h-4 w-4 text-destructive" />,
        onClick: () => setShowDeleteModal(true),
      });
    }

    return options;
  }, [permissions, isLoading, server]);

  if (!permissions?.includes("server:view"))
    return <AccessDenied content="Don't have access to server details." />;

  if (isError)
    return <DataFechError content="Mailbox server details getting error...!" />;

  const MonitoringBadge = ({ isMonitoring }) => (
    <div
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium ${isMonitoring
          ? "bg-primary/10 text-primary border-primary/20 border"
          : "bg-muted text-muted-foreground border-border border"
        }`}
    >
      {isMonitoring ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <X className="h-3.5 w-3.5" />
      )}
      {isMonitoring ? "Cloud Server Enabled" : "Cloud Server Disabled"}
    </div>
  );

  const MailboxBadge = ({ isMailbox }) => (
    <div
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium ${isMailbox
          ? "bg-primary/10 text-primary border-primary/20 border"
          : "bg-muted text-muted-foreground border-border border"
        }`}
    >
      {isMailbox ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <X className="h-3.5 w-3.5" />
      )}
      {isMailbox ? "Mailbox Enabled" : "Mailbox Disabled"}
    </div>
  );

  const AcceptingMailboxesBadge = ({ isAccepting }) => (
    <div
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium ${isAccepting
          ? "bg-primary/10 text-primary border-primary/20 border"
          : "bg-muted text-muted-foreground border-border border"
        }`}
    >
      {isAccepting ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <X className="h-3.5 w-3.5" />
      )}
      {isAccepting ? "Accepting Mailboxes" : "Not Accepting Mailboxes"}
    </div>
  );


  return (
    <>
      <div className="h-full w-full px-2">
        <div className="mt-1.5 mb-3 flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButton />
            <Breadcrumbs
              items={[
                {
                  name: "Mailbox Server",
                  link: `/server/list`,
                },
                {
                  name: "View Server",
                },
              ]}
            />
          </div>

          <div className="flex flex-row gap-2 justify-center items-center">
            {permissions?.includes("server:edit") && !isLoading && (
              <Link to={`/server/edit/${server?.server_id}`}>
                <Button variant="primary" icon={SquarePen}>
                  Edit Server
                </Button>
              </Link>
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
        <div className="no-scrollbar h-[calc(100vh-140px)] w-full">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <DataLoading content="Loading mailbox server details." />
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              <div className="from-primary/8 to-primary/3 border-border rounded-lg border bg-gradient-to-r p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/15 rounded-lg p-2">
                      <Server className="text-primary h-6 w-6" />
                    </div>
                    <div>
                      <h1 className="text-card-foreground text-left text-xl font-bold">
                        {server?.host_name || "Unknown Server"}
                      </h1>
                      <CopyButton text={server?.server_id} />
                    </div>
                  </div>
                  <StatusBadge active={server?.is_active} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <InfoCard icon={HardDrive} title="Storage Quota">
                  <InfoItem
                    label="Allocated"
                    value={`${server?.quota_allocated || 0} GB`}
                  />
                  <InfoItem
                    label="Utilized"
                    value={`${server?.quota_utilized || 0} GB`}
                  />
                  <div className="border-border mt-3 border-t pt-3">
                    <div className="text-muted-foreground mb-1 flex justify-between text-xs">
                      <span className="text-left">Usage</span>
                      <span className="text-right">
                        {server?.quota_allocated > 0
                          ? Math.round(
                            (server?.quota_utilized /
                              server?.quota_allocated) *
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
                          width:
                            server?.quota_allocated > 0
                              ? `${Math.min((server?.quota_utilized / server?.quota_allocated) * 100, 100)}%`
                              : "0%",
                        }}
                      ></div>
                    </div>
                  </div>
                </InfoCard>

                <InfoCard icon={Network} title="Network Configuration">
                  <InfoItem
                    label="SMTP Port"
                    value={server?.smtp_port || "Not configured"}
                  />
                  <InfoItem
                    label="Storage Path"
                    value={server?.storage_path || "Not configured"}
                  />
                  <div className="border-border mt-3 border-t pt-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs font-medium">
                        Cloud Server Status
                      </span>
                      <MonitoringBadge isMonitoring={server?.is_monitoring} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs font-medium">
                        Mailbox Server Status
                      </span>
                      <MailboxBadge isMailbox={server?.is_mailbox_server} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs font-medium">
                        Accepting New Mailboxes
                      </span>
                      <AcceptingMailboxesBadge
                        isAccepting={server?.is_accepting_new_mailboxes}
                      />
                    </div>
                  </div>
                </InfoCard>

                <InfoCard icon={Calendar} title="Timeline Info">
                  {server?.created_at && (
                    <InfoItem
                      label="Created"
                      value={formatUserDateNice(server.created_at)}
                    />
                  )}
                  {server?.updated_at && (
                    <InfoItem
                      label="Last Updated"
                      value={formatUserDateNice(server.updated_at)}
                    />
                  )}
                </InfoCard>
              </div>

              {server?.server_info && (
                <div className="space-y-4">
                  <InfoCard
                    icon={Info}
                    title="Server Information"
                    className="w-full"
                  >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {Object.entries(server.server_info).map(
                        ([key, value]) => {
                          if (!value) return null;

                          const getIcon = (key) => {
                            switch (key.toLowerCase()) {
                              case "ipv4":
                              case "ipv6":
                                return (
                                  <Globe className="text-muted-foreground h-3 w-3" />
                                );
                              case "location":
                                return (
                                  <MapPin className="text-muted-foreground h-3 w-3" />
                                );
                              case "os":
                                return (
                                  <Monitor className="text-muted-foreground h-3 w-3" />
                                );
                              default:
                                return (
                                  <Info className="text-muted-foreground h-3 w-3" />
                                );
                            }
                          };

                          const formatLabel = (key) => {
                            return (
                              key.charAt(0).toUpperCase() +
                              key.slice(1).replace(/_/g, " ")
                            );
                          };

                          const formatValue = (key, value) => {
                            if (key.toLowerCase().includes("ip")) {
                              return <span className="font-mono">{value}</span>;
                            }
                            return value;
                          };

                          return (
                            <div
                              key={key}
                              className="bg-muted/30 border-border/50 rounded-md border p-3"
                            >
                              <div className="mb-1 flex items-center gap-2">
                                {getIcon(key)}
                                <span className="text-muted-foreground text-xs font-medium uppercase">
                                  {formatLabel(key)}
                                </span>
                              </div>
                              <div className="text-card-foreground text-left text-sm font-medium">
                                {formatValue(key, value)}
                              </div>
                            </div>
                          );
                        },
                      )}
                    </div>
                    <div className="border-border mt-3 border-t pt-3">
                      <span className="text-muted-foreground text-xs">
                        {Object.keys(server.server_info).length} server
                        properties configured
                      </span>
                    </div>
                  </InfoCard>
                </div>
              )}

              {(!server?.server_info ||
                Object.keys(server.server_info).length === 0) && (
                  <div className="bg-card border-border rounded-lg border p-8 text-center">
                    <Info className="text-muted-foreground mx-auto mb-3 h-12 w-12 opacity-50" />
                    <h3 className="text-card-foreground mb-2 text-lg font-medium">
                      No Server Information
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Additional server information has not been configured yet.
                    </p>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>

      <DeleteModelBox
        isOpen={showDeleteModal}
        handleCancel={OnCancel}
        handleDelete={() => OnDelete(server?.server_id)}
        value={server?.host_name || ""}
        isLoading={isPending}
        requireConfirmation={true}
        confirmationText={server?.host_name}
        confirmationPlaceholder={`Type "${server?.host_name}" to confirm`}
        confirmationLabel="Please type the server hostname exactly to confirm deletion:"
        title="Delete Server"
        description="This action cannot be undone and will remove all server data."
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
              {statusName} .
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
    </>
  );
};

export default ServerDetails;
