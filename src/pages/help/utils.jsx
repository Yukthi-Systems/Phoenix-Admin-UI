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

/**
 * Enhanced Markdown Formatter Utility - FIXED INDENTATION
 * Handles markdown-style content for AI responses with proper nested lists
 */

import React from "react";

/**
 * Detect and convert URLs and markdown links to clickable links
 */
export const detectLinks = (text) => {
  if (typeof text !== "string") return text;

  const parts = [];
  let lastIndex = 0;

  // First handle markdown-style links [text](url)
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;

  // Collect all markdown links first
  const markdownLinks = [];
  while ((match = markdownLinkRegex.exec(text)) !== null) {
    markdownLinks.push({
      start: match.index,
      end: match.index + match[0].length,
      text: match[1],
      url: match[2],
      fullMatch: match[0],
    });
  }

  // Sort by start position
  markdownLinks.sort((a, b) => a.start - b.start);

  // Process markdown links and remaining text
  markdownLinks.forEach((link, index) => {
    // Add text before this link
    if (link.start > lastIndex) {
      const beforeText = text.slice(lastIndex, link.start);
      const urlProcessed = detectUrlsInText(beforeText);
      if (Array.isArray(urlProcessed)) {
        parts.push(...urlProcessed);
      } else {
        parts.push(urlProcessed);
      }
    }

    // Add the markdown link
    const fullUrl = link.url.startsWith("http")
      ? link.url
      : `https://${link.url}`;
    parts.push(
      <a
        key={`markdown-${index}-${link.start}`}
        href={fullUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:text-primary/80 underline break-all"
      >
        {link.text}
      </a>,
    );

    lastIndex = link.end;
  });

  // Handle remaining text after last markdown link
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex);
    const urlProcessed = detectUrlsInText(remainingText);
    if (Array.isArray(urlProcessed)) {
      parts.push(...urlProcessed);
    } else {
      parts.push(urlProcessed);
    }
  }

  return parts.length > 1 ? parts : text;
};

/**
 * Detect URLs in plain text (helper function)
 */
