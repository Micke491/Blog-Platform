"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/button";
import { Navbar } from "@/components/navbar";
import Link from "next/link";
import { useToast } from "@/components/Toast";

export default function ForgotPasswordPage() {
  const { toast, Toast } = useToast();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/password-reset-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast(data.error || "Failed to send reset email", "error");
        setLoading(false);
        return;
      }

      setSubmitted(true);
      toast("Reset link sent! Check your email.", "success");
    } catch (err) {
      toast("Something went wrong. Please try again.", "error");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-black to-pink-900 opacity-50"></div>

      {/* Moving gradient orb */}
      <div
        className="fixed w-96 h-96 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 blur-3xl opacity-20 transition-all duration-1000 ease-out"
        style={{
          left: `${mousePosition.x - 192}px`,
          top: `${mousePosition.y - 192}px`,
          pointerEvents: "none",
        }}
      ></div>

      <div className="relative z-10">
        <Navbar variant="auth" />

        <main className="flex items-center justify-center min-h-screen px-6 pt-20">
          <div className="w-full max-w-md">
            {/* Card */}
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>

              {/* Main card */}
              <div className="relative p-8 bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10">
                {!submitted ? (
                  <>
                    <div className="text-center mb-8">
                      <h1 className="text-4xl font-black mb-2">
                        Forgot{" "}
                        <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                          Password?
                        </span>
                      </h1>
                      <p className="text-gray-400">
                        No worries! We'll send you reset instructions
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium mb-2 text-gray-300"
                        >
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all backdrop-blur-sm text-white placeholder-gray-500"
                          placeholder="you@example.com"
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 text-base font-semibold cursor-pointer"
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Sending...
                          </span>
                        ) : (
                          "Send Reset Link"
                        )}
                      </Button>
                    </form>

                    <div className="mt-6 text-center">
                      <p className="text-gray-400 text-sm">
                        Remember your password?{" "}
                        <Link
                          href="/login"
                          className="text-purple-400 hover:text-pink-400 font-semibold transition-colors"
                        >
                          Sign in
                        </Link>
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>

                    <h2 className="text-2xl font-black mb-3">
                      Check Your{" "}
                      <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Email
                      </span>
                    </h2>

                    <p className="text-gray-400 mb-6">
                      We've sent a password reset link to{" "}
                      <span className="text-white font-medium">{email}</span>
                    </p>

                    <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 backdrop-blur-sm mb-6">
                      <p className="text-sm text-gray-300">
                        📧 Didn't receive the email? Check your spam folder or{" "}
                        <button
                          onClick={() => {
                            setSubmitted(false);
                            setEmail("");
                          }}
                          className="text-purple-400 hover:text-pink-400 font-semibold underline"
                        >
                          try again
                        </button>
                      </p>
                    </div>

                    <Link href="/login">
                      <Button className="w-full h-12 text-base font-semibold cursor-pointer">
                        Back to Sign In
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      <Toast />
    </div>
  );
}