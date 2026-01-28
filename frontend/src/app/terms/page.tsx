"use client";

import { PageLayout } from "@/components/shared";

export default function TermsPage() {
  return (
    <PageLayout currentPage="terms">
      <article className="w-full max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-gray-500 mb-12">Last updated: January 28, 2025</p>

        <div className="space-y-10">
          <section>
            <h2 className="text-xl font-semibold mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-600">
              By accessing or using Erao ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-gray-600">
              Erao is a software-as-a-service platform that enables users to query databases using natural language. The Service translates natural language questions into database queries, executes them, and presents the results.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">3. User Accounts</h2>
            <p className="text-gray-600 mb-4">
              To use certain features of the Service, you must create an account. You are responsible for:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
              <li>Ensuring your account information is accurate and current</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">4. Acceptable Use</h2>
            <p className="text-gray-600 mb-4">You agree not to use the Service to:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Violate any applicable laws or regulations</li>
              <li>Access databases without proper authorization</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Use the Service for any malicious or harmful purpose</li>
              <li>Reverse engineer or attempt to extract source code</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">5. Database Connections</h2>
            <p className="text-gray-600">
              You are solely responsible for ensuring you have proper authorization to connect to and query any databases you use with our Service. We are not responsible for any unauthorized access to third-party databases.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">6. Payment and Billing</h2>
            <p className="text-gray-600 mb-4">For paid plans:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Fees are billed in advance on a monthly or annual basis</li>
              <li>All fees are non-refundable except as required by law</li>
              <li>We may change pricing with 30 days notice</li>
              <li>You are responsible for all applicable taxes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">7. Intellectual Property</h2>
            <p className="text-gray-600">
              The Service and its original content, features, and functionality are owned by Erao and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-600">
              To the maximum extent permitted by law, Erao shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, resulting from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">9. Disclaimer of Warranties</h2>
            <p className="text-gray-600">
              The Service is provided "as is" without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">10. Termination</h2>
            <p className="text-gray-600">
              We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users or us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">11. Changes to Terms</h2>
            <p className="text-gray-600">
              We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms on this page. Your continued use of the Service after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">12. Contact Us</h2>
            <p className="text-gray-600">
              If you have any questions about these Terms, please contact us at{" "}
              <a href="mailto:legal@erao.io" className="text-black underline">legal@erao.io</a>
            </p>
          </section>
        </div>
      </article>
    </PageLayout>
  );
}
