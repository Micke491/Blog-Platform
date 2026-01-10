"use client";

import { Heart, MessageCircle } from "lucide-react";

type Post = {
  _id: string;
  title: string;
  content: string;
  coverImage?: string;
  author: { username: string; avatar?: string };
  createdAt: Date;
  likes: any[];
  tags?: string[];
};

interface PostListProps {
  posts: Post[];
  loading: boolean;
  onPostClick?: (post: Post) => void;
}

export default function PostList({
  posts,
  loading,
  onPostClick,
}: PostListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white/5 border border-white/10 rounded-3xl p-6 animate-pulse"
          >
            <div className="w-full h-48 bg-white/10 rounded-2xl mb-4" />
            <div className="h-6 bg-white/10 rounded w-3/4 mb-3" />
            <div className="h-4 bg-white/10 rounded w-full mb-2" />
            <div className="h-4 bg-white/10 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-6">
          <MessageCircle size={48} className="text-gray-500" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">No posts found</h3>
        <p className="text-gray-400">
          Try adjusting your filters or search terms
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map((post) => (
        <div
          key={post._id}
          onClick={() => onPostClick?.(post)}
          className="group bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-pink-400/50 hover:shadow-2xl hover:shadow-pink-500/20 transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
        >
          {/* Cover Image */}
          {post.coverImage && (
            <div className="relative h-48 overflow-hidden">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {post.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  >
                    #{tag}
                  </span>
                ))}
                {post.tags.length > 2 && (
                  <span className="px-2 py-1 rounded-full text-xs text-gray-400">
                    +{post.tags.length - 2}
                  </span>
                )}
              </div>
            )}

            {/* Title */}
            <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-pink-400 transition-colors">
              {post.title}
            </h3>

            {/* Content Preview */}
            <p className="text-gray-400 text-sm line-clamp-3 mb-4">
              {post.content}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                {post.author.avatar ? (
                  <img
                    src={post.author.avatar}
                    alt={post.author.username}
                    className="w-8 h-8 rounded-full object-cover border border-white/20"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                    {post.author.username[0].toUpperCase()}
                  </div>
                )}
                <span className="text-sm text-gray-400">
                  {post.author.username}
                </span>
              </div>

              <div className="flex items-center gap-4 text-gray-400 text-sm">
                <div className="flex items-center gap-1">
                  <Heart size={16} />
                  <span>{post.likes.length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle size={16} />
                </div>
              </div>
            </div>

            {/* Date */}
            <p className="text-xs text-gray-500 mt-3">
              {new Date(post.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
