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
      
      // Fetch user data
      const res = await fetch("/api/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Unauthorized");
      }

      const data = await res.json();
      setUser(data);
      setBio(data.bio || "");

      // Fetch user's posts
      try {
        const postsRes = await fetch("/api/posts?author=me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (postsRes.ok) {
          const postsData = await postsRes.json();
          // Ensure postsData is an array
          setPosts(Array.isArray(postsData) ? postsData : []);
        } else {
          // If endpoint doesn't exist or returns error, set empty array
          setPosts([]);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
        setPosts([]);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
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
        alert("Bio saved successfully!");
      } else {
        alert("Failed to save bio");
      }
    } catch (error) {
      console.error("Error saving bio:", error);
      alert("Failed to save bio");
    } finally {
      setSavingBio(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-black to-pink-900 opacity-40" />

      <div className="relative z-10">
        <Navbar />

        {/* Header */}
        <section className="max-w-7xl mx-auto px-6 pt-28 pb-12 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black mb-2">
              {user.username}
            </h1>
            <p className="text-gray-400">{user.email}</p>
          </div>

          <button
            onClick={logout}
            className="px-6 py-2 rounded-full bg-white/5 border border-white/20 text-gray-300 hover:bg-red-500/20 hover:border-red-400 transition"
          >
            Logout
          </button>
        </section>

        {/* Profile Content */}
        <main className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 pb-20">
          {/* Left Column */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-3">Bio</h3>

              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={5}
                className="w-full rounded-xl bg-black/40 border border-white/20 p-3 text-sm text-white focus:outline-none focus:border-pink-400"
                placeholder="Tell people about yourself..."
              />

              <button
                onClick={saveBio}
                disabled={savingBio}
                className="mt-4 w-full py-2 rounded-full bg-pink-600 hover:bg-pink-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingBio ? "Saving..." : "Save Bio"}
              </button>
            </div>

            {/* Image Upload Placeholder */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-3">
                Profile Picture
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Upload images using UploadThing or Cloudinary
              </p>

              {/* Upload button goes here */}
              <button className="w-full py-2 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition">
                Upload Image
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Your Posts</h2>

              <button
                onClick={() => router.push("/create")}
                className="px-6 py-2 rounded-full bg-purple-600 hover:bg-purple-500 transition"
              >
                New Post
              </button>
            </div>

            {posts.length === 0 && (
              <p className="text-gray-400">
                You haven't published any posts yet.
              </p>
            )}

            <div className="grid gap-6">
              {posts.map((post) => (
                <div
                  key={post._id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-pink-400/50 transition cursor-pointer"
                  onClick={() => router.push(`/posts/${post._id}`)}
                >
                  {post.coverImage && (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-48 object-cover rounded-xl mb-4"
                    />
                  )}
                  <h3 className="text-xl font-semibold mb-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-400 line-clamp-2">
                    {post.content}
                  </p>
                  <p className="text-xs text-gray-500 mt-3">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}