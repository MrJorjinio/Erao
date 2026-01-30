"use client";

import { useState } from "react";
import { PageLayout, SUPPORT_EMAIL } from "@/components/shared";

export default function ContactPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (type: string) => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <PageLayout currentPage="contact">
      <div className="w-full max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have questions about Erao? We're here to help. Click any card below to copy our email address.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* General */}
          <button
            onClick={() => handleCopy("general")}
            className="group border border-gray-200 rounded-2xl p-8 hover:border-black hover:shadow-lg transition-all text-center text-left"
          >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-5 transition-colors ${
              copied === "general" ? "bg-green-500 text-white" : "bg-gray-100 group-hover:bg-black group-hover:text-white"
            }`}>
              {copied === "general" ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            <h3 className="text-lg font-semibold mb-2">General Inquiries</h3>
            <p className="text-sm text-gray-600 mb-4">
              Questions about Erao? Want to learn more about what we offer?
            </p>
            <span className={`inline-flex items-center gap-2 text-sm font-medium ${
              copied === "general" ? "text-green-600" : "text-black"
            }`}>
              {copied === "general" ? "Email Copied!" : "Click to Copy Email"}
            </span>
          </button>

          {/* Support */}
          <button
            onClick={() => handleCopy("support")}
            className="group border border-gray-200 rounded-2xl p-8 hover:border-black hover:shadow-lg transition-all text-center text-left"
          >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-5 transition-colors ${
              copied === "support" ? "bg-green-500 text-white" : "bg-gray-100 group-hover:bg-black group-hover:text-white"
            }`}>
              {copied === "support" ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </div>
            <h3 className="text-lg font-semibold mb-2">Technical Support</h3>
            <p className="text-sm text-gray-600 mb-4">
              Having issues? Need help setting up your database connections?
            </p>
            <span className={`inline-flex items-center gap-2 text-sm font-medium ${
              copied === "support" ? "text-green-600" : "text-black"
            }`}>
              {copied === "support" ? "Email Copied!" : "Click to Copy Email"}
            </span>
          </button>

          {/* Sales */}
          <button
            onClick={() => handleCopy("sales")}
            className="group border border-gray-200 rounded-2xl p-8 hover:border-black hover:shadow-lg transition-all text-center text-left"
          >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-5 transition-colors ${
              copied === "sales" ? "bg-green-500 text-white" : "bg-gray-100 group-hover:bg-black group-hover:text-white"
            }`}>
              {copied === "sales" ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            <h3 className="text-lg font-semibold mb-2">Sales</h3>
            <p className="text-sm text-gray-600 mb-4">
              Interested in Enterprise plans or custom solutions for your team?
            </p>
            <span className={`inline-flex items-center gap-2 text-sm font-medium ${
              copied === "sales" ? "text-green-600" : "text-black"
            }`}>
              {copied === "sales" ? "Email Copied!" : "Click to Copy Email"}
            </span>
          </button>
        </div>

        {/* Direct Email Display */}
        <div className="mt-16 max-w-2xl mx-auto text-center">
          <div className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-xl font-semibold mb-3">Our Email Address</h2>
            <p className="text-gray-600 mb-4">
              Reach us directly at:
            </p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-lg font-medium text-black bg-white px-4 py-2 rounded-lg border border-gray-200">
                {SUPPORT_EMAIL}
              </span>
              <button
                onClick={() => handleCopy("direct")}
                className="w-20 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-black text-white hover:bg-gray-800"
              >
                {copied === "direct" ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>

        {/* Response Time */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            We typically respond within 24 hours during business days.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
