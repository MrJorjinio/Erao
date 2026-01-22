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
} from "@/lib/api";

// Helper to strip SQL code blocks from AI response text
function stripSqlBlocks(content: string): string {
  // Remove ```sql ... ``` blocks
  return content
    .replace(/```sql[\s\S]*?```/gi, "")
    .replace(/```SQL[\s\S]*?```/g, "")
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

  // Chat input state
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Account menu state
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

    // Load conversations and databases
    loadConversations();
    loadDatabases();
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

  const selectConversation = useCallback(async (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setLoadingMessages(true);
    setError(null);

    try {
      const response = await api.getConversation(conversationId);
      if (response.success) {
        setMessages(response.data.messages);
        if (response.data.databaseConnectionId) {
          setSelectedDatabaseId(response.data.databaseConnectionId);
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
    if (!selectedDatabaseId) {
      setShowDatabaseModal(true);
      return;
    }

    try {
      const response = await api.createConversation({
        databaseConnectionId: selectedDatabaseId,
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
      if (!selectedDatabaseId) {
        setShowDatabaseModal(true);
        setIsSending(false);
        setInputValue(messageContent);
        return;
      }

      try {
        const convResponse = await api.createConversation({
          databaseConnectionId: selectedDatabaseId,
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
        <div className="flex flex-col gap-2">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-5 pb-4">
            <span className="font-semibold text-base">Chats</span>
            <button
              onClick={createNewConversation}
              className="w-7 h-7 bg-[#18181b] rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
            >
              <span className="text-white text-xs font-semibold">+</span>
            </button>
          </div>

          {/* Chat List */}
          <div className="flex flex-col gap-1 px-3 pb-3 overflow-y-auto max-h-[calc(100vh-220px)]">
            {loadingConversations ? (
              <div className="text-center py-4 text-sm text-gray-400">
                Loading...
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-4 text-sm text-gray-400">
                No conversations yet
              </div>
            ) : (
              conversations.map((chat) => (
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
                  <span className="text-xs text-gray-400">
                    {formatRelativeTime(chat.updatedAt)}
                  </span>
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
      <main className="flex-1 flex flex-col bg-[#fcfcfd]">
        {/* Header */}
        <header className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex flex-col gap-0.5">
            <h1 className="font-semibold text-base">
              {selectedConversation?.title || "New Chat"}
            </h1>
            <button
              onClick={() => setShowDatabaseModal(true)}
              className="text-xs text-gray-400 hover:text-gray-600 text-left transition-colors"
            >
              {selectedDatabase
                ? `Connected to ${selectedDatabase.name}`
                : "Select a database"}
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-auto px-8 py-6 flex flex-col gap-6">
          {loadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-400 text-sm">Loading messages...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <h2 className="text-lg font-semibold mb-2">
                  {selectedDatabase
                    ? `Connected to ${selectedDatabase.name}`
                    : "Welcome to Erao"}
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedDatabase
                    ? "Ask anything about your data. I can help you analyze, query, and understand your database."
                    : "Connect a database to start querying your data with natural language."}
                </p>
                {!selectedDatabase && (
                  <button
                    onClick={() => setShowDatabaseModal(true)}
                    className="mt-4 px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Connect Database
                  </button>
                )}
              </div>
            </div>
          ) : (
            messages.filter((m) => m && m.role).map((message) => (
              <div key={message.id}>
                {message.role === "Assistant" ? (
                  <div className="w-[70%] bg-white rounded-2xl p-5 flex flex-col gap-3.5 shadow-sm">
                    <span className="font-semibold text-base">Erao</span>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {stripSqlBlocks(message.content)}
                    </p>
                    {(() => {
                      const parsedResult = parseQueryResult(message.queryResult);
                      if (!parsedResult || parsedResult.rows.length === 0) return null;
                      return (
                        <div className="bg-[#fafafc] rounded-xl p-1 overflow-x-auto">
                          {/* Table Header */}
                          <div className="flex items-center gap-2.5 px-3 py-2.5 min-w-fit">
                            <span className="w-10 text-sm font-semibold">#</span>
                            {parsedResult.columns.map((col) => (
                              <span
                                key={col}
                                className="flex-1 min-w-[90px] text-sm font-semibold"
                              >
                                {col}
                              </span>
                            ))}
                          </div>
                          {/* Table Rows */}
                          {parsedResult.rows.slice(0, 10).map((row, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2.5 px-3 py-2.5 bg-white rounded-lg min-w-fit"
                            >
                              <span className="w-10 text-sm">{idx + 1}</span>
                              {parsedResult.columns.map((col) => (
                                <span
                                  key={col}
                                  className="flex-1 min-w-[90px] text-sm truncate"
                                >
                                  {String(row[col] ?? "")}
                                </span>
                              ))}
                            </div>
                          ))}
                          {parsedResult.rowCount > 10 && (
                            <div className="text-xs text-gray-400 text-center py-2">
                              Showing 10 of {parsedResult.rowCount} rows
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
            <div className="w-[70%] bg-white rounded-2xl p-5 flex flex-col gap-3.5 shadow-sm">
              <span className="font-semibold text-base">Erao</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
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
            className="w-full max-w-[700px] h-[52px] bg-white rounded-2xl px-5 pr-2 flex items-center gap-3 shadow-sm"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything about your data..."
              disabled={isSending}
              className="flex-1 text-sm outline-none placeholder:text-gray-400 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isSending || !inputValue.trim()}
              className="w-9 h-9 bg-[#18181b] rounded-[10px] flex items-center justify-center flex-shrink-0 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-white text-sm">&rarr;</span>
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
            setShowAddDatabaseModal(false);
          }}
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
