"use client";

import { useState } from "react";
import Link from "next/link";
import { PageLayout } from "@/components/shared";

const plans = [
  {
    name: "Free",
    description: "For individuals getting started",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      { name: "1 database connection", included: true },
      { name: "50 queries/month", included: true },
      { name: "Basic table & chart views", included: true },
      { name: "7-day conversation history", included: true },
      { name: "Community support", included: true },
      { name: "Advanced visualizations", included: false },
      { name: "Export to CSV/Excel", included: false },
      { name: "Team collaboration", included: false },
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Pro",
    description: "For growing teams",
    monthlyPrice: 49,
    yearlyPrice: 39,
    features: [
      { name: "5 database connections", included: true },
      { name: "Unlimited queries", included: true },
      { name: "Advanced visualizations", included: true },
      { name: "Unlimited conversation history", included: true },
      { name: "Priority email support", included: true },
      { name: "Export to CSV/Excel/PDF", included: true },
      { name: "Team collaboration (up to 5)", included: true },
      { name: "Custom integrations", included: false },
    ],
    cta: "Start 14-Day Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "For large organizations",
    monthlyPrice: null,
    yearlyPrice: null,
    features: [
      { name: "Unlimited database connections", included: true },
      { name: "Unlimited queries", included: true },
      { name: "Advanced visualizations", included: true },
      { name: "Unlimited conversation history", included: true },
      { name: "24/7 dedicated support", included: true },
      { name: "SSO & SAML authentication", included: true },
      { name: "Unlimited team members", included: true },
      { name: "Custom integrations & API", included: true },
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const faqs = [
  {
    question: "Can I try Erao for free?",
    answer: "Yes! Our Free plan lets you connect 1 database and run 50 queries per month at no cost. No credit card required to get started.",
  },
  {
    question: "What happens when I hit my query limit?",
    answer: "You'll receive a notification when you're approaching your limit. You can upgrade your plan anytime to continue querying without interruption.",
  },
  {
    question: "Can I switch plans later?",
    answer: "Absolutely. You can upgrade or downgrade your plan at any time. When upgrading, you'll get immediate access to new features. When downgrading, the change takes effect at your next billing cycle.",
  },
  {
    question: "What databases do you support?",
    answer: "We currently support PostgreSQL, MySQL, and MongoDB. More database types are on our roadmap, including SQL Server, Oracle, and Snowflake.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes. We never store your actual data—only the queries you run. All database credentials are encrypted with AES-256, and connections use SSL/TLS. We're SOC 2 Type II compliant.",
  },
  {
    question: "Do you offer refunds?",
    answer: "Yes, we offer a 14-day money-back guarantee on all paid plans. If you're not satisfied, contact us for a full refund.",
  },
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <PageLayout currentPage="pricing">
      {/* Hero */}
      <section className="w-full max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Simple, transparent pricing</h1>
        <p className="text-lg text-gray-600 mb-8">Start free. Upgrade when you need more.</p>

        {/* Billing toggle */}
        <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-5 py-2.5 rounded-md text-sm font-medium transition-colors ${
              billingCycle === "monthly" ? "bg-white shadow-sm text-black" : "text-gray-600"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`px-5 py-2.5 rounded-md text-sm font-medium transition-colors ${
              billingCycle === "yearly" ? "bg-white shadow-sm text-black" : "text-gray-600"
            }`}
          >
            Yearly <span className="text-gray-500 text-xs ml-1">Save 20%</span>
          </button>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="w-full max-w-5xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-6 ${
                plan.popular
                  ? "border-2 border-black relative"
                  : "border border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white px-3 py-1 rounded-full text-xs font-medium">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-semibold mb-1">{plan.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
              <div className="mb-6">
                {plan.monthlyPrice !== null ? (
                  <>
                    <span className="text-4xl font-bold">
                      ${billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice}
                    </span>
                    <span className="text-gray-500">/month</span>
                    {billingCycle === "yearly" && plan.monthlyPrice > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        Billed ${plan.yearlyPrice * 12}/year
                      </p>
                    )}
                  </>
                ) : (
                  <span className="text-4xl font-bold">Custom</span>
                )}
              </div>

              <Link
                href={plan.name === "Enterprise" ? "mailto:sales@erao.io" : "/register"}
                className={`block w-full py-3 text-center rounded-xl text-sm font-medium transition-colors mb-6 ${
                  plan.popular
                    ? "bg-black text-white hover:bg-gray-800"
                    : "border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {plan.cta}
              </Link>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature.name} className="flex items-start gap-3 text-sm">
                    {feature.included ? (
                      <svg className="w-5 h-5 text-black flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className={feature.included ? "text-gray-700" : "text-gray-400"}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="w-full max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-center mb-8">Compare all features</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 pr-4 font-medium">Feature</th>
                <th className="text-center py-4 px-4 font-medium">Free</th>
                <th className="text-center py-4 px-4 font-medium">Pro</th>
                <th className="text-center py-4 px-4 font-medium">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: "Database connections", free: "1", pro: "5", enterprise: "Unlimited" },
                { feature: "Queries per month", free: "50", pro: "Unlimited", enterprise: "Unlimited" },
                { feature: "Conversation history", free: "7 days", pro: "Unlimited", enterprise: "Unlimited" },
                { feature: "Team members", free: "1", pro: "5", enterprise: "Unlimited" },
                { feature: "Export formats", free: "—", pro: "CSV, Excel, PDF", enterprise: "All + API" },
                { feature: "Chart types", free: "Basic", pro: "Advanced", enterprise: "Advanced" },
                { feature: "SSO / SAML", free: "—", pro: "—", enterprise: "Yes" },
                { feature: "Support", free: "Community", pro: "Priority email", enterprise: "24/7 dedicated" },
              ].map((row) => (
                <tr key={row.feature} className="border-b border-gray-100">
                  <td className="py-4 pr-4 text-sm text-gray-700">{row.feature}</td>
                  <td className="text-center py-4 px-4 text-sm text-gray-600">{row.free}</td>
                  <td className="text-center py-4 px-4 text-sm text-gray-600">{row.pro}</td>
                  <td className="text-center py-4 px-4 text-sm text-gray-600">{row.enterprise}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full max-w-3xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently asked questions</h2>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-xl">
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <span className="font-medium text-sm">{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${openFaq === index ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openFaq === index && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="w-full bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
          <p className="text-gray-600 mb-6">Our team is here to help you find the right plan.</p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/contact" className="border border-gray-300 px-6 py-3 rounded-xl text-sm font-medium hover:bg-white transition-colors">
              Contact Sales
            </Link>
            <Link href="/register" className="bg-black text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
