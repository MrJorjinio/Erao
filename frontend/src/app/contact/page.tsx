"use client";

import { useState } from "react";
import { PageLayout } from "@/components/shared";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "general",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <PageLayout currentPage="contact">
      <div className="w-full max-w-5xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-16">
          {/* Left - Info */}
          <div>
            <h1 className="text-4xl font-bold mb-4">Get in touch</h1>
            <p className="text-gray-600 mb-8">
              Have questions about Erao? We're here to help. Fill out the form or reach us directly.
            </p>

            <div className="space-y-6">
              <div className="border border-gray-200 rounded-xl p-5">
                <h3 className="font-semibold mb-1">General Inquiries</h3>
                <a href="mailto:hello@erao.io" className="text-gray-600 hover:text-black transition-colors">
                  hello@erao.io
                </a>
              </div>

              <div className="border border-gray-200 rounded-xl p-5">
                <h3 className="font-semibold mb-1">Sales</h3>
                <a href="mailto:sales@erao.io" className="text-gray-600 hover:text-black transition-colors">
                  sales@erao.io
                </a>
              </div>

              <div className="border border-gray-200 rounded-xl p-5">
                <h3 className="font-semibold mb-1">Technical Support</h3>
                <a href="mailto:support@erao.io" className="text-gray-600 hover:text-black transition-colors">
                  support@erao.io
                </a>
              </div>
            </div>
          </div>

          {/* Right - Form */}
          <div>
            {submitted ? (
              <div className="border border-gray-200 rounded-2xl p-8 text-center">
                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold mb-2">Message sent!</h2>
                <p className="text-gray-600 text-sm">
                  We'll get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="sales">Sales</option>
                    <option value="support">Technical Support</option>
                    <option value="billing">Billing</option>
                    <option value="partnership">Partnership</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                    placeholder="How can we help?"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
