"use client";

import { PageLayout } from "@/components/shared";

const services = [
  { name: "API", status: "operational", uptime: "99.99%" },
  { name: "Web Application", status: "operational", uptime: "99.98%" },
  { name: "Database Connections", status: "operational", uptime: "99.97%" },
  { name: "AI Query Generation", status: "operational", uptime: "99.95%" },
  { name: "Authentication", status: "operational", uptime: "99.99%" },
];

const incidents = [
  {
    date: "January 25, 2025",
    title: "Brief API Latency",
    status: "resolved",
    description: "Users experienced increased API response times for approximately 15 minutes. The issue was identified and resolved.",
    updates: [
      { time: "14:30 UTC", message: "Investigating increased API latency" },
      { time: "14:35 UTC", message: "Root cause identified - database connection pool issue" },
      { time: "14:45 UTC", message: "Fix deployed, monitoring" },
      { time: "15:00 UTC", message: "Resolved - all systems operational" },
    ],
  },
  {
    date: "January 15, 2025",
    title: "Scheduled Maintenance",
    status: "completed",
    description: "Scheduled maintenance to upgrade infrastructure. Service was unavailable for 10 minutes.",
    updates: [
      { time: "02:00 UTC", message: "Maintenance started" },
      { time: "02:10 UTC", message: "Maintenance completed successfully" },
    ],
  },
];

const statusColors: Record<string, string> = {
  operational: "bg-black",
  degraded: "bg-gray-400",
  outage: "bg-gray-800",
};

export default function StatusPage() {
  const allOperational = services.every((s) => s.status === "operational");

  return (
    <PageLayout currentPage="status">
      {/* Status Banner */}
      <section className="w-full max-w-5xl mx-auto px-6 pt-16 pb-8">
        <div className={`rounded-2xl p-8 text-center ${allOperational ? "bg-gray-50" : "bg-gray-100"}`}>
          <div className={`w-4 h-4 rounded-full mx-auto mb-4 ${allOperational ? "bg-black" : "bg-gray-500"}`} />
          <h1 className="text-2xl font-bold mb-2">
            {allOperational ? "All Systems Operational" : "Some Systems Experiencing Issues"}
          </h1>
          <p className="text-gray-600 text-sm">
            Last updated: {new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="w-full max-w-5xl mx-auto px-6 pb-12">
        <h2 className="text-lg font-semibold mb-4">Services</h2>
        <div className="border border-gray-200 rounded-2xl divide-y divide-gray-200">
          {services.map((service) => (
            <div key={service.name} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${statusColors[service.status]}`} />
                <span className="font-medium">{service.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">{service.uptime} uptime</span>
                <span className="text-sm capitalize text-gray-600">{service.status}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Uptime Graph */}
      <section className="w-full max-w-5xl mx-auto px-6 pb-12">
        <h2 className="text-lg font-semibold mb-4">90-Day Uptime</h2>
        <div className="border border-gray-200 rounded-2xl p-6">
          <div className="flex items-end gap-0.5 h-16">
            {Array.from({ length: 90 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-black rounded-sm"
                style={{ height: `${85 + Math.random() * 15}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-4 text-sm text-gray-500">
            <span>90 days ago</span>
            <span>Today</span>
          </div>
          <div className="text-center mt-4">
            <span className="text-2xl font-bold">99.97%</span>
            <span className="text-gray-500 ml-2">overall uptime</span>
          </div>
        </div>
      </section>

      {/* Past Incidents */}
      <section className="w-full max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-lg font-semibold mb-4">Past Incidents</h2>
        <div className="space-y-6">
          {incidents.map((incident, i) => (
            <div key={i} className="border border-gray-200 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-sm text-gray-500">{incident.date}</span>
                  <h3 className="font-semibold mt-1">{incident.title}</h3>
                </div>
                <span className="text-sm font-medium capitalize text-black">
                  {incident.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">{incident.description}</p>
              <div className="space-y-2 border-l-2 border-gray-200 pl-4">
                {incident.updates.map((update, j) => (
                  <div key={j} className="text-sm">
                    <span className="text-gray-500">{update.time}</span>
                    <span className="text-gray-400 mx-2">—</span>
                    <span className="text-gray-700">{update.message}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Subscribe */}
      <section className="w-full bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Get Status Updates</h2>
          <p className="text-gray-600 mb-6">
            Subscribe to receive notifications about service status and incidents.
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
