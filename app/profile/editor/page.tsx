"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { useToast } from "@/components/Toast";

export default function EditorPage() {
  const router = useRouter();
  const { toast, Toast } = useToast();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function uploadImage(file: File) {
    setUploading(true);
    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      const error = await res.json();
      toast(error.error || "Upload failed", "error");
      setUploading(false);
      return;
    }

    const data = await res.json();
    setImage(data.url);
    toast("Image uploaded successfully!", "success");
    setUploading(false);
  }

  function addTag(tag: string) {
    const cleanedTag = tag.trim().replace(/^#+/, "").toLowerCase();
    if (!cleanedTag) return;
    if (tags.includes(cleanedTag)) {
      toast("Tag already exists", "info");
      return;
    }
    if (tags.length >= 10) {
      toast("Maximum 10 tags allowed", "error");
      return;
    }
    setTags([...tags, cleanedTag]);
    setTagInput("");
    toast(`Tag "#${cleanedTag}" added`, "success");
  }

  function removeTag(tagToRemove: string) {
    setTags(tags.filter((tag) => tag !== tagToRemove));
    toast(`Tag "#${tagToRemove}" removed`, "info");
  }

  function handleTagInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (tagInput.trim()) {
        addTag(tagInput);
      }
    }
  }

  async function publish() {
    if (!title || !content) {
      toast("Please fill in all required fields", "error");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          coverImage: image,
          tags: tags,
        }),
      });

      if (res.ok) {
        toast("Post published successfully!", "success");
        // Get user data to redirect to profile
        const userRes = await fetch("/api/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (userRes.ok) {
          const user = await userRes.json();
          setTimeout(() => router.push(`/profile/${user.username}`), 1000);
        } else {
          setTimeout(() => router.push("/explore"), 1000);
        }
      } else {
        const error = await res.json();
        toast(error.message || "Failed to publish post", "error");
      }
    } catch (error) {
      toast("Failed to publish post", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 pt-32 space-y-6">
        {/* Header with Cancel Button */}
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-black">Create Post</h1>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded-full border border-white/20 hover:bg-white/10 transition cursor-pointer text-sm font-medium"
          >
            Cancel
          </button>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title"
          className="w-full bg-white/5 border border-white/20 rounded-xl p-4 text-lg"
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          placeholder="Write something..."
          className="w-full bg-white/5 border border-white/20 rounded-xl p-4"
        />

        <div className="space-y-2">
          <label className="text-sm text-gray-400">
            Tags (press Enter or comma to add)
          </label>
          <div className="flex flex-wrap gap-2 p-3 bg-white/5 border border-white/20 rounded-xl min-h-[3rem]">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-sm"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-white transition-colors"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              onBlur={() => tagInput.trim() && addTag(tagInput)}
              placeholder={tags.length === 0 ? "Add tags..." : ""}
              className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-white placeholder-gray-500"
            />
          </div>
          {tags.length >= 10 && (
            <p className="text-xs text-gray-500">Maximum 10 tags allowed</p>
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files && uploadImage(e.target.files[0])}
          disabled={uploading}
        />
        {uploading && <p className="text-gray-400">Uploading image...</p>}

        {image && (
          <img
            src={image}
            alt="Preview"
            className="rounded-xl max-h-80 object-cover"
          />
        )}

        <button
          onClick={publish}
          disabled={loading || uploading}
          className="w-full py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 font-semibold hover:scale-[1.02] transition cursor-pointer disabled:opacity-50 disabled:hover:scale-100"
        >
          {loading ? "Posting..." : uploading ? "Uploading..." : "Post"}
        </button>
      </main>
      <Toast />
    </div>
  );
}