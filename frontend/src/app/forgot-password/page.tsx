"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";

type Step = "email" | "otp" | "reset" | "success";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(pwd)) return "Password must contain an uppercase letter";
    if (!/[a-z]/.test(pwd)) return "Password must contain a lowercase letter";
    if (!/[0-9]/.test(pwd)) return "Password must contain a number";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return "Password must contain a special character";
    return null;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await api.forgotPassword(email);
      setStep("otp");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.verifyOtp(email, otpCode);
      if (response.success) {
        setStep("reset");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Invalid or expired code. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setIsLoading(true);

    try {
      await api.resetPassword(email, otp.join(""), newPassword);
      setStep("success");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setIsLoading(true);
    try {
      await api.forgotPassword(email);
      setOtp(["", "", "", "", "", ""]);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[400px] flex flex-col items-center gap-8">
        {/* Logo */}
        <Link href="/" className="font-bold text-2xl tracking-tight">
          Erao.
        </Link>

        {/* Step: Email */}
        {step === "email" && (
          <div className="w-full flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-base font-semibold">Reset your password</h1>
              <p className="text-base text-gray-500">
                Enter your email and we&apos;ll send you a code
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-[10px]">
                {error}
              </div>
            )}

            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
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
                  className="h-10 bg-[#f5f5f5] rounded-[10px] px-3 text-sm outline-none placeholder:text-gray-400"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="h-11 bg-black text-white rounded-[10px] text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? "Sending..." : "Send reset code"}
              </button>
            </form>

            <div className="text-center">
              <Link href="/login" className="text-sm text-black hover:underline">
                Back to login
              </Link>
            </div>
          </div>
        )}

        {/* Step: OTP */}
        {step === "otp" && (
          <div className="w-full flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-base font-semibold">Verify your email</h1>
              <p className="text-base text-gray-500">
                We&apos;ve sent a 6-digit code to your email. Enter it below to reset your password.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-[10px]">
                {error}
              </div>
            )}

            <form onSubmit={handleOtpSubmit} className="flex flex-col gap-6">
              <div className="flex justify-center gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-14 bg-[#f5f5f5] rounded-[10px] text-center text-lg font-semibold outline-none focus:ring-2 focus:ring-black"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="h-11 bg-black text-white rounded-[10px] text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </button>
            </form>

            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-1 text-base">
                <span>Didn&apos;t receive the code?</span>
                <button
                  onClick={handleResend}
                  disabled={isLoading}
                  className="font-semibold hover:underline disabled:opacity-50"
                >
                  Resend
                </button>
              </div>
              <Link href="/login" className="text-sm text-black hover:underline">
                Back to login
              </Link>
            </div>
          </div>
        )}

        {/* Step: Reset Password */}
        {step === "reset" && (
          <div className="w-full flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-base font-semibold">Create new password</h1>
              <p className="text-base text-gray-500">
                Choose a strong password for your account
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-[10px]">
                {error}
              </div>
            )}

            <form onSubmit={handleResetSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="newPassword" className="text-sm font-medium">
                  New password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                  className="h-10 bg-[#f5f5f5] rounded-[10px] px-3 text-sm outline-none placeholder:text-gray-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  required
                  className="h-10 bg-[#f5f5f5] rounded-[10px] px-3 text-sm outline-none placeholder:text-gray-400"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="h-11 bg-black text-white rounded-[10px] text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? "Resetting..." : "Reset password"}
              </button>
            </form>
          </div>
        )}

        {/* Step: Success */}
        {step === "success" && (
          <div className="w-full flex flex-col items-center gap-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-center flex flex-col gap-1">
              <h1 className="text-base font-semibold">Password reset!</h1>
              <p className="text-base text-gray-500">
                Your password has been successfully reset.
              </p>
            </div>
            <button
              onClick={() => router.push("/login")}
              className="w-full h-11 bg-black text-white rounded-[10px] text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Sign in
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
