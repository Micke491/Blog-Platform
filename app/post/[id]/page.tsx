"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { CommentSection } from "@/components/CommentSection";
import { Heart, MessageCircle, User, Calendar, ArrowLeft } from "lucide-react";

type AuthorDto = {
  _id: string;
  username: string;
};

type CommentDto = {
  _id: string;
  content: string;
  author?: AuthorDto;
  createdAt: string;
};

type PostDto = {
  _id: string;
  title: string;
  content: string;
  author?: AuthorDto;
  tags: string[];
  likes: string[];
  comments: CommentDto[];
  createdAt: string;
};

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [post, setPost] = useState<PostDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setIsLoggedIn(!!token);
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/posts/${id}`);
      const data = await res.json();
      if (res.ok) {
        setPost(data.post);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleLike = async () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/posts/${id}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) fetchPost();
    } catch (err) {
      console.error(err);
    }
  };

  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center">
        <div className="text-slate-400">Post not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      {/* HEADER */}
      <header className="border-b border-gray-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-slate-400 hover:text-indigo-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* POST HEADER */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
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

          {/* POST TITLE */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-slate-100 leading-tight">
            {post.title}
          </h1>

          {/* POST CONTENT */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="text-gray-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </div>
          </div>

          {/* TAGS */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex items-center gap-4 pt-6 border-t border-gray-200 dark:border-slate-800">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
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
              {post.likes.length}
            </button>

            <div className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-slate-400">
              <MessageCircle className="w-4 h-4" />
              {post.comments.length}
            </div>
          </div>

          {/* COMMENTS SECTION */}
          <div className="pt-8 border-t border-gray-200 dark:border-slate-800">
            <CommentSection
              postId={post._id}
              comments={post.comments}
              onCommentAdded={fetchPost}
            />
          </div>
        </motion.article>
      </main>
    </div>
  );
}