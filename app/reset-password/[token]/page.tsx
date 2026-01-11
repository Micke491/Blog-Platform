"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/button";
import { Navbar } from "@/components/navbar";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/components/Toast";

export default function ResetPasswordPage() {
  const { toast, Toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  // This ref prevents the verification effect from showing errors after we reset
  const isResetting = useRef(false);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // 1. IMPROVED VERIFICATION LOGIC
  useEffect(() => {
    const verifyToken = async () => {
      // If we are currently in the middle of a reset or already finished, stop.
      if (isResetting.current || resetSuccess) return;

      try {
        const response = await fetch(`/api/auth/password-reset/${token}`);
        const data = await response.json();

        if (response.ok && data.valid) {
          setTokenValid(true);
        } else {
          // Double check ref before showing error to prevent "expired" toast after POST
          if (!isResetting.current && !resetSuccess) {
            setTokenValid(false);
            toast(data.error || "Invalid or expired reset link", "error");
          }
        }
      } catch (err) {
        if (!isResetting.current && !resetSuccess) {
          setTokenValid(false);
          toast("Failed to verify reset link", "error");
        }
      } finally {
        setVerifying(false);
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token, toast, resetSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast("Passwords do not match", "error");
      return;
    }

    // SET THE KILL SWITCH
    isResetting.current = true;
    setLoading(true);

    try {
      const response = await fetch(`/api/auth/password-reset/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        isResetting.current = false; // Turn off kill switch if it actually failed
        toast(data.error || "Failed to reset password", "error");
        setLoading(false);
        return;
      }

      setResetSuccess(true);
      toast("Password reset successful!", "success");
      setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      isResetting.current = false;
      toast("Something went wrong. Please try again.", "error");
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
        <Navbar variant="auth" />

        <main className="flex items-center justify-center min-h-screen px-6 pt-20">
          <div className="w-full max-w-md">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>

              <div className="relative p-8 bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10">
                {verifying ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-6 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                    <p className="text-gray-400">Verifying reset link...</p>
                  </div>
                ) : resetSuccess ? (
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-black mb-3">
                      Password <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Reset!</span>
                    </h2>
                    <p className="text-gray-400 mb-6">Your password has been successfully reset. Redirecting to login...</p>
                    <div className="flex items-center justify-center gap-2 text-purple-400">
                      <div className="w-5 h-5 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div>
                      <span>Redirecting...</span>
                    </div>
                  </div>
                ) : !tokenValid ? (
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                      <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-black mb-3">
                      Invalid <span className="bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">Link</span>
                    </h2>
                    <p className="text-gray-400 mb-6">This password reset link is invalid or has expired.</p>
                    <Link href="/forgot-password">
                      <Button className="w-full h-12 text-base font-semibold cursor-pointer">Request New Link</Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-8">
                      <h1 className="text-4xl font-black mb-2">
                        Reset <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Password</span>
                      </h1>
                      <p className="text-gray-400">Enter your new password below</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">New Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all backdrop-blur-sm text-white placeholder-gray-500"
                          placeholder="••••••••"
                          required
                          minLength={6}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Confirm Password</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all backdrop-blur-sm text-white placeholder-gray-500"
                          placeholder="••••••••"
                          required
                          minLength={6}
                        />
                      </div>
                      <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading || newPassword !== confirmPassword}>
                        {loading ? "Resetting..." : "Reset Password"}
                      </Button>
                    </form>
                  </>
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