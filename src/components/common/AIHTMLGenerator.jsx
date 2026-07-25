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

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Loader2,
  CheckCircle,
  Code,
  Type,
  AlertCircle,
  Wand2,
} from "lucide-react";
import { useAIStyleGenerate } from "@/hooks/useAiHelp";
import { useToastify } from "@/hooks/useToastify";
import { TextArea } from "@/components/common/Inputs";
import { Button } from "@/components/common/Buttons";

const AIHtmlGenerator = ({
  textContent = "",
  htmlContent = "",
  onTextContentChange,
  onHtmlGenerated,
  textLabel = "Text Content",
  htmlLabel = "HTML Content",
  textPlaceholder = "Enter your text content here (100-400 characters)...",
  htmlPlaceholder = "<p>Generated HTML will appear here</p>",
  textRows = 4,
  htmlRows = 6,
  textRequired = false,
  htmlRequired = false,
  disabled = false,
  textErrors = {},
  htmlErrors = {},
  textRegister = null,
  htmlRegister = null,
  textName = "text_content",
  htmlName = "html_content",
  generatePrompt = null,
  className = "",
  minLength = 100,
  maxLength = 400,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("");
  const [viewMode, setViewMode] = useState("text");
  const [hasGeneratedInSession, setHasGeneratedInSession] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);

  const { mutate: generateStyle, isPending } = useAIStyleGenerate();
  const toast = useToastify();

  // Update character count when textContent changes
  useEffect(() => {
    setCharacterCount(textContent?.length || 0);
  }, [textContent]);

  // Detect if HTML content was updated externally (e.g. by auto-generation in parent)
  useEffect(() => {
    if (htmlContent && !hasGeneratedInSession && htmlContent.length > 0) {
        // If content appears and user didn't click generate here, assume parent or load did it
        // We don't strictly set hasGeneratedInSession to true here to avoid the green success message 
        // popping up unexpectedly, but we ensure the textarea shows it.
    }
  }, [htmlContent, hasGeneratedInSession]);

  const isValidLength =
    characterCount >= minLength && characterCount <= maxLength;
  const canGenerate = textContent?.trim() && isValidLength;

  const getCharacterStatus = () => {
    if (characterCount === 0) return "neutral";
    if (characterCount < minLength) return "warning";
    if (characterCount > maxLength) return "error";
    return "success";
  };

  const getCharacterColor = () => {
    const status = getCharacterStatus();
    switch (status) {
      case "warning":
        return "text-warning";
      case "error":
        return "text-destructive";
      case "success":
        return "text-success";
      default:
        return "text-muted-foreground";
    }
  };

  const handleTextChange = (value) => {
    if (onTextContentChange) {
      onTextContentChange(value);
    }
    setCharacterCount(value.length);
  };

  const handleGenerate = async () => {
    if (!canGenerate) {
      if (!textContent?.trim()) {
        toast("error", "Please enter text content before generating HTML");
      } else if (!isValidLength) {
        toast(
          "error",
          `Text must be between ${minLength}-${maxLength} characters`,
        );
      }
      return;
    }

    setIsGenerating(true);
    setGenerationStep("Analyzing your content...");

    const prompt = generatePrompt
      ? generatePrompt.replace("{text}", textContent.trim())
      : `Generate a very good stylish email footer in HTML format with inline CSS styles with the text: "${textContent.trim()}"`;

    try {
      setTimeout(() => setGenerationStep("Creating HTML structure..."), 1000);
      setTimeout(() => setGenerationStep("Applying modern styling..."), 2000);
      setTimeout(
        () => setGenerationStep("Optimizing for email clients..."),
        3000,
      );

      generateStyle(prompt, {
        onSuccess: (response) => {
          setIsGenerating(false);
          setGenerationStep("");

          if (response?.data?.answer) {
            const sanitized = response.data.answer
              .replace(/```html\s*/gi, "")
              .replace(/```\s*/g, "")
              .replace(/<\/?(?:html|head|body|title|meta|script|style|link)\b[^>]*>/gi, "")
              .trim();
            if (onHtmlGenerated) {
              onHtmlGenerated(sanitized);
            }
            setHasGeneratedInSession(true);
            setViewMode("html"); // Auto switch to HTML view on success
            toast("success", "HTML content generated successfully!");
          } else {
            toast("error", "No content received from AI");
          }
        },
        onError: (error) => {
          setIsGenerating(false);
          setGenerationStep("");
          console.error("AI Generation Error:", error);

          const message =
            error.response?.data?.message ||
            error.message ||
            "Failed to generate HTML";
          const tracebackId = error.response?.data?.traceback_id;

          toast(
            "error",
            `${message}${tracebackId ? `\nTraceback ID: ${tracebackId}` : ""}`,
          );
        },
      });
    } catch (error) {
      setIsGenerating(false);
      setGenerationStep("");
      toast("error", "An unexpected error occurred");
    }
  };

  const handleButtonClick = (e, action) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  return (
    <div className={className}>
      {/* Header Bar */}
      <div className="border-border bg-card rounded-md border">
        <div className="border-border bg-muted flex items-center justify-between gap-2 border-b px-3 py-2">
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Wand2 className="h-4 w-4" />
            <span className="font-medium">
              {viewMode === "text" ? textLabel : htmlLabel}
            </span>
            {hasGeneratedInSession && (
              <div className="flex items-center gap-1">
                <CheckCircle className="text-success h-3 w-3" />
                <span className="text-success text-xs">Generated</span>
              </div>
            )}
          </div>

          {/* Toggle Switches */}
          <div className="border-border bg-card flex items-center gap-1 rounded-md border p-1">
            <button
              type="button"
              onClick={(e) => handleButtonClick(e, () => setViewMode("text"))}
              className={`flex items-center gap-1 rounded-sm px-2 py-1 text-xs font-medium transition-colors ${
                viewMode === "text"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
              title="Text Content"
            >
              <Type className="h-3 w-3" />
              Text
            </button>
            <button
              type="button"
              onClick={(e) => handleButtonClick(e, () => setViewMode("html"))}
              className={`flex items-center gap-1 rounded-sm px-2 py-1 text-xs font-medium transition-colors ${
                viewMode === "html"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
              title="HTML Content"
            >
              <Code className="h-3 w-3" />
              HTML
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4">
          {viewMode === "text" ? (
            <div className="space-y-3">
              {/* Text Input with embedded character counter */}
              <div className="relative">
                <TextArea
                  label=""
                  name={textName}
                  value={textContent}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder={textPlaceholder}
                  rows={textRows}
                  isRequired={textRequired}
                  disabled={disabled}
                  errors={textErrors}
                  register={textRegister}
                />

                {/* Character Counter in corner */}
                <div className="absolute right-2 bottom-2 flex items-center gap-2">
                  {!isValidLength && characterCount > 0 && (
                    <div className="bg-card/90 border-border flex items-center gap-1 rounded border px-2 py-1 text-xs">
                      <AlertCircle className="text-warning h-3 w-3" />
                      <span className="text-warning">
                        {characterCount < minLength
                          ? `Need ${minLength - characterCount} more`
                          : `${characterCount - maxLength} over`}
                      </span>
                    </div>
                  )}
                  <div className="bg-card/90 border-border rounded border px-2 py-1 text-xs">
                    <span className={`font-mono ${getCharacterColor()}`}>
                      {characterCount}/{maxLength}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleGenerate}
                  disabled={
                    isGenerating || isPending || disabled || !canGenerate
                  }
                  className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2"
                  size="sm"
                  icon={isGenerating || isPending ? Loader2 : Sparkles}
                >
                  {isGenerating || isPending
                    ? "Generating..."
                    : "Generate HTML with AI"}
                </Button>
              </div>
            </div>
          ) : (
            /* HTML Content View */
            <div>
              <TextArea
                label=""
                name={htmlName}
                value={htmlContent}
                onChange={(e) =>
                  onHtmlGenerated && onHtmlGenerated(e.target.value)
                }
                placeholder={htmlPlaceholder}
                rows={htmlRows}
                isRequired={htmlRequired}
                disabled={disabled}
                errors={htmlErrors}
                register={htmlRegister}
                info={
                  hasGeneratedInSession
                    ? "Generated HTML content. You can edit this if needed."
                    : htmlContent
                      ? "HTML content is loaded. You can edit this if needed."
                      : "HTML content will appear here after generation"
                }
              />
            </div>
          )}

          {/* Generation Progress */}
          {(isGenerating || isPending) && (
            <div className="from-muted/50 to-muted/30 border-border mt-4 rounded-md border bg-gradient-to-r p-4 text-left">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Loader2 className="text-primary h-5 w-5 animate-spin" />
                  <Sparkles className="text-primary absolute top-1 left-1 h-3 w-3 animate-pulse" />
                </div>
                <div className="flex-1">
                  <p className="text-card-foreground text-left text-sm font-medium">
                    Generating HTML Content
                  </p>
                  {generationStep && (
                    <p className="text-muted-foreground mt-1 text-left text-xs">
                      {generationStep}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-3">
                <div className="bg-muted h-2 w-full rounded-full">
                  <div
                    className="from-primary to-primary/80 h-2 animate-pulse rounded-full bg-gradient-to-r transition-all duration-500"
                    style={{ width: "60%" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {hasGeneratedInSession &&
            !isGenerating &&
            !isPending &&
            viewMode === "text" && (
              <div className="text-success bg-success/10 border-success/20 mt-4 flex items-center gap-2 rounded-md border p-3 text-sm">
                <CheckCircle className="h-4 w-4" />
                <span>
                  HTML content generated successfully! Switch to HTML tab to
                  view/edit.
                </span>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AIHtmlGenerator;