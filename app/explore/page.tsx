"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Heart, MessageCircle, User, Calendar } from "lucide-react";

type AuthorDto = {
  _id: string;
  username: string;
};

type PostDto = {
  _id: string;
  title: string;
  content: string;
  author?: AuthorDto;
  tags: string[];
  likes: string[];
  comments: string[];
  createdAt: string;
};

export default function ExplorePage() {
  const router = useRouter();
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setIsLoggedIn(!!token);
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      if (res.ok) {
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleLike = async (postId: string) => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = (postId: string) => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    router.push(`/post/${postId}`);
  };

  const userId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col">
      {/* HEADER / NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <Sparkles className="w-6 h-6 text-indigo-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              ProBlog
            </span>
          </div>

          <nav className="flex items-center gap-8">
            <button
              onClick={() => router.push("/explore")}
              className="text-indigo-400 font-medium"
            >
              Explore
            </button>

            <button
              onClick={() => router.push("/search")}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              Search
            </button>

            <button
              onClick={() =>
                router.push(isLoggedIn ? "/dashboard" : "/login")
              }
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              Profile
            </button>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="border-b border-slate-800 bg-gradient-to-br from-indigo-950/40 to-purple-950/40">
        <div className="max-w-7xl mx-auto px-6 py-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"
          >
            Explore Latest Posts
          </motion.h1>

          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Read inspiring stories and ideas from the community
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-20 w-full">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-slate-400">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-2xl font-semibold text-slate-300 mb-2">
              No posts yet
            </h3>
            <p className="text-slate-400">
              Be the first to publish something.
            </p>
          </div>
        ) : (
          <div className="grid gap-8">
            {posts.map((post, idx) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="rounded-2xl bg-slate-900/50 border-slate-800 backdrop-blur hover:border-indigo-500/30 transition">
                  <CardContent className="p-6">
                    {/* HEADER */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-200">
                          {post.author?.username || "Anonymous"}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Calendar className="w-3 h-3" />
                          {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* CONTENT */}
                    <div
                      onClick={() => router.push(`/post/${post._id}`)}
                      className="cursor-pointer"
                    >
                      <h3 className="text-2xl font-bold text-slate-100 mb-3 hover:text-indigo-400 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-slate-400 line-clamp-3 mb-6">
                        {post.content.substring(0, 200)}...
                      </p>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex items-center gap-4 pt-4 border-t border-slate-800">
                      <button
                        onClick={() => handleLike(post._id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                          userId && post.likes.includes(userId)
                            ? "bg-red-500/20 text-red-400"
                            : "text-slate-400 hover:bg-slate-800"
                        }`}
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            userId && post.likes.includes(userId)
                              ? "fill-current"
                              : ""
                          }`}
                        />
                        {post.likes.length}
                      </button>

                      <button
                        onClick={() => handleComment(post._id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 transition"
                      >
                        <MessageCircle className="w-4 h-4" />
                        {post.comments.length}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* FOOTER – SPUŠTEN */}
      <footer className="border-t border-slate-800 mt-32 py-10 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} ProBlog. All rights reserved.
      </footer>
    </div>
  );
}