const detectUrlsInText = (text) => {
  if (typeof text !== "string") return text;

  // More precise URL regex that requires valid TLD and excludes common false positives
  const urlRegex =
    /(?:https?:\/\/|www\.)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+(?:\/[^\s)]*)?(?:\?[^\s)]*)?(?:#[^\s)]*)?\b/g;

  const parts = [];
  let lastIndex = 0;
  let match;

  // Common false positive patterns to exclude
  const falsePositives = [
    /\be\.g\./i,
    /\bi\.e\./i,
    /\betc\./i,
    /\bvs\./i,
    /\bno\./i,
    /\bfig\./i,
    /\bref\./i,
    /\bch\./i,
    /\bsec\./i,
    /\bvol\./i,
    /\bp\./i,
    /\bpp\./i,
    /\bdr\./i,
    /\bmr\./i,
    /\bms\./i,
    /\bmrs\./i,
    /\bprof\./i,
    /\binc\./i,
    /\bcorp\./i,
    /\bltd\./i,
    /\bco\./i,
    /\bjan\./i,
    /\bfeb\./i,
    /\bmar\./i,
    /\bapr\./i,
    /\bjun\./i,
    /\bjul\./i,
    /\baug\./i,
    /\bsep\./i,
    /\boct\./i,
    /\bnov\./i,
    /\bdec\./i,
    /\bmon\./i,
    /\btue\./i,
    /\bwed\./i,
    /\bthu\./i,
    /\bfri\./i,
    /\bsat\./i,
    /\bsun\./i,
  ];

  while ((match = urlRegex.exec(text)) !== null) {
    const url = match[0];
    const matchStart = match.index;
    const matchEnd = match.index + url.length;

    // Get context around the match for better detection
    const beforeMatch = text.slice(Math.max(0, matchStart - 15), matchStart);
    const afterMatch = text.slice(
      matchEnd,
      Math.min(text.length, matchEnd + 5),
    );
    const fullContext = text.slice(
      Math.max(0, matchStart - 5),
      Math.min(text.length, matchEnd + 5),
    );

    // Skip if it's an email address
    if (beforeMatch.includes("@") || afterMatch.includes("@")) {
      continue;
    }

    // Skip if it matches common false positive patterns
    let isFalsePositive = false;
    for (const pattern of falsePositives) {
      if (pattern.test(fullContext)) {
        isFalsePositive = true;
        break;
      }
    }

    if (isFalsePositive) {
      continue;
    }

    // Skip if it's just a single word with dots but no valid domain structure
    const tldMatch = url.match(/\.([a-zA-Z]{2,})(?:\/|$)/);
    if (!tldMatch) {
      continue;
    }

    // Skip very short "domains" that are likely abbreviations
    const domain = url.split("/")[0];
    if (
      domain.length < 4 &&
      !url.startsWith("http") &&
      !url.startsWith("www.")
    ) {
      continue;
    }

    // Skip if it looks like a numbered list item
    if (/^\d+\./.test(url) && beforeMatch.match(/\s+$/)) {
      continue;
    }

    // If we get here, it's likely a real URL
    if (matchStart > lastIndex) {
      parts.push(text.slice(lastIndex, matchStart));
    }

    const fullUrl = url.startsWith("http") ? url : `https://${url}`;
    parts.push(
      <a
        key={`url-${matchStart}-${url}`}
        href={fullUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:text-primary/80 underline break-all"
      >
        {url}
      </a>,
    );

    lastIndex = matchEnd;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 1 ? parts : text;
};

/**
 * Process text with inline formatting (bold, italic, code) - FIXED COLOR INHERITANCE
 */
const processInlineText = (text, inheritedClasses = "") => {
  if (typeof text !== "string") return text;

  let result = text;
  const elements = [];
  let currentIndex = 0;

  // Process in order: code first, then bold, then italic to avoid conflicts
  const patterns = [
    {
      regex: /`([^`]+)`/g,
      render: (match, content) => (
        <code
          key={`code-${match.index}`}
          className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground"
        >
          {content}
        </code>
      ),
    },
    {
      regex: /\*\*([^*]+?)\*\*/g,
      render: (match, content) => (
        <strong
          key={`bold-${match.index}`}
          className={`font-semibold ${inheritedClasses || "text-foreground"}`}
        >
          {content}
        </strong>
      ),
    },
    {
      regex: /\*([^*]+?)\*/g,
      render: (match, content) => (
        <em
          key={`italic-${match.index}`}
          className={`italic ${inheritedClasses || "text-foreground"}`}
        >
          {content}
        </em>
      ),
    },
  ];

  // Find all matches first
  const allMatches = [];
  patterns.forEach((pattern, patternIndex) => {
    let match;
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
    while ((match = regex.exec(text)) !== null) {
      allMatches.push({
        start: match.index,
        end: match.index + match[0].length,
        content: match[1],
        render: pattern.render,
        match: match,
        patternIndex,
      });
    }
  });

  // Sort by start position and pattern priority (code first, then bold, then italic)
  allMatches.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return a.patternIndex - b.patternIndex;
  });

  // Remove overlapping matches (keep first one)
  const validMatches = [];
  let lastEnd = 0;
  allMatches.forEach((match) => {
    if (match.start >= lastEnd) {
      validMatches.push(match);
      lastEnd = match.end;
    }
  });

  // Build the result
  currentIndex = 0;
  validMatches.forEach((match) => {
    // Add text before match
    if (match.start > currentIndex) {
      const beforeText = text.slice(currentIndex, match.start);
      const linkedText = detectLinks(beforeText);
      if (Array.isArray(linkedText)) {
        elements.push(...linkedText);
      } else {
        elements.push(linkedText);
      }
    }

    // Add formatted element
    elements.push(match.render(match.match, match.content));
    currentIndex = match.end;
  });

  // Add remaining text
  if (currentIndex < text.length) {
    const remainingText = text.slice(currentIndex);
    const linkedText = detectLinks(remainingText);
    if (Array.isArray(linkedText)) {
      elements.push(...linkedText);
    } else {
      elements.push(remainingText);
    }
  }

  return elements.length > 0 ? elements : text;
};

/**
 * Main markdown formatter function - FIXED INDENTATION AND NESTED LISTS
 */
export const formatMarkdownContent = (content) => {
  if (!content || typeof content !== "string") {
    return <span className="text-muted-foreground">No content available</span>;
  }

  const lines = content.split("\n");

  return lines.map((line, index) => {
    // Don't trim for indentation detection - preserve leading spaces
    const originalLine = line;
    const trimmedLine = line.trim();

    // Empty lines
    if (!trimmedLine) {
      return <div key={index} className="py-1" />;
    }

    // Calculate indentation level
    const leadingSpaces = originalLine.length - originalLine.trimStart().length;
    const indentLevel = Math.floor(leadingSpaces / 2); // Assuming 2 spaces per indent

    // Headers (### Header) - FIXED: Inherit color for nested elements
    const headerMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const text = headerMatch[2];
      const HeaderTag = `h${Math.min(level, 6)}`;

      // Define header classes with color inheritance
      const headerClasses = `font-bold mb-1 ${
        level === 1
          ? "text-xl text-foreground"
          : level === 2
            ? "text-lg text-foreground"
            : level === 3
              ? "text-base text-primary"
              : "text-sm text-foreground"
      }`;

      // Extract the inherited color class for nested elements
      const inheritedColor = level === 3 ? "text-primary" : "text-foreground";

      return React.createElement(
        HeaderTag,
        {
          key: index,
          className: headerClasses,
        },
        processInlineText(text, inheritedColor),
      );
    }

    // Numbered lists (1. Item) - FIXED: Handle indentation
    const numberedMatch = trimmedLine.match(/^(\d+)\.\s+(.+)$/);
    if (numberedMatch) {
      const number = numberedMatch[1];
      const text = numberedMatch[2];
      const marginLeft = indentLevel * 16; // 16px per indent level

      return (
        <div
          key={index}
          className="mb-1 flex items-start gap-2 break-words"
          style={{ marginLeft: `${marginLeft}px` }}
        >
          <span className="font-semibold text-primary flex-shrink-0 min-w-2">
            {number}.
          </span>
          <span className="break-words flex-1">{processInlineText(text)}</span>
        </div>
      );
    }

    // Bullet points (- Item, * Item, • Item) - FIXED: Handle indentation
    const bulletMatch = trimmedLine.match(/^[-*•]\s+(.+)$/);
    if (bulletMatch) {
      const text = bulletMatch[1];
      const marginLeft = indentLevel * 16; // 16px per indent level
      const basePadding = indentLevel === 0 ? "ml-4" : "ml-0"; // Only add base margin for top-level items

      return (
        <div
          key={index}
          className={`mb-1 flex items-start gap-2 ${basePadding} break-words`}
          style={{
            marginLeft: indentLevel > 0 ? `${marginLeft + 16}px` : undefined,
          }}
        >
          <span className="text-primary flex-shrink-0">•</span>
          <span className="break-words flex-1">{processInlineText(text)}</span>
        </div>
      );
    }

    // Code blocks (```code```)
    const codeBlockMatch = trimmedLine.match(/^```(.*)```$/);
    if (codeBlockMatch) {
      const code = codeBlockMatch[1];
      return (
        <div
          key={index}
          className="mb-3 bg-muted border rounded-lg p-3 overflow-x-auto"
        >
          <code className="text-sm font-mono text-foreground whitespace-pre">
            {code}
          </code>
        </div>
      );
    }

    // Blockquotes (> Text)
    const quoteMatch = trimmedLine.match(/^>\s+(.+)$/);
    if (quoteMatch) {
      const text = quoteMatch[1];
      return (
        <blockquote
          key={index}
          className="mb-3 pl-4 border-l-2 border-primary bg-muted/30 py-2 rounded-r"
        >
          <p className="text-sm italic text-muted-foreground leading-relaxed">
            {processInlineText(text, "text-muted-foreground")}
          </p>
        </blockquote>
      );
    }

    // Horizontal rules (---, ***, ___)
    if (trimmedLine.match(/^[-*_]{3,}$/)) {
      return <hr key={index} className="my-0 border-t border-border" />;
    }

    // Regular paragraphs
    return (
      <p key={index} className="mb-1 leading-relaxed break-words">
        {processInlineText(trimmedLine)}
      </p>
    );
  });
};

/**
 * Strip markdown formatting to get plain text
 */
export const stripMarkdown = (text) => {
  if (!text || typeof text !== "string") {
    return "";
  }

  return text
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*([^*]+?)\*\*/g, "$1")
    .replace(/\*([^*]+?)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/^[-*•]\s+/gm, "")
    .replace(/^>\s+/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();
};

/**
 * Count words in markdown content (excluding formatting)
 */
export const countMarkdownWords = (text) => {
  const plainText = stripMarkdown(text);
  return plainText.split(/\s+/).filter((word) => word.length > 0).length;
};

/**
 * Truncate markdown content while preserving basic formatting
 */
export const truncateMarkdown = (text, maxLength = 150) => {
  if (!text || text.length <= maxLength) {
    return text;
  }

  const truncated = text.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(" ");

  return (
    (lastSpaceIndex > 0 ? truncated.substring(0, lastSpaceIndex) : truncated) +
    "..."
  );
};
