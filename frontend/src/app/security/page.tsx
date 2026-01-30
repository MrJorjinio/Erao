"use client";

import { PageLayout, EmailButton } from "@/components/shared";

const securityFeatures = [
  {
    title: "Encrypted Credentials",
    description: "All database credentials are encrypted using AES-256 encryption. Your passwords and connection strings are never stored in plain text.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    title: "Secure Connections",
    description: "All connections to your databases use SSL/TLS encryption. Data in transit is always protected.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: "No Data Storage",
    description: "We never store your actual database data. We only store the queries you run and their metadata, not the results.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
      </svg>
    ),
  },
  {
    title: "Read-Only Queries",
    description: "By default, Erao only executes read-only (SELECT) queries. We prevent any data modification unless explicitly enabled.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
];

export default function SecurityPage() {
  return (
    <PageLayout currentPage="security">
      {/* Hero */}
      <section className="w-full max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold mb-4">Security at Erao</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Your data security is our top priority. We've built Erao from the ground up with security in mind.
        </p>
      </section>

      {/* Security Features */}
      <section className="w-full max-w-5xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityFeatures.map((feature) => (
            <div key={feature.title} className="border border-gray-200 rounded-2xl p-6">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How Data Flows */}
      <section className="w-full bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-12">How Your Data Flows</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              { step: 1, title: "You ask a question", desc: "Your natural language question is sent to our servers over an encrypted connection." },
              { step: 2, title: "We generate a query", desc: "Our AI translates your question into a SQL query. Only metadata about your database schema is used." },
              { step: 3, title: "Query executes on your database", desc: "The query runs directly on your database using your encrypted credentials. We connect via SSL/TLS." },
              { step: 4, title: "Results displayed to you", desc: "The results are sent back to your browser. We do not store the actual data, only the query text." },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Contact */}
      <section className="w-full bg-black text-white py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Security Questions?</h2>
          <p className="text-gray-400 mb-6">
            If you have security concerns or want to report a vulnerability, please contact our team.
          </p>
          <EmailButton variant="secondary">
            Contact Security Team
          </EmailButton>
        </div>
      </section>
    </PageLayout>
  );
}
