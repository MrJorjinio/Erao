"use client";

import { PageLayout } from "@/components/shared";

export default function PrivacyPage() {
  return (
    <PageLayout currentPage="privacy">
      <article className="w-full max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-gray-500 mb-12">Last updated: January 28, 2025</p>

        <div className="space-y-10">
          <section>
            <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-gray-600">
              At Erao, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">2. Information We Collect</h2>
            <p className="text-gray-600 mb-4">We collect the following types of information:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li><strong>Account Information:</strong> Email address, name, and password when you create an account.</li>
              <li><strong>Database Credentials:</strong> Connection strings and credentials to connect to your databases. These are encrypted using AES-256 encryption.</li>
              <li><strong>Query History:</strong> The natural language questions you ask and the queries we generate. We do NOT store your actual data or query results.</li>
              <li><strong>Usage Data:</strong> Information about how you use our service, including features used and time spent.</li>
              <li><strong>Payment Information:</strong> Billing details processed securely through our payment provider (Stripe).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-600 mb-4">We use your information to:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices, updates, and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Analyze usage patterns to improve user experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">4. Data Security</h2>
            <p className="text-gray-600 mb-4">
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>All database credentials are encrypted with AES-256</li>
              <li>All connections use SSL/TLS encryption</li>
              <li>We never store your actual database data—only queries</li>
              <li>Regular security audits and penetration testing</li>
              <li>SOC 2 Type II compliance</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">5. Data Sharing</h2>
            <p className="text-gray-600 mb-4">
              We do not sell, trade, or otherwise transfer your personal information to third parties except:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Service providers who assist in operating our service (e.g., hosting, payment processing)</li>
              <li>When required by law or to protect our rights</li>
              <li>In connection with a business transfer (merger, acquisition)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">6. Your Rights</h2>
            <p className="text-gray-600 mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Access, update, or delete your personal information</li>
              <li>Export your data in a portable format</li>
              <li>Opt out of marketing communications</li>
              <li>Request information about how your data is processed</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">7. Cookies</h2>
            <p className="text-gray-600">
              We use essential cookies to maintain your session and preferences. We do not use third-party tracking cookies for advertising purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">8. Data Retention</h2>
            <p className="text-gray-600">
              We retain your account information as long as your account is active. Query history is retained based on your plan (7 days for Free, unlimited for paid plans). You can delete your account and all associated data at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">9. Changes to This Policy</h2>
            <p className="text-gray-600">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">10. Contact Us</h2>
            <p className="text-gray-600">
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:privacy@erao.io" className="text-black underline">privacy@erao.io</a>
            </p>
          </section>
        </div>
      </article>
    </PageLayout>
  );
}
