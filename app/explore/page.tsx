"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Heart, MessageCircle, User, Calendar } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPosts, setFilteredPosts] = useState<PostDto[]>([]);

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setIsLoggedIn(!!token);
    fetchPosts();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = posts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredPosts(filtered);
    } else {
      setFilteredPosts(posts);
    }
  }, [posts, searchQuery]);

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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const userId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex flex-col">
      {/* SEARCH SECTION */}
      <section className="border-b border-gray-200 dark:border-slate-800 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 text-center bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"
          >
            Explore Latest Posts
          </motion.h1>
          <div className="max-w-md mx-auto">
            <SearchBar onSearch={handleSearch} placeholder="Search posts..." />
          </div>
        </div>
      </section>

      {/* POSTS SECTION */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-slate-400">Loading posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-slate-300 mb-2">
              No posts yet
            </h3>
            <p className="text-slate-400">
              Be the first to publish something.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredPosts.map((post, idx) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="rounded-xl bg-white dark:bg-slate-900/50 border-gray-200 dark:border-slate-800 backdrop-blur hover:border-indigo-500/30 transition">
                  <CardContent className="p-4 sm:p-6">
                    {/* HEADER */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-slate-200">
                          {post.author?.username || "Anonymous"}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-500">
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
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-slate-100 mb-3 hover:text-indigo-400 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 dark:text-slate-400 line-clamp-3 mb-4 sm:mb-6 text-sm sm:text-base">
                        {post.content.substring(0, 200)}...
                      </p>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex items-center gap-2 sm:gap-4 pt-4 border-t border-gray-200 dark:border-slate-800">
                      <button
                        onClick={() => handleLike(post._id)}
                        className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg transition text-sm ${
                          userId && post.likes.includes(userId)
                            ? "bg-red-500/20 text-red-400"
                            : "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            userId && post.likes.includes(userId)
                              ? "fill-current"
                              : ""
                          }`}
                        />
                        <span className="hidden sm:inline">{post.likes.length}</span>
                      </button>

                      <button
                        onClick={() => handleComment(post._id)}
                        className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition text-sm"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">{post.comments.length}</span>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 dark:border-slate-800 mt-16 py-8 text-center text-sm text-gray-500 dark:text-slate-500">
        © {new Date().getFullYear()} ProBlog. All rights reserved.
      </footer>
    </div>
  );
}
