"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import PostList from "@/components/PostList";
import SearchBar from "@/components/SearchBar";
import TagCloud from "@/components/TagCloud";

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

export default function ExplorePage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"latest" | "likes">("latest");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Auth guard
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    setIsAuthenticated(true);
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    async function load() {
      setLoading(true);

      const mockPosts: Post[] = [
        {
          _id: "1",
          title: "Building a Blog Platform with Next.js",
          content:
            "Learn how to structure a scalable blog using Next.js, MongoDB, and modern authentication patterns.",
          coverImage:
            "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=450&fit=crop",
          author: { username: "nikola" },
          createdAt: new Date(Date.now() - 2 * 86400000),
          likes: Array(23).fill(null),
          tags: ["nextjs", "mongodb"],
        },
        {
          _id: "2",
          title: "Modern React Patterns in 2025",
          content:
            "Discover the latest React patterns and best practices shaping modern web development.",
          coverImage:
            "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop",
          author: { username: "sarah_dev" },
          createdAt: new Date(Date.now() - 5 * 86400000),
          likes: Array(45).fill(null),
          tags: ["react"],
        },
        {
          _id: "3",
          title: "MongoDB Schema Design for Scale",
          content:
            "A deep dive into MongoDB schema design patterns, indexing strategies, and performance optimization.",
          coverImage:
            "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=450&fit=crop",
          author: { username: "alex_db" },
          createdAt: new Date(Date.now() - 1 * 86400000),
          likes: Array(12).fill(null),
          tags: ["mongodb", "database"],
        },
      ];

      setTimeout(() => {
        setPosts(mockPosts);
        setLoading(false);
      }, 600);
    }

    load();
  }, [isAuthenticated]);

  const allTags = Array.from(
    new Set(posts.flatMap((p) => p.tags || []))
  );

  const filteredPosts = posts
    .filter((post) => {
      if (!search) return true;
      return (
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.content.toLowerCase().includes(search.toLowerCase())
      );
    })
    .filter((post) => {
      if (selectedTags.length === 0) return true;
      return post.tags?.some((t) => selectedTags.includes(t));
    })
    .sort((a, b) => {
      if (sort === "likes") {
        return b.likes.length - a.likes.length;
      }
      return (
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
      );
    });

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-black to-pink-900 opacity-40" />

      <div className="relative z-10">
        <Navbar />

        <section className="max-w-7xl mx-auto px-6 pt-28 pb-12">
          <h1 className="text-6xl font-black mb-4">Explore</h1>
          <p className="text-gray-400 text-lg">
            Discover stories, ideas, and creators worth following
          </p>
        </section>

        <section className="sticky top-20 z-20 backdrop-blur-md bg-black/40 border-y border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <select
              value={sort}
              onChange={(e) =>
                setSort(e.target.value as "latest" | "likes")
              }
              className="w-40 rounded-full bg-white/5 border border-white/20 px-4 py-2 text-sm text-white focus:outline-none focus:border-pink-400"
            >
              <option value="latest">Latest</option>
              <option value="likes">Most liked</option>
            </select>

            <SearchBar value={search} onChange={setSearch} />
          </div>

          {allTags.length > 0 && (
            <div className="max-w-7xl mx-auto px-6 pb-4">
              <TagCloud
                tags={allTags}
                selected={selectedTags}
                onToggle={toggleTag}
              />
            </div>
          )}
        </section>

        <main className="max-w-7xl mx-auto px-6 py-16">
          <PostList posts={filteredPosts} loading={loading} />
        </main>

        <footer className="border-t border-white/10 py-10 text-center text-gray-400">
          © {new Date().getFullYear()} Blogify — Discover great writing
        </footer>
      </div>
    </div>
  );
}