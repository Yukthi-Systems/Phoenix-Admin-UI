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

import React, { useState, useMemo, useEffect } from "react";
import {
  Mail,
  Server,
  BarChart3,
  RefreshCw,
  AlertCircle,
  Layers,
  Trash2,
  PauseCircle,
  PlayCircle,
  SendHorizonal,
} from "lucide-react";
import ServerSelector from "./ServerSelector";
import QueueTable from "./Table";
import DomainStatsModal from "./DomainStats";
import QueueStatsModal from "./QueueStatModal";
import FetchAllModal from "./FetchAllModal";
import { useMailQueue } from "@/hooks/useMailQ";
import { useMailQueueAction } from "@/hooks/useMailQ";
import { useAtomValue, useSetAtom } from "jotai";
import { userProfileAtom } from "@/store/userProfile";
import {
  queueActionCooldownAtom,
  setCooldownAtom,
  checkCooldownActive,
  getRemainingSeconds,
} from "@/store/queueCooldown";
import AccessDenied from "@/components/common/AccessDenied";
import { useToastify } from "@/hooks/useToastify";
import { processError } from "@/utils/errorProcessing";
import QueueActionConfirmModal from "./ActionConfirmedModal";
import BulkActionProgressModal from "./BulkActionModal";
import { SERVER_ACTIONS } from "@/constants/constants";
import DropdownButton from "@/components/common/DropdownButton";

