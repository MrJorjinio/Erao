"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, auth, ApiError } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEmailNotVerified(false);
    setIsLoading(true);

    try {
      const response = await api.login({ email, password });

      if (response.success && response.data) {
        auth.saveTokens(response.data.accessToken, response.data.refreshToken);
        auth.saveUser(response.data.user);
        router.push("/ai");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.message.includes("not verified")) {
          setEmailNotVerified(true);
          setError("Your email is not verified. Please verify your email to continue.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    try {
      await api.resendEmailVerification(email);
      router.push(`/otp-verification?email=${encodeURIComponent(email)}&type=email-verification`);
    } catch (err) {
      setError("Failed to resend verification code");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center justify-center px-4 relative">
      {/* Back Button */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      <div className="w-full max-w-[400px] flex flex-col items-center gap-8">
        {/* Logo */}
        <Link href="/" className="font-bold text-2xl tracking-tight">
          Erao.
        </Link>

        {/* Form Container */}
        <div className="w-full flex flex-col gap-6">
          {/* Header - LEFT ALIGNED */}
          <div className="flex flex-col gap-1">
            <h1 className="text-base font-semibold">Welcome back</h1>
            <p className="text-base text-gray-500">
              Sign in to continue to your dashboard
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-[10px]">
              {error}
              {emailNotVerified && (
                <button
                  onClick={handleResendVerification}
                  disabled={resending}
                  className="block mt-2 text-black font-semibold hover:underline disabled:opacity-50"
                >
                  {resending ? "Sending..." : "Resend verification code"}
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="h-10 bg-[#f5f5f5] rounded-[10px] px-3 text-sm outline-none placeholder:text-gray-400 hover:bg-[#efefef] focus:bg-white focus:ring-1 focus:ring-black transition-colors"
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="h-10 bg-[#f5f5f5] rounded-[10px] px-3 text-sm outline-none placeholder:text-gray-400 hover:bg-[#efefef] focus:bg-white focus:ring-1 focus:ring-black transition-colors"
              />
            </div>

            {/* Forgot Password - BLACK text, right aligned */}
            <Link
              href="/forgot-password"
              className="text-sm text-black text-right hover:underline"
            >
              Forgot password?
            </Link>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="h-11 bg-black text-white rounded-[10px] text-sm font-medium hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-center gap-1 text-base">
            <span>Don&apos;t have an account?</span>
            <Link href="/register" className="font-semibold hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
