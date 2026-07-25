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

import { useState, useRef, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  useGetTicketFollowUps,
  useAddTicketFollowUp,
  useUploadTicketFile,
  useGetTicketByID,
} from "@/hooks/useSupportTickets";

export const useFollowUpLogic = (
  organizationId,
  ticketId,
  userProfile,
  additionalInfo = "Sent via UI"
) => {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // API Hooks
  const { data: ticketDataResponse, isLoading: isTicketLoading } =
    useGetTicketByID(organizationId, ticketId);

  const { data: followUpsData, isLoading: isFollowUpsLoading } =
    useGetTicketFollowUps(organizationId, ticketId, 1, 100);

  const { mutate: sendMessage, isPending: isSending } = useAddTicketFollowUp();
  const { mutateAsync: uploadFile } = useUploadTicketFile();

  // Derived State
  const ticketDetails = ticketDataResponse?.data;
  const isResolved = ticketDetails?.ticket_status === "RESOLVED";

  // Conversation Timeline
  const conversationTimeline = useMemo(() => {
    const timeline = [];

    if (ticketDetails) {
      timeline.push({
        id: `initial-${ticketDetails.ticket_id}`,
        isInitialTicket: true,
        message: ticketDetails.ticket_description,
        created_at: ticketDetails.created_at,
        details: {
          created_by: ticketDetails.created_by,
          attachments: ticketDetails.details?.attachments || [],
        },
      });
    }

    const followUps = followUpsData?.data?.data || [];
    const sortedFollowUps = [...followUps].reverse();

    return [...timeline, ...sortedFollowUps];
  }, [ticketDetails, followUpsData]);

  const isLoading = isTicketLoading || isFollowUpsLoading;

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollContainerRef.current) {
      const { scrollHeight, clientHeight } = scrollContainerRef.current;
      scrollContainerRef.current.scrollTop = scrollHeight - clientHeight;
    }
  }, [conversationTimeline.length, isLoading]);

  // Handlers
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setSelectedFiles((prev) => [...prev, ...files]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if ((!message || message.trim() === "") && selectedFiles.length === 0)
      return;

    setIsUploading(true);
    const uploadedAttachments = [];

    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await uploadFile(formData);
        const fileId = response?.file_id || response?.id;
        if (fileId) {
          uploadedAttachments.push({
            file_id: fileId,
            file_name: file.name,
            file_size_mb: Math.max(
              parseFloat((file.size / (1024 * 1024)).toFixed(2)),
              0.1
            ),
            file_type: file.type,
            uploaded_at: new Date().toISOString(),
          });
        }
      } catch (error) {
        toast.error(error?.message || `Failed to upload ${file.name}`);
        setIsUploading(false);
        return;
      }
    }

    setIsUploading(false);
    const payload = {
      message: message,
      details: {
        created_by: userProfile?.user_name || userProfile?.name || "User",
        additional_info: additionalInfo,
        attachments: uploadedAttachments,
      },
    };

    sendMessage(
      { organization_id: organizationId, ticket_id: ticketId, payload },
      {
        onSuccess: () => {
          setMessage("");
          setSelectedFiles([]);
          queryClient.invalidateQueries([
            "support-ticket-followups",
            organizationId,
            ticketId,
          ]);
          toast.success("Message sent successfully!");
        },
        onError: (err) => {
          toast.error(err.message || "Failed to send message");
        },
      }
    );
  };

  return {
    message,
    setMessage,
    selectedFiles,
    setSelectedFiles,
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
  };
};
