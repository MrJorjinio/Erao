"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api, auth, ApiError } from "@/lib/api";

function OtpVerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const verificationType = searchParams.get("type") || "password-reset";

  const isEmailVerification = verificationType === "email-verification";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      router.push(isEmailVerification ? "/register" : "/forgot-password");
    }
  }, [email, router, isEmailVerification]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }

    if (!/^\d*$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    // Focus last filled input or next empty
    const lastIndex = Math.min(pastedData.length - 1, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isEmailVerification) {
        // Email verification flow - auto-login after verification
        const response = await api.verifyEmail({ email, otp: otpValue });
        if (response.success && response.data) {
          auth.saveTokens(response.data.accessToken, response.data.refreshToken);
          auth.saveUser(response.data.user);
          setSuccess("Email verified! Redirecting...");
          setTimeout(() => router.push("/ai"), 1000);
        } else {
          setError("Invalid or expired OTP");
        }
      } else {
        // Password reset flow
        const response = await api.verifyOtp(email, otpValue);
        if (response.success && response.data) {
          setSuccess("OTP verified! Redirecting to reset password...");
          router.push(
            `/reset-password?email=${encodeURIComponent(email)}&otp=${otpValue}`
          );
        } else {
          setError("Invalid or expired OTP");
        }
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Invalid or expired OTP");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    setSuccess("");

    try {
      if (isEmailVerification) {
        await api.resendEmailVerification(email);
      } else {
        await api.resendOtp(email);
      }
      setSuccess("A new code has been sent to your email");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError("Failed to resend code");
      console.error(err);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center justify-center">
      <div className="w-full max-w-[400px] px-6 flex flex-col items-center gap-8">
        {/* Logo */}
        <Link href="/" className="font-bold text-xl tracking-tight">
          Erao.
        </Link>

        {/* Header */}
        <div className="w-full text-center flex flex-col gap-2">
          <h1 className="text-base font-semibold">Verify your email</h1>
          <p className="text-sm text-gray-500">
            {isEmailVerification
              ? "We've sent a 6-digit code to your email. Enter it below to complete your registration."
              : "We've sent a 6-digit code to your email. Enter it below to reset your password."}
          </p>
        </div>

        {error && (
          <div className="w-full bg-red-50 text-red-600 px-4 py-2 rounded-[10px] text-sm text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="w-full bg-green-50 text-green-600 px-4 py-2 rounded-[10px] text-sm text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleVerify} className="w-full flex flex-col gap-6">
          {/* OTP Input Boxes */}
          <div className="flex justify-center gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-14 text-center text-lg font-semibold bg-[#f5f5f5] rounded-[10px] outline-none focus:ring-2 focus:ring-black"
              />
            ))}
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            disabled={loading || otp.some((d) => !d)}
            className="w-full h-11 bg-black text-white text-sm font-medium rounded-[10px] hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </form>

        {/* Resend Link */}
        <div className="flex items-center gap-1 text-sm">
          <span className="text-gray-500">Didn&apos;t receive the code?</span>
          <button
            onClick={handleResend}
            disabled={resending}
            className="font-semibold text-black hover:underline disabled:opacity-50"
          >
            {resending ? "Sending..." : "Resend"}
          </button>
        </div>

        {/* Back to Login */}
        <Link
          href="/login"
          className="text-black text-sm font-medium hover:underline"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}

export default function OtpVerificationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center justify-center">
        <div className="w-full max-w-[400px] px-6 flex flex-col items-center gap-8">
          <span className="font-bold text-xl tracking-tight">Erao.</span>
          <div className="text-sm text-gray-500">Loading...</div>
        </div>
      </div>
    }>
      <OtpVerificationContent />
    </Suspense>
  );
}
