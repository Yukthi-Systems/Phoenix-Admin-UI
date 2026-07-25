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
import { Bot, Archive, Sparkles, X, GripHorizontal } from "lucide-react"; // Added GripHorizontal
import { useAIHelp } from "@/hooks/useAiHelp";
import { useSyncedUiInfo } from "@/hooks/useSyncedUiInfo";
import { useToastify } from "@/hooks/useToastify";
import ArchiveView from "./ArchiveView";
import ActiveChat from "./ArchiveChat";

const AIChatInterface = ({ customPositionClass, preventClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [showFirstLoadTooltip, setShowFirstLoadTooltip] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showArchives, setShowArchives] = useState(false);

  // State for hover effect to show drag tooltip
  const [isHovered, setIsHovered] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const textareaRef = useRef(null);
  const shouldAutoScrollRef = useRef(true);
  const typingIntervalRef = useRef(null);

  const {
    uiInfo,
    updateUiInfo,
    isLoading,
    isSaving: isSavingUiInfo,
  } = useSyncedUiInfo();
  const aiHelpMutation = useAIHelp();
  const toast = useToastify();

  const getChatData = () => {
    return (
      uiInfo?.aiChat || {
        messages: [],
        isExpanded: false,
        settings: {
          autoSave: true,
          maxMessages: 100,
        },
      }
    );
  };

  const getArchivedChats = () => {
    return uiInfo?.archivedAiChats || [];
  };

  const storeChatData = (chatData, skipApiCall = false) => {
    updateUiInfo(
      {
        aiChat: {
          ...chatData,
          lastUpdated: new Date().toISOString(),
          messageCount: chatData.messages?.length || 0,
        },
      },
      {
        localOnly: skipApiCall,
        onError: () => console.error("Failed to save chat data"),
      },
    );
  };

  const saveCurrentChatState = (messagesToSave = null) => {
    const chatData = {
      messages: (messagesToSave || messages).map((msg) => ({
        ...msg,
        timestamp: msg.timestamp.toISOString(),
      })),
      isExpanded,
      settings: {
        autoSave: true,
        maxMessages: 100,
      },
    };

    storeChatData(chatData, false);
  };

  useEffect(() => {
    if (isLoading || isInitialized) return;

    const chatData = getChatData();

    if (chatData.messages && Array.isArray(chatData.messages)) {
      const restoredMessages = chatData.messages.map((msg) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
      setMessages(restoredMessages);
    }

    if (chatData.isExpanded !== undefined) {
      setIsExpanded(chatData.isExpanded);
    }

    setIsInitialized(true);
  }, [isLoading, isInitialized, uiInfo]);

  const cleanupOldMessages = (newMessages) => {
    const maxMessages = 100;
    if (newMessages.length > maxMessages) {
      return newMessages.slice(-maxMessages);
    }
    return newMessages;
  };

  const clearChatData = () => {
    setMessages([]);

    const emptyChatData = {
      messages: [],
      isExpanded,
      settings: {
        autoSave: true,
        maxMessages: 100,
      },
    };

    storeChatData(emptyChatData, false);
    toast("success", "Chat history cleared");
  };

  const generateChatTitle = (messages) => {
    const firstUserMessage = messages.find((msg) => msg.type === "user");
    if (firstUserMessage) {
      const content = firstUserMessage.content;
      return content.length > 50 ? content.substring(0, 50) + "..." : content;
    }
    return `Chat from ${new Date().toLocaleDateString()}`;
  };

  const archiveCurrentChat = () => {
    if (messages.length === 0) {
      toast("info", "No messages to archive");
      return;
    }

    const title = generateChatTitle(messages);
    const archiveData = {
      id: Date.now(),
      title,
      messages: messages.map((msg) => ({
        ...msg,
        timestamp: msg.timestamp.toISOString(),
      })),
      archivedAt: new Date().toISOString(),
      messageCount: messages.length,
    };

    const currentArchives = uiInfo?.archivedAiChats || [];

    updateUiInfo(
      {
        archivedAiChats: [...currentArchives, archiveData].slice(-10),
        aiChat: {
          messages: [],
          isExpanded,
          settings: { autoSave: true, maxMessages: 100 },
        },
      },
      {
        onSuccess: () => toast("success", "Chat archived and cleared"),
        onError: () => toast("error", "Failed to archive chat"),
      },
    );

    setMessages([]);
  };

  const restoreArchivedChat = (archive) => {
    const restoredMessages = archive.messages.map((msg) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }));

    setMessages(restoredMessages);
    setShowArchives(false);
    setTimeout(() => saveCurrentChatState(restoredMessages), 500);
    toast("success", `Restored chat`);
  };

  const deleteArchivedChat = (archiveId) => {
    const currentArchives = uiInfo?.archivedAiChats || [];
    const updatedArchivedChats = currentArchives.filter(
      (chat) => chat.id !== archiveId,
    );

    updateUiInfo(
      { archivedAiChats: updatedArchivedChats },
      {
        onSuccess: () => toast("success", "Archived chat deleted"),
        onError: () => toast("error", "Failed to delete archived chat"),
      },
    );
  };

  useEffect(() => {
    if (!isInitialized) return;
    const timeoutId = setTimeout(() => {
      saveCurrentChatState();
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [isExpanded]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const checkIfNearBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return true;
    const threshold = 100;
    const { scrollTop, scrollHeight, clientHeight } = container;
    return scrollHeight - scrollTop - clientHeight < threshold;
  };

  const handleScroll = () => {
    shouldAutoScrollRef.current = checkIfNearBottom();
  };

  useEffect(() => {
    const hasSeenTooltip = localStorage.getItem("ai-chat-tooltip-seen");

    if (!hasSeenTooltip) {
      const timer = setTimeout(() => {
        setShowFirstLoadTooltip(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (isOpen && messages.length > 0) {
      setTimeout(() => scrollToBottom(), 100);
    }
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current.focus(), 200);
    }
  }, [isOpen]);

  useEffect(() => {
    if (shouldAutoScrollRef.current || isTyping) {
      scrollToBottom();
    }
  }, [messages, isTyping, typingText]);

  const getCharCountInfo = (text) => {
    const charsWithoutSpaces = text.replace(/\s/g, "").length;
    const totalChars = text.length;

    return {
      charsWithoutSpaces,
      totalChars,
      isValid: charsWithoutSpaces >= 30 && totalChars <= 250,
      minReached: charsWithoutSpaces >= 30,
      maxExceeded: totalChars > 250,
    };
  };

  const simulateTyping = (text, callback) => {
    setTypingText("");
    let index = 0;
    const words = text.split(" ");

    typingIntervalRef.current = setInterval(() => {
      if (index < words.length) {
        setTypingText((prev) => prev + (index > 0 ? " " : "") + words[index]);
        index++;
      } else {
        clearInterval(typingIntervalRef.current);
        setTypingText("");
        callback();
      }
    }, 40);
  };

  const charInfo = getCharCountInfo(inputValue);

  const handleSendMessage = async () => {
    if (
      !inputValue.trim() ||
      !charInfo.isValid ||
      aiHelpMutation.isPending ||
      !isInitialized
    )
      return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    const newMessages = cleanupOldMessages([...messages, userMessage]);

    setMessages(newMessages);
    setInputValue("");
    setIsTyping(true);
    shouldAutoScrollRef.current = true;

    try {
      const response = await aiHelpMutation.mutateAsync(inputValue.trim());
      const aiContent =
        response?.data?.answer || "Sorry, I could not process your request.";

      simulateTyping(aiContent, () => {
        const aiMessage = {
          id: Date.now() + 1,
          type: "ai",
          content: aiContent,
          context: response?.data?.context || "",
          query: response?.data?.query || "",
          userName: response?.data?.user_name || "",
          timestamp: new Date(),
        };

        const finalMessages = cleanupOldMessages([...newMessages, aiMessage]);

        setMessages(finalMessages);
        setIsTyping(false);
        setTimeout(() => saveCurrentChatState(finalMessages), 100);
      });
    } catch (error) {
      const errorContent =
        "Sorry, I encountered an error while processing your request. Please try again.";

      simulateTyping(errorContent, () => {
        const errorMessage = {
          id: Date.now() + 1,
          type: "ai",
          content: errorContent,
          timestamp: new Date(),
          isError: true,
        };

        const finalMessages = cleanupOldMessages([
          ...newMessages,
          errorMessage,
        ]);
        setMessages(finalMessages);
        setIsTyping(false);
        setTimeout(() => saveCurrentChatState(), 500);
      });
    }
  };

  if (isLoading && !isInitialized) {
    return (
      <div
        className={customPositionClass || "fixed bottom-16 right-16 z-[100]"}
      >
        <div className="w-14 h-14 bg-muted animate-pulse rounded-full shadow-lg flex items-center justify-center border border-border">
          <Bot className="w-7 h-7 text-muted-foreground opacity-50" />
        </div>
      </div>
    );
  }

  const archivedChats = getArchivedChats();

  const handleToggleOpen = (e) => {
    if (preventClick) return;
    setIsOpen(true);
    setShowFirstLoadTooltip(false);
    localStorage.setItem("ai-chat-tooltip-seen", "true");
  };

  const closeTooltip = (e) => {
    e.stopPropagation();
    setShowFirstLoadTooltip(false);
    localStorage.setItem("ai-chat-tooltip-seen", "true");
  };

  return (
    <>
      {!isOpen && (
        <div
          className={customPositionClass || "fixed bottom-28 right-16 z-[100]"}
          // Set Hover State
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* --- Drag Tooltip --- */}
          {!showFirstLoadTooltip && (
            <div
              className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-[10px] font-medium rounded shadow-sm whitespace-nowrap pointer-events-none transition-all duration-200 ${
                isHovered
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-2"
              }`}
            >
              Hold to Drag
            </div>
          )}

          {/* --- Trigger Button --- */}
          <button
            onClick={handleToggleOpen}
            className="group relative flex h-14 w-14 items-center justify-center rounded-full 
              bg-primary text-primary-foreground shadow-xl 
              hover:bg-primary/90 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20
              active:scale-95 transition-all duration-300 ease-out cursor-grab active:cursor-grabbing"
          >
            {/* Visual Grip Indicator (Fades in on hover) */}
            <div className="absolute top-1 opacity-0 group-hover:opacity-40 transition-opacity duration-300">
              <GripHorizontal size={14} />
            </div>

            <Bot
              className="h-7 w-7 transition-transform duration-300 group-hover:translate-y-0.5"
              strokeWidth={2}
            />

            {/* Message count badge */}
            {messages.length > 0 && (
              <div className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-background animate-in zoom-in">
                {messages.length > 99 ? "99+" : messages.length}
              </div>
            )}

            {/* Archive count badge */}
            {archivedChats.length > 0 && messages.length === 0 && (
              <div className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm ring-2 ring-background animate-in zoom-in">
                <Archive className="h-3 w-3" />
              </div>
            )}
          </button>

          {/* --- Intro Tooltip (First Load Only) --- */}
          {showFirstLoadTooltip && (
            <div className="absolute text-left bottom-full right-0 mb-4 w-72 origin-bottom-right animate-in slide-in-from-bottom-2 fade-in zoom-in-95 duration-300 z-[80]">
              <div className="relative rounded-xl bg-card backdrop-blur-sm p-4 text-card-foreground shadow-2xl border-2 border-border ring-1 ring-black/10">
                <button
                  onClick={closeTooltip}
                  className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <X size={14} />
                </button>

                <div className="flex gap-3">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold leading-none tracking-tight">
                      AI Assistant
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Need help? You can drag this button anywhere on the
                      screen!
                    </p>
                  </div>
                </div>
                <div className="absolute -bottom-1.5 right-6 h-3 w-3 rotate-45 border-b-2 border-r-2 border-border/50 bg-card backdrop-blur-sm"></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- Main Chat Modal --- */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[110] flex justify-end"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div
            className="absolute inset-0 bg-background/20 backdrop-blur-md transition-all duration-300"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={`relative h-full bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 ease-out 
              ${isExpanded ? "w-full max-w-4xl" : "w-full max-w-[450px]"}`}
          >
            {showArchives ? (
              <ArchiveView
                archivedChats={archivedChats}
                onClose={() => setShowArchives(false)}
                onRestore={restoreArchivedChat}
                onDelete={deleteArchivedChat}
              />
            ) : (
              <ActiveChat
                messages={messages}
                inputValue={inputValue}
                setInputValue={setInputValue}
                handleSendMessage={handleSendMessage}
                isTyping={isTyping}
                typingText={typingText}
                isInitialized={isInitialized}
                isExpanded={isExpanded}
                setIsExpanded={setIsExpanded}
                isSavingUiInfo={isSavingUiInfo}
                archivedChatsCount={archivedChats.length}
                onShowArchives={() => setShowArchives(true)}
                onArchiveCurrent={archiveCurrentChat}
                onClearChat={clearChatData}
                onClose={() => setIsOpen(false)}
                charInfo={charInfo}
                textareaRef={textareaRef}
                messagesEndRef={messagesEndRef}
                messagesContainerRef={messagesContainerRef}
                handleScroll={handleScroll}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatInterface;
