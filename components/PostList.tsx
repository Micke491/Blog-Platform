"use client";

import { motion } from "framer-motion";
import { PostCard } from "./PostCard";

type Post = {
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
  createdAt: string;
};

type PostListProps = {
  posts: Post[];
  loading?: boolean;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onPostClick?: (postId: string) => void;
};

export function PostList({
  posts,
  loading = false,
  onLike,
  onComment,
  onPostClick,
}: PostListProps) {
  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-slate-400">Loading posts...</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-20">
        <h3 className="text-2xl font-semibold text-slate-300 mb-2">
          No posts yet
        </h3>
        <p className="text-slate-400">Be the first to publish something.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      {posts.map((post, idx) => (
        <motion.div
          key={post._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
        >
          <PostCard
            post={post}
            onLike={() => onLike?.(post._id)}
            onComment={() => onComment?.(post._id)}
            onClick={() => onPostClick?.(post._id)}
          />
        </motion.div>
      ))}
    </div>
  );
}