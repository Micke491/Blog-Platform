"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";

export default function EditorPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string | null>(null);
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
      alert(error.error || "Upload failed");
      setUploading(false);
      return;
    }

    const data = await res.json();
    setImage(data.url);
    setUploading(false);
  }

  async function publish() {
    if (!title || !content) return alert("Fill all fields");

    setLoading(true);
    const token = localStorage.getItem("token");

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
      }),
    });

    setLoading(false);

    if (res.ok) {
      // Get user data to redirect to profile
      const userRes = await fetch("/api/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (userRes.ok) {
        const user = await userRes.json();
        router.push(`/profile/${user.username}`);
      } else {
        router.push("/explore"); // fallback
      }
    } else {
      alert("Failed to publish");
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 pt-32 space-y-6">
        <h1 className="text-4xl font-black">Create Post</h1>

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

        <input
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files && uploadImage(e.target.files[0])}
          disabled={uploading}
        />
        {uploading && <p className="text-gray-400">Uploading image...</p>}

        {image && (
          <img src={image} className="rounded-xl max-h-80 object-cover" />
        )}

        <button
          onClick={publish}
          disabled={loading || uploading}
          className="w-full py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 font-semibold hover:scale-[1.02] transition"
        >
          {loading ? "Posting..." : uploading ? "Uploading..." : "Post"}
        </button>
      </main>
    </div>
  );
}
