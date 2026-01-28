"use client";

import Link from "next/link";
import { useState } from "react";

// Logo icon component - square, circle, triangle in one horizontal line
const LogoIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 16" fill="currentColor">
    {/* Square - left */}
    <rect x="0" y="1" width="14" height="14" />
    {/* Circle - center */}
    <circle cx="24" cy="8" r="7" />
    {/* Triangle - right */}
    <polygon points="34,15 48,15 41,1" />
  </svg>
);

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <nav className="w-full max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LogoIcon className="w-7 h-7" />
          <span className="font-semibold text-lg">Erao</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/features" className="text-gray-600 hover:text-black transition-colors">Features</Link>
          <Link href="/pricing" className="text-gray-600 hover:text-black transition-colors">Pricing</Link>
          <Link href="/about" className="text-gray-600 hover:text-black transition-colors">About</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-gray-600 hover:text-black transition-colors px-3 py-2"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Start Free
          </Link>
        </div>
      </nav>

      {/* Hero Section - Clear value prop in 5 seconds */}
      <section className="w-full max-w-5xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="max-w-3xl mx-auto text-center">
          {/* Social proof badge */}
          <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-1.5 mb-6">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-gray-900 border-2 border-white" />
              <div className="w-6 h-6 rounded-full bg-gray-700 border-2 border-white" />
              <div className="w-6 h-6 rounded-full bg-gray-500 border-2 border-white" />
            </div>
            <span className="text-sm text-gray-600">Trusted by 500+ data teams</span>
          </div>

          {/* Main headline - clear, benefit-focused */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
            Ask your database anything.
            <span className="text-gray-400"> In plain English.</span>
          </h1>

          {/* Subheadline - explains how */}
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl mx-auto">
            Connect your database and get instant answers. No SQL required.
            Just ask like you'd ask a colleague.
          </p>

          {/* Single primary CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="w-full sm:w-auto bg-black text-white px-8 py-3.5 rounded-xl text-base font-medium hover:bg-gray-800 transition-colors"
            >
              Start Free
            </Link>
          </div>

          {/* Quick trust indicators */}
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Free forever plan
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Setup in 2 minutes
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              SOC 2 compliant
            </span>
          </div>
        </div>

        {/* Product preview */}
        <div className="mt-16 relative">
          <div className="bg-gradient-to-b from-gray-100 to-gray-50 rounded-2xl p-2 md:p-3 shadow-2xl shadow-gray-200/50">
            <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
              {/* Mock chat interface */}
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                  <div className="w-3 h-3 rounded-full bg-gray-300" />
                  <div className="w-3 h-3 rounded-full bg-gray-500" />
                </div>
                <span className="text-sm text-gray-500">Erao — Connected to production_db</span>
              </div>
              <div className="p-6 space-y-4">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="bg-gray-900 text-white px-4 py-2.5 rounded-2xl rounded-br-md max-w-md">
                    <p className="text-sm">Show me our top 5 customers by revenue this month</p>
                  </div>
                </div>
                {/* AI response */}
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-md max-w-lg">
                    <p className="text-sm text-gray-700 mb-3">Here are your top 5 customers by revenue for January 2025:</p>
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left px-3 py-2 text-gray-600 font-medium">Customer</th>
                            <th className="text-right px-3 py-2 text-gray-600 font-medium">Revenue</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          <tr><td className="px-3 py-2">Acme Corp</td><td className="text-right px-3 py-2 font-medium">$42,500</td></tr>
                          <tr><td className="px-3 py-2">TechStart Inc</td><td className="text-right px-3 py-2 font-medium">$38,200</td></tr>
                          <tr><td className="px-3 py-2">DataFlow Labs</td><td className="text-right px-3 py-2 font-medium">$31,800</td></tr>
                          <tr><td className="px-3 py-2">CloudNine Systems</td><td className="text-right px-3 py-2 font-medium">$28,400</td></tr>
                          <tr><td className="px-3 py-2">Quantum Analytics</td><td className="text-right px-3 py-2 font-medium">$24,100</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Value Props - Concise, scannable */}
      <section className="w-full max-w-5xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center md:text-left">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4 mx-auto md:mx-0">
              <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Natural Language</h3>
            <p className="text-gray-600 text-sm">
              Ask questions like "What were sales last week?" and get instant answers. No SQL knowledge needed.
            </p>
          </div>

          <div className="text-center md:text-left">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4 mx-auto md:mx-0">
              <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Instant Answers</h3>
            <p className="text-gray-600 text-sm">
              Get formatted tables, charts, and summaries in seconds. Stop waiting on your data team.
            </p>
          </div>

          <div className="text-center md:text-left">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4 mx-auto md:mx-0">
              <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Enterprise Security</h3>
            <p className="text-gray-600 text-sm">
              Your data never leaves your database. All credentials encrypted. SOC 2 Type II compliant.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works - 3 simple steps */}
      <section className="w-full bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Up and running in 2 minutes</h2>
            <p className="text-gray-600">No complex setup. No learning curve.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 relative">
              <span className="absolute -top-3 -left-3 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
              <h3 className="text-lg font-semibold mb-2 mt-2">Connect your database</h3>
              <p className="text-gray-600 text-sm">
                PostgreSQL, MySQL, or MongoDB. Just paste your connection string.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 relative">
              <span className="absolute -top-3 -left-3 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
              <h3 className="text-lg font-semibold mb-2 mt-2">Ask a question</h3>
              <p className="text-gray-600 text-sm">
                Type what you want to know in plain English. Our AI understands context.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 relative">
              <span className="absolute -top-3 -left-3 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
              <h3 className="text-lg font-semibold mb-2 mt-2">Get your answer</h3>
              <p className="text-gray-600 text-sm">
                See results as tables, charts, or summaries. Export or share with your team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Simple, clear */}
      <section className="w-full max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
          <p className="text-gray-600 mb-6">Start free, upgrade when you need more.</p>

          {/* Billing toggle */}
          <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === "monthly" ? "bg-white shadow-sm" : "text-gray-600"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === "yearly" ? "bg-white shadow-sm" : "text-gray-600"
              }`}
            >
              Yearly <span className="text-gray-500 text-xs">Save 20%</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Free */}
          <div className="border border-gray-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-1">Free</h3>
            <p className="text-sm text-gray-500 mb-4">For trying out Erao</p>
            <div className="mb-6">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-gray-500">/month</span>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2 text-sm">
                <svg className="w-5 h-5 text-black flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                1 database connection
              </li>
              <li className="flex items-center gap-2 text-sm">
                <svg className="w-5 h-5 text-black flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                50 queries/month
              </li>
              <li className="flex items-center gap-2 text-sm">
                <svg className="w-5 h-5 text-black flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Basic charts
              </li>
            </ul>
            <Link
              href="/register"
              className="block w-full py-3 text-center border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Get Started Free
            </Link>
          </div>

          {/* Pro - Recommended */}
          <div className="border-2 border-black rounded-2xl p-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white px-3 py-1 rounded-full text-xs font-medium">
              Most Popular
            </div>
            <h3 className="text-lg font-semibold mb-1">Pro</h3>
            <p className="text-sm text-gray-500 mb-4">For growing teams</p>
            <div className="mb-6">
              <span className="text-4xl font-bold">${billingCycle === "monthly" ? "49" : "39"}</span>
              <span className="text-gray-500">/month</span>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2 text-sm">
                <svg className="w-5 h-5 text-black flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                5 database connections
              </li>
              <li className="flex items-center gap-2 text-sm">
                <svg className="w-5 h-5 text-black flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Unlimited queries
              </li>
              <li className="flex items-center gap-2 text-sm">
                <svg className="w-5 h-5 text-black flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Advanced charts & exports
              </li>
              <li className="flex items-center gap-2 text-sm">
                <svg className="w-5 h-5 text-black flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Priority support
              </li>
            </ul>
            <Link
              href="/register"
              className="block w-full py-3 text-center bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Start 14-Day Free Trial
            </Link>
          </div>

          {/* Enterprise */}
          <div className="border border-gray-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-1">Enterprise</h3>
            <p className="text-sm text-gray-500 mb-4">For large organizations</p>
            <div className="mb-6">
              <span className="text-4xl font-bold">Custom</span>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2 text-sm">
                <svg className="w-5 h-5 text-black flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Unlimited connections
              </li>
              <li className="flex items-center gap-2 text-sm">
                <svg className="w-5 h-5 text-black flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                SSO & SAML
              </li>
              <li className="flex items-center gap-2 text-sm">
                <svg className="w-5 h-5 text-black flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Dedicated support
              </li>
              <li className="flex items-center gap-2 text-sm">
                <svg className="w-5 h-5 text-black flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Custom integrations
              </li>
            </ul>
            <Link
              href="mailto:sales@erao.io"
              className="block w-full py-3 text-center border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA - Strong closer */}
      <section className="w-full bg-black text-white py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Stop writing SQL. Start getting answers.
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            Join 500+ teams who save hours every week with Erao.
          </p>
          <Link
            href="/register"
            className="inline-block bg-white text-black px-8 py-3.5 rounded-xl text-base font-medium hover:bg-gray-100 transition-colors"
          >
            Start Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto px-6 py-16 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h4 className="font-semibold text-sm mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link href="/features" className="hover:text-black transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-black transition-colors">Pricing</Link></li>
              <li><Link href="/changelog" className="hover:text-black transition-colors">Changelog</Link></li>
              <li><Link href="/status" className="hover:text-black transition-colors">Status</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4">Resources</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link href="/help" className="hover:text-black transition-colors">Help Center</Link></li>
              <li><Link href="/security" className="hover:text-black transition-colors">Security</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link href="/about" className="hover:text-black transition-colors">About</Link></li>
              <li><Link href="/contact" className="hover:text-black transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link href="/privacy" className="hover:text-black transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-black transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <LogoIcon className="w-6 h-6" />
            <span className="font-semibold">Erao</span>
          </div>
          <p className="text-sm text-gray-400">© 2025 Erao. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
