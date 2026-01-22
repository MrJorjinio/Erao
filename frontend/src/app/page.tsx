"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const features = [
  {
    image: "https://framerusercontent.com/images/yKGWivZ0V1kKgA2z42jKXWhty9E.png",
    title: "Just Ask.",
    description:
      'Interact with your database exactly like you talk to a colleague. Whether you need to find "My best employee in June" or "Sales from last week," Erao translates your plain English into instant, accurate answers. It\'s the power of a data engineer with the simplicity of a chat.',
  },
  {
    image: "https://framerusercontent.com/images/S1tnR8P9TQvl5WXdCn4sVEm8.png",
    title: "Data designed to be read, not decoded.",
    description:
      "Stop squinting at raw data dumps or complicated code rows. Erao automatically formats your answers into clean tables, easy-to-read summaries, and beautiful charts.",
  },
  {
    image: "https://framerusercontent.com/images/K0xlSkqXX9zkhpofdKahr7lyS0.png",
    title: "Connect to any database instantly.",
    description:
      "Skip the setup headache. Just connect your PostgreSQL, MySQL, or MongoDB credentials, and Erao does the rest. Our AI instantly maps your database so you can start asking questions in seconds.",
  },
  {
    image: "https://framerusercontent.com/images/WPd4HFHbqcaOml3JH0gJb3dXOA.png",
    title: "Your data stays yours. Always.",
    description:
      "Security isn't an afterthought—it's built into everything we do. All your database credentials are encrypted with industry-standard hashing. We never store your actual data, only the queries you ask. Your connections are secured with SSL/TLS encryption, and we follow strict data protection protocols. With Erao, you get powerful insights without compromising privacy.",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "$49",
    features: ["1 database", "500 queries/month", "Basic support"],
    cta: "Get Starter",
    popular: false,
  },
  {
    name: "Professional",
    price: "$99",
    features: ["5 databases", "3,000 queries/month", "Priority support"],
    cta: "Get Professional",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$299",
    features: ["Unlimited databases", "15,000 queries/month", "24/7 dedicated support"],
    cta: "Contact Sales",
    popular: false,
  },
];

const trustedCompanies = ["Acme Inc", "TechCorp", "DataFlow", "CloudBase", "StartupX"];