const SearchQueue = () => {
  const [selectedServer, setSelectedServer] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [queueFilter, setQueueFilter] = useState("all");
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [showDomainStats, setShowDomainStats] = useState(false);
  const [showQueueStats, setShowQueueStats] = useState(false);

  const [showFetchAll, setShowFetchAll] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    action: null,
    messages: [],
  });
  const [bulkProgress, setBulkProgress] = useState({
    isOpen: false,
    action: null,
    progress: {},
  });
  const [cooldownTime, setCooldownTime] = useState(0);

  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const canManageQueue = permissions.includes("mailq:edit");
  const cooldownTimestamp = useAtomValue(queueActionCooldownAtom);
  const setCooldown = useSetAtom(setCooldownAtom);
  const notify = useToastify();

  const { data, isLoading, isError, error, refetch, isFetching } =
    useMailQueue(selectedServer);
  const { mutate: performAction, isPending: isActionPending } =
    useMailQueueAction();
  const queueData = data?.data || [];

  useEffect(() => {
    setExpandedRows(new Set());
    setSelectedMessages(new Set());
    setShowDomainStats(false);
    setShowQueueStats(false);
  }, [selectedServer]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (checkCooldownActive(cooldownTimestamp)) {
        setCooldownTime(getRemainingSeconds(cooldownTimestamp));
      } else {
        setCooldownTime(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownTimestamp]);

  const filteredData = useMemo(() => {
    let filtered = queueData;
    if (queueFilter !== "all")
      filtered = filtered.filter((item) => item.queue_name === queueFilter);
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.queue_id?.toLowerCase().includes(query) ||
          item.sender?.toLowerCase().includes(query) ||
          item.recipients?.some((recipient) =>
            recipient.address?.toLowerCase().includes(query),
          ),
      );
    }
    return filtered;
  }, [queueData, queueFilter, searchQuery]);

  const domainStats = useMemo(() => {
    const stats = {};
    filteredData.forEach((item) => {
      if (item.sender) {
        const atIndex = item.sender.indexOf("@");
        let domain =
          atIndex !== -1 ? item.sender.substring(atIndex + 1) : item.sender;
        domain = domain.trim();
        if (domain) stats[domain] = (stats[domain] || 0) + 1;
      }
    });
    return Object.entries(stats)
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredData]);

  const fetchQueueData = async () => {
    if (!selectedServer) {
      notify("warning", "Please select a server first");
      return;
    }
    try {
      const result = await refetch();
      if (result.isSuccess) {
        setExpandedRows(new Set());
        setSelectedMessages(new Set());
        notify("success", "Queue data fetched successfully");
      }
    } catch (err) {
      const { message, tracebackId } = processError(err);
      notify(
        "error",
        `Failed to fetch queue: ${message}${tracebackId ? `\nTraceback ID: ${tracebackId}` : ""}`,
      );
    }
  };

  const toggleRowExpansion = (queueId) => {
    const newExpanded = new Set(expandedRows);
    newExpanded.has(queueId)
      ? newExpanded.delete(queueId)
      : newExpanded.add(queueId);
    setExpandedRows(newExpanded);
  };

  const toggleSelect = (queueId, checked, newSet) => {
    if (newSet) {
      setSelectedMessages(newSet);
    } else {
      const newSelected = new Set(selectedMessages);
      checked ? newSelected.add(queueId) : newSelected.delete(queueId);
      setSelectedMessages(newSelected);
    }
  };

  const handleGlobalAction = (action) => {
    if (!canManageQueue) {
      notify("error", "You do not have permission to perform queue actions");
      return;
    }
    if (checkCooldownActive(cooldownTimestamp)) {
      notify(
        "warning",
        `Please wait ${cooldownTime}s before performing another global action`,
      );
      return;
    }
    setConfirmModal({ isOpen: true, action, messages: [] });
  };

  const handleMessageAction = (action, queueId) => {
    if (!canManageQueue) {
      notify("error", "You do not have permission to perform queue actions");
      return;
    }
    setConfirmModal({ isOpen: true, action, messages: [queueId] });
  };

  const handleBulkAction = (action) => {
    if (!canManageQueue) {
      notify("error", "You do not have permission to perform queue actions");
      return;
    }
    setConfirmModal({
      isOpen: true,
      action,
      messages: Array.from(selectedMessages),
    });
  };

  const executeAction = async () => {
    const { action, messages } = confirmModal;
    const actionLabel = action.split("_").join(" ").toUpperCase();
    const isGlobalAction = [
      SERVER_ACTIONS.CLEAR_QUEUE,
      SERVER_ACTIONS.FLUSH_QUEUE,
      SERVER_ACTIONS.HOLD_ALL,
      SERVER_ACTIONS.REQUEUE_ALL,
      SERVER_ACTIONS.RELEASE_ALL,
    ].includes(action);
    const isBulkAction = messages.length > 1;
    setConfirmModal({ isOpen: false, action: null, messages: [] });

    if (isBulkAction) {
      setBulkProgress({
        isOpen: true,
        action,
        progress: {
          total: messages.length,
          processed: 0,
          succeeded: 0,
          failed: 0,
          currentMessage: messages[0],
        },
      });
      let succeeded = 0,
        failed = 0;

      for (let i = 0; i < messages.length; i++) {
        try {
          await new Promise((resolve, reject) => {
            performAction(
              {
                server_host_id: selectedServer,
                action,
                data: { message_id: messages[i] },
              },
              {
                onSuccess: () => {
                  succeeded++;
                  resolve();
                },
                onError: (err) => {
                  failed++;
                  reject(err);
                },
              },
            );
          });
        } catch (err) {}
        setBulkProgress((prev) => ({
          ...prev,
          progress: {
            ...prev.progress,
            processed: i + 1,
            succeeded,
            failed,
            currentMessage: i < messages.length - 1 ? messages[i + 1] : null,
          },
        }));
      }

      setTimeout(() => {
        setBulkProgress((prev) => ({
          ...prev,
          progress: { ...prev.progress, currentMessage: null },
        }));
        refetch();
        setSelectedMessages(new Set());
        if (succeeded === messages.length)
          notify(
            "success",
            `${actionLabel} completed successfully for all messages`,
          );
        else if (failed === messages.length)
          notify("error", `${actionLabel} failed for all messages`);
        else
          notify(
            "warning",
            `${actionLabel} completed: ${succeeded} succeeded, ${failed} failed`,
          );
      }, 500);
    } else {
      const data = messages.length === 1 ? { message_id: messages[0] } : {};
      performAction(
        { server_host_id: selectedServer, action, data },
        {
          onSuccess: (res) => {
            notify(
              "success",
              res?.message || `Action '${action}' completed successfully`,
            );
            if (isGlobalAction) setCooldown();
            refetch();
            setSelectedMessages(new Set());
          },
          onError: (err) => {
            const { message, tracebackId } = processError(err);
            notify(
              "error",
              `Action '${action}' failed: ${message}${tracebackId ? `\nTraceback ID: ${tracebackId}` : ""}`,
            );
          },
        },
      );
    }
  };

  if (!permissions.includes("mailq:view"))
    return (
      <AccessDenied content="Don't have the access to view Mail Queue details" />
    );

  const hasData = queueData.length > 0;
  const hasResults = filteredData.length > 0;
  const isLoadingOrFetching = isLoading || isFetching;

  return (
    <div className="bg-background min-h-screen p-6">
      <div className="mx-auto max-w-[1800px]">
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-4">
            <h1 className="text-foreground text-3xl font-bold">Mail Queue</h1>
            <button
              onClick={() => setShowFetchAll(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors"
            >
              <Layers className="h-4 w-4" />
              Fetch All Servers
            </button>
          </div>
          <p className="text-muted-foreground mx-auto max-w-2xl">
            Monitor and manage mail queues across your servers
          </p>
        </div>

        <ServerSelector
          selectedServer={selectedServer}
          setSelectedServer={setSelectedServer}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          queueFilter={queueFilter}
          setQueueFilter={setQueueFilter}
          onFetch={fetchQueueData}
          isLoading={isLoadingOrFetching}
        />

        {selectedServer && hasResults && (
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-foreground text-lg font-semibold">
              Queue Messages
            </h3>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDomainStats(true)}
                className="bg-accent hover:bg-accent/80 text-accent-foreground flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors"
              >
                <BarChart3 className="h-4 w-4" />
                Domain Stats ({domainStats.length})
              </button>
              <button
                onClick={() => setShowQueueStats(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors"
              >
                <BarChart3 className="h-4 w-4" />
                Total {filteredData.length}{" "}
                {filteredData.length === 1 ? "message" : "messages"}
              </button>
              {canManageQueue && (
                <DropdownButton
                  label="Queue Actions"
                  variant="primary"
                  options={[
                    {
                      id: SERVER_ACTIONS.FLUSH_QUEUE,
                      label: "Flush Queue",
                      description: "Retry all messages",
                      icon: <SendHorizonal className="h-4 w-4" />,
                      onClick: () =>
                        handleGlobalAction(SERVER_ACTIONS.FLUSH_QUEUE),
                      disabled: !hasData,
                      className: "text-success hover:text-success",
                    },
                    {
                      id: SERVER_ACTIONS.HOLD_ALL,
                      label: "Hold All",
                      description: "Pause all messages",
                      icon: <PauseCircle className="h-4 w-4" />,
                      onClick: () =>
                        handleGlobalAction(SERVER_ACTIONS.HOLD_ALL),
                      disabled: !hasData,
                      className: "text-warning hover:text-warning",
                    },
                    {
                      id: SERVER_ACTIONS.RELEASE_ALL,
                      label: "Release All",
                      description: "Release all hold messages",
                      icon: <PlayCircle className="h-4 w-4" />,
                      onClick: () =>
                        handleGlobalAction(SERVER_ACTIONS.RELEASE_ALL),
                      disabled: !hasData,
                    },
                    {
                      id: SERVER_ACTIONS.REQUEUE_ALL,
                      label: "Requeue All",
                      description: "Reinjecting all messages",
                      icon: <RefreshCw className="h-4 w-4" />,
                      onClick: () =>
                        handleGlobalAction(SERVER_ACTIONS.REQUEUE_ALL),
                      disabled: !hasData,
                    },
                    {
                      id: SERVER_ACTIONS.CLEAR_QUEUE,
                      label: "Clear All",
                      description: "Remove all messages from queue",
                      icon: <Trash2 className="h-4 w-4" />,
                      onClick: () =>
                        handleGlobalAction(SERVER_ACTIONS.CLEAR_QUEUE),
                      disabled: !hasData,
                      className: "text-destructive hover:text-destructive",
                    },
                  ]}
                />
              )}
            </div>
          </div>
        )}

        {!selectedServer ? (
          <div className="bg-card border-border rounded-xl border py-16 text-center shadow-sm">
            <Server className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
            <h3 className="text-foreground mb-2 text-lg font-medium">
              Select a Mail Server
            </h3>
            <p className="text-muted-foreground">
              Choose a mail server from the dropdown above to view queue data
            </p>
          </div>
        ) : isLoadingOrFetching ? (
          <div className="bg-card border-border rounded-xl border py-16 text-center shadow-sm">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2"></div>
              <div>
                <h3 className="text-foreground mb-2 text-lg font-medium">
                  Fetching Queue Data
                </h3>
                <p className="text-muted-foreground text-sm">
                  Please wait while we load the mail queue...
                </p>
              </div>
            </div>
          </div>
        ) : isError ? (
          <div className="bg-card border-border rounded-xl border py-16 text-center shadow-sm">
            <div className="flex flex-col items-center justify-center gap-4">
              <AlertCircle className="text-destructive h-16 w-16" />
              <div>
                <h3 className="text-foreground mb-2 text-lg font-medium">
                  Failed to Load Queue Data
                </h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  {error?.response?.data?.message ||
                    error?.message ||
                    "An error occurred while fetching the queue"}
                </p>
                <button
                  onClick={fetchQueueData}
                  disabled={isLoadingOrFetching}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isLoadingOrFetching ? "animate-spin" : ""}`}
                  />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        ) : !hasData ? (
          <div className="bg-card border-border rounded-xl border py-16 text-center shadow-sm">
            <Mail className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
            <h3 className="text-foreground mb-2 text-lg font-medium">
              No Messages in Queue
            </h3>
            <p className="text-muted-foreground mb-4">
              The selected server's mail queue is currently empty
            </p>
            <button
              onClick={fetchQueueData}
              disabled={isLoadingOrFetching}
              className="bg-accent text-accent-foreground hover:bg-accent/80 inline-flex items-center gap-2 rounded-lg px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoadingOrFetching ? "animate-spin" : ""}`}
              />
              Refresh Queue
            </button>
          </div>
        ) : !hasResults ? (
          <div className="bg-card border-border rounded-xl border py-16 text-center shadow-sm">
            <Mail className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
            <h3 className="text-foreground mb-2 text-lg font-medium">
              No Messages Found
            </h3>
            <p className="text-muted-foreground mb-4">
              No messages match your current search or filter criteria
            </p>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => {
                  setSearchQuery("");
                  setQueueFilter("all");
                }}
                className="bg-accent text-accent-foreground hover:bg-accent/80 rounded-lg px-4 py-2 transition-colors"
              >
                Clear Filters
              </button>
              <button
                onClick={fetchQueueData}
                disabled={isLoadingOrFetching}
                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoadingOrFetching ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>
        ) : (
          <QueueTable
            filteredData={filteredData}
            expandedRows={expandedRows}
            onToggleExpand={toggleRowExpansion}
            selectedMessages={selectedMessages}
            onToggleSelect={toggleSelect}
            onMessageAction={handleMessageAction}
            onBulkAction={handleBulkAction}
            onClearSelection={() => setSelectedMessages(new Set())}
          />
        )}

        {showDomainStats && (
          <DomainStatsModal
            isOpen={showDomainStats}
            onClose={() => setShowDomainStats(false)}
            domainStats={domainStats}
            totalMessages={filteredData.length}
          />
        )}
        {showQueueStats && (
          <QueueStatsModal
            isOpen={showQueueStats}
            onClose={() => setShowQueueStats(false)}
            filteredData={filteredData}
          />
        )}
        {showFetchAll && (
          <FetchAllModal
            isOpen={showFetchAll}
            onClose={() => setShowFetchAll(false)}
          />
        )}
        <QueueActionConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() =>
            setConfirmModal({ isOpen: false, action: null, messages: [] })
          }
          onConfirm={executeAction}
          action={confirmModal.action}
          messageCount={confirmModal.messages.length}
          isLoading={isActionPending}
        />
        <BulkActionProgressModal
          isOpen={bulkProgress.isOpen}
          onClose={() =>
            setBulkProgress({ isOpen: false, action: null, progress: {} })
          }
          action={bulkProgress.action}
          progress={bulkProgress.progress}
          canClose={
            bulkProgress.progress.processed === bulkProgress.progress.total
          }
        />
      </div>
    </div>
  );
};

export default SearchQueue;
