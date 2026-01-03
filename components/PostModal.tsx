"use client";

import { useState, useEffect } from "react";
import { X, Heart, MessageCircle, Send, Trash2 } from "lucide-react";
import { useToast } from "@/components/Toast";

type Post = {
  _id: string;
  title: string;
  content: string;
  coverImage?: string;
  author: { _id?: string; username: string; avatar?: string };
  createdAt: Date;
  likes: any[];
  tags?: string[];
};

type Comment = {
  _id: string;
  content: string;
  author: { _id: string; username: string; avatar?: string };
  createdAt: Date;
};

interface PostModalProps {
  post: Post | null;
  onClose: () => void;
  currentUsername?: string;
  currentUserId?: string;
}

export default function PostModal({
  post,
  onClose,
  currentUsername,
  currentUserId,
}: PostModalProps) {
  const { toast, Toast } = useToast();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);

  const isAuthor =
    currentUserId &&
    (post?.author._id === currentUserId ||
      post?.author.username === currentUsername);

  useEffect(() => {
    if (!post) return;

    setLikeCount(post.likes.length);
    const hasLiked = currentUserId
      ? post.likes.some((likeId: any) => {
          if (!likeId) return false;
          const likeIdStr =
            typeof likeId === "string" ? likeId : likeId.toString();
          return likeIdStr === currentUserId;
        })
      : false;
    setLiked(hasLiked);

    async function fetchComments() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/posts/${post!._id}/comment`, {
          headers: {
            Authorization: `Bearer ${token}`,
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
  }, [post, currentUserId]);

  if (!post) return null;

  const handleDeletePost = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this post? This action is permanent."
      )
    )
      return;

    setIsDeletingPost(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/posts/${post._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast("Post deleted successfully", "success");
        onClose();
      } else {
        const data = await response.json();
        toast(data.message || "Failed to delete post", "error");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast("Error deleting post", "error");
    } finally {
      setIsDeletingPost(false);
    }
  };

  const handleLike = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/posts/${post!._id}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setLikeCount(data.likes);
        const newLikedState =
          data.liked !== undefined ? data.liked : !liked;
        setLiked(newLikedState);
        toast(newLikedState ? "Post liked!" : "Post unliked", "success");
      }
    } catch (error) {
      toast("Failed to like post", "error");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    setIsDeleting(commentId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
        toast("Comment deleted", "success");
      }
    } catch (error) {
      toast("Error deleting comment", "error");
    } finally {
      setIsDeleting(null);
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment }),
      });
      const data = await response.json();
      if (data.comment) {
        setComments([data.comment, ...comments]);
        setNewComment("");
        toast("Comment posted!", "success");
      }
    } catch (error) {
      toast("Failed to post comment", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-gradient-to-br from-gray-900 to-black rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
        {/* Top Controls (Delete & Close) */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          {isAuthor && (
            <button
              onClick={handleDeletePost}
              disabled={isDeletingPost}
              className="p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 transition-all disabled:opacity-50 cursor-pointer"
              title="Delete post"
            >
              {isDeletingPost ? (
                <div className="w-6 h-6 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
              ) : (
                <Trash2 size={24} />
              )}
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white/80 hover:text-white transition-all cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
          {/* Left Side - Image */}
          {post.coverImage && (
            <div className="md:w-1/2 bg-black flex items-center justify-center overflow-hidden border-r border-white/10">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Right Side - Content */}
          <div
            className={`${
              post.coverImage ? "md:w-1/2" : "w-full"
            } flex flex-col`}
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-3 mb-4">
                {post.author.avatar ? (
                  <img
                    src={post.author.avatar}
                    alt={post.author.username}
                    className="w-10 h-10 rounded-full object-cover border border-white/20"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    {post.author.username[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-white">
                    {post.author.username}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(post.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-3">
                {post.title}
              </h2>

              {post.tags && (
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
                  className={`flex items-center gap-2 transition-all cursor-pointer ${
                    liked
                      ? "text-pink-500 scale-110"
                      : "text-gray-400 hover:text-pink-400"
                  }`}
                >
                  <Heart size={22} fill={liked ? "currentColor" : "none"} />
                  <span className="font-semibold">{likeCount}</span>
                </button>
                <div className="flex items-center gap-2 text-gray-400">
                  <MessageCircle size={22} />
                  <span className="font-semibold">{comments.length}</span>
                </div>
              </div>
            </div>

            {/* Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>
              </div>

              {/* Comments */}
              <div className="border-t border-white/10 pt-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  Comments ({comments.length})
                </h3>
                <div className="space-y-4">
                  {comments.map((comment) => {
                    const isCommentOwner =
                      currentUserId && comment.author?._id === currentUserId;
                    return (
                      <div
                        key={comment._id}
                        className="p-4 rounded-2xl bg-white/5 border border-white/10 group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2 mb-2">
                            {/* User Avatar in Comment */}
                            {comment.author.avatar ? (
                              <img
                                src={comment.author.avatar}
                                alt={comment.author.username}
                                className="w-8 h-8 rounded-full object-cover border border-white/20"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs text-white">
                                {comment.author.username[0].toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-white text-sm">
                                {comment.author.username}
                              </p>
                            </div>
                          </div>
                          {isCommentOwner && (
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                        <p className="text-gray-300 text-sm pl-10">
                          {comment.content}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-black/50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a comment..."
                  className="flex-1 px-4 py-3 rounded-full bg-white/5 border border-white/20 text-white focus:outline-none focus:border-pink-400"
                />
                <button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmitting}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  <Send size={18} />
                  {isSubmitting ? "..." : "Send"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toast />
    </div>
  );
}