// Logo icon component - all shapes in ONE horizontal line
const LogoIcon = ({ className = "w-12 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 60 20" fill="currentColor">
    <rect x="0" y="2" width="16" height="16" rx="2" />
    <circle cx="30" cy="10" r="8" />
    <path d="M44 18 L52 2 L60 18 Z" />
  </svg>
);

export default function LandingPage() {
  const [currentFeature, setCurrentFeature] = useState(0);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="w-full max-w-[960px] mx-auto px-5 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LogoIcon className="w-10 h-4" />
        </div>
        <div className="flex items-center gap-6 text-sm">
          <a href="#features" className="text-black hover:opacity-70 transition-opacity">
            What It Does
          </a>
          <a href="#pricing" className="text-black hover:opacity-70 transition-opacity">
            Pricing
          </a>
          <Link href="/register" className="text-black hover:opacity-70 transition-opacity">
            Get Started
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="text-black hover:opacity-70 transition-opacity">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
          <a href="#" className="text-black hover:opacity-70 transition-opacity">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M8 12 L11 15 L16 9" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
          </a>
          <a href="#" className="text-black hover:opacity-70 transition-opacity">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="w-full max-w-[960px] mx-auto px-5 py-16 flex flex-col items-center justify-center">
        <LogoIcon className="w-12 h-4 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Erao.</h2>
        <h1 className="text-3xl md:text-4xl font-medium text-gray-400 text-center mb-6">
          Speak your language. Get your data.
        </h1>
        <div className="flex gap-2.5">
          <Link
            href="/register"
            className="bg-black text-white px-4 h-[32px] rounded-full text-sm font-medium hover:bg-gray-800 transition-colors flex items-center"
          >
            Start Free
          </Link>
          <a
            href="#pricing"
            className="bg-[#f5f5f5] text-black px-4 h-[32px] rounded-full text-sm font-medium hover:bg-gray-200 transition-colors flex items-center"
          >
            View Pricing
          </a>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="w-full max-w-[960px] mx-auto px-5 py-8 flex flex-col items-center gap-6">
        <p className="text-sm text-gray-400">Trusted by 50+ companies worldwide</p>
        <div className="flex flex-wrap justify-center gap-10">
          {trustedCompanies.map((company) => (
            <span key={company} className="font-semibold text-base text-gray-300">
              {company}
            </span>
          ))}
        </div>
      </section>

      {/* Connect Section */}
      <section className="w-full max-w-[960px] mx-auto px-5 py-10">
        <h2 className="text-2xl md:text-3xl font-bold mb-1">
          Connect any database in seconds.
        </h2>
        <p className="text-xl md:text-2xl text-gray-400 max-w-[500px] leading-relaxed">
          Erao protects your credentials and instantly transforms complex tables into{" "}
          <span className="relative">
            easy-to-understand data
            <span className="absolute left-0 right-0 top-1/2 h-[2px] bg-gray-400" />
          </span>
          —so you can skip the setup and start asking questions.
        </p>
      </section>

      {/* Features Slideshow */}
      <section id="features" className="w-full max-w-[960px] mx-auto px-5 py-10">
        <div className="bg-white h-[580px] flex flex-col items-center justify-between py-8">
          <div className="flex flex-col items-center text-center max-w-[600px] px-4">
            <div className="w-full h-[250px] mb-6 flex items-center justify-center overflow-hidden">
              <Image
                key={currentFeature}
                src={features[currentFeature].image}
                alt={features[currentFeature].title}
                width={500}
                height={250}
                className="object-contain rounded-xl max-h-[250px] w-auto transition-opacity duration-300 ease-in-out animate-fadeIn"
                unoptimized
              />
            </div>
            <div className="transition-opacity duration-300 ease-in-out h-[220px] overflow-hidden">
              <h3 className="text-xl font-semibold mb-3">{features[currentFeature].title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed max-w-[450px]">
                {features[currentFeature].description}
              </p>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentFeature(index)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  index === currentFeature ? "w-6 bg-black" : "w-2.5 bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to feature ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="w-full max-w-[960px] mx-auto px-5">
        <div className="border-t border-gray-200" />
      </div>

      {/* Pricing Section */}
      <section id="pricing" className="w-full max-w-[960px] mx-auto px-5 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-1">Pricing Plans</h2>
          <p className="text-gray-400">Simple pricing, billed monthly.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className="bg-[#f5f5f5] rounded-2xl p-5 flex flex-col gap-4"
            >
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="text-2xl font-bold">{plan.price}/mo</p>
              <div className="flex-1 space-y-2">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </div>
                ))}
              </div>
              <Link
                href="/register"
                className={`w-full h-10 rounded-lg text-center text-sm font-medium transition-colors flex items-center justify-center ${
                  plan.popular
                    ? "bg-black text-white hover:bg-gray-800"
                    : "bg-black/[0.08] text-black hover:bg-black/[0.12]"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="w-full max-w-[960px] mx-auto px-5">
        <div className="border-t border-gray-200" />
      </div>

      {/* CTA Section */}
      <section className="w-full max-w-[960px] mx-auto px-5 py-20 flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center">Ready to try Erao?</h2>
        <p className="text-gray-400 text-center max-w-[250px]">
          Sign up and connect your database in minutes. No credit card required.
        </p>
        <Link
          href="/register"
          className="bg-black text-white px-4 h-[32px] rounded-full text-sm font-medium hover:bg-gray-800 transition-colors flex items-center mt-2"
        >
          Start Free
        </Link>
      </section>

      {/* Divider */}
      <div className="w-full max-w-[960px] mx-auto px-5">
        <div className="border-t border-gray-200" />
      </div>

      {/* Footer */}
      <footer className="w-full max-w-[960px] mx-auto px-5 py-12 flex flex-wrap gap-10">
        <LogoIcon className="w-12 h-4 opacity-30" />
        <div className="flex-1" />
        <div className="flex flex-wrap gap-16">
          <div>
            <h4 className="font-semibold text-sm mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#features" className="hover:text-black transition-colors">What It Does</a></li>
              <li><a href="#pricing" className="hover:text-black transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Docs</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-black transition-colors">About</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-black transition-colors">API</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Security</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Help</a></li>
            </ul>
          </div>
        </div>
      </footer>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200">
        <div className="w-full max-w-[960px] mx-auto px-5 py-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-1 text-gray-600 hover:text-black transition-colors">
              Product
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button className="flex items-center gap-1 text-gray-600 hover:text-black transition-colors">
              Resources
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button className="flex items-center gap-1 text-gray-600 hover:text-black transition-colors">
              Community
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-600 hover:text-black transition-colors">Changelog</a>
            <a href="#pricing" className="text-gray-600 hover:text-black transition-colors">Pricing</a>
          </div>
        </div>
      </div>
    </div>
  );
}
