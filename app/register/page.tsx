"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) router.push("/dashboard");
  }, [router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setMessage("");

    const emailRegex = /^\S+@\S+\.\S+$/;
    const newErrors: any = {};
    if (username.trim().length < 3) newErrors.username = "Min 3 characters";
    if (!emailRegex.test(email)) newErrors.email = "Invalid email";
    if (password.length < 6) newErrors.password = "Min 6 characters";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
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
        localStorage.setItem("token", data.token);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <header className="relative z-10 border-b border-slate-800 bg-slate-950/70 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
          <Sparkles className="w-6 h-6 text-indigo-400" />
          <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            ProBlog
          </span>
        </div>
      </header>

      <main className="relative z-10 flex items-center justify-center px-4 py-20">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Card className="rounded-3xl bg-slate-900/60 border-slate-800 backdrop-blur shadow-2xl">
            <CardContent className="p-8">
              <div className="mb-8 text-center">
                <div className="inline-flex items-center gap-2 mb-3 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-sm text-indigo-300">
                  <Check className="w-4 h-4" /> Always free
                </div>
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Create your account</h1>
                <p className="text-slate-400">Start sharing your ideas on ProBlog</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-5">
                <Input label="Username" value={username} onChange={setUsername} error={errors.username} />
                <Input label="Email" value={email} onChange={setEmail} error={errors.email} type="email" />
                <Input label="Password" value={password} onChange={setPassword} error={errors.password} type="password" />
                <Input label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} error={errors.confirmPassword} type="password" />

                {message && (
                  <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-2 text-sm text-red-400">
                    {message}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/30"
                >
                  {loading ? "Creating account..." : "Create account"}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-slate-400">
                Already have an account?{" "}
                <button onClick={() => router.push("/login")} className="text-indigo-400 hover:text-indigo-300">
                  Log in
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

function Input({ label, value, onChange, error, type = "text" }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-lg bg-slate-800 border px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
          error ? "border-red-500" : "border-slate-700"
        }`}
      />
      {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
    </div>
  );
}
