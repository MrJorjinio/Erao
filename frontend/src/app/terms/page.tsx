"use client";

import { PageLayout, EmailButton } from "@/components/shared";

export default function TermsPage() {
  return (
    <PageLayout currentPage="terms">
      <article className="w-full max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="border-b border-gray-200 pb-8 mb-10">
          <h1 className="text-4xl font-bold mb-3">Terms of Service</h1>
          <p className="text-gray-500">Last updated: January 28, 2025</p>
        </div>

        {/* Introduction */}
        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-gray-600 mb-10">
            Welcome to Erao. These Terms of Service govern your use of our platform and services.
            By accessing or using Erao, you agree to be bound by these terms. Please read them carefully.
          </p>

          {/* Terms Content */}
          <div className="space-y-12">
            {/* Section 1 */}
            <section className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center text-sm font-bold">1</span>
                <div>
                  <h2 className="text-xl font-semibold mb-3">Acceptance of Terms</h2>
                  <p className="text-gray-600 leading-relaxed">
                    By creating an account or using our Service, you acknowledge that you have read, understood,
                    and agree to be bound by these Terms. If you do not agree to these Terms, you may not access
                    or use the Service. These Terms apply to all visitors, users, and others who access the Service.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center text-sm font-bold">2</span>
                <div>
                  <h2 className="text-xl font-semibold mb-3">Description of Service</h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Erao is a software-as-a-service platform that enables users to query databases using natural language.
                    Our Service translates your questions into database queries, executes them securely, and presents
                    the results in an accessible format.
                  </p>
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <p className="text-sm text-gray-500">
                      The Service is provided on an "as available" basis. We reserve the right to modify, suspend,
                      or discontinue any aspect of the Service at any time.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center text-sm font-bold">3</span>
                <div>
                  <h2 className="text-xl font-semibold mb-3">User Accounts</h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    To access certain features, you must create an account. When you create an account, you agree to:
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-black flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600">Provide accurate, current, and complete information</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-black flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600">Maintain the confidentiality of your account credentials</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-black flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600">Accept responsibility for all activities under your account</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-black flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600">Notify us immediately of any unauthorized access</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center text-sm font-bold">4</span>
                <div>
                  <h2 className="text-xl font-semibold mb-3">Acceptable Use</h2>
                  <p className="text-gray-600 leading-relaxed mb-4">You agree not to use the Service to:</p>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      "Violate any applicable laws or regulations",
                      "Access databases without proper authorization",
                      "Attempt to gain unauthorized access to our systems",
                      "Interfere with or disrupt the Service",
                      "Use the Service for malicious purposes",
                      "Reverse engineer or extract source code",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-2 bg-white rounded-lg p-3 border border-gray-200">
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="text-sm text-gray-600">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center text-sm font-bold">5</span>
                <div>
                  <h2 className="text-xl font-semibold mb-3">Database Connections</h2>
                  <p className="text-gray-600 leading-relaxed">
                    You are solely responsible for ensuring you have proper authorization to connect to and query
                    any databases you use with our Service. Erao is not responsible for any unauthorized access
                    to third-party databases. You must ensure that your use of the Service complies with any
                    applicable data protection laws and regulations.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center text-sm font-bold">6</span>
                <div>
                  <h2 className="text-xl font-semibold mb-3">Payment and Billing</h2>
                  <p className="text-gray-600 leading-relaxed mb-4">For paid subscription plans:</p>
                  <div className="space-y-2">
                    {[
                      "Fees are billed in advance on a monthly or annual basis",
                      "All fees are non-refundable except as required by law",
                      "We may change pricing with 30 days advance notice",
                      "You are responsible for all applicable taxes",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-3 text-gray-600">
                        <div className="w-1.5 h-1.5 bg-black rounded-full" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Section 7 */}
            <section className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center text-sm font-bold">7</span>
                <div>
                  <h2 className="text-xl font-semibold mb-3">Intellectual Property</h2>
                  <p className="text-gray-600 leading-relaxed">
                    The Service and its original content, features, and functionality are owned by Erao and are
                    protected by international copyright, trademark, patent, trade secret, and other intellectual
                    property laws. You may not copy, modify, distribute, sell, or lease any part of our Service
                    without our express written permission.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 8 */}
            <section className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center text-sm font-bold">8</span>
                <div>
                  <h2 className="text-xl font-semibold mb-3">Limitation of Liability</h2>
                  <p className="text-gray-600 leading-relaxed">
                    To the maximum extent permitted by applicable law, Erao shall not be liable for any indirect,
                    incidental, special, consequential, or punitive damages, including but not limited to loss of
                    profits, data, use, goodwill, or other intangible losses, resulting from your access to or
                    use of (or inability to access or use) the Service.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 9 */}
            <section className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center text-sm font-bold">9</span>
                <div>
                  <h2 className="text-xl font-semibold mb-3">Termination</h2>
                  <p className="text-gray-600 leading-relaxed">
                    We may terminate or suspend your account and access to the Service immediately, without prior
                    notice or liability, for any reason, including if you breach these Terms. Upon termination,
                    your right to use the Service will cease immediately. You may terminate your account at any
                    time by contacting us or using the account deletion feature in your settings.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 10 */}
            <section className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center text-sm font-bold">10</span>
                <div>
                  <h2 className="text-xl font-semibold mb-3">Changes to Terms</h2>
                  <p className="text-gray-600 leading-relaxed">
                    We reserve the right to modify or replace these Terms at any time at our sole discretion.
                    If a revision is material, we will provide at least 30 days notice prior to any new terms
                    taking effect. Your continued use of the Service after changes constitutes acceptance of the
                    new Terms.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Contact Section */}
          <div className="mt-16 bg-black text-white rounded-2xl p-8 text-center">
            <h2 className="text-xl font-semibold mb-3">Questions about these Terms?</h2>
            <p className="text-gray-400 mb-6">
              If you have any questions about these Terms of Service, please contact us.
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
