"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";

type User = {
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
};

type Post = {
  _id: string;
  title: string;
  coverImage?: string;
  createdAt: string;
};

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    loadProfile();
  }, [router]);

  async function loadProfile() {
    try {
      const token = localStorage.getItem("token");

      const meRes = await fetch("/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!meRes.ok) throw new Error("Unauthorized");

      const meData = await meRes.json();
      setUser(meData);

      const postsRes = await fetch("/api/posts/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData);
      }
    } catch {
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    document.cookie =
      "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* HEADER */}
      <section className="max-w-6xl mx-auto px-6 pt-28 pb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl font-black">
            {user.username[0].toUpperCase()}
          </div>

          <div>
            <h1 className="text-4xl font-black">{user.username}</h1>
            <p className="text-gray-400 text-sm">{user.email}</p>
            {user.bio && (
              <p className="text-gray-300 mt-2 max-w-md">
                {user.bio}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/profile/edit")}
            className="px-6 py-2 rounded-full border border-white/20 hover:bg-white/10 transition"
          >
            Edit Profile
          </button>

          <button
            onClick={logout}
            className="px-6 py-2 rounded-full border border-red-400/40 text-red-400 hover:bg-red-500/20 transition"
          >
            Logout
          </button>
        </div>
      </section>

      {/* POSTS */}
      <main className="max-w-6xl mx-auto px-6 pb-32">
        <h2 className="text-2xl font-bold mb-6">Your Posts</h2>

        {posts.length === 0 && (
          <p className="text-gray-400">You have not published any posts yet.</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {posts.map((post) => (
            <div
              key={post._id}
              onClick={() => router.push(`/post/${post._id}`)}
              className="relative aspect-square bg-white/5 border border-white/10 rounded-xl overflow-hidden cursor-pointer group"
            >
              {post.coverImage ? (
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                  No image
                </div>
              )}

              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <p className="text-white font-semibold text-center px-3 line-clamp-2">
                  {post.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* CREATE POST */}
      <button
        onClick={() => router.push("/profile/editor")}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white text-3xl flex items-center justify-center shadow-2xl hover:scale-110 transition"
      >
        +
      </button>
    </div>
  );
}
