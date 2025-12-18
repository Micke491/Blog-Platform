"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Heart, MessageCircle, User, Calendar, Tag, Search, TrendingUp } from "lucide-react";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
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
    } catch (error) {
      console.error("Error fetching posts:", error);
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
          "Authorization": `Bearer ${token}`,
        },
      });

      if (res.ok) {
        fetchPosts(); // Refresh posts
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleComment = (postId: string) => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    router.push(`/post/${postId}`);
  };

  const filteredPosts = posts.filter((post: PostDto) => {
  const matchesSearch =
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase());

  const matchesTag = !selectedTag || post.tags.includes(selectedTag);

  return matchesSearch && matchesTag;
});


  const allTags = [
  ...new Set(posts.flatMap((post: PostDto) => post.tags)),
];
  
    const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
            <Sparkles className="w-6 h-6 text-indigo-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              ProBlog
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Button variant="ghost" className="hover:bg-slate-800" onClick={() => router.push("/dashboard")}>
                  Profile
                </Button>
                <Button 
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
                  onClick={() => router.push("/dashboard/new")}
                >
                  Write Post
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" className="hover:bg-slate-800" onClick={() => router.push("/login")}>
                  Login
                </Button>
                <Button 
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
                  onClick={() => router.push("/register")}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-br from-indigo-950/50 to-purple-950/50">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-sm text-indigo-300">
              <TrendingUp className="w-4 h-4" />
              Discover Amazing Stories
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Explore Latest Posts
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Read inspiring stories, learn new things, and connect with writers from around the world
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Tags */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card className="sticky top-24 rounded-2xl bg-slate-900/50 border-slate-800 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-semibold text-slate-100">Popular Tags</h2>
                </div>
                
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedTag("")}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      !selectedTag 
                        ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" 
                        : "text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    All Posts
                  </button>
                  
                  {allTags.slice(0, 10).map((tag, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedTag(tag)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedTag === tag 
                          ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" 
                          : "text-slate-400 hover:bg-slate-800"
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.aside>

          {/* Posts Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="mt-4 text-slate-400">Loading posts...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-2xl font-semibold text-slate-300 mb-2">No posts found</h3>
                <p className="text-slate-400">
                  {searchTerm || selectedTag ? "Try a different search or tag" : "Be the first to write a post!"}
                </p>
              </motion.div>
            ) : (
              <div className="grid gap-6">
                {filteredPosts.map((post: PostDto, idx: number) => (
                  <motion.div
                    key={post._id || idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="rounded-2xl bg-slate-900/50 border-slate-800 backdrop-blur hover:border-indigo-500/30 transition-all duration-300 overflow-hidden group">
                      <CardContent className="p-6">
                        {/* Post Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-200">{post.author?.username || "Anonymous"}</p>
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Calendar className="w-3 h-3" />
                                {new Date(post.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Post Content */}
                        <div 
                          className="cursor-pointer"
                          onClick={() => router.push(`/post/${post._id}`)}
                        >
                          <h3 className="text-2xl font-bold text-slate-100 mb-3 group-hover:text-indigo-400 transition-colors">
                            {post.title}
                          </h3>
                          <p className="text-slate-400 line-clamp-3 mb-4">
                            {post.content?.substring(0, 200)}...
                          </p>
                        </div>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.slice(0, 3).map((tag: string, i: number) => (
                              <span
                                key={i}
                                className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-4 pt-4 border-t border-slate-800">
                          <button
                            onClick={() => handleLike(post._id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                              userId ? post.likes.includes(userId) : false
                                ? "bg-red-500/20 text-red-400"
                                : "hover:bg-slate-800 text-slate-400"
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${userId ? post.likes.includes(userId) : false ? "fill-current" : ""}`} />
                            <span className="text-sm">{post.likes?.length || 0}</span>
                          </button>

                          <button
                            onClick={() => handleComment(post._id)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-sm">{post.comments?.length || 0}</span>
                          </button>

                          {!isLoggedIn && (
                            <span className="ml-auto text-xs text-slate-500">
                              Login to like and comment
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-400">
        <div className="max-w-7xl mx-auto px-6">
          <p>© {new Date().getFullYear()} ProBlog. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}