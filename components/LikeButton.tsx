"use client";

import { Heart } from "lucide-react";

interface LikeButtonProps {
  count: number;
  liked?: boolean;
  onToggle?: () => void;
}

export default function LikeButton({
  count,
  liked,
  onToggle,
}: LikeButtonProps) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 text-sm transition ${
        liked ? "text-pink-500" : "text-gray-400 hover:text-pink-400"
      }`}
    >
      <Heart size={16} fill={liked ? "currentColor" : "none"} />
      {count}
    </button>
  );
}
