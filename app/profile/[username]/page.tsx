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
  content: string;
  coverImage?: string;
  createdAt: Date;
};

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingBio, setSavingBio] = useState(false);

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

      const res = await fetch("/api/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Unauthorized");

      const data = await res.json();
      setUser(data);
      setBio(data.bio || "");

      const postsRes = await fetch("/api/posts?author=me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(Array.isArray(postsData) ? postsData : []);
      }
    } catch (err) {
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

  async function saveBio() {
    setSavingBio(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bio }),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
      }
    } finally {
      setSavingBio(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-black to-pink-900 opacity-40" />
      <div className="relative z-10">
        <Navbar />

        {/* HEADER */}
        <section className="max-w-7xl mx-auto px-6 pt-28 pb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-6">
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

          <button
            onClick={logout}
            className="px-6 py-2 rounded-full border border-white/20 text-gray-300 hover:bg-red-500/20 hover:border-red-400 transition"
          >
            Logout
          </button>
        </section>

        {/* CONTENT */}
        <main className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 pb-32">
          {/* LEFT */}
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="font-semibold mb-3">Bio</h3>

              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full rounded-xl bg-black/40 border border-white/20 p-3 text-sm"
              />

              <button
                onClick={saveBio}
                disabled={savingBio}
                className="mt-4 w-full py-2 rounded-full bg-pink-600 hover:bg-pink-500 transition"
              >
                {savingBio ? "Saving..." : "Save Bio"}
              </button>
            </div>
          </div>

          {/* POSTS GRID */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Posts</h2>

            {posts.length === 0 && (
              <p className="text-gray-400">
                You haven’t posted anything yet.
              </p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
              {posts.map((post) => (
                <div
                  key={post._id}
                  onClick={() =>
                    router.push(`/explore?post=${post._id}`)
                  }
                  className="relative aspect-square bg-white/5 border border-white/10 overflow-hidden cursor-pointer group"
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
          </div>
        </main>

        {/* FLOATING + BUTTON */}
        <button
          onClick={() => router.push("/profile/editor")}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white text-3xl flex items-center justify-center shadow-2xl hover:scale-110 transition"
        >
          +
        </button>
      </div>
    </div>
  );
}
