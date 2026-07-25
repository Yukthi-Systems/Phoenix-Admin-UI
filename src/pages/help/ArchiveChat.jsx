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

import React, { useState } from "react";
import {
  Bot,
  User,
  X,
  Maximize2,
  Minimize2,
  History,
  Archive,
  Trash2,
  Copy,
  Check,
  Info,
  Send,
} from "lucide-react";
import { formatMarkdownContent, detectLinks } from "./utils";

const TypingIndicator = () => (
  <div className="flex items-center space-x-2 text-muted-foreground">
    <div className="flex space-x-1">
      <div
        className="w-2 h-2 bg-primary rounded-full animate-bounce"
        style={{ animationDelay: "0ms" }}
      ></div>
      <div
        className="w-2 h-2 bg-primary rounded-full animate-bounce"
        style={{ animationDelay: "150ms" }}
      ></div>
      <div
        className="w-2 h-2 bg-primary rounded-full animate-bounce"
        style={{ animationDelay: "300ms" }}
      ></div>
    </div>
    <span className="text-sm">Thinking...</span>
  </div>
);

const TypingMessage = ({ typingText }) => (
  <div className="flex justify-start">
    <div className="max-w-[85%] order-1">
      <div className="p-3 rounded-2xl bg-muted text-foreground break-words overflow-hidden">
        <div className="text-sm text-left">
          <div className="whitespace-pre-wrap break-words overflow-x-auto max-w-full">
            {formatMarkdownContent(typingText)}
            <span className="animate-pulse ml-1">💭</span>
          </div>
        </div>
      </div>
    </div>
    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 order-2 ml-2 bg-primary">
      <Bot className="w-3 h-3 text-primary-foreground" />
    </div>
  </div>
);

