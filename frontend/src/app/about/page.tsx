"use client";

import Link from "next/link";
import { PageLayout } from "@/components/shared";

const values = [
  {
    title: "Simplicity First",
    description: "We believe powerful tools don't have to be complicated. Every feature we build must make your life easier, not harder.",
  },
  {
    title: "Privacy by Design",
    description: "Your data is yours. We never store your actual data—only the queries you run. Security isn't an afterthought; it's built into everything we do.",
  },
  {
    title: "Speed Matters",
    description: "Waiting for answers slows down decisions. We're obsessed with making Erao fast—from connection to query to result.",
  },
  {
    title: "Transparency",
    description: "No hidden fees, no surprise charges, no data selling. What you see is what you get.",
  },
];

export default function AboutPage() {
  return (
    <PageLayout currentPage="about">
      {/* Hero */}
      <section className="w-full max-w-5xl mx-auto px-6 pt-16 pb-20">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            We're making data accessible to everyone
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Erao was born from a simple frustration: why do you need to know SQL to ask your own database a question? We're building a world where anyone—not just engineers—can get instant insights from their data.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="w-full bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg text-gray-600">
              To eliminate the gap between asking a question and getting an answer from your data. No SQL. No waiting. No middlemen.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="w-full max-w-5xl mx-auto px-6 py-20">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold mb-6">Our Story</h2>
          <div className="space-y-4 text-gray-600">
            <p>
              Every day, thousands of business decisions are delayed because someone needs to ask a developer to write a SQL query. Product managers wait for usage stats. Sales teams wait for pipeline reports. Support teams wait for customer history.
            </p>
            <p>
              We started Erao to fix this. By combining modern AI with a deep understanding of databases, we've built a tool that lets anyone—regardless of technical background—have a conversation with their data.
            </p>
            <p>
              Today, teams use Erao to get instant answers to questions that used to take hours or days. And we're just getting started.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="w-full bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-12">What We Believe</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {values.map((value) => (
              <div key={value.title} className="bg-white rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="w-full max-w-5xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
        <p className="text-gray-600 mb-6">
          Questions? Feedback? We'd love to hear from you.
        </p>
        <div className="flex items-center justify-center gap-4">
          <a
            href="mailto:hello@erao.io"
            className="border border-gray-300 px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Email Us
          </a>
          <Link
            href="/contact"
            className="bg-black text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Contact Form
          </Link>
        </div>
      </section>
    </PageLayout>
  );
}
