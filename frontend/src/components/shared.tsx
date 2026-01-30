"use client";

import Link from "next/link";
import { useState, useRef } from "react";

// Support email
export const SUPPORT_EMAIL = "javxohirdoniyorov@gmail.com";

// Email button that redirects to contact page
export const EmailButton = ({
  className = "",
  variant = "primary",
  children,
}: {
  className?: string;
  variant?: "primary" | "secondary" | "outline";
  children: React.ReactNode;
}) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all";
  const variantStyles = {
    primary: "bg-black text-white hover:bg-gray-800",
    secondary: "bg-white text-black hover:bg-gray-100",
    outline: "border border-gray-300 hover:bg-gray-50",
  };

  return (
    <Link
      href="/contact"
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </Link>
  );
};

// Logo icon component - square, circle, triangle in one horizontal line
export const LogoIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 16" fill="currentColor">
    {/* Square - left */}
    <rect x="0" y="1" width="14" height="14" />
    {/* Circle - center */}
    <circle cx="24" cy="8" r="7" />
    {/* Triangle - right */}
    <polygon points="34,15 48,15 41,1" />
  </svg>
);

// Navigation dropdown data
const navDropdowns = {
  product: {
    label: "Product",
    items: [
      { href: "/features", label: "Features", desc: "See what Erao can do" },
      { href: "/pricing", label: "Pricing", desc: "Plans for every team" },
    ],
  },
  resources: {
    label: "Resources",
    items: [
      { href: "/help", label: "Help Center", desc: "Guides and tutorials" },
      { href: "/security", label: "Security", desc: "How we protect your data" },
    ],
  },
  company: {
    label: "Company",
    items: [
      { href: "/about", label: "About", desc: "Our story and mission" },
      { href: "/contact", label: "Contact", desc: "Get in touch" },
    ],
  },
  legal: {
    label: "Legal",
    items: [
      { href: "/privacy", label: "Privacy Policy", desc: "How we handle your data" },
      { href: "/terms", label: "Terms of Service", desc: "Rules of using Erao" },
    ],
  },
};

// Dropdown component
const NavDropdown = ({
  label,
  items,
  isOpen,
  onMouseEnter,
  onMouseLeave
}: {
  label: string;
  items: { href: string; label: string; desc: string }[];
  isOpen: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) => (
  <div
    className="relative"
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-black transition-colors py-2">
      {label}
      <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    {isOpen && (
      <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <div className="text-sm font-medium text-gray-900">{item.label}</div>
            <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
          </Link>
        ))}
      </div>
    )}
  </div>
);

// Consistent navigation bar with dropdowns
export const Navbar = ({ currentPage }: { currentPage?: string }) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (dropdown: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setOpenDropdown(dropdown);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  };

  return (
    <nav className="w-full max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2.5">
        <LogoIcon className="w-10 h-10" />
        <span className="font-semibold text-xl">Erao</span>
      </Link>

      <div className="hidden md:flex items-center gap-6">
        <NavDropdown
          label={navDropdowns.product.label}
          items={navDropdowns.product.items}
          isOpen={openDropdown === 'product'}
          onMouseEnter={() => handleMouseEnter('product')}
          onMouseLeave={handleMouseLeave}
        />
        <NavDropdown
          label={navDropdowns.resources.label}
          items={navDropdowns.resources.items}
          isOpen={openDropdown === 'resources'}
          onMouseEnter={() => handleMouseEnter('resources')}
          onMouseLeave={handleMouseLeave}
        />
        <NavDropdown
          label={navDropdowns.company.label}
          items={navDropdowns.company.items}
          isOpen={openDropdown === 'company'}
          onMouseEnter={() => handleMouseEnter('company')}
          onMouseLeave={handleMouseLeave}
        />
        <NavDropdown
          label={navDropdowns.legal.label}
          items={navDropdowns.legal.items}
          isOpen={openDropdown === 'legal'}
          onMouseEnter={() => handleMouseEnter('legal')}
          onMouseLeave={handleMouseLeave}
        />
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="text-sm text-gray-600 hover:text-black transition-colors px-3 py-2"
        >
          Log in
        </Link>
        <Link
          href="/register"
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Start Free
        </Link>
      </div>
    </nav>
  );
};

// Comprehensive footer with all links (removed changelog and status)
export const Footer = () => (
  <footer className="w-full border-t border-gray-200 bg-white">
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="flex items-center gap-2.5 mb-4">
            <LogoIcon className="w-10 h-10" />
            <span className="font-semibold text-xl">Erao</span>
          </Link>
          <p className="text-sm text-gray-500">
            AI-powered database intelligence.
          </p>
        </div>

        {/* Product */}
        <div>
          <h4 className="font-semibold text-sm mb-4">Product</h4>
          <ul className="space-y-3 text-sm text-gray-500">
            <li><Link href="/features" className="hover:text-black transition-colors">Features</Link></li>
            <li><Link href="/pricing" className="hover:text-black transition-colors">Pricing</Link></li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h4 className="font-semibold text-sm mb-4">Resources</h4>
          <ul className="space-y-3 text-sm text-gray-500">
            <li><Link href="/help" className="hover:text-black transition-colors">Help Center</Link></li>
            <li><Link href="/security" className="hover:text-black transition-colors">Security</Link></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-semibold text-sm mb-4">Company</h4>
          <ul className="space-y-3 text-sm text-gray-500">
            <li><Link href="/about" className="hover:text-black transition-colors">About</Link></li>
            <li><Link href="/contact" className="hover:text-black transition-colors">Contact</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="font-semibold text-sm mb-4">Legal</h4>
          <ul className="space-y-3 text-sm text-gray-500">
            <li><Link href="/privacy" className="hover:text-black transition-colors">Privacy</Link></li>
            <li><Link href="/terms" className="hover:text-black transition-colors">Terms</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom */}
      <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-400">© 2025 Erao. All rights reserved.</p>
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <Link href="/privacy" className="hover:text-black transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-black transition-colors">Terms</Link>
          <Link href="/contact" className="hover:text-black transition-colors">Contact</Link>
        </div>
      </div>
    </div>
  </footer>
);

// Page wrapper for consistent layout
export const PageLayout = ({
  children,
  currentPage
}: {
  children: React.ReactNode;
  currentPage?: string;
}) => (
  <div className="min-h-screen bg-white text-gray-900 flex flex-col">
    <Navbar currentPage={currentPage} />
    <main className="flex-1">
      {children}
    </main>
    <Footer />
  </div>
);
