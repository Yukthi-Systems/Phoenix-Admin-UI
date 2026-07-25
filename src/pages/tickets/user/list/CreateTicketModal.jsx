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

import React, { useState, useRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";
import {
  X,
  UploadCloud,
  FileText,
  Trash2,
  Paperclip,
  Loader2,
  AlertCircle,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useAtomValue } from "jotai";
import { userProfileAtom } from "@/store/userProfile";
import { toast } from "react-toastify";
import { Input, SelectField } from "@/components/common/Inputs";

import { SubmitButton, Button } from "@/components/common/Buttons";
import { createTicketSchema } from "./validationSchema";
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_SUBCATEGORIES,
} from "./data";
import {
  useCreateSupportTicket,
  useUploadTicketFile,
} from "@/hooks/useSupportTickets";
import { MarkdownEditor } from "@/components/common/MarkdownEditor";
import { formatFileSize } from "@/utils/numberFormat";

const CreateTicketModal = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const userProfile = useAtomValue(userProfileAtom);
  const fileInputRef = useRef(null);
  const scrollableRef = useRef(null);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    current: 0,
    total: 0,
  });

  const { mutateAsync: createTicket } = useCreateSupportTicket();
  const { mutateAsync: uploadFile } = useUploadTicketFile();

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(createTicketSchema),
    defaultValues: {
      title: "",
      category: "",
      sub_category: "",
      priority: "Medium",
      description: "",
    },
  });

  const selectedCategory = watch("category");
  const selectedSubCategory = watch("sub_category");

  // Auto-select subcategory if only one option
  useEffect(() => {
    if (selectedCategory) {
      const subcategories = TICKET_SUBCATEGORIES[selectedCategory] || [];
      if (subcategories.length === 1 && !selectedSubCategory) {
        setValue("sub_category", subcategories[0].value);
      }
    }
  }, [selectedCategory, selectedSubCategory, setValue]);

  // Process files (shared logic for both drag-drop and click-upload)
  const processFiles = (files) => {
    if (!files.length) return;

    const newFiles = files.map((file) => ({
      id: Math.random().toString(36).substring(7),
      fileObject: file,
      name: file.name,
      size: file.size,
      type: file.type.split("/").pop(),
      previewUrl: URL.createObjectURL(file),
    }));

    setSelectedFiles((prev) => [...prev, ...newFiles]);

    // Auto-scroll to bottom after adding files
    setTimeout(() => {
      if (scrollableRef.current) {
        scrollableRef.current.scrollTo({
          top: scrollableRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 100);
  };

  // Handle File Selection (click)
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Drag and Drop Handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isSubmitting) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only set isDragging to false if we're leaving the drop zone entirely
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (isSubmitting) return;

    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const removeFile = (idToRemove) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== idToRemove));
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setUploadProgress({ current: 0, total: selectedFiles.length });

    try {
      const uploadedAttachments = [];

      if (selectedFiles.length > 0) {
        for (let i = 0; i < selectedFiles.length; i++) {
          const fileItem = selectedFiles[i];
          const formData = new FormData();
          formData.append("file", fileItem.fileObject);

          try {
            const response = await uploadFile(formData);
            const fileId = response?.file_id;

            if (fileId) {
              uploadedAttachments.push({
                file_id: fileId,
                file_name: fileItem.name,
                file_size_mb: Math.max(
                  parseFloat((fileItem.size / (1024 * 1024)).toFixed(2)),
                  0.1,
                ),
                file_type: fileItem.type,
                uploaded_at: new Date().toISOString(),
              });
            }
          } catch (err) {
            console.error(`Failed to upload ${fileItem.name}`, err);
            toast.error(
              err?.message ||
                `${t("Failed to upload")}: ${fileItem.name}`,
            );
          }

          setUploadProgress((prev) => ({ ...prev, current: i + 1 }));
        }
      }

      const payload = {
        title: data.title,
        description: data.description,
        details: {
          category: data.category,
          sub_category: data.sub_category,
          priority: data.priority,
          additional_info: "Created via Admin Panel UI",
          created_by: userProfile?.user_name || "Unknown User",
          isEndUser: true,
          attachments: uploadedAttachments,
        },
      };

      await createTicket(payload);

      toast.success(t("Support ticket created successfully"));
      reset();
      setSelectedFiles([]);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Creation error:", error);
      toast.error(error.message || t("Failed to create ticket"));
    } finally {
      setIsSubmitting(false);
      setUploadProgress({ current: 0, total: 0 });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        className={`bg-card flex flex-col text-left ${
          isFullscreen
            ? "w-full h-full"
            : "w-full max-w-4xl rounded-xl border border-border shadow-2xl max-h-[90vh]"
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 flex-shrink-0">
          <h2 className="text-xl font-semibold text-card-foreground">
            {t("Create Support Ticket")}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              disabled={isSubmitting}
              className="text-muted-foreground hover:text-foreground transition-colors rounded-full p-1 hover:bg-accent disabled:opacity-50"
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-muted-foreground hover:text-destructive transition-colors rounded-full p-1 hover:bg-accent disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div ref={scrollableRef} className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <form
              id="create-ticket-form"
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
            >
              {/* Title */}
              <Input
                label="Subject"
                name="title"
                placeholder="E.g., Unable to send emails to external domains"
                register={register}
                errors={errors}
                isRequired
                disabled={isSubmitting}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Category */}
                <SelectField
                  label="Category"
                  name="category"
                  register={register}
                  errors={errors}
                  options={TICKET_CATEGORIES}
                  placeholder="Select Category"
                  isRequired
                  disabled={isSubmitting}
                />

                {/* Sub-Category */}
                <SelectField
                  label="Sub-Category"
                  name="sub_category"
                  register={register}
                  errors={errors}
                  options={
                    selectedCategory
                      ? TICKET_SUBCATEGORIES[selectedCategory] || []
                      : []
                  }
                  placeholder={
                    selectedCategory
                      ? "Select Sub-Category"
                      : "Select Category First"
                  }
                  isRequired
                  disabled={!selectedCategory || isSubmitting}
                />
              </div>

              {/* Priority */}
              <div className="w-full md:w-1/2">
                <SelectField
                  label="Priority"
                  name="priority"
                  register={register}
                  errors={errors}
                  options={TICKET_PRIORITIES}
                  isRequired
                  disabled={isSubmitting}
                />
              </div>

              {/* Description */}
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <MarkdownEditor
                    label="Description"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.description}
                    placeholder="Please provide detailed information about the issue. Markdown supported."
                    rows={8}
                    isRequired
                    disabled={isSubmitting}
                  />
                )}
              />

              {/* Attachments Section */}
              <div className="space-y-2 pt-2">
                <label className="text-sm font-medium text-card-foreground block">
                  {t("Attachments")}
                </label>

                <div
                  className={`border-2 border-dashed rounded-lg p-6 transition-all text-center ${
                    isSubmitting
                      ? "opacity-50 cursor-not-allowed border-border"
                      : isDragging
                      ? "border-primary bg-primary/10 cursor-pointer"
                      : "border-border hover:bg-accent/30 cursor-pointer"
                  }`}
                  onClick={() => !isSubmitting && fileInputRef.current?.click()}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    onChange={handleFileSelect}
                    disabled={isSubmitting}
                  />
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <UploadCloud 
                      size={32} 
                      className={isDragging ? "text-primary" : ""}
                    />
                    <p className={`text-sm ${isDragging ? "text-primary font-medium" : ""}`}>
                      {isDragging 
                        ? t("Drop files here") 
                        : t("Drag and drop files here or click to upload")
                      }
                    </p>
                    {!isDragging && (
                      <p className="text-xs text-muted-foreground/70">
                        {t("Files will be uploaded when you create the ticket.")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Attachments List */}
                {selectedFiles.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {selectedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-card rounded-md border border-border group"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="bg-primary/10 p-2 rounded">
                            {["png", "jpg", "jpeg", "gif"].includes(
                              file.type,
                            ) ? (
                              <FileText size={16} className="text-primary" />
                            ) : (
                              <Paperclip size={16} className="text-primary" />
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium truncate text-foreground">
                              {file.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)} • {file.fileObject.type || 'Unknown'}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(file.id)}
                          disabled={isSubmitting}
                          className="text-muted-foreground hover:text-destructive p-2 rounded hover:bg-destructive/10 transition-colors disabled:opacity-50"
                          title={t("Remove file")}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {isSubmitting && (
                <div className="bg-accent/30 rounded-lg p-3 flex items-center gap-3 border border-primary/20">
                  <Loader2 className="animate-spin text-primary" size={20} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {uploadProgress.total > 0
                        ? t(
                            `Uploading files (${uploadProgress.current}/${uploadProgress.total}) & Creating Ticket...`,
                          )
                        : t("Creating Ticket...")}
                    </p>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4 flex justify-end gap-3 bg-muted/20 flex-shrink-0">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            {t("Cancel")}
          </Button>
          <form onSubmit={handleSubmit(onSubmit)}>
            <SubmitButton
              isPending={isSubmitting}
              label={isSubmitting ? "Processing..." : "Create Ticket"}
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTicketModal;
