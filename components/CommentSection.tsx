"use client";

interface Comment {
  _id: string;
  content: string;
  author: { username: string };
}

export default function CommentSection({ comments }: { comments: Comment[] }) {
  return (
    <div className="space-y-6">
      {comments.map((c) => (
        <div
          key={c._id}
          className="p-4 rounded-2xl bg-white/5 border border-white/10"
        >
          <p className="text-white mb-2">{c.content}</p>
          <span className="text-sm text-gray-400">
            — {c.author.username}
          </span>
        </div>
      ))}
    </div>
  );
}
