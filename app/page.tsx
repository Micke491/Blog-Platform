"use client"

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">ProBlog</h1>

          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => router.push("/login")}>Login</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-500" onClick={() => router.push("/register")}>
              Register
            </Button>
          </div>
        </div>
      </header>


      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-28 grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl font-bold leading-tight mb-6">
            Share your ideas with the world
            <span className="text-indigo-400"> in one simple place</span>
          </h2>
          <p className="text-lg text-slate-300 mb-8 max-w-xl">
            ProBlog is a clean and easy-to-use blogging platform where you can write stories, share knowledge, and connect with readers — without distractions.
          </p>
          <div className="flex gap-4">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500">
              Start Writing
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-slate-600 text-slate-200 hover:bg-slate-800"
            >
              Explore Blogs
            </Button>
          </div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          <Card className="rounded-2xl">
            <CardContent>
              <h3 className="text-lg font-semibold mb-2">Easy to Write</h3>
              <p className="text-slate-300 text-sm">
                Focus on your words with a clean editor designed for clarity and comfort.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardContent>
              <h3 className="text-lg font-semibold mb-2">Reach Readers</h3>
              <p className="text-slate-300 text-sm">
                Share your posts publicly and grow your audience over time.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardContent>
              <h3 className="text-lg font-semibold mb-2">Your Space</h3>
              <p className="text-slate-300 text-sm">
                Customize your profile and manage all your posts in one dashboard.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardContent>
              <h3 className="text-lg font-semibold mb-2">Built for Growth</h3>
              <p className="text-slate-300 text-sm">
                Whether you write for fun or professionally, ProBlog grows with you.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <div className="grow" />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 py-6 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} ProBlog. All rights reserved.
      </footer>
    </div>
  );
}
