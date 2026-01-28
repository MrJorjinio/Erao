"use client";

import Link from "next/link";
import { PageLayout } from "@/components/shared";

const features = [
  {
    title: "Natural Language Queries",
    description: "Ask questions in plain English. No SQL knowledge required. Our AI understands context and translates your questions into accurate database queries.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    title: "Instant Visualizations",
    description: "Get results as clean tables, bar charts, line graphs, pie charts, or summaries. Switch between views with one click.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: "Multi-Database Support",
    description: "Connect PostgreSQL, MySQL, or MongoDB. Add your connection string and start querying in seconds. More databases coming soon.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    ),
  },
  {
    title: "Conversation History",
    description: "Your queries are saved in conversations. Pick up where you left off, reference previous results, or share insights with your team.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Export & Share",
    description: "Export your results to CSV, Excel, or PDF. Share insights with teammates or stakeholders without giving them database access.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
  },
  {
    title: "Enterprise Security",
    description: "Your data never leaves your database. Credentials encrypted with AES-256. SSL/TLS connections. SOC 2 Type II compliant.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
];

const useCases = [
  {
    title: "For Product Teams",
    description: "Track user engagement, analyze feature adoption, and make data-driven decisions without waiting for engineering.",
    examples: ["User signups this week", "Most used features by cohort", "Churn analysis by plan"],
  },
  {
    title: "For Sales Teams",
    description: "Get real-time pipeline insights, track performance, and identify opportunities without complex reporting tools.",
    examples: ["Deals closed this month", "Top performing reps", "Revenue by region"],
  },
  {
    title: "For Support Teams",
    description: "Find customer information instantly, track ticket trends, and identify common issues to improve service.",
    examples: ["Customer's recent orders", "Open tickets by priority", "Average resolution time"],
  },
];

export default function FeaturesPage() {
  return (
    <PageLayout currentPage="features">
      {/* Hero */}
      <section className="w-full max-w-5xl mx-auto px-6 pt-16 pb-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Everything you need to query your data
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Erao turns your natural language questions into SQL queries, executes them, and presents the results beautifully.
        </p>
        <Link
          href="/register"
          className="inline-block bg-black text-white px-8 py-3.5 rounded-xl text-base font-medium hover:bg-gray-800 transition-colors"
        >
          Start Free
        </Link>
      </section>

      {/* Features Grid */}
      <section className="w-full max-w-5xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div key={feature.title} className="border border-gray-200 rounded-2xl p-6">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="w-full bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Connect</h3>
              <p className="text-sm text-gray-600">
                Add your database connection string. We support PostgreSQL, MySQL, and MongoDB.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">Ask</h3>
              <p className="text-sm text-gray-600">
                Type your question in plain English. Our AI understands context and generates accurate queries.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Get Answers</h3>
              <p className="text-sm text-gray-600">
                See results as tables, charts, or summaries. Export or share with your team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="w-full max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">Built for every team</h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          From product managers to sales reps, anyone can get insights from your data.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {useCases.map((useCase) => (
            <div key={useCase.title} className="border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-2">{useCase.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{useCase.description}</p>
              <div className="space-y-2">
                {useCase.examples.map((example) => (
                  <div key={example} className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="text-gray-400">"</span>
                    {example}
                    <span className="text-gray-400">"</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="w-full bg-black text-white py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to talk to your data?
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            Start free and see results in under 2 minutes.
          </p>
          <Link
            href="/register"
            className="inline-block bg-white text-black px-8 py-3.5 rounded-xl text-base font-medium hover:bg-gray-100 transition-colors"
          >
            Start Free
          </Link>
        </div>
      </section>
    </PageLayout>
  );
}
