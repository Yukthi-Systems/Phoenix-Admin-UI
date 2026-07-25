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

import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useAtomValue } from "jotai";
import { Loader2, FileText } from "lucide-react";
import { userProfileAtom } from "@/store/userProfile";
import { userInfoAtom } from "@/store/userInfo";
import { useUserTimezone } from "@/hooks/useTimezone";
import { BackButton } from "@/components/common/Buttons";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import AccessDenied from "@/components/common/AccessDenied";
import { MessageItem } from "../../MessageItem";
import { MessageInput } from "../../MessageInput";
import { useFollowUpLogic } from "@/hooks/useFollowUp";
import StatusBadge from "../../StatusBadge";

const FollowUp = () => {
  const { id: ticketId } = useParams();
  const userProfile = useAtomValue(userProfileAtom);
  const userInfo = useAtomValue(userInfoAtom);
  const { permissions = [] } = userProfile;
  const organizationId =
    userInfo?.organization_id || userProfile?.organization_id;
  const { formatUserDateNice } = useUserTimezone();

  const {
    message,
    setMessage,
    selectedFiles,
    isUploading,
    fileInputRef,
    scrollContainerRef,
    ticketDetails,
    isResolved,
    conversationTimeline,
    isLoading,
    isSending,
    handleFileSelect,
    removeAttachment,
    handleSendMessage,
  } = useFollowUpLogic(
    organizationId,
    ticketId,
    userProfile,
    "Sent via Admin Panel UI",
  );

  // Breadcrumbs Logic
  const breadcrumbItems = useMemo(() => {
    const title = ticketDetails?.ticket_title || "Loading...";
    const truncatedTitle =
      title.length > 30 ? `${title.substring(0, 30)}...` : title;

    return [
      { name: "Support", link: "/support/admin/tickets" },
      { name: "Admin Tickets", link: "/support/admin/tickets" },
      { name: truncatedTitle, isActive: true },
    ];
  }, [ticketDetails]);

  // Permission Check
  if (
    !permissions.includes("support_admin:view") ||
    !permissions.includes("support_admin:edit")
  ) {
    return (
      <AccessDenied
        message="You don't have permission to view support tickets"
        redirectTo="/dashboard"
      />
    );
  }

  return (
    <div className="flex h-full w-full flex-col px-2">
      {/* Header Area */}
      <div className="mb-4 flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <BackButton />
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {ticketDetails && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground font-medium hidden sm:block">
              Current Status:
            </span>
            <StatusBadge status={ticketDetails.ticket_status} />
          </div>
        )}
      </div>

      {/* Main Chat Card */}
      <div className="flex-1 flex flex-col overflow-hidden rounded-xl border border-border bg-background text-left shadow-sm min-h-0">
        {/* Messages Area */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/5 custom-scrollbar"
        >
          {isLoading ? (
            <div className="flex justify-center items-center h-full text-muted-foreground">
              <Loader2 className="animate-spin mr-2" size={20} /> Loading
              conversation...
            </div>
          ) : conversationTimeline.length === 0 ? (
            <div className="flex flex-col items-center mt-8 text-muted-foreground opacity-60">
              <div className="bg-muted p-4 rounded-full mb-3">
                <FileText size={32} />
              </div>
              <p>No content found.</p>
            </div>
          ) : (
            conversationTimeline.map((item, index) => {
              const creatorName =
                item.details?.created_by || item.created_by || "Support";
              const isLastItem = index === conversationTimeline.length - 1;

              return (
                <MessageItem
                  key={item.id || index}
                  item={item}
                  index={index}
                  isLastItem={isLastItem}
                  creatorName={creatorName}
                  formatUserDateNice={formatUserDateNice}
                />
              );
            })
          )}
        </div>

        {/* Input Area */}
        <MessageInput
          isResolved={isResolved}
          selectedFiles={selectedFiles}
          message={message}
          setMessage={setMessage}
          isSending={isSending}
          isUploading={isUploading}
          fileInputRef={fileInputRef}
          handleFileSelect={handleFileSelect}
          removeAttachment={removeAttachment}
          handleSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default FollowUp;
