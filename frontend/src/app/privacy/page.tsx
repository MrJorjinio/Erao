"use client";

import { PageLayout, EmailButton } from "@/components/shared";

export default function PrivacyPage() {
  return (
    <PageLayout currentPage="privacy">
      <article className="w-full max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="border-b border-gray-200 pb-8 mb-10">
          <h1 className="text-4xl font-bold mb-3">Privacy Policy</h1>
          <p className="text-gray-500">Last updated: January 28, 2025</p>
        </div>

        {/* Introduction */}
        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-gray-600 mb-10">
            At Erao, we take your privacy seriously. This Privacy Policy explains how we collect, use,
            disclose, and safeguard your information when you use our service. Please read this policy
            carefully to understand our practices.
          </p>

          {/* Content */}
          <div className="space-y-12">
            {/* Section 1 */}
            <section className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center text-sm font-bold">1</span>
                <div>
                  <h2 className="text-xl font-semibold mb-3">Information We Collect</h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    We collect information that you provide directly to us and information generated through
                    your use of our Service:
                  </p>
                  <div className="space-y-3">
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <h4 className="font-medium mb-1">Account Information</h4>
                      <p className="text-sm text-gray-600">Email address, name, and password when you create an account.</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <h4 className="font-medium mb-1">Database Credentials</h4>
                      <p className="text-sm text-gray-600">Connection strings and credentials encrypted using AES-256 encryption.</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <h4 className="font-medium mb-1">Query History</h4>
                      <p className="text-sm text-gray-600">The questions you ask and queries we generate. We do NOT store your actual data or query results.</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <h4 className="font-medium mb-1">Usage Data</h4>
                      <p className="text-sm text-gray-600">Information about how you use our service, including features used and time spent.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center text-sm font-bold">2</span>
                <div>
                  <h2 className="text-xl font-semibold mb-3">How We Use Your Information</h2>
                  <p className="text-gray-600 leading-relaxed mb-4">We use the information we collect to:</p>
                  <ul className="space-y-3">
                    {[
                      "Provide, maintain, and improve our services",
                      "Process transactions and send related information",
                      "Send technical notices, updates, and support messages",
                      "Respond to your comments and questions",
                      "Analyze usage patterns to improve user experience",
                      "Detect, investigate, and prevent fraudulent or illegal activities",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-black flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center text-sm font-bold">3</span>
                <div>
                  <h2 className="text-xl font-semibold mb-3">Data Security</h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    We implement industry-standard security measures to protect your data:
                  </p>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      { title: "AES-256 Encryption", desc: "All database credentials encrypted" },
                      { title: "SSL/TLS", desc: "All connections use encryption" },
                      { title: "No Data Storage", desc: "We never store your actual database data" },
                    ].map((item) => (
                      <div key={item.title} className="bg-white rounded-xl p-4 border border-gray-200">
                        <h4 className="font-medium mb-1">{item.title}</h4>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center text-sm font-bold">4</span>
                <div>
                  <h2 className="text-xl font-semibold mb-3">Data Sharing</h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    We do not sell, trade, or otherwise transfer your personal information to third parties except:
                  </p>
                  <ul className="space-y-3">
                    {[
                      "Service providers who assist in operating our service (e.g., hosting, payment processing)",
                      "When required by law or to protect our rights",
                      "In connection with a business transfer (merger, acquisition)",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 bg-black rounded-full mt-2 flex-shrink-0" />
                        <span className="text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center text-sm font-bold">5</span>
                <div>
                  <h2 className="text-xl font-semibold mb-3">Your Rights</h2>
                  <p className="text-gray-600 leading-relaxed mb-4">You have the right to:</p>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      "Access your personal information",
                      "Update or correct your data",
                      "Export your data in a portable format",
                      "Opt out of marketing communications",
                      "Request information about data processing",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2 bg-white rounded-lg p-3 border border-gray-200">
                        <svg className="w-4 h-4 text-black flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-gray-600">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center text-sm font-bold">6</span>
                <div>
                  <h2 className="text-xl font-semibold mb-3">Data Retention</h2>
                  <p className="text-gray-600 leading-relaxed">
                    We retain your account information as long as your account is active. Query history is
                    retained based on your plan (7 days for Free, unlimited for paid plans). Account deletion
                    is not available to prevent abuse of our free tier.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 7 */}
            <section className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center text-sm font-bold">7</span>
                <div>
                  <h2 className="text-xl font-semibold mb-3">Changes to This Policy</h2>
                  <p className="text-gray-600 leading-relaxed">
                    We may update this Privacy Policy from time to time. We will notify you of any changes by
                    posting the new policy on this page and updating the "Last updated" date. We encourage
                    you to review this page periodically for any changes.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Contact Section */}
          <div className="mt-16 bg-black text-white rounded-2xl p-8 text-center">
            <h2 className="text-xl font-semibold mb-3">Questions about Privacy?</h2>
            <p className="text-gray-400 mb-6">
              If you have any questions about this Privacy Policy, please contact us.
            </p>
            <EmailButton variant="secondary">
              Contact Us
            </EmailButton>
          </div>
        </div>
      </article>
    </PageLayout>
  );
}
