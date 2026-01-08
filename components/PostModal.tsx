"use client";

import { useState, useEffect } from "react";
import { X, Heart, MessageCircle, Send, Trash2, Edit2, Save, XCircle } from "lucide-react";
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
  onPostUpdated?: (updatedPost: Post | null) => void; 
}

export default function PostModal({
  post,
  onClose,
  currentUsername,
  currentUserId,
  onPostUpdated,
}: PostModalProps) {
  const { toast, Toast } = useToast();
  
  const [displayPost, setDisplayPost] = useState<Post | null>(post);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [editedTags, setEditedTags] = useState("");

  const isAuthor =
    currentUserId &&
    (displayPost?.author?._id === currentUserId ||
      displayPost?.author.username === currentUsername);

  useEffect(() => {
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isEditing) onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isEditing, onClose]);

  useEffect(() => {
    if (!post) return;
    setDisplayPost(post);
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

    fetchComments(post._id);
  }, [post, currentUserId]);

  async function fetchComments(postId: string) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/posts/${postId}/comment`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast("Error loading comments", "error");
      setComments([]);
    }
  }

  const handleStartEdit = () => {
    if (!displayPost) return;
    setEditedTitle(displayPost.title);
    setEditedContent(displayPost.content);
    setEditedTags(displayPost.tags ? displayPost.tags.join(", ") : "");
    setIsEditing(true);
  };

  const handleSavePost = async () => {
    if (!displayPost) return;
    setIsSaving(true);

    try {
      const token = localStorage.getItem("token");
      
      const tagsArray = editedTags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const response = await fetch(`/api/posts/${displayPost._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editedTitle,
          content: editedContent,
          tags: tagsArray,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const updatedPost = {
          ...displayPost,
          title: editedTitle,
          content: editedContent,
          tags: tagsArray,
        };
        
        setDisplayPost(updatedPost);
        setIsEditing(false);
        toast("Post updated successfully", "success");
        
        if (onPostUpdated) onPostUpdated(updatedPost);
      } else {
        toast(data.message || "Failed to update post", "error");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      toast("Error updating post", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePost = async () => {
    if (!displayPost) return;
    if (!confirm("Are you sure you want to delete this post? This action is permanent.")) return;

    setIsDeletingPost(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/posts/${displayPost._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast("Post deleted successfully", "success");
        if (onPostUpdated) onPostUpdated(null);
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
    if (!displayPost) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/posts/${displayPost._id}/like`, {
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
      } else {
        toast("Failed to delete comment", "error");
      }
    } catch (error) {
      toast("Error deleting comment", "error");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || isSubmitting || !displayPost) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/posts/${displayPost._id}/comment`, {
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
      } else {
        toast("Failed to post comment", "error");
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
    if (e.target === e.currentTarget && !isEditing) onClose();
  };

  if (!displayPost) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4"
      onClick={handleBackdropClick}
    >
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="relative w-full h-full sm:h-[90vh] sm:max-w-5xl bg-gradient-to-br from-gray-900 to-black sm:rounded-3xl border-0 sm:border border-white/20 shadow-2xl overflow-hidden flex flex-col">
        {/* Action Buttons - Moved to top on mobile */}
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 flex gap-1 sm:gap-2">
          {isAuthor && (
            <>
              {!isEditing ? (
                <button
                  onClick={handleStartEdit}
                  className="p-1.5 sm:p-2 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-all cursor-pointer"
                  title="Edit post"
                >
                  <Edit2 size={20} className="sm:w-6 sm:h-6" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="p-1.5 sm:p-2 rounded-full bg-gray-500/10 hover:bg-gray-500/20 text-gray-400 border border-gray-500/20 transition-all cursor-pointer"
                    title="Cancel edit"
                    disabled={isSaving}
                  >
                    <XCircle size={20} className="sm:w-6 sm:h-6" />
                  </button>
                  <button
                    onClick={handleSavePost}
                    disabled={isSaving}
                    className="p-1.5 sm:p-2 rounded-full bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20 transition-all cursor-pointer disabled:opacity-50"
                    title="Save changes"
                  >
                     {isSaving ? <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" /> : <Save size={20} className="sm:w-6 sm:h-6" />}
                  </button>
                </>
              )}

              {!isEditing && (
                <button
                  onClick={handleDeletePost}
                  disabled={isDeletingPost}
                  className="p-1.5 sm:p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 transition-all disabled:opacity-50 cursor-pointer"
                  title="Delete post"
                >
                  {isDeletingPost ? (
                    <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                  ) : (
                    <Trash2 size={20} className="sm:w-6 sm:h-6" />
                  )}
                </button>
              )}
            </>
          )}
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-1.5 sm:p-2 rounded-full bg-black/50 hover:bg-black/70 text-white/80 hover:text-white transition-all cursor-pointer"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row h-full overflow-hidden">
          {/* Cover Image - Stack on mobile */}
          {displayPost.coverImage && (
            <div className="w-full md:w-1/2 bg-black flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-white/10 shrink-0 h-48 sm:h-64 md:h-auto">
              <img
                src={displayPost.coverImage}
                alt={displayPost.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content Area */}
          <div
            className={`${
              displayPost.coverImage ? "md:w-1/2" : "w-full"
            } flex flex-col h-full overflow-hidden`}
          >
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3 mb-4">
                {displayPost.author.avatar ? (
                  <img
                    src={displayPost.author.avatar}
                    alt={displayPost.author.username}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-white/20"
                  />
                ) : (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm sm:text-base font-bold">
                    {displayPost.author.username[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-white text-sm sm:text-base">
                    {displayPost.author.username}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(displayPost.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-3">
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white font-bold text-lg sm:text-xl focus:outline-none focus:border-purple-500"
                      placeholder="Post Title"
                    />
                    <input
                      type="text"
                      value={editedTags}
                      onChange={(e) => setEditedTags(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-xs sm:text-sm text-purple-300 focus:outline-none focus:border-purple-500"
                      placeholder="Tags (comma separated)..."
                    />
                </div>
              ) : (
                <>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
                    {displayPost.title}
                  </h2>
                  {displayPost.tags && displayPost.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {displayPost.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 sm:px-3 py-1 rounded-full text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              )}

              {!isEditing && (
                <div className="flex items-center gap-4 sm:gap-6 pt-3">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 transition-all cursor-pointer ${
                      liked
                        ? "text-pink-500 scale-110"
                        : "text-gray-400 hover:text-pink-400"
                    }`}
                  >
                    <Heart size={20} className="sm:w-6 sm:h-6" fill={liked ? "currentColor" : "none"} />
                    <span className="font-semibold text-sm sm:text-base">{likeCount}</span>
                  </button>
                  <div className="flex items-center gap-2 text-gray-400">
                    <MessageCircle size={20} className="sm:w-6 sm:h-6" />
                    <span className="font-semibold text-sm sm:text-base">{comments.length}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 hide-scrollbar">
              {isEditing ? (
                 <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full h-48 sm:h-64 bg-white/10 border border-white/20 rounded-lg p-3 sm:p-4 text-sm sm:text-base text-gray-200 leading-relaxed focus:outline-none focus:border-purple-500 resize-none hide-scrollbar"
                  placeholder="Post content..."
                />
              ) : (
                <div className="prose prose-invert max-w-none">
                  <p className="text-sm sm:text-base text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {displayPost.content}
                  </p>
                </div>
              )}

              {!isEditing && (
                <div className="border-t border-white/10 pt-4 sm:pt-6">
                  <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">
                    Comments ({comments.length})
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    {comments.map((comment) => {
                      const isCommentOwner =
                        currentUserId && comment.author?._id === currentUserId;
                      return (
                        <div
                          key={comment._id}
                          className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2 mb-2">
                              {comment.author.avatar ? (
                                <img
                                  src={comment.author.avatar}
                                  alt={comment.author.username}
                                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-white/20"
                                />
                              ) : (
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs text-white">
                                  {comment.author.username[0].toUpperCase()}
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-white text-xs sm:text-sm">
                                  {comment.author.username}
                                </p>
                              </div>
                            </div>
                            {isCommentOwner && (
                              <button
                                onClick={() => handleDeleteComment(comment._id)}
                                disabled={isDeleting === comment._id}
                                className="text-gray-500 hover:text-red-500 transition-all cursor-pointer disabled:opacity-50"
                              >
                                {isDeleting === comment._id ? (
                                  <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                                ) : (
                                  <Trash2 size={14} className="sm:w-4 sm:h-4" />
                                )}
                              </button>
                            )}
                          </div>
                          <p className="text-gray-300 text-xs sm:text-sm pl-9 sm:pl-10">
                            {comment.content}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Comment Input - Fixed at bottom */}
            {!isEditing && (
              <div className="p-3 sm:p-4 border-t border-white/10 bg-black/50 shrink-0">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add a comment..."
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-full bg-white/5 border border-white/20 text-white text-sm sm:text-base focus:outline-none focus:border-pink-400"
                  />
                  <button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || isSubmitting}
                    className="px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold flex items-center gap-2 disabled:opacity-50 cursor-pointer text-sm sm:text-base"
                  >
                    <Send size={16} className="sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">{isSubmitting ? "..." : "Send"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Toast />
    </div>
  );
}