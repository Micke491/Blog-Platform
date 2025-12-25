"use client";

export default function PostEditor() {
  return (
    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
      <input
        placeholder="Post title..."
        className="w-full bg-transparent text-2xl font-bold text-white mb-4 outline-none"
      />
      <textarea
        placeholder="Write your story..."
        className="w-full h-64 bg-transparent text-gray-300 outline-none resize-none"
      />
    </div>
  );
}
