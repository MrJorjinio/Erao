"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PageLayout } from "@/components/shared";

const articles: Record<string, { title: string; category: string; content: string[] }> = {
  "quick-start": {
    title: "Quick Start Guide",
    category: "Getting Started",
    content: [
      "Welcome to Erao. This guide will help you get started with querying your database using natural language.",
      "Step 1: Create an account by clicking 'Start Free' on the homepage.",
      "Step 2: Once logged in, navigate to your dashboard and click 'Add Database' to connect your first database.",
      "Step 3: Enter your database connection details. We support PostgreSQL, MySQL, and MongoDB.",
      "Step 4: After connecting, go to the chat interface and start asking questions about your data.",
      "That's it. You're ready to query your database using natural language.",
    ],
  },
  "connect-database": {
    title: "Connecting Your First Database",
    category: "Getting Started",
    content: [
      "Erao supports PostgreSQL, MySQL, and MongoDB. Here's how to connect your database.",
      "1. From your dashboard, click 'Add Database' or the '+' button.",
      "2. Select your database type from the dropdown menu.",
      "3. Enter your connection details: host, port, database name, username, and password.",
      "4. Click 'Test Connection' to verify the connection works.",
      "5. Once verified, click 'Save' to add the database to your account.",
      "Your credentials are encrypted with AES-256 encryption and stored securely.",
    ],
  },
  "first-query": {
    title: "Running Your First Query",
    category: "Getting Started",
    content: [
      "After connecting a database, you can start querying it with natural language.",
      "1. Select your database from the dropdown in the chat interface.",
      "2. Type your question in plain English. For example: 'Show me all users created this month'.",
      "3. Press Enter or click Send.",
      "4. Erao will generate the appropriate SQL query and execute it against your database.",
      "5. View your results as a table, chart, or summary.",
      "Tips: Be specific in your questions. Include table names if you know them.",
    ],
  },
  "query-results": {
    title: "Understanding Query Results",
    category: "Getting Started",
    content: [
      "Erao presents your query results in multiple formats.",
      "Table View: The default view showing your data in rows and columns.",
      "Bar Chart: Visualize numeric data as horizontal or vertical bars.",
      "Line Chart: See trends over time with line graphs.",
      "Pie Chart: View proportional data as pie segments.",
      "You can switch between views using the toolbar above your results.",
      "Export your results to CSV, Excel, or PDF using the export button.",
    ],
  },
  "connect-postgresql": {
    title: "Connecting PostgreSQL",
    category: "Database Connections",
    content: [
      "To connect a PostgreSQL database to Erao:",
      "1. Get your PostgreSQL connection details from your database provider or server.",
      "2. In Erao, click 'Add Database' and select 'PostgreSQL'.",
      "3. Enter the host (e.g., localhost or your server IP/domain).",
      "4. Enter the port (default is 5432).",
      "5. Enter your database name, username, and password.",
      "6. Enable SSL if your database requires it.",
      "7. Click 'Test Connection' then 'Save'.",
    ],
  },
  "connect-mysql": {
    title: "Connecting MySQL",
    category: "Database Connections",
    content: [
      "To connect a MySQL database to Erao:",
      "1. Get your MySQL connection details from your database provider or server.",
      "2. In Erao, click 'Add Database' and select 'MySQL'.",
      "3. Enter the host (e.g., localhost or your server IP/domain).",
      "4. Enter the port (default is 3306).",
      "5. Enter your database name, username, and password.",
      "6. Enable SSL if your database requires it.",
      "7. Click 'Test Connection' then 'Save'.",
    ],
  },
  "connect-mongodb": {
    title: "Connecting MongoDB",
    category: "Database Connections",
    content: [
      "To connect a MongoDB database to Erao:",
      "1. Get your MongoDB connection string from MongoDB Atlas or your server.",
      "2. In Erao, click 'Add Database' and select 'MongoDB'.",
      "3. Paste your connection string (starts with mongodb:// or mongodb+srv://).",
      "4. Alternatively, enter host, port, database name, and credentials manually.",
      "5. Click 'Test Connection' then 'Save'.",
      "Note: Erao translates your natural language questions into MongoDB aggregation queries.",
    ],
  },
  "connection-troubleshooting": {
    title: "Connection Troubleshooting",
    category: "Database Connections",
    content: [
      "If you're having trouble connecting your database, try these steps:",
      "1. Verify your credentials are correct. Copy-paste to avoid typos.",
      "2. Check that your database server allows external connections.",
      "3. Ensure your IP address is whitelisted in your database firewall.",
      "4. For cloud databases, check that the connection string format is correct.",
      "5. Try enabling or disabling SSL based on your database requirements.",
      "6. Check that the port is correct (PostgreSQL: 5432, MySQL: 3306, MongoDB: 27017).",
      "If issues persist, contact support at javxohirdoniyorov@gmail.com.",
    ],
  },
  "effective-questions": {
    title: "Writing Effective Questions",
    category: "Querying Data",
    content: [
      "Get better results by writing clear, specific questions.",
      "Be specific: 'Show users created in January 2025' is better than 'Show recent users'.",
      "Include context: Mention table names if you know them.",
      "Use time ranges: 'Last 7 days', 'This month', 'Between Jan 1 and Jan 15'.",
      "Ask for aggregations: 'Total sales', 'Average order value', 'Count of users'.",
      "Request sorting: 'Top 10 by revenue', 'Oldest first', 'Highest to lowest'.",
      "Combine conditions: 'Active users who signed up last month and made a purchase'.",
    ],
  },
  "working-with-tables": {
    title: "Working with Tables",
    category: "Querying Data",
    content: [
      "Table view is the default format for query results.",
      "Sorting: Click column headers to sort by that column.",
      "Pagination: Use the navigation controls to move between pages of results.",
      "Column resizing: Drag column borders to resize.",
      "Copy: Select cells and copy data to clipboard.",
      "Full screen: Expand the table to full screen for better viewing.",
      "For large datasets, Erao automatically paginates results.",
    ],
  },
  "creating-charts": {
    title: "Creating Charts",
    category: "Querying Data",
    content: [
      "Erao can visualize your data as charts.",
      "Bar Chart: Best for comparing categories or values.",
      "Line Chart: Best for showing trends over time.",
      "Pie Chart: Best for showing proportions of a whole.",
      "Area Chart: Best for cumulative totals over time.",
      "To create a chart, run a query with numeric data, then click the chart type in the toolbar.",
      "Erao automatically detects which columns to use for labels and values.",
    ],
  },
  "exporting-results": {
    title: "Exporting Results",
    category: "Querying Data",
    content: [
      "Export your query results in multiple formats.",
      "CSV: Comma-separated values, opens in any spreadsheet application.",
      "Excel: Native Excel format with formatting preserved.",
      "PDF: Printable document format (Pro plan and above).",
      "To export, click the Export button in the results toolbar and select your format.",
      "Large exports may take a few moments to generate.",
      "Exported files are downloaded directly to your device.",
    ],
  },
  "manage-account": {
    title: "Managing Your Account",
    category: "Account & Billing",
    content: [
      "Access your account settings from the user menu in the top right.",
      "Profile: Update your name, email, and password.",
      "Databases: View and manage your connected databases.",
      "Billing: View your subscription and payment details.",
      "Note: Account deletion is not available to prevent abuse of our free tier.",
    ],
  },
  "upgrade-plan": {
    title: "Upgrading Your Plan",
    category: "Account & Billing",
    content: [
      "Upgrade your plan to access more features.",
      "1. Go to Settings and click 'Billing'.",
      "2. Click 'Upgrade Plan' and select your new plan.",
      "3. Enter your payment details.",
      "4. Your new features are available immediately.",
      "When upgrading mid-cycle, you're charged a prorated amount.",
      "You can downgrade at any time; changes take effect at the next billing cycle.",
    ],
  },
  "usage": {
    title: "Understanding Your Usage",
    category: "Account & Billing",
    content: [
      "Track your usage from the Settings page.",
      "Queries: Number of queries run this billing cycle.",
      "Databases: Number of connected databases.",
      "Team Members: Number of users on your team.",
      "Free plan: 50 queries per month, 1 database.",
      "Pro plan: Unlimited queries, 5 databases.",
      "Usage resets at the start of each billing cycle.",
    ],
  },
  "billing-faq": {
    title: "Billing FAQ",
    category: "Account & Billing",
    content: [
      "When am I charged? You're charged at the start of each billing cycle.",
      "Can I get a refund? Yes, we offer a 14-day money-back guarantee.",
      "What payment methods do you accept? Credit cards via Stripe.",
      "Can I switch between monthly and yearly? Yes, from your billing settings.",
      "What happens if my payment fails? We'll retry and notify you by email.",
      "How do I cancel? Go to Settings, Billing, and click 'Cancel Subscription'.",
    ],
  },
  "data-protection": {
    title: "How We Protect Your Data",
    category: "Security",
    content: [
      "Security is our top priority at Erao.",
      "Encryption at rest: All credentials encrypted with AES-256.",
      "Encryption in transit: All connections use SSL/TLS.",
      "No data storage: We never store your actual database data.",
      "Read-only by default: Erao only runs SELECT queries unless you enable writes.",
      "Access controls: Fine-grained permissions for team members.",
      "We undergo regular security audits and penetration testing.",
    ],
  },
  "encryption": {
    title: "Encryption & Security",
    category: "Security",
    content: [
      "Erao uses industry-standard encryption throughout.",
      "AES-256: Your database credentials are encrypted at rest.",
      "TLS 1.3: All data in transit is encrypted.",
      "Key management: Encryption keys are stored separately from data.",
      "Secure infrastructure: Hosted on reliable cloud providers.",
      "Zero-knowledge: Our staff cannot access your credentials.",
    ],
  },
  "compliance": {
    title: "Data Protection",
    category: "Security",
    content: [
      "Erao takes data protection seriously.",
      "We never store your actual database data - only queries.",
      "All credentials are encrypted with AES-256.",
      "All connections use SSL/TLS encryption.",
      "For security questions, contact javxohirdoniyorov@gmail.com.",
    ],
  },
  "security-best-practices": {
    title: "Security Best Practices",
    category: "Security",
    content: [
      "Follow these practices to keep your data secure.",
      "Use strong passwords: At least 12 characters with mixed characters.",
      "Enable 2FA: Two-factor authentication adds an extra layer of security.",
      "Use read-only credentials: Connect with read-only database users when possible.",
      "Review access: Regularly audit who has access to your databases.",
      "Monitor queries: Review your query history for unusual activity.",
      "Keep credentials private: Never share database credentials via email or chat.",
    ],
  },
};

export default function HelpArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const article = articles[slug];

  if (!article) {
    return (
      <PageLayout currentPage="help">
        <div className="w-full max-w-3xl mx-auto px-6 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-6">The article you're looking for doesn't exist.</p>
          <Link href="/help" className="text-black underline">
            Back to Help Center
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout currentPage="help">
      <article className="w-full max-w-3xl mx-auto px-6 py-16">
        <div className="mb-8">
          <Link href="/help" className="text-sm text-gray-500 hover:text-black transition-colors">
            Help Center
          </Link>
          <span className="text-gray-400 mx-2">/</span>
          <span className="text-sm text-gray-500">{article.category}</span>
        </div>

        <h1 className="text-3xl font-bold mb-6">{article.title}</h1>

        <div className="space-y-4">
          {article.content.map((paragraph, index) => (
            <p key={index} className="text-gray-600 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Was this article helpful?</p>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
              Yes
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
              No
            </button>
          </div>
        </div>

        <div className="mt-8">
          <Link href="/help" className="text-sm text-black font-medium hover:underline">
            Back to Help Center
          </Link>
        </div>
      </article>
    </PageLayout>
  );
}