const ActiveChat = ({
  messages,
  inputValue,
  setInputValue,
  handleSendMessage,
  isTyping,
  typingText,
  isInitialized,
  isExpanded,
  setIsExpanded,
  isSavingUiInfo,
  archivedChatsCount,
  onShowArchives,
  onArchiveCurrent,
  onClearChat,
  onClose,
  charInfo,
  textareaRef,
  messagesEndRef,
  messagesContainerRef,
  handleScroll,
}) => {
  const [copiedMessage, setCopiedMessage] = useState(null);
  const [showContextForMessage, setShowContextForMessage] = useState({});

  const toggleContextForMessage = (messageId) => {
    setShowContextForMessage((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  const copyToClipboard = async (text, messageId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessage(messageId);
      setTimeout(() => setCopiedMessage(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center relative">
            <Bot className="w-4 h-4 text-primary-foreground" />
            {isSavingUiInfo && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-pulse" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-left">
              AI Support
            </h3>
            <p className="text-xs text-muted-foreground text-left">
              {messages.length > 0
                ? `${messages.length} message${messages.length === 1 ? "" : "s"}`
                : "Ask me anything!"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* Archive button */}
          {archivedChatsCount > 0 && (
            <button
              onClick={onShowArchives}
              className="p-2 hover:bg-accent rounded-lg transition-colors relative"
              title={`View ${archivedChatsCount} archived chat${archivedChatsCount === 1 ? "" : "s"}`}
            >
              <History className="w-4 h-4" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-success text-success-foreground rounded-full flex items-center justify-center text-xs font-medium">
                {archivedChatsCount > 9 ? "9+" : archivedChatsCount}
              </div>
            </button>
          )}

          {messages.length > 0 && (
            <>
              <button
                onClick={onArchiveCurrent}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
                title="Archive & Clear Chat"
              >
                <Archive className="w-4 h-4" />
              </button>
              <button
                onClick={onClearChat}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
                title="Clear Chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            title={isExpanded ? "Minimize" : "Expand"}
          >
            {isExpanded ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <Bot className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-sm">Start a conversation with AI Support</p>
            <p className="text-xs mt-2">
              Ask questions about configurations, setup, or any technical help
              you need.
            </p>

            {/* Show if there are archived chats */}
            {archivedChatsCount > 0 && (
              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-2">
                  You have {archivedChatsCount} archived chat
                  {archivedChatsCount === 1 ? "" : "s"}
                </p>
                <button
                  onClick={onShowArchives}
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-accent text-accent-foreground rounded-md hover:bg-accent/80 transition-colors"
                >
                  <History className="w-3 h-3" />
                  View Archives
                </button>
              </div>
            )}
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] ${message.type === "user" ? "order-2" : "order-1"}`}
            >
              <div
                className={`p-3 rounded-2xl break-words overflow-hidden ${
                  message.type === "user"
                    ? "bg-primary text-primary-foreground ml-auto"
                    : message.isError
                      ? "bg-destructive/10 text-destructive border border-destructive/20"
                      : "bg-muted text-foreground"
                }`}
              >
                {message.type === "user" ? (
                  <p className="text-sm text-left whitespace-pre-wrap break-words">
                    {detectLinks(message.content)}
                  </p>
                ) : (
                  <div className="text-sm text-left">
                    <div className="whitespace-pre-wrap break-words overflow-x-auto max-w-full">
                      {formatMarkdownContent(message.content)}
                    </div>
                  </div>
                )}
              </div>

              {/* Message Actions */}
              {message.type === "ai" && !message.isError && (
                <div className="flex items-center justify-start mt-2 space-x-2">
                  <button
                    onClick={() => copyToClipboard(message.content, message.id)}
                    className="flex items-center space-x-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground bg-accent/50 hover:bg-accent rounded transition-colors"
                    title="Copy message"
                  >
                    {copiedMessage === message.id ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  {message.context && (
                    <button
                      onClick={() => toggleContextForMessage(message.id)}
                      className="flex items-center space-x-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground bg-accent/50 hover:bg-accent rounded transition-colors"
                      title={
                        showContextForMessage[message.id]
                          ? "Hide More Info"
                          : "Show More Info"
                      }
                    >
                      <Info className="w-3 h-3" />
                      <span>More Info</span>
                    </button>
                  )}
                </div>
              )}

              {/* Context Information */}
              {message.type === "ai" &&
                message.context &&
                showContextForMessage[message.id] &&
                !message.isError && (
                  <div className="mt-2 p-3 bg-accent/50 rounded-lg border border-border">
                    <div className="flex items-center mb-2">
                      <Info className="w-3 h-3 mr-1 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">
                        Additional Information
                      </span>
                    </div>
                    <div className="text-xs overflow-y-auto max-h-[300px] text-left text-muted-foreground leading-relaxed whitespace-pre-wrap break-words overflow-x-auto max-w-full">
                      {detectLinks(message.context)}
                    </div>
                  </div>
                )}

              {/* Timestamp */}
              <p
                className={`text-xs text-muted-foreground mt-1 ${message.type === "user" ? "text-right" : "text-left"}`}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {/* Avatar */}
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${message.type === "user" ? "order-1 mr-2 bg-accent" : "order-2 ml-2 bg-primary"}`}
            >
              {message.type === "user" ? (
                <User className="w-3 h-3 text-accent-foreground" />
              ) : (
                <Bot className="w-3 h-3 text-primary-foreground" />
              )}
            </div>
          </div>
        ))}

        {/* Typing Indicators */}
        {isTyping && !typingText && (
          <div className="flex justify-start">
            <div className="max-w-[85%]">
              <div className="p-3 rounded-2xl bg-muted">
                <TypingIndicator />
              </div>
            </div>
          </div>
        )}

        {isTyping && typingText && <TypingMessage typingText={typingText} />}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Section */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="mb-2 flex justify-between items-center text-xs">
          <span
            className={`${charInfo.minReached ? "text-success" : "text-muted-foreground"}`}
          >
            Min: {charInfo.charsWithoutSpaces}/30 chars (excluding space)
          </span>
          <span
            className={`${charInfo.maxExceeded ? "text-destructive" : "text-muted-foreground"}`}
          >
            Total: {charInfo.totalChars}/250 chars
          </span>
        </div>

        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              disabled={!isInitialized}
              className={`w-full max-h-24 min-h-[44px] p-3 bg-background border rounded-lg resize-none text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                charInfo.maxExceeded
                  ? "border-destructive focus:ring-destructive/20"
                  : !charInfo.minReached && inputValue.length > 0
                    ? "border-warning focus:ring-warning/20"
                    : "border-border focus:ring-primary/20"
              }`}
              rows={1}
              style={{
                height: "auto",
                minHeight: "44px",
              }}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={
              !charInfo.isValid || isTyping || !isInitialized || isSavingUiInfo // Also disable if saving
            }
            className={`p-3 rounded-lg mb-2.5 transition-colors flex-shrink-0 ${
              charInfo.isValid && !isTyping && isInitialized
                ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {inputValue.length > 0 && (
          <div className="mt-2 text-xs">
            {charInfo.maxExceeded && (
              <p className="text-destructive">
                {charInfo.totalChars - 250} characters over limit
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ActiveChat;
