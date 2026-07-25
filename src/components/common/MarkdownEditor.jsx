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

import React, { useState, useRef } from "react";
import {
  Bold,
  Italic,
  List,
  Code,
  Link as LinkIcon,
  Heading1,
  Eye,
  Edit3,
  Quote,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { MarkdownView } from "./MarkDownViewer";

export function MarkdownEditor({
  label = "",
  value = "",
  onChange,
  onPaste,
  error = null,
  disabled = false,
  placeholder = "",
  rows = 5,
  isRequired = false,
  className = "",
}) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("write");
  const textareaRef = useRef(null);

  const insertFormat = (startTag, endTag = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    const newText =
      text.substring(0, start) +
      startTag +
      selectedText +
      endTag +
      text.substring(end);

    onChange({ target: { value: newText, name: textarea.name } });

    setTimeout(() => {
      textarea.focus();
      const cursorPosition = start + startTag.length + selectedText.length;
      textarea.setSelectionRange(cursorPosition, cursorPosition);
    }, 0);
  };

  const insertQuote = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    // Find the start of the first line (go back to last newline or start of text)
    let lineStart = start;
    while (lineStart > 0 && text[lineStart - 1] !== '\n') {
      lineStart--;
    }

    // Find the end of the last line (go forward to next newline or end of text)
    let lineEnd = end;
    while (lineEnd < text.length && text[lineEnd] !== '\n') {
      lineEnd++;
    }

    // Extract the entire line(s) content
    const selectedLines = text.substring(lineStart, lineEnd);
    const lines = selectedLines.split('\n');

    // Check if all lines are already quoted
    const allQuoted = lines.every(line => line.trim().startsWith('>'));

    let newLines;
    if (allQuoted) {
      // Remove quotes from all lines
      newLines = lines.map(line => line.replace(/^>\s?/, ''));
    } else {
      // Add quotes to all lines
      newLines = lines.map(line => {
        // If line is already quoted, don't add another quote
        if (line.trim().startsWith('>')) {
          return line;
        }
        // Add quote, preserving leading whitespace for empty lines
        return line.trim() ? `> ${line}` : '>';
      });
    }

    const quotedText = newLines.join('\n');

    // Build the new text
    const newText =
      text.substring(0, lineStart) +
      quotedText +
      text.substring(lineEnd);

    onChange({ target: { value: newText, name: textarea.name } });

    // Position cursor at the end of the quoted section
    const newCursorPos = lineStart + quotedText.length;

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleKeyDown = (e) => {
    // Handle Tab key
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;

      // Insert tab (2 spaces)
      const newText =
        text.substring(0, start) +
        "  " +
        text.substring(end);

      onChange({ target: { value: newText, name: textarea.name } });

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 2, start + 2);
      }, 0);
    }
  };

  const toolbarItems = [
    {
      icon: <Bold size={16} />,
      label: "Bold",
      action: () => insertFormat("**", "**"),
    },
    {
      icon: <Italic size={16} />,
      label: "Italic",
      action: () => insertFormat("*", "*"),
    },
    {
      icon: <Heading1 size={16} />,
      label: "Heading",
      action: () => insertFormat("# ", ""),
    },
    {
      icon: <List size={16} />,
      label: "List",
      action: () => insertFormat("- ", ""),
    },
    {
      icon: <Quote size={16} />,
      label: "Quote",
      action: insertQuote,
    },
    {
      icon: <Code size={16} />,
      label: "Code",
      action: () => insertFormat("`", "`"),
    },
    {
      icon: <LinkIcon size={16} />,
      label: "Link",
      action: () => insertFormat("[", "](url)"),
    },
  ];

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {label && (
        <label className="text-card-foreground block text-left text-sm font-medium">
          {t(label)}
          {isRequired && <span className="text-destructive"> *</span>}
        </label>
      )}

      <div
        className={`border rounded-md overflow-hidden bg-card transition-colors duration-200 ${error ? "border-destructive" : "border-border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary"}`}
      >
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-2 py-1.5">
          <div className="flex items-center gap-1">
            {activeTab === "write" &&
              toolbarItems.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={item.action}
                  disabled={disabled}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                  title={t(item.label)}
                >
                  {item.icon}
                </button>
              ))}
          </div>

          <div className="flex bg-muted rounded-lg p-0.5 border border-border">
            <button
              type="button"
              onClick={() => setActiveTab("write")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all focus:outline-none ${activeTab === "write" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Edit3 size={12} /> {t("Write")}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all focus:outline-none ${activeTab === "preview" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Eye size={12} /> {t("Preview")}
            </button>
          </div>
        </div>

        <div className="relative min-h-[40px]">
          {activeTab === "write" ? (
            <textarea
              ref={textareaRef}
              value={value}
              onChange={onChange}
              onPaste={onPaste}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder={t(placeholder)}
              rows={rows}
              name={label.toLowerCase().replace(/\s/g, "_")}
              className="w-full h-full p-3 bg-transparent border-none resize-y focus:ring-0 focus:outline-none text-sm font-mono text-foreground placeholder:text-muted-foreground"
            />
          ) : (
            <div className="w-full h-full p-4 overflow-y-auto max-h-[300px] bg-card">
              {value ? (
                <MarkdownView content={value} />
              ) : (
                <p className="text-muted-foreground italic text-sm">
                  {t("Nothing to preview")}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="text-destructive mt-1 text-sm text-left">
          {error.message}
        </p>
      )}
    </div>
  );
}