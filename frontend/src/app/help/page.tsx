"use client";

import { useState } from "react";
import Link from "next/link";
import { PageLayout, EmailButton } from "@/components/shared";

const categories = [
  {
    title: "Getting Started",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    articles: [
      { title: "Quick Start Guide", slug: "quick-start" },
      { title: "Connecting Your First Database", slug: "connect-database" },
      { title: "Running Your First Query", slug: "first-query" },
      { title: "Understanding Query Results", slug: "query-results" },
    ],
  },
  {
    title: "Database Connections",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
      </svg>
    ),
    articles: [
      { title: "Connecting PostgreSQL", slug: "connect-postgresql" },
      { title: "Connecting MySQL", slug: "connect-mysql" },
      { title: "Connecting MongoDB", slug: "connect-mongodb" },
      { title: "Connection Troubleshooting", slug: "connection-troubleshooting" },
    ],
  },
  {
    title: "Querying Data",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    articles: [
      { title: "Writing Effective Questions", slug: "effective-questions" },
      { title: "Working with Tables", slug: "working-with-tables" },
      { title: "Creating Charts", slug: "creating-charts" },
      { title: "Exporting Results", slug: "exporting-results" },
    ],
  },
  {
    title: "Account & Billing",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    articles: [
      { title: "Managing Your Account", slug: "manage-account" },
      { title: "Upgrading Your Plan", slug: "upgrade-plan" },
      { title: "Understanding Your Usage", slug: "usage" },
      { title: "Billing FAQ", slug: "billing-faq" },
    ],
  },
  {
    title: "Security",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    articles: [
      { title: "How We Protect Your Data", slug: "data-protection" },
      { title: "Encryption & Security", slug: "encryption" },
      { title: "Compliance & Certifications", slug: "compliance" },
      { title: "Security Best Practices", slug: "security-best-practices" },
    ],
  },
];

const popularArticles = [
  { title: "Quick Start Guide", category: "Getting Started", slug: "quick-start" },
  { title: "Connecting Your First Database", category: "Getting Started", slug: "connect-database" },
  { title: "Writing Effective Questions", category: "Querying Data", slug: "effective-questions" },
  { title: "How We Protect Your Data", category: "Security", slug: "data-protection" },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = searchQuery
    ? categories.map((cat) => ({
        ...cat,
        articles: cat.articles.filter((a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter((cat) => cat.articles.length > 0)
    : categories;

  return (
    <PageLayout currentPage="help">
      {/* Hero with Search */}
      <section className="w-full bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">How can we help?</h1>
          <p className="text-gray-600 mb-8">Search our knowledge base or browse categories below</p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Search for articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-4 pl-12 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      {!searchQuery && (
        <section className="w-full max-w-5xl mx-auto px-6 py-12">
          <h2 className="text-lg font-semibold mb-4">Popular Articles</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {popularArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/help/${article.slug}`}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
              >
                <div>
                  <p className="font-medium text-sm">{article.title}</p>
                  <p className="text-xs text-gray-500">{article.category}</p>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="w-full max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-lg font-semibold mb-6">{searchQuery ? "Search Results" : "Browse by Category"}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <div key={category.title} className="border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  {category.icon}
                </div>
                <h3 className="font-semibold">{category.title}</h3>
              </div>
              <ul className="space-y-2">
                {category.articles.map((article) => (
                  <li key={article.slug}>
                    <Link
                      href={`/help/${article.slug}`}
                      className="text-sm text-gray-600 hover:text-black transition-colors flex items-center gap-2"
                    >
                      <span>→</span>
                      {article.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {searchQuery && filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No articles found for "{searchQuery}"</p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-4 text-sm text-black underline"
            >
              Clear search
            </button>
          </div>
        )}
      </section>

      {/* Contact Support */}
      <section className="w-full bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
          <p className="text-gray-600 mb-6">Our support team is ready to assist you.</p>
          <EmailButton variant="primary">
            Contact Support
          </EmailButton>
        </div>
      </section>
    </PageLayout>
  );
}
