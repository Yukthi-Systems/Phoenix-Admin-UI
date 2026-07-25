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

import { useState, useRef, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Code2,
  Monitor,
  Smartphone,
  Tablet,
  GripVertical,
} from "lucide-react";

const HTMLPreview = ({
  htmlContent,
  className = "",
  height = "200px",
  showPreviewText = true,
  resizable = true,
}) => {
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [viewMode, setViewMode] = useState("desktop");
  const [showRawHtml, setShowRawHtml] = useState(false);
  const [previewHeight, setPreviewHeight] = useState(parseInt(height) || 400);
  const [isDragging, setIsDragging] = useState(false);
  const iframeRef = useRef(null);
  const containerRef = useRef(null);

  const getViewportStyles = () => {
    switch (viewMode) {
      case "mobile":
        return "max-w-sm h-full mx-auto";
      case "tablet":
        return "max-w-md h-full mx-auto";
      default:
        return "w-full h-full";
    }
  };

  const getViewportIcon = () => {
    switch (viewMode) {
      case "mobile":
        return <Smartphone className="h-4 w-4" />;
      case "tablet":
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const handleButtonClick = (e, action) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  // Simple and reliable resize handling - following your project's patterns
  const handleMouseDown = (e) => {
    if (!resizable) return;
    e.preventDefault();
    setIsDragging(true);

    const startY = e.clientY;
    const startHeight = previewHeight;

    const handleMouseMove = (e) => {
      const deltaY = e.clientY - startY;
      const newHeight = Math.max(100, Math.min(800, startHeight + deltaY));
      setPreviewHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "ns-resize";
    document.body.style.userSelect = "none";
  };

  const extractStyles = (htmlString) => {
    if (!htmlString) return "";
    const styleMatches = htmlString.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
    if (!styleMatches) return "";
    return styleMatches
      .map((match) => match.replace(/<\/?style[^>]*>/gi, ""))
      .join("\n");
  };

  const removeStyleTags = (htmlString) => {
    if (!htmlString) return "";
    return htmlString.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  };

  const originalContent = htmlContent || "";
  const extractedStyles = extractStyles(originalContent);
  const contentWithoutStyles = removeStyleTags(originalContent);

  useEffect(() => {
    if (!isPreviewVisible || showRawHtml || !iframeRef.current || !htmlContent)
      return;

    // Sanitize HTML: remove <script> tags
    const sanitizedHtml = contentWithoutStyles.replace(
      /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
      "",
    );

    const completeHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { box-sizing: border-box; }
            html, body {
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              line-height: 1.6;
              color: hsl(var(--foreground, 222 47% 11%));
              background-color: hsl(var(--background, 210 40% 98%));
            }
            h1, h2, h3, h4, h5, h6 { font-weight: bold; margin: 0.5em 0; }
            p { margin: 1em 0; }
            ul, ol { margin: 1em 0; padding-left: 2em; }
            li { margin: 0.25em 0; }
            a { color: hsl(var(--primary, 250 47% 60%)); text-decoration: underline; }
            a:hover { text-decoration: none; }
            img { max-width: 100%; height: auto; display: block; }
            blockquote {
              margin: 1em 0;
              padding-left: 1em;
              border-left: 4px solid hsl(var(--border, 214 32% 91%));
              font-style: italic;
            }
            pre {
              font-family: 'Courier New', monospace;
              white-space: pre-wrap;
              padding: 1em;
              background-color: hsl(var(--muted, 210 40% 96%));
              border: 1px solid hsl(var(--border, 214 32% 91%));
              border-radius: 4px;
              overflow-x: auto;
            }
            code {
              font-family: 'Courier New', monospace;
              background-color: hsl(var(--muted, 210 40% 96%));
              padding: 0.2em 0.4em;
              border-radius: 3px;
              border: 1px solid hsl(var(--border, 214 32% 91%));
            }
            table {
              border-collapse: collapse;
              margin: 1em 0;
              width: 100%;
            }
            th, td {
              border: 1px solid hsl(var(--border, 214 32% 91%));
              padding: 0.75em;
              text-align: left;
            }
            th {
              background-color: hsl(var(--muted, 210 40% 96%));
            }
            button {
              cursor: pointer;
              border: 1px solid hsl(var(--border, 214 32% 91%));
              padding: 0.5em 1em;
              border-radius: 4px;
              background-color: hsl(var(--card, 0 0% 100%));
              color: hsl(var(--card-foreground, 222 47% 11%));
            }
            input, textarea, select {
              padding: 0.5em;
              border: 1px solid hsl(var(--border, 214 32% 91%));
              border-radius: 4px;
              font-family: inherit;
              background-color: hsl(var(--card, 0 0% 100%));
              color: hsl(var(--card-foreground, 222 47% 11%));
            }
            ${extractedStyles}
          </style>
        </head>
        <body>${sanitizedHtml}</body>
      </html>
    `;

    // Create a Blob URL to bypass cross-origin issues
    const blob = new Blob([completeHtml], { type: "text/html" });
    const blobUrl = URL.createObjectURL(blob);

    iframeRef.current.src = blobUrl;

    return () => {
      // Cleanup Blob URL when component unmounts or re-renders
      URL.revokeObjectURL(blobUrl);
    };
  }, [
    originalContent,
    extractedStyles,
    contentWithoutStyles,
    isPreviewVisible,
    showRawHtml,
  ]);

  return (
    <div className={className}>
      {showPreviewText && (
        <div className="flex items-center justify-between">
          <label className="text-card-foreground mb-1 block text-sm font-medium">
            HTML Preview
          </label>
        </div>
      )}

      {isPreviewVisible && (
        <div
          ref={containerRef}
          className="border-border bg-card overflow-hidden rounded-md border"
        >
          <div className="border-border bg-muted text-muted-foreground flex items-center justify-between gap-2 border-b px-3 py-2 text-xs">
            <div className="flex items-center gap-1">
              {getViewportIcon()}
              <span className="capitalize">{viewMode} preview</span>
            </div>
            <div className="border-border bg-card flex items-center gap-2 rounded-md border p-1">
              {htmlContent && (
                <button
                  onClick={(e) =>
                    handleButtonClick(e, () => setShowRawHtml(!showRawHtml))
                  }
                  className={`rounded-sm p-1 transition-colors ${showRawHtml ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}
                  title={showRawHtml ? "Show UI" : "Show Code"}
                >
                  <Code2 className="h-4 w-4" />
                </button>
              )}

              <div className="flex items-center gap-1">
                {["desktop", "tablet", "mobile"].map((mode) => {
                  const Icon =
                    mode === "desktop"
                      ? Monitor
                      : mode === "tablet"
                        ? Tablet
                        : Smartphone;
                  return (
                    <button
                      key={mode}
                      onClick={(e) =>
                        handleButtonClick(e, () => setViewMode(mode))
                      }
                      className={`rounded-sm p-1 transition-colors ${viewMode === mode ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}
                      title={`${mode[0].toUpperCase() + mode.slice(1)} view`}
                    >
                      <Icon className="h-3 w-3" />
                    </button>
                  );
                })}
              </div>

              {htmlContent && (
                <span className="ml-2 text-xs">
                  {extractedStyles ? "🎨 Styled" : "📝 Plain"}
                </span>
              )}
            </div>
          </div>

          <div
            className="overflow-y-auto p-4"
            style={{ height: `${previewHeight}px` }}
          >
            {htmlContent ? (
              showRawHtml ? (
                <pre className="text-card-foreground bg-muted border-border h-full overflow-auto rounded border p-3 font-mono text-xs break-words whitespace-pre-wrap">
                  {originalContent}
                </pre>
              ) : (
                <div
                  className={`border-border relative h-full overflow-hidden rounded-md border border-dashed ${getViewportStyles()}`}
                >
                  <iframe
                    ref={iframeRef}
                    title="HTML Preview"
                    className="bg-card h-full w-full border-none"
                    sandbox="allow-scripts allow-forms allow-popups allow-modals"
                  />
                </div>
              )
            ) : (
              <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
                <div className="py-8 text-center">
                  <div className="mb-2 text-2xl">👁️</div>
                  <p>HTML preview will appear here</p>
                  <p className="mt-1 text-xs">
                    Start typing HTML content to see a live preview
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Resize Handle - Only shown if resizable */}
          {resizable && (
            <div
              className={`bg-border hover:bg-primary/50 flex h-1.5 cursor-ns-resize items-center justify-center transition-colors select-none ${isDragging ? "bg-primary/50" : ""} `}
              onMouseDown={handleMouseDown}
              style={{ touchAction: "none" }}
            >
              <div className="bg-muted-foreground/40 h-1 w-12 rounded-full"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HTMLPreview;
