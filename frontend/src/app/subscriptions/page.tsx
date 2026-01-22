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

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push("/login");
      return;
    }
    loadPlans();
  }, [router]);

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-10 gap-10">
      <div className="bg-white rounded-2xl p-5 text-center">
        <h1 className="text-2xl font-bold">Choose your plan</h1>
        <p className="text-gray-500 text-sm mt-2">
          Select the perfect plan for your database needs
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-6">
        {plans.map((plan) => (
          <div
            key={plan.tier}
            className={`w-80 rounded-2xl p-8 ${
              plan.isPopular ? "bg-black text-white" : "bg-white"
            }`}
          >
            {plan.isPopular && (
              <span className="bg-white text-black text-xs font-semibold px-3 py-1 rounded-full">
                Most Popular
              </span>
            )}

            <div className="mt-4">
              <h2 className="text-lg font-semibold">{plan.name}</h2>
              <div className="flex items-end gap-1 mt-2">
                <span className="text-3xl font-bold">${plan.price}</span>
                <span
                  className={`text-sm ${
                    plan.isPopular ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  /month
                </span>
              </div>
              <p
                className={`text-sm mt-2 ${
                  plan.isPopular ? "text-gray-300" : "text-gray-500"
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
              className={`w-full mt-6 py-3 rounded-lg font-medium text-sm transition ${
                plan.isCurrent
                  ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                  : plan.isPopular
                  ? "bg-white text-black hover:bg-gray-100"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              {upgrading === plan.tier
                ? "Upgrading..."
                : plan.isCurrent
                ? "Current Plan"
                : plan.tier === 2
                ? "Contact Sales"
                : "Upgrade"}
            </button>
          </div>
        ))}
      </div>

      <Link href="/ai" className="text-black text-sm font-medium hover:underline">
        &larr; Back to chat
      </Link>
    </div>
  );
}
