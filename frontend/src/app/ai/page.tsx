"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  auth,
  api,
  ApiError,
  User,
  Conversation,
  Message,
  DatabaseConnection,
  CreateDatabaseConnectionPayload,
  QueryResult,
  FileDocument,
} from "@/lib/api";
import { DataChart, ChartType, detectChartType } from "@/components/DataChart";
import { DataViewerModal } from "@/components/DataViewerModal";
import { useVirtualizer } from "@tanstack/react-virtual";

// Helper to strip SQL/JSON code blocks and query result blocks from AI response text
function stripCodeBlocks(content: string): string {
  return content
    .replace(/```sql[\s\S]*?```/gi, "") // Remove SQL code blocks
    .replace(/```json[\s\S]*?```/gi, "") // Remove JSON code blocks
    .replace(/```[\s\S]*?```/g, "") // Remove any other code blocks
    .replace(/\[Query Result:[\s\S]*$/gi, "") // Remove [Query Result: to end of string
    .replace(/[,{]?"?(columns|rows|rowCount|executionTimeMs)"?[\s\S]*$/gi, "") // Remove partial JSON results
    .replace(/\{"columns":\[[\s\S]*$/gi, "") // Remove JSON starting with columns
    .replace(/\n\|[^\n]*\|(\n\|[^\n]*\|)*/g, "") // Remove markdown tables
    .replace(/\n{3,}/g, "\n\n") // Clean up extra newlines
    .trim();
}

// Helper to safely parse queryResult (can be string, object, or null)
function parseQueryResult(queryResult: QueryResult | string | null): QueryResult | null {
  if (!queryResult) return null;
  if (typeof queryResult === "string") {
    try {
      const parsed = JSON.parse(queryResult);
      if (parsed && Array.isArray(parsed.rows) && Array.isArray(parsed.columns)) {
        return parsed as QueryResult;
      }
      return null;
    } catch {
      return null;
    }
  }
  if (typeof queryResult === "object" && Array.isArray(queryResult.rows)) {
    return queryResult;
  }
  return null;
}

// Helper to detect requested chart type from user message
function detectRequestedChartType(message: string): ChartType | null {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes("bar chart") || lowerMessage.includes("bar graph")) {
    return "bar";
  }
  if (lowerMessage.includes("line chart") || lowerMessage.includes("line graph")) {
    return "line";
  }
  if (lowerMessage.includes("pie chart") || lowerMessage.includes("pie graph")) {
    return "pie";
  }
  if (lowerMessage.includes("area chart") || lowerMessage.includes("area graph")) {
    return "area";
  }
  return null;
}

// Helper to format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

// Virtual Table Component for handling large datasets
function VirtualTable({
  columns,
  rows
}: {
  columns: string[];
  rows: Record<string, unknown>[];
}) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 10,
  });

  // Calculate minimum width based on columns
  const minTableWidth = Math.max(columns.length * 140 + 60, 400);

  return (
    <div className="p-1 overflow-hidden">
      {/* Scroll container - handles both horizontal and vertical scroll */}
      <div
        ref={parentRef}
        className="max-h-[400px] overflow-auto"
      >
        {/* Inner container with minimum width for horizontal scroll */}
        <div style={{ minWidth: `${minTableWidth}px` }}>
          {/* Table Header - sticky top, scrolls horizontally with data */}
          <div
            className="flex items-center gap-2.5 px-3 py-2.5 bg-[#fafafc] border-b border-gray-200 sticky top-0 z-10"
          >
            <span className="w-12 text-xs font-semibold text-gray-500 flex-shrink-0">#</span>
            {columns.map((col) => (
              <span
                key={col}
                className="min-w-[120px] w-[120px] text-xs font-semibold text-gray-700 truncate"
                title={col}
              >
                {col}
              </span>
            ))}
          </div>

          {/* Virtual rows container */}
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index];
              return (
                <div
                  key={virtualRow.index}
                  className={`flex items-center gap-2.5 px-3 py-2.5 absolute w-full ${
                    virtualRow.index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                  }`}
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <span className="w-12 text-xs text-gray-400 flex-shrink-0">
                    {virtualRow.index + 1}
                  </span>
                  {columns.map((col) => (
                    <span
                      key={col}
                      className="min-w-[120px] w-[120px] text-sm text-gray-700 truncate"
                      title={String(row[col] ?? "")}
                    >
                      {String(row[col] ?? "")}
                    </span>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row count indicator */}
      <div className="text-xs text-gray-400 text-center py-2 border-t border-gray-100">
        {rows.length} rows total
      </div>
    </div>
  );
}

export default function AIPage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  // User state
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Conversations state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Database connections state
  const [databases, setDatabases] = useState<DatabaseConnection[]>([]);
  const [selectedDatabaseId, setSelectedDatabaseId] = useState<string | null>(null);
  const [showDatabaseModal, setShowDatabaseModal] = useState(false);
  const [showAddDatabaseModal, setShowAddDatabaseModal] = useState(false);

  // File state
  const [files, setFiles] = useState<FileDocument[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [showFilesModal, setShowFilesModal] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chat input state
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0); // 0: Thinking, 1: Writing query, 2: Executing, 3: Formatting

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Account menu state
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  // Search state
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Chart view state - tracks view mode per message
  const [chartViews, setChartViews] = useState<Record<string, ChartType>>({});

  // Fullscreen data viewer state
  const [dataViewerOpen, setDataViewerOpen] = useState<string | null>(null);
  const [dataViewerData, setDataViewerData] = useState<{
    columns: string[];
    rows: Record<string, unknown>[];
    chartType: ChartType;
  } | null>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cycle through loading stages
  useEffect(() => {
    if (!isSending) {
      setLoadingStage(0);
      return;
    }

    const stages = [
      { delay: 0 },      // Thinking...
      { delay: 1500 },   // Writing query...
      { delay: 3000 },   // Executing...
      { delay: 5000 },   // Formatting...
    ];

    const timers: NodeJS.Timeout[] = [];
    stages.forEach((stage, index) => {
      if (index > 0) {
        const timer = setTimeout(() => setLoadingStage(index), stage.delay);
        timers.push(timer);
      }
    });

    return () => timers.forEach(t => clearTimeout(t));
  }, [isSending]);

  // Close account menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setShowAccountMenu(false);
      }
    };

    if (showAccountMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAccountMenu]);

  // Check auth and load initial data
  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push("/login");
      return;
    }

    const currentUser = auth.getUser();
    setUser(currentUser);
    setIsLoading(false);

    // Load conversations, databases, and files
    loadConversations();
    loadDatabases();
    loadFiles();
  }, [router]);

  const loadConversations = async () => {
    setLoadingConversations(true);
    try {
      const response = await api.getConversations();
      if (response.success) {
        setConversations(response.data);
        // Auto-select first conversation if available
        if (response.data.length > 0 && !selectedConversationId) {
          selectConversation(response.data[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadDatabases = async () => {
    try {
      const response = await api.getDatabases();
      if (response.success) {
        setDatabases(response.data);
        // Auto-select first active database
        const activeDb = response.data.find((db) => db.isActive);
        if (activeDb) {
          setSelectedDatabaseId(activeDb.id);
        }
      }
    } catch (err) {
      console.error("Failed to load databases:", err);
    }
  };

  const loadFiles = async () => {
    try {
      const response = await api.getFiles();
      // Handle both wrapped { success, data } and direct { files } response formats
      if ('success' in response && response.success && response.data) {
        setFiles(response.data.files);
      } else if ('files' in response) {
        // Direct response format from backend
        setFiles((response as unknown as { files: FileDocument[] }).files);
      }
    } catch (err) {
      console.error("Failed to load files:", err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);
    setError(null);

    try {
      const response = await api.uploadFile(file);
      if (response.success && response.file) {
        setFiles((prev) => [response.file!, ...prev]);
        setSelectedFileId(response.file.id);
        // Clear database and conversation when file is uploaded
        setSelectedDatabaseId(null);
        setSelectedConversationId(null);
        setMessages([]);
      } else {
        setError(response.message || "Failed to upload file");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to upload file");
      }
    } finally {
      setIsUploadingFile(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await api.deleteFile(fileId);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      if (selectedFileId === fileId) {
        setSelectedFileId(null);
      }
    } catch (err) {
      console.error("Failed to delete file:", err);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "Excel":
        return (
          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
            <path d="M8 12h3l1.5 2.5L14 12h3l-2.5 4L17 20h-3l-1.5-2.5L11 20H8l2.5-4L8 12z"/>
          </svg>
        );
      case "Word":
        return (
          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
            <path d="M8 12h1.5l1 4 1-4h1l1 4 1-4H15l-1.5 6h-1l-1-4-1 4h-1L8 12z"/>
          </svg>
        );
      case "Csv":
        return (
          <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
            <path d="M8 12v6h8v-6H8zm2 2h4v2h-4v-2z"/>
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  const selectConversation = useCallback(async (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setLoadingMessages(true);
    setError(null);

    try {
      const response = await api.getConversation(conversationId);
      if (response.success) {
        setMessages(response.data.messages);
        // Set the appropriate data source (database or file)
        if (response.data.databaseConnectionId) {
          setSelectedDatabaseId(response.data.databaseConnectionId);
          setSelectedFileId(null);
        } else if (response.data.fileDocumentId) {
          setSelectedFileId(response.data.fileDocumentId);
          setSelectedDatabaseId(null);
        }
      }
    } catch (err) {
      console.error("Failed to load conversation:", err);
      setError("Failed to load conversation");
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const createNewConversation = async () => {
    // Need either a database or file selected
    if (!selectedDatabaseId && !selectedFileId) {
      setShowDatabaseModal(true);
      return;
    }

    try {
      const response = await api.createConversation({
        databaseConnectionId: selectedDatabaseId || undefined,
        fileDocumentId: selectedFileId || undefined,
      });
      if (response.success) {
        setConversations((prev) => [response.data, ...prev]);
        setSelectedConversationId(response.data.id);
        setMessages([]);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSending) return;

    const messageContent = inputValue.trim();
    setInputValue("");
    setIsSending(true);
    setError(null);

    // If no conversation selected, create one first
    let conversationId = selectedConversationId;
    if (!conversationId) {
      // Need either a database or file selected
      if (!selectedDatabaseId && !selectedFileId) {
        setShowDatabaseModal(true);
        setIsSending(false);
        setInputValue(messageContent);
        return;
      }

      try {
        const convResponse = await api.createConversation({
          databaseConnectionId: selectedDatabaseId || undefined,
          fileDocumentId: selectedFileId || undefined,
        });
        if (convResponse.success) {
          conversationId = convResponse.data.id;
          setConversations((prev) => [convResponse.data, ...prev]);
          setSelectedConversationId(conversationId);
        }
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        }
        setIsSending(false);
        setInputValue(messageContent);
        return;
      }
    }

    // Add user message optimistically
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      role: "User",
      content: messageContent,
      sqlQuery: null,
      queryResult: null,
      tokensUsed: 0,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      const response = await api.sendMessage({
        conversationId: conversationId!,
        message: messageContent,
      });

      if (response.success) {
        // Replace temp message with actual user message and add assistant response
        setMessages((prev) => {
          const filtered = prev.filter((m) => m && m.id !== tempUserMessage.id);
          return [
            ...filtered,
            response.data.userMessage,
            response.data.assistantMessage,
          ];
        });

        // Check if user requested a specific chart type and auto-set it
        const requestedChartType = detectRequestedChartType(messageContent);
        if (requestedChartType && response.data.assistantMessage.queryResult) {
          setChartViews((prev) => ({
            ...prev,
            [response.data.assistantMessage.id]: requestedChartType,
          }));
        }

        // Refresh conversations to get updated title
        loadConversations();
      }
    } catch (err) {
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m && m.id !== tempUserMessage.id));
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to send message");
      }
      setInputValue(messageContent);
    } finally {
      setIsSending(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore logout errors
    }
    auth.clearTokens();
    router.push("/login");
  };

  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId
  );
  const selectedDatabase = databases.find((d) => d.id === selectedDatabaseId);
  const selectedFile = files.find((f) => f.id === selectedFileId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center">
        <div className="text-gray-500 text-sm">Loading...</div>
      </div>
    );
  }

  const userInitial = user?.firstName?.[0]?.toUpperCase() || "U";

  return (
    <div className="h-screen bg-[#f9fafb] flex">
      {/* Sidebar */}
      <aside className="w-[260px] bg-white flex flex-col justify-between border-r border-gray-100">
        {/* Top Section */}
        <div className="flex flex-col">
          {/* Header */}
          <div className="px-4 pt-5 pb-3">
            <span className="font-semibold text-base">Chats</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-1 px-3 pb-3">
            <button
              onClick={createNewConversation}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-[#f5f5f5] rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              New chat
            </button>
            <button
              onClick={() => setShowSearchInput(!showSearchInput)}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-[#f5f5f5] rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search chats
            </button>
          </div>

          {/* Search Input */}
          {showSearchInput && (
            <div className="px-3 pb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full h-9 bg-[#f5f5f5] rounded-lg px-3 text-sm outline-none placeholder:text-gray-400"
                autoFocus
              />
            </div>
          )}

          {/* Chat List */}
          <div className="flex flex-col gap-1 px-3 pb-3 overflow-y-auto max-h-[calc(100vh-280px)] custom-scrollbar">
            {loadingConversations ? (
              <div className="text-center py-4 text-sm text-gray-400">
                Loading...
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-4 text-sm text-gray-400">
                No conversations yet
              </div>
            ) : (
              conversations
                .filter((chat) =>
                  searchQuery === "" ||
                  (chat.title || "New Chat").toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (chat.databaseConnectionName || "").toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => selectConversation(chat.id)}
                  className={`w-full text-left rounded-[10px] px-3.5 py-3 flex flex-col gap-1 transition-colors ${
                    chat.id === selectedConversationId
                      ? "bg-[#fafafa]"
                      : "bg-white hover:bg-[#fafafa]"
                  }`}
                >
                  <span className="text-sm font-medium truncate">
                    {chat.title || "New Chat"}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    {(chat.databaseConnectionName || chat.fileDocumentName) && (
                      <span className="truncate max-w-[100px]">
                        {chat.databaseConnectionName || chat.fileDocumentName}
                      </span>
                    )}
                    {(chat.databaseConnectionName || chat.fileDocumentName) && <span>·</span>}
                    <span>{formatRelativeTime(chat.updatedAt)}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* User Profile */}
        <div className="p-3 relative">
          <button
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            className="w-full bg-[#fafafa] rounded-xl p-3 flex items-center gap-3 hover:bg-gray-100 transition-colors"
          >
            <div className="w-9 h-9 bg-black rounded-[10px] flex items-center justify-center">
              <span className="text-white text-xs font-semibold">
                {userInitial}
              </span>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-400">
                {user?.subscriptionTier || "Starter"} Plan
              </p>
            </div>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${showAccountMenu ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Account Menu Dropdown */}
          {showAccountMenu && (
            <div className="absolute bottom-full left-3 right-3 mb-2 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
              <button
                onClick={() => {
                  setShowAccountMenu(false);
                  router.push("/profile");
                }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-3"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </button>
              <button
                onClick={() => {
                  setShowAccountMenu(false);
                  router.push("/usage");
                }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-3"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Usage
              </button>
              <button
                onClick={() => {
                  setShowAccountMenu(false);
                  router.push("/subscriptions");
                }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-3"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Subscriptions
              </button>
              <hr className="my-1 border-gray-100" />
              <button
                onClick={() => {
                  setShowAccountMenu(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col bg-[#fcfcfd] overflow-hidden">
        {/* Header */}
        <header className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex flex-col gap-0.5">
            <h1 className="font-semibold text-base">
              {selectedConversation?.title || "New Chat"}
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDatabaseModal(true)}
                className={`text-xs hover:text-gray-600 text-left transition-colors ${
                  selectedDatabase ? "text-gray-600" : "text-gray-400"
                }`}
              >
                {selectedDatabase
                  ? `DB: ${selectedDatabase.name}`
                  : "Select database"}
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => setShowFilesModal(true)}
                className={`text-xs hover:text-gray-600 text-left transition-colors ${
                  selectedFile ? "text-gray-600" : "text-gray-400"
                }`}
              >
                {selectedFile
                  ? `File: ${selectedFile.originalFileName}`
                  : "Select file"}
              </button>
            </div>
          </div>
          {/* Upload indicator */}
          {isUploadingFile && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              Uploading...
            </div>
          )}
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-8 py-6 flex flex-col gap-6">
          {loadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-400 text-sm">Loading messages...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <h2 className="text-lg font-semibold mb-2">
                  {selectedFile
                    ? `Analyzing ${selectedFile.originalFileName}`
                    : selectedDatabase
                    ? `Connected to ${selectedDatabase.name}`
                    : "Welcome to Erao"}
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedFile
                    ? `${selectedFile.fileType} file with ${selectedFile.rowCount?.toLocaleString() || 0} rows ready. Ask anything about your data.`
                    : selectedDatabase
                    ? "Ask anything about your data. I can help you analyze, query, and understand your database."
                    : "Connect a database or upload a file to start querying your data with natural language."}
                </p>
                {!selectedDatabase && !selectedFile && (
                  <div className="flex gap-3 justify-center mt-4">
                    <button
                      onClick={() => setShowDatabaseModal(true)}
                      className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Connect Database
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-white text-black text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      Upload File
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            messages.filter((m) => m && m.role).map((message) => (
              <div key={message.id}>
                {message.role === "Assistant" ? (
                  <div className="w-[70%] max-w-[70%] bg-white rounded-2xl p-5 flex flex-col gap-3.5 shadow-sm overflow-hidden">
                    <span className="font-semibold text-base">Erao</span>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {stripCodeBlocks(message.content)}
                    </p>
                    {(() => {
                      const parsedResult = parseQueryResult(message.queryResult);
                      if (!parsedResult || parsedResult.rows.length === 0) return null;

                      // For single value results (1 row, 1-2 columns), show as highlighted text
                      const isSingleValue = parsedResult.rows.length === 1 && parsedResult.columns.length <= 2;
                      if (isSingleValue) {
                        const row = parsedResult.rows[0];
                        const values = parsedResult.columns.map((col) => ({
                          label: col,
                          value: row[col],
                        }));
                        return (
                          <div className="bg-[#f0fdf4] border border-green-200 rounded-xl p-4 mt-2">
                            <div className="flex flex-wrap gap-4">
                              {values.map((item, idx) => (
                                <div key={idx} className="flex flex-col">
                                  <span className="text-xs text-gray-500">{item.label}</span>
                                  <span className="text-lg font-semibold text-gray-900">
                                    {typeof item.value === "number" ? item.value.toLocaleString() : String(item.value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }

                      // Get current view mode for this message, default to table
                      const currentView = chartViews[message.id] || "table";

                      // Check if data is chartable (has at least one numeric column)
                      const hasNumericData = parsedResult.columns.slice(1).some((col) =>
                        parsedResult.rows.some((row) => {
                          const val = row[col];
                          return typeof val === "number" || !isNaN(Number(val));
                        })
                      );

                      return (
                        <div className="bg-[#fafafc] rounded-xl overflow-hidden">
                          {/* View Toggle Buttons */}
                          {hasNumericData && parsedResult.rows.length > 1 && (
                            <div className="flex items-center justify-between p-2 border-b border-gray-200">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setChartViews(prev => ({ ...prev, [message.id]: "table" }))}
                                  className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                                    currentView === "table"
                                      ? "bg-black text-white"
                                      : "bg-white text-gray-600 hover:bg-gray-100"
                                  }`}
                                >
                                  Table
                                </button>
                                <button
                                  onClick={() => setChartViews(prev => ({ ...prev, [message.id]: "bar" }))}
                                  className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                                    currentView === "bar"
                                      ? "bg-black text-white"
                                      : "bg-white text-gray-600 hover:bg-gray-100"
                                  }`}
                                >
                                  Bar
                                </button>
                                <button
                                  onClick={() => setChartViews(prev => ({ ...prev, [message.id]: "line" }))}
                                  className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                                    currentView === "line"
                                      ? "bg-black text-white"
                                      : "bg-white text-gray-600 hover:bg-gray-100"
                                  }`}
                                >
                                  Line
                                </button>
                                <button
                                  onClick={() => setChartViews(prev => ({ ...prev, [message.id]: "pie" }))}
                                  className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                                    currentView === "pie"
                                      ? "bg-black text-white"
                                      : "bg-white text-gray-600 hover:bg-gray-100"
                                  }`}
                                >
                                  Pie
                                </button>
                                <button
                                  onClick={() => setChartViews(prev => ({ ...prev, [message.id]: "area" }))}
                                  className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                                    currentView === "area"
                                      ? "bg-black text-white"
                                      : "bg-white text-gray-600 hover:bg-gray-100"
                                  }`}
                                >
                                  Area
                                </button>
                              </div>
                              {/* Expand Button */}
                              <button
                                onClick={() => {
                                  setDataViewerData({
                                    columns: parsedResult.columns,
                                    rows: parsedResult.rows,
                                    chartType: currentView,
                                  });
                                  setDataViewerOpen(message.id);
                                }}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                                title="Open in fullscreen"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                </svg>
                                Expand
                              </button>
                            </div>
                          )}

                          {/* Chart View */}
                          {currentView !== "table" && (
                            <DataChart
                              data={parsedResult.rows}
                              columns={parsedResult.columns}
                              chartType={currentView}
                            />
                          )}

                          {/* Table View - Virtual Scrolling for performance */}
                          {currentView === "table" && (
                            <VirtualTable
                              columns={parsedResult.columns}
                              rows={parsedResult.rows}
                            />
                          )}

                          {/* Expand button for table-only view (no numeric data or single row) */}
                          {(!hasNumericData || parsedResult.rows.length === 1) && parsedResult.rows.length > 0 && (
                            <div className="flex justify-end p-2 border-t border-gray-200">
                              <button
                                onClick={() => {
                                  setDataViewerData({
                                    columns: parsedResult.columns,
                                    rows: parsedResult.rows,
                                    chartType: "table",
                                  });
                                  setDataViewerOpen(message.id);
                                }}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                                title="Open in fullscreen"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                </svg>
                                Expand
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <div className="max-w-[70%] bg-[#18181b] rounded-2xl px-[18px] py-3.5">
                      <p className="text-sm text-white leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          {isSending && (
            <div className="w-[70%] max-w-[70%] bg-white rounded-2xl p-5 shadow-sm">
              <p className="font-semibold text-base mb-3">Erao</p>
              <div className="flex items-center gap-3">
                <span className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                </span>
                <span className="text-sm text-gray-600">
                  {loadingStage === 0 && "Thinking..."}
                  {loadingStage === 1 && "Writing query..."}
                  {loadingStage === 2 && "Executing..."}
                  {loadingStage === 3 && "Formatting results..."}
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-8 pb-2">
            <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg">
              {error}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="bg-[#fcfcfd] px-8 pt-4 pb-6 flex justify-center">
          <form
            onSubmit={handleSendMessage}
            className="w-full max-w-[700px] h-[52px] bg-white rounded-2xl px-3 pr-2 flex items-center gap-2 shadow-sm"
          >
            {/* File Upload Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx,.xls,.docx,.doc,.csv,.xml,.json,.txt"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingFile}
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-gray-100 transition-colors disabled:opacity-50"
              title="Upload file (Excel, Word, CSV)"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={selectedFile ? `Ask about ${selectedFile.originalFileName}...` : "Ask anything about your data..."}
              disabled={isSending}
              className="flex-1 text-sm outline-none border-none focus:outline-none focus:ring-0 placeholder:text-gray-400 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isSending || !inputValue.trim()}
              className="w-9 h-9 bg-[#18181b] rounded-full flex items-center justify-center flex-shrink-0 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </form>
        </div>
      </main>

      {/* Database Selection Modal */}
      {showDatabaseModal && (
        <DatabaseModal
          databases={databases}
          selectedDatabaseId={selectedDatabaseId}
          onSelect={(id) => {
            setSelectedDatabaseId(id);
            setSelectedFileId(null); // Clear file when database is selected
            // Clear conversation if changing data source
            if (selectedConversationId) {
              setSelectedConversationId(null);
              setMessages([]);
            }
            setShowDatabaseModal(false);
          }}
          onClose={() => setShowDatabaseModal(false)}
          onAddNew={() => {
            setShowDatabaseModal(false);
            setShowAddDatabaseModal(true);
          }}
        />
      )}

      {/* Add Database Modal */}
      {showAddDatabaseModal && (
        <AddDatabaseModal
          onClose={() => setShowAddDatabaseModal(false)}
          onSuccess={(newDb) => {
            setDatabases((prev) => [...prev, newDb]);
            setSelectedDatabaseId(newDb.id);
            setSelectedFileId(null); // Clear file
            setSelectedConversationId(null); // Start fresh
            setMessages([]);
            setShowAddDatabaseModal(false);
          }}
        />
      )}

      {/* Files Modal */}
      {showFilesModal && (
        <FilesModal
          files={files}
          selectedFileId={selectedFileId}
          onSelect={(id) => {
            setSelectedFileId(id || null);
            setSelectedDatabaseId(null); // Clear database when file is selected
            // Clear conversation if changing data source
            if (selectedConversationId) {
              setSelectedConversationId(null);
              setMessages([]);
            }
            setShowFilesModal(false);
          }}
          onClose={() => setShowFilesModal(false)}
          onUpload={() => {
            setShowFilesModal(false);
            fileInputRef.current?.click();
          }}
          onDelete={handleDeleteFile}
          formatFileSize={formatFileSize}
          getFileIcon={getFileIcon}
        />
      )}

      {/* Fullscreen Data Viewer Modal */}
      {dataViewerOpen && dataViewerData && (
        <DataViewerModal
          isOpen={true}
          onClose={() => {
            setDataViewerOpen(null);
            setDataViewerData(null);
          }}
          columns={dataViewerData.columns}
          rows={dataViewerData.rows}
          initialChartType={dataViewerData.chartType}
        />
      )}
    </div>
  );
}

// Database Selection Modal Component
function DatabaseModal({
  databases,
  selectedDatabaseId,
  onSelect,
  onClose,
  onAddNew,
}: {
  databases: DatabaseConnection[];
  selectedDatabaseId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
  onAddNew: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Select Database</h2>
        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
          {databases.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No databases connected yet
            </p>
          ) : (
            databases.map((db) => (
              <button
                key={db.id}
                onClick={() => onSelect(db.id)}
                className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-colors ${
                  db.id === selectedDatabaseId
                    ? "bg-black text-white"
                    : "bg-[#f5f5f5] hover:bg-gray-200"
                }`}
              >
                <div>
                  <p className="font-medium text-sm">{db.name}</p>
                  <p
                    className={`text-xs ${
                      db.id === selectedDatabaseId
                        ? "text-gray-300"
                        : "text-gray-500"
                    }`}
                  >
                    {db.databaseType}
                  </p>
                </div>
                {db.isActive && (
                  <span
                    className={`text-xs ${
                      db.id === selectedDatabaseId
                        ? "text-green-300"
                        : "text-green-600"
                    }`}
                  >
                    Active
                  </span>
                )}
              </button>
            ))
          )}
        </div>
        <div className="flex gap-3 mt-4">
          <button
            onClick={onAddNew}
            className="flex-1 h-10 bg-[#f5f5f5] text-black rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Add New
          </button>
          <button
            onClick={onClose}
            className="flex-1 h-10 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// Add Database Modal Component
function AddDatabaseModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (db: DatabaseConnection) => void;
}) {
  // Database type mapping: 0=PostgreSQL, 1=MySQL, 2=SQLServer, 3=MongoDB
  const databaseTypes = [
    { value: 0, label: "PostgreSQL", port: 5432 },
    { value: 1, label: "MySQL", port: 3306 },
    { value: 2, label: "SQL Server", port: 1433 },
    { value: 3, label: "MongoDB", port: 27017 },
  ];

  const [formData, setFormData] = useState<CreateDatabaseConnectionPayload>({
    name: "",
    databaseType: 0, // PostgreSQL
    host: "localhost",
    port: 5432,
    databaseName: "",
    username: "",
    password: "",
  });
  const [portInput, setPortInput] = useState("5432");
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState("");
  const [testResult, setTestResult] = useState<boolean | null>(null);

  const handlePortChange = (value: string) => {
    setPortInput(value);
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed)) {
      setFormData({ ...formData, port: parsed });
    }
  };

  const handleDatabaseTypeChange = (value: string) => {
    const typeValue = parseInt(value, 10);
    const dbType = databaseTypes.find((t) => t.value === typeValue);
    if (dbType) {
      setFormData({ ...formData, databaseType: typeValue, port: dbType.port });
      setPortInput(dbType.port.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.createDatabase(formData);
      if (response.success) {
        onSuccess(response.data);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to create database connection");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    setError("");

    try {
      // First create, then test
      const createResponse = await api.createDatabase(formData);
      if (createResponse.success) {
        const testResponse = await api.testDatabase(createResponse.data.id);
        setTestResult(testResponse.data);
        if (testResponse.data) {
          onSuccess(createResponse.data);
        } else {
          // Delete if test failed
          await api.deleteDatabase(createResponse.data.id);
          setError("Connection test failed. Please check your credentials.");
        }
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to test connection");
      }
      setTestResult(false);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Add Database Connection</h2>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Connection Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Production DB"
              required
              className="h-10 bg-[#f5f5f5] rounded-lg px-3 text-sm outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Database Type</label>
            <select
              value={formData.databaseType}
              onChange={(e) => handleDatabaseTypeChange(e.target.value)}
              className="h-10 bg-[#f5f5f5] rounded-lg px-3 text-sm outline-none"
            >
              {databaseTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 flex flex-col gap-1.5">
              <label className="text-sm font-medium">Host</label>
              <input
                type="text"
                value={formData.host}
                onChange={(e) =>
                  setFormData({ ...formData, host: e.target.value })
                }
                placeholder="localhost"
                required
                className="h-10 bg-[#f5f5f5] rounded-lg px-3 text-sm outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Port</label>
              <input
                type="text"
                inputMode="numeric"
                value={portInput}
                onChange={(e) => handlePortChange(e.target.value)}
                required
                className="h-10 bg-[#f5f5f5] rounded-lg px-3 text-sm outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Database Name</label>
            <input
              type="text"
              value={formData.databaseName}
              onChange={(e) =>
                setFormData({ ...formData, databaseName: e.target.value })
              }
              placeholder="mydb"
              required
              className="h-10 bg-[#f5f5f5] rounded-lg px-3 text-sm outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              placeholder="postgres"
              required
              className="h-10 bg-[#f5f5f5] rounded-lg px-3 text-sm outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Enter password"
              required
              className="h-10 bg-[#f5f5f5] rounded-lg px-3 text-sm outline-none"
            />
          </div>

          {testResult !== null && (
            <div
              className={`text-sm px-4 py-2 rounded-lg ${
                testResult
                  ? "bg-green-50 text-green-600"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {testResult
                ? "Connection successful!"
                : "Connection failed. Please check your credentials."}
            </div>
          )}

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 bg-[#f5f5f5] text-black rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleTest}
              disabled={isTesting || isLoading}
              className="flex-1 h-10 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {isTesting ? "Testing..." : "Test & Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Files Modal Component
function FilesModal({
  files,
  selectedFileId,
  onSelect,
  onClose,
  onUpload,
  onDelete,
  formatFileSize,
  getFileIcon,
}: {
  files: FileDocument[];
  selectedFileId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
  onUpload: () => void;
  onDelete: (id: string) => void;
  formatFileSize: (bytes: number) => string;
  getFileIcon: (fileType: string) => React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Your Files</h2>
          <button
            onClick={onUpload}
            className="flex items-center gap-2 px-3 py-1.5 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Upload
          </button>
        </div>

        <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
          {files.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm text-gray-500 mb-2">No files uploaded yet</p>
              <p className="text-xs text-gray-400">
                Upload Excel, Word, CSV, or other files to analyze
              </p>
            </div>
          ) : (
            files.map((file) => (
              <div
                key={file.id}
                className={`p-3 rounded-xl flex items-center gap-3 transition-colors cursor-pointer ${
                  file.id === selectedFileId
                    ? "bg-black text-white"
                    : "bg-[#f5f5f5] hover:bg-gray-200"
                }`}
                onClick={() => onSelect(file.id)}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  file.id === selectedFileId ? "bg-white/20" : "bg-white"
                }`}>
                  {getFileIcon(file.fileType)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {file.originalFileName}
                  </p>
                  <div className={`flex items-center gap-2 text-xs ${
                    file.id === selectedFileId ? "text-gray-300" : "text-gray-500"
                  }`}>
                    <span>{file.fileType}</span>
                    <span>•</span>
                    <span>{formatFileSize(file.fileSizeBytes)}</span>
                    {file.rowCount && (
                      <>
                        <span>•</span>
                        <span>{file.rowCount.toLocaleString()} rows</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {file.status === "Completed" ? (
                    <span className={`text-xs ${
                      file.id === selectedFileId ? "text-green-300" : "text-green-600"
                    }`}>
                      Ready
                    </span>
                  ) : file.status === "Processing" ? (
                    <span className={`text-xs ${
                      file.id === selectedFileId ? "text-yellow-300" : "text-yellow-600"
                    }`}>
                      Processing...
                    </span>
                  ) : file.status === "Failed" ? (
                    <span className={`text-xs ${
                      file.id === selectedFileId ? "text-red-300" : "text-red-600"
                    }`}>
                      Failed
                    </span>
                  ) : null}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(file.id);
                    }}
                    className={`p-1 rounded hover:bg-black/10 transition-colors ${
                      file.id === selectedFileId ? "text-white/70 hover:text-white" : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={() => onSelect("")}
            className="flex-1 h-10 bg-[#f5f5f5] text-black rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Clear Selection
          </button>
          <button
            onClick={onClose}
            className="flex-1 h-10 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
