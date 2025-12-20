"use client";

import { useState } from "react";
import { X, Save } from "lucide-react";

type PostEditorProps = {
  initialTitle?: string;
  initialContent?: string;
  initialCoverImage?: string;
  initialTags?: string[];
  initialPublished?: boolean;
  onSave: (title: string, content: string, coverImage: string, tags: string[], published: boolean) => void;
  onCancel: () => void;
  submitLabel?: string;
};

export function PostEditor({
  initialTitle = "",
  initialContent = "",
  initialCoverImage = "",
  initialTags = [],
  initialPublished = true,
  onSave,
  onCancel,
  submitLabel = "Save",
}: PostEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [coverImage, setCoverImage] = useState(initialCoverImage);
  const [tags, setTags] = useState(initialTags.join(", "));
  const [published, setPublished] = useState(initialPublished);

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;
    
    const tagArray = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    
    onSave(title, content, coverImage, tagArray, published);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter post title..."
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Cover Image URL
        </label>
        <input
          type="url"
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Content
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your post content..."
          rows={8}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Tags (comma separated)
        </label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="technology, coding, tutorial"
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="published"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="w-4 h-4 text-indigo-600 bg-slate-800 border-slate-700 rounded focus:ring-indigo-500"
        />
        <label htmlFor="published" className="text-sm font-medium text-slate-300">
          Publish publicly (uncheck to make private)
        </label>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={!title.trim() || !content.trim()}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {submitLabel}
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-slate-800 rounded-xl font-semibold hover:bg-slate-700 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}