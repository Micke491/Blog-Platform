"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const router = useRouter();

  useEffect(() => {
    // Check if already logged in
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        router.push("/");
      }
    }
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setFieldErrors({ username: "", email: "", password: "", confirmPassword: "" });

    // client-side validation
    const errors: any = {};
    if (!username || username.trim().length < 3) errors.username = "Username must be at least 3 characters";
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!email || !emailRegex.test(email)) errors.email = "Enter a valid email";
    if (!password || password.length < 6) errors.password = "Password must be at least 6 characters";
    if (!confirmPassword || confirmPassword !== password) errors.confirmPassword = "Passwords do not match";
    if (Object.keys(errors).length) {
      setFieldErrors((prev) => ({ ...prev, ...errors }));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token); // VAŽNO
        router.push("/dashboard");
      } else {
        setMessage(data.message);
      }
    } catch {
      setMessage("Something went wrong");
    }
    setLoading(false);
  };

  return (
  <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950 px-4">
    <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 shadow-xl p-8">
      
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white">Create your account</h1>
        <p className="text-slate-400 mt-2">
          Start sharing your ideas on ProBlog
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleRegister} className="space-y-5">
        
        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`w-full rounded-lg bg-slate-800 border px-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500
              ${fieldErrors.username ? "border-red-500" : "border-slate-700"}
            `}
            placeholder="yourname"
          />
          {fieldErrors.username && (
            <p className="text-sm text-red-400 mt-1">
              {fieldErrors.username}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full rounded-lg bg-slate-800 border px-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500
              ${fieldErrors.email ? "border-red-500" : "border-slate-700"}
            `}
            placeholder="you@example.com"
          />
          {fieldErrors.email && (
            <p className="text-sm text-red-400 mt-1">
              {fieldErrors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full rounded-lg bg-slate-800 border px-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500
              ${fieldErrors.password ? "border-red-500" : "border-slate-700"}
            `}
            placeholder="At least 6 characters"
          />
          {fieldErrors.password && (
            <p className="text-sm text-red-400 mt-1">
              {fieldErrors.password}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full rounded-lg bg-slate-800 border px-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500
              ${fieldErrors.confirmPassword ? "border-red-500" : "border-slate-700"}
            `}
            placeholder="Repeat your password"
          />
          {fieldErrors.confirmPassword && (
            <p className="text-sm text-red-400 mt-1">
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>

        {/* Error message */}
        {message && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-2 text-sm text-red-400">
            {message}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors py-2 font-medium text-white disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      {/* Footer */}
      <div className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{" "}
        <button
          onClick={() => router.push("/login")}
          className="text-indigo-400 hover:text-indigo-300"
        >
          Log in
        </button>
      </div>
    </div>
  </div>
);
}