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

import React from 'react';
import DOMPurify from 'dompurify';

export const MarkdownView = ({ content, className = '' }) => {
  if (!content) return null;

  const renderMarkdown = (rawText) => {
    // DON'T escape HTML yet - we need to detect > for blockquotes first
    let lines = rawText.split('\n');
    let processedLines = [];
    let inBlockquote = false;
    let blockquoteLines = [];
    let inList = false;
    let listItems = [];

    const escapeHtml = (text) => {
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    };

    const flushBlockquote = () => {
      if (blockquoteLines.length > 0) {
        const quotedContent = blockquoteLines.join('<br/>');
        processedLines.push(
          `<blockquote class="border-l-4 border-primary/50 pl-4 pr-3 italic my-3 text-muted-foreground bg-accent/20 py-2 rounded-r">${quotedContent}</blockquote>`
        );
        blockquoteLines = [];
      }
      inBlockquote = false;
    };

    const flushList = () => {
      if (listItems.length > 0) {
        processedLines.push(
          `<ul class="my-2 space-y-1">${listItems.join('')}</ul>`
        );
        listItems = [];
      }
      inList = false;
    };

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      const trimmedLine = line.trim();

      // Headers
      if (trimmedLine.match(/^#{1,6}\s/)) {
        flushBlockquote();
        flushList();
        
        const level = trimmedLine.match(/^(#{1,6})/)[1].length;
        const text = escapeHtml(trimmedLine.replace(/^#{1,6}\s+/, ''));
        
        if (level === 1) {
          processedLines.push(`<h1 class="text-2xl font-bold mt-4 mb-2 text-foreground">${text}</h1>`);
        } else if (level === 2) {
          processedLines.push(`<h2 class="text-xl font-bold mt-3 mb-2 text-foreground">${text}</h2>`);
        } else if (level === 3) {
          processedLines.push(`<h3 class="text-lg font-semibold mt-3 mb-2 text-foreground">${text}</h3>`);
        } else {
          processedLines.push(`<h4 class="text-base font-semibold mt-2 mb-1 text-foreground">${text}</h4>`);
        }
      }
      // Blockquotes - NOW this will work because > hasn't been escaped yet
      else if (trimmedLine.match(/^>\s?/)) {
        flushList();
        inBlockquote = true;
        const quotedText = escapeHtml(trimmedLine.replace(/^>\s?/, ''));
        blockquoteLines.push(quotedText || '&nbsp;');
      }
      // Lists
      else if (trimmedLine.match(/^[-*]\s/)) {
        flushBlockquote();
        inList = true;
        const itemText = escapeHtml(trimmedLine.replace(/^[-*]\s/, ''));
        listItems.push(`<li class="ml-5 list-disc marker:text-primary text-foreground">${itemText}</li>`);
      }
      // Numbered lists
      else if (trimmedLine.match(/^\d+\.\s/)) {
        flushBlockquote();
        if (!inList) {
          flushList();
        }
        const itemText = escapeHtml(trimmedLine.replace(/^\d+\.\s/, ''));
        if (listItems.length === 0 || inList) {
          listItems.push(`<li class="ml-5 list-decimal marker:text-primary text-foreground">${itemText}</li>`);
          inList = true;
        }
      }
      // Code blocks (```)
      else if (trimmedLine.match(/^```/)) {
        flushBlockquote();
        flushList();
        const code = escapeHtml(trimmedLine.replace(/```/g, ''));
        processedLines.push(`<pre class="bg-muted p-3 rounded my-2 overflow-x-auto"><code class="text-sm font-mono text-foreground">${code}</code></pre>`);
      }
      // Empty lines
      else if (!trimmedLine) {
        if (inBlockquote) {
          flushBlockquote();
        }
        if (inList) {
          flushList();
        }
        if (processedLines.length > 0 && !processedLines[processedLines.length - 1].includes('h-3')) {
          processedLines.push('<div class="h-3"></div>');
        }
      }
      // Regular text
      else {
        flushBlockquote();
        flushList();
        const escapedLine = escapeHtml(line);
        processedLines.push(`<p class="my-1.5 leading-relaxed text-foreground">${escapedLine}</p>`);
      }
    }

    // Flush any remaining blockquote or list
    flushBlockquote();
    flushList();

    let html = processedLines.join('');

    // Apply inline formatting (these work on already-escaped HTML)
    // Bold + Italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong class="font-bold italic text-foreground">$1</strong>');
    html = html.replace(/___(.+?)___/g, '<strong class="font-bold italic text-foreground">$1</strong>');
    
    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-foreground">$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong class="font-bold text-foreground">$1</strong>');
    
    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>');
    html = html.replace(/_(.+?)_/g, '<em class="italic">$1</em>');
    
    // Inline code (need to handle escaped backticks)
    html = html.replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary border border-border">$1</code>');
    
    // Links (need to unescape for href)
    html = html.replace(
      /\[(.+?)\]\((.+?)\)/g, 
      (match, text, url) => {
        // Unescape the URL for the href attribute
        const unescapedUrl = url.replace(/&amp;/g, '&');
        return `<a href="${unescapedUrl}" target="_blank" rel="noopener noreferrer" class="text-primary hover:text-primary/80 underline font-medium inline-flex items-center gap-1">${text}<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-60"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></a>`;
      }
    );

    // Strikethrough
    html = html.replace(/~~(.+?)~~/g, '<del class="line-through text-muted-foreground">$1</del>');

    // Horizontal rule
    html = html.replace(/^---$/gm, '<hr class="my-4 border-border" />');

    const cleanHtml = DOMPurify.sanitize(html, {
      ADD_TAGS: ['target'],
      ADD_ATTR: ['target', 'class', 'rel']
    });

    return { __html: cleanHtml };
  };

  return (
    <div 
      className={`prose prose-sm dark:prose-invert max-w-none break-words ${className}`}
      dangerouslySetInnerHTML={renderMarkdown(content)} 
    />
  );
};
