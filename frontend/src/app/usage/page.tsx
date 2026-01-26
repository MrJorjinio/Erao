"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, UsageStats, UsageLogEntry, auth } from "@/lib/api";

export default function UsagePage() {
  const router = useRouter();
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [history, setHistory] = useState<UsageLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push("/login");
      return;
    }
    loadData();
    // Load dark mode preference
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, [router]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const loadData = async () => {
    try {
      const [usageRes, historyRes] = await Promise.all([
        api.getUsage(),
        api.getUsageHistory(),
      ]);

      if (usageRes.success) {
        setUsage(usageRes.data);
      }
      if (historyRes.success) {
        setHistory(historyRes.data);
      }
    } catch (err) {
      setError("Failed to load usage data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return `Today, ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`;
    } else if (days === 1) {
      return `Yesterday, ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  const formatResetDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
      </div>
    );
  }

  const user = auth.getUser();
  const percentUsed = usage
    ? Math.round((usage.queriesUsedThisMonth / usage.queryLimitPerMonth) * 100)
    : 0;

  // Aggregate queries by database connection
  const aggregatedUsage = history.reduce((acc, entry) => {
    const dbName = entry.databaseConnectionName || "Chat Query";
    if (!acc[dbName]) {
      acc[dbName] = {
        name: dbName,
        count: 0,
        lastActivity: entry.createdAt,
      };
    }
    acc[dbName].count += 1;
    // Keep the most recent activity date
    if (new Date(entry.createdAt) > new Date(acc[dbName].lastActivity)) {
      acc[dbName].lastActivity = entry.createdAt;
    }
    return acc;
  }, {} as Record<string, { name: string; count: number; lastActivity: string }>);

  const aggregatedList = Object.values(aggregatedUsage).sort(
    (a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center pt-24 pb-10 gap-6 transition-colors relative">
      {/* Back Button - Top Left */}
      <Link
        href="/ai"
        className="absolute top-6 left-6 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      {/* Header */}
      <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl p-5 transition-colors">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Usage</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Track your query usage and billing cycle
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg text-sm max-w-3xl w-full">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="w-full max-w-3xl flex gap-5">
        {/* Queries Used */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-6 transition-colors">
          <p className="text-gray-500 dark:text-gray-400 text-sm">Queries Used</p>
          <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
            {usage?.queriesUsedThisMonth} / {usage?.queryLimitPerMonth}
          </p>
          <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full mt-3">
            <div
              className="h-2 bg-gray-900 dark:bg-white rounded-full transition-all"
              style={{ width: `${Math.min(percentUsed, 100)}%` }}
            />
          </div>
        </div>

        {/* Current Plan */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-6 transition-colors">
          <p className="text-gray-500 dark:text-gray-400 text-sm">Current Plan</p>
          <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
            {user?.subscriptionTier || "Starter"}
          </p>
          <Link
            href="/subscriptions"
            className="text-blue-600 dark:text-blue-400 text-sm font-medium"
          >
            Upgrade plan &rarr;
          </Link>
        </div>

        {/* Billing Resets */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-6 transition-colors">
          <p className="text-gray-500 dark:text-gray-400 text-sm">Billing Resets</p>
          <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
            {usage ? formatResetDate(usage.billingCycleEnd) : "-"}
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {usage?.daysUntilReset} days remaining
          </p>
        </div>
      </div>

      {/* Usage by Database */}
      <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-xl p-6 transition-colors">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Usage This Month</h2>
        <div className="space-y-4">
          {aggregatedList.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No activity yet</p>
          ) : (
            aggregatedList.map((item) => (
              <div
                key={item.name}
                className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                <div>
                  <p className="font-medium text-sm text-gray-900 dark:text-white">{item.name}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    Last used: {formatDate(item.lastActivity)}
                  </p>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.count} {item.count === 1 ? "query" : "queries"}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
