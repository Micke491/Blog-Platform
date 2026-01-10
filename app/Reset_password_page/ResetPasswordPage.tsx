"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link. Please request a new password reset.");
    }
  }, [token]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!token) {
      setError("Invalid reset token");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/password_reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Password reset failed");
        setLoading(false);
        return;
      }

      setSuccess("Password reset successful! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-black to-pink-900 opacity-50"></div>

      <div
        className="fixed w-96 h-96 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 blur-3xl opacity-20 transition-all duration-1000 ease-out"
        style={{
          left: `${mousePosition.x - 192}px`,
          top: `${mousePosition.y - 192}px`,
          pointerEvents: "none",
        }}
      ></div>

      <div className="relative z-10">
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/30 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <a href="/" className="text-2xl font-black">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Logo
              </span>
            </a>
            <a
              href="/login"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Back to Login
            </a>
          </div>
        </nav>

        <main className="flex items-center justify-center min-h-screen px-6 pt-20">
          <div className="w-full max-w-md">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>

              <div className="relative p-8 bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10">
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-black mb-2">
                    Reset{" "}
                    <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Password
                    </span>
                  </h1>
                  <p className="text-gray-400">
                    Create a new password for your account
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 backdrop-blur-sm">
                    <p className="text-red-400 text-sm text-center">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="mb-6 p-4 rounded-2xl bg-green-500/10 border border-green-500/30 backdrop-blur-sm">
                    <p className="text-green-400 text-sm text-center">
                      {success}
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-sm font-medium mb-2 text-gray-300"
                    >
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all backdrop-blur-sm text-white placeholder-gray-500"
                      placeholder="••••••••"
                      required
                      disabled={!token}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium mb-2 text-gray-300"
                    >
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all backdrop-blur-sm text-white placeholder-gray-500"
                      placeholder="••••••••"
                      required
                      disabled={!token}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full h-12 text-base font-semibold cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading || !token}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Resetting...
                      </span>
                    ) : (
                      "Reset Password"
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-gray-400 text-sm">
                    Remember your password?{" "}
                    <a
                      href="/login"
                      className="text-purple-400 hover:text-pink-400 font-semibold transition-colors"
                    >
                      Sign in
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
