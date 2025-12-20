"use client";

import { useState } from "react";
import { User, Calendar, Trash2 } from "lucide-react";

type Comment = {
  _id: string;
  content: string;
  author?: {
    _id: string;
    username: string;
  };
  createdAt: string;
};

type CommentSectionProps = {
  postId: string;
  comments: Comment[];
  onCommentAdded: () => void;
};

export function CommentSection({ postId, comments, onCommentAdded }: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/posts/${postId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (res.ok) {
        setNewComment("");
        onCommentAdded();
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Da li želiš da obrišeš ovaj komentar?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/posts/${postId}/comment/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        onCommentAdded();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-slate-100">
        Comments ({comments.length})
      </h3>

      {/* Add Comment Form */}
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 space-y-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim() || loading}
            className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg font-medium hover:shadow-lg hover:shadow-indigo-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Posting..." : "Post Comment"}
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-slate-500 text-center py-8">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment._id}
              className="flex gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-slate-200">
                      {comment.author?.username || "Anonymous"}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" />
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {userId === comment.author?._id && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="p-2 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-slate-300">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}