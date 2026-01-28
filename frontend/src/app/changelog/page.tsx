"use client";

import { PageLayout } from "@/components/shared";

const updates = [
  {
    version: "1.2.0",
    date: "January 28, 2025",
    type: "feature",
    title: "Multi-table Query Support",
    description: "You can now ask for multiple tables in a single query. Results are displayed in a compact format with expandable views.",
    items: [
      "Ask for multiple tables (e.g., 'Show employees and orders')",
      "Compact table buttons for 2+ results",
      "Click to expand individual tables",
      "Improved query result parsing",
    ],
  },
  {
    version: "1.1.0",
    date: "January 20, 2025",
    type: "feature",
    title: "Enhanced Visualizations",
    description: "New chart types and improved data visualization capabilities.",
    items: [
      "Added area charts",
      "Improved bar and line chart rendering",
      "Better handling of large datasets",
      "Auto-detect best chart type",
    ],
  },
  {
    version: "1.0.5",
    date: "January 15, 2025",
    type: "improvement",
    title: "Performance Improvements",
    description: "Faster query execution and improved response times.",
    items: [
      "50% faster query generation",
      "Improved database connection pooling",
      "Reduced memory usage",
      "Better error handling",
    ],
  },
  {
    version: "1.0.4",
    date: "January 10, 2025",
    type: "fix",
    title: "Bug Fixes",
    description: "Various bug fixes and stability improvements.",
    items: [
      "Fixed chart rendering issues on Safari",
      "Fixed conversation history pagination",
      "Improved MongoDB query generation",
      "Fixed export to Excel formatting",
    ],
  },
  {
    version: "1.0.0",
    date: "January 1, 2025",
    type: "release",
    title: "Erao Launch",
    description: "Initial public release of Erao.",
    items: [
      "Natural language to SQL conversion",
      "Support for PostgreSQL, MySQL, MongoDB",
      "Table, bar, line, and pie chart views",
      "Export to CSV and Excel",
      "Conversation history",
    ],
  },
];

const typeStyles: Record<string, string> = {
  feature: "bg-black text-white",
  improvement: "bg-gray-200 text-gray-800",
  fix: "bg-gray-100 text-gray-600",
  release: "bg-black text-white",
};

const typeLabels: Record<string, string> = {
  feature: "New Feature",
  improvement: "Improvement",
  fix: "Bug Fix",
  release: "Release",
};

export default function ChangelogPage() {
  return (
    <PageLayout currentPage="changelog">
      {/* Header */}
      <section className="w-full max-w-5xl mx-auto px-6 pt-16 pb-12">
        <h1 className="text-4xl font-bold mb-4">Changelog</h1>
        <p className="text-gray-600">
          New updates and improvements to Erao. Follow along as we build.
        </p>
      </section>

      {/* Updates */}
      <section className="w-full max-w-3xl mx-auto px-6 pb-20">
        <div className="space-y-12">
          {updates.map((update) => (
            <article key={update.version} className="relative pl-8 border-l-2 border-gray-200">
              <div className="absolute -left-2 top-0 w-4 h-4 bg-black rounded-full" />

              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${typeStyles[update.type]}`}>
                  {typeLabels[update.type]}
                </span>
                <span className="text-sm text-gray-500">v{update.version}</span>
                <span className="text-sm text-gray-400">•</span>
                <span className="text-sm text-gray-500">{update.date}</span>
              </div>

              <h2 className="text-xl font-semibold mb-2">{update.title}</h2>
              <p className="text-gray-600 mb-4">{update.description}</p>

              <ul className="space-y-2">
                {update.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-gray-400 mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* Subscribe */}
      <section className="w-full bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
          <p className="text-gray-600 mb-6">
            Get notified when we release new features and improvements.
          </p>
          <div className="flex items-center justify-center gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
            <button className="bg-black text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
