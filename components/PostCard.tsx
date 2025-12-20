"use client";

import { User, Calendar, Heart, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type PostCardProps = {
  post: {
    _id: string;
    title: string;
    content: string;
    author?: {
      _id: string;
      username: string;
    };
    tags: string[];
    likes: string[];
    comments: string[];
    coverImage?: string;
    createdAt: string;
  };
  onLike?: () => void;
  onComment?: () => void;
  onClick?: () => void;
};

export function PostCard({ post, onLike, onComment, onClick }: PostCardProps) {
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const isLiked = userId ? post.likes.includes(userId) : false;

  return (
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
        <div onClick={onClick} className="cursor-pointer">
          {post.coverImage && (
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          )}
          <h3 className="text-2xl font-bold text-slate-100 mb-3 hover:text-indigo-400 transition-colors">
            {post.title}
          </h3>
          <p className="text-slate-400 line-clamp-3 mb-6">
            {post.content.substring(0, 200)}...
          </p>
        </div>

        {/* TAGS */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 text-xs bg-indigo-500/20 text-indigo-300 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex items-center gap-4 pt-4 border-t border-slate-800">
          <button
            onClick={onLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              isLiked
                ? "bg-red-500/20 text-red-400"
                : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            {post.likes.length}
          </button>

          <button
            onClick={onComment}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 transition"
          >
            <MessageCircle className="w-4 h-4" />
            {post.comments.length}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}