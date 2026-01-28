"use client";

import Link from "next/link";

// Logo icon component - square, circle, triangle in one horizontal line
export const LogoIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 16" fill="currentColor">
    {/* Square - left */}
    <rect x="0" y="1" width="14" height="14" />
    {/* Circle - center */}
    <circle cx="24" cy="8" r="7" />
    {/* Triangle - right */}
    <polygon points="34,15 48,15 41,1" />
  </svg>
);

// Consistent navigation bar
export const Navbar = ({ currentPage }: { currentPage?: string }) => (
  <nav className="w-full max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
    <Link href="/" className="flex items-center gap-2">
      <LogoIcon className="w-7 h-7" />
      <span className="font-semibold text-lg">Erao</span>
    </Link>
    <div className="hidden md:flex items-center gap-6 text-sm">
      <Link
        href="/features"
        className={`transition-colors ${currentPage === 'features' ? 'text-black font-medium' : 'text-gray-600 hover:text-black'}`}
      >
        Features
      </Link>
      <Link
        href="/pricing"
        className={`transition-colors ${currentPage === 'pricing' ? 'text-black font-medium' : 'text-gray-600 hover:text-black'}`}
      >
        Pricing
      </Link>
      <Link
        href="/security"
        className={`transition-colors ${currentPage === 'security' ? 'text-black font-medium' : 'text-gray-600 hover:text-black'}`}
      >
        Security
      </Link>
      <Link
        href="/help"
        className={`transition-colors ${currentPage === 'help' ? 'text-black font-medium' : 'text-gray-600 hover:text-black'}`}
      >
        Help
      </Link>
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

// Comprehensive footer with all links
export const Footer = () => (
  <footer className="w-full border-t border-gray-200 bg-white">
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <LogoIcon className="w-6 h-6" />
            <span className="font-semibold">Erao</span>
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
            <li><Link href="/changelog" className="hover:text-black transition-colors">Changelog</Link></li>
            <li><Link href="/status" className="hover:text-black transition-colors">Status</Link></li>
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
          <Link href="/status" className="hover:text-black transition-colors">Status</Link>
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
