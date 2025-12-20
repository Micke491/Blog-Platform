"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

type LikeButtonProps = {
  postId: string;
  likes: string[];
  onLikeToggle: () => void;
};

export function LikeButton({ postId, likes, onLikeToggle }: LikeButtonProps) {
  const [loading, setLoading] = useState(false);
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const isLiked = userId ? likes.includes(userId) : false;

  const handleLike = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        onLikeToggle();
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
        isLiked
          ? "bg-red-500/20 text-red-400"
          : "text-slate-400 hover:bg-slate-800"
      }`}
    >
      <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
      {likes.length}
    </button>
  );
}