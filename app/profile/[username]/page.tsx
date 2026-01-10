"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import PostList from "@/components/PostList";

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
  author: { username: string };
  createdAt: Date;
  likes: any[];
  tags?: string[];
};

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadProfile() {
    try {
      const token = localStorage.getItem("token");

      const meRes = await fetch("/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!meRes.ok) throw new Error("Unauthorized");

      const meData = await meRes.json();
      setUser(meData);

      const postsRes = await fetch(
        `/api/posts?author=${meData.username}&includePrivate=true`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData.posts || []);
      }
    } catch {
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    loadProfile();

    // Refetch posts when window regains focus
    const handleFocus = () => loadProfile();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [router]);

  function logout() {
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
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
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.username}
              className="w-24 h-24 rounded-full object-cover border-2 border-white/20"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl font-black">
              {user.username[0].toUpperCase()}
            </div>
          )}

          <div>
            <h1 className="text-4xl font-black">{user.username}</h1>
            <p className="text-gray-400 text-sm">{user.email}</p>
            {user.bio && (
              <p className="text-gray-300 mt-2 max-w-md">{user.bio}</p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/profile/edit-profile")}
            className="px-6 py-2 rounded-full border border-white/20 hover:bg-white/10 transition cursor-pointer"
          >
            Edit Profile
          </button>

          <button
            onClick={logout}
            className="px-6 py-2 rounded-full border border-red-400/40 text-red-400 hover:bg-red-500/20 transition cursor-pointer"
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

        <PostList
          posts={posts}
          loading={loading}
          onPostClick={(post) => router.push(`/post/${post._id}`)}
        />
      </main>

      {/* CREATE POST */}
      <button
        onClick={() => router.push("/profile/editor")}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white text-3xl flex items-center justify-center shadow-2xl hover:scale-110 transition cursor-pointer"
      >
        +
      </button>
    </div>
  );
}
