"use client";

import { Heart, Calendar, User } from "lucide-react";
import Link from "next/link";

interface PostCardProps {
  post: {
    _id: string;
    title: string;
    content: string;
    coverImage?: string;
    author: { username: string };
    createdAt: Date;
    likes: any[];
  };
}

export default function PostCard({ post }: PostCardProps) {
  const excerpt =
    post.content.length > 160
      ? post.content.slice(0, 160) + "..."
      : post.content;

  const daysAgo = Math.floor(
    (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Link href={`/posts/${post._id}`}>
      <article className="group relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/30 transition-all duration-300 hover:-translate-y-1">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          {post.coverImage ? (
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-purple-800 to-pink-800" />
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-pink-400 transition-colors">
            {post.title}
          </h3>

          <p className="text-gray-400 text-sm mb-5 line-clamp-3">
            {excerpt}
          </p>

          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <User size={14} />
              {post.author.username}
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              {daysAgo === 0 ? "Today" : `${daysAgo}d ago`}
            </div>
            <div className="flex items-center gap-1">
              <Heart size={14} />
              {post.likes.length}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
