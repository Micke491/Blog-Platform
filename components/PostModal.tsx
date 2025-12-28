"use client";

import { useState, useEffect } from "react";
import { X, Heart, MessageCircle, Send } from "lucide-react";

type Post = {
  _id: string;
  title: string;
  content: string;
  coverImage?: string;
  author: { username: string };
  createdAt: Date;
  likes: any[];
  tags?: string[];
};

type Comment = {
  _id: string;
  content: string;
  author: { username: string };
  createdAt: Date;
};

interface PostModalProps {
  post: Post | null;
  onClose: () => void;
  currentUsername?: string;
}

export default function PostModal({ post, onClose, currentUsername }: PostModalProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!post) return;

    // Initialize like state
    setLikeCount(post.likes.length);
    setLiked(false); // You can check if current user has liked

    // Fetch comments from API
    async function fetchComments() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/posts/${post!._id}/comment`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setComments(data.comments || []);
      } catch (error) {
        console.error("Error fetching comments:", error);
        setComments([]);
      }
    }
    
    fetchComments();
  }, [post]);

  if (!post) return null;

  const handleLike = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/posts/${post!._id}/like`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setLikeCount(data.likes);
      setLiked(!liked);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/posts/${post!._id}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment }),
      });
      const data = await response.json();
      if (data.comment) {
        setComments([data.comment, ...comments]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-gradient-to-br from-gray-900 to-black rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white/80 hover:text-white transition-all"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
          {/* Left Side - Image */}
          {post.coverImage && (
            <div className="md:w-1/2 bg-black flex items-center justify-center overflow-hidden">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Right Side - Content */}
          <div className={`${post.coverImage ? 'md:w-1/2' : 'w-full'} flex flex-col`}>
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  {post.author.username[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-white">{post.author.username}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-3">{post.title}</h2>

              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-6 pt-3">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 transition-all ${
                    liked
                      ? "text-pink-500 scale-110"
                      : "text-gray-400 hover:text-pink-400"
                  }`}
                >
                  <Heart
                    size={22}
                    fill={liked ? "currentColor" : "none"}
                    className="transition-all"
                  />
                  <span className="font-semibold">{likeCount}</span>
                </button>

                <div className="flex items-center gap-2 text-gray-400">
                  <MessageCircle size={22} />
                  <span className="font-semibold">{comments.length}</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>
              </div>

              {/* Comments Section */}
              <div className="border-t border-white/10 pt-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  Comments ({comments.length})
                </h3>

                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div
                      key={comment._id}
                      className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                          {comment.author.username[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">
                            {comment.author.username}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">{comment.content}</p>
                    </div>
                  ))}

                  {comments.length === 0 && (
                    <p className="text-gray-500 text-center py-8">
                      No comments yet. Be the first to comment!
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Comment Input */}
            <div className="p-4 border-t border-white/10 bg-black/50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a comment..."
                  className="flex-1 px-4 py-3 rounded-full bg-white/5 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-pink-400 transition-all"
                  disabled={isSubmitting}
                />
                <button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmitting}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send size={18} />
                  {isSubmitting ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}