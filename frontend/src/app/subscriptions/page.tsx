"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, SubscriptionPlan, auth } from "@/lib/api";

export default function SubscriptionsPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push("/login");
      return;
    }
    loadPlans();
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

  const loadPlans = async () => {
    try {
      const response = await api.getSubscriptionPlans();
      if (response.success) {
        setPlans(response.data);
      }
    } catch (err) {
      setError("Failed to load subscription plans");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (tier: number) => {
    setUpgrading(tier);
    setError("");
    try {
      const response = await api.upgradeSubscription(tier);
      if (response.success) {
        // Reload plans to show updated current plan
        await loadPlans();
        // Update local user data
        const user = auth.getUser();
        if (user) {
          user.subscriptionTier = response.data.tierName;
          user.queryLimitPerMonth = response.data.queriesPerMonth;
          auth.saveUser(user);
        }
      }
    } catch (err) {
      setError("Failed to upgrade subscription");
      console.error(err);
    } finally {
      setUpgrading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-10 gap-10 transition-colors relative">
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

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 text-center transition-colors">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Choose your plan</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
          Select the perfect plan for your database needs
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-6 flex-wrap justify-center">
        {plans.map((plan) => (
          <div
            key={plan.tier}
            className={`w-80 rounded-2xl p-8 transition-colors ${
              plan.isPopular
                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            }`}
          >
            {plan.isPopular && (
              <span className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs font-semibold px-3 py-1 rounded-full">
                Most Popular
              </span>
            )}

            <div className="mt-4">
              <h2 className="text-lg font-semibold">{plan.name}</h2>
              <div className="flex items-end gap-1 mt-2">
                <span className="text-3xl font-bold">${plan.price}</span>
                <span
                  className={`text-sm ${
                    plan.isPopular
                      ? "text-gray-300 dark:text-gray-600"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  /month
                </span>
              </div>
              <p
                className={`text-sm mt-2 ${
                  plan.isPopular
                    ? "text-gray-300 dark:text-gray-600"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {plan.description}
              </p>
            </div>

            <div className="mt-6 space-y-3">
              {plan.features.map((feature, i) => (
                <p key={i} className="text-sm">
                  {feature}
                </p>
              ))}
            </div>

            <button
              onClick={() => !plan.isCurrent && handleUpgrade(plan.tier)}
              disabled={plan.isCurrent || upgrading === plan.tier}
              className={`w-full mt-6 py-3 rounded-lg font-medium text-sm transition-colors ${
                plan.isCurrent
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  : plan.isPopular
                  ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100"
              }`}
            >
              {upgrading === plan.tier
                ? "Upgrading..."
                : plan.isCurrent
                ? "Current Plan"
                : "Upgrade"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
