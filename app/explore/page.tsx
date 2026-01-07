"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import PostModal from "@/components/PostModal";
import { Search, Plus, Filter, ChevronDown } from "lucide-react";

type Post = {
  _id: string;
  title: string;
  content: string;
  coverImage?: string;
  author: { username: string; avatar?: string };
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

  // Modal state
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<string>("");

  // Auth guard
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    // Get current username from API
    async function fetchUser() {
      try {
        const response = await fetch("/api/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.username) {
          setCurrentUsername(data.username);
          setCurrentUserId(data.id);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    }

    setIsAuthenticated(true);
    fetchUser();
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadPosts();
    
    const handleFocus = () => loadPosts();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [isAuthenticated]);

  async function loadPosts() {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/posts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  // Update a specific post in the local state (passed to Modal)
  const handlePostUpdate = (updatedPost: Post | null) => {
    if (!updatedPost) return;
    setPosts((prevPosts) =>
      prevPosts.map((p) => (p._id === updatedPost._id ? updatedPost : p))
    );
    // Also update the selected post so the modal stays in sync
    setSelectedPost(updatedPost);
  };

  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags || [])));

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
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function handlePostClick(post: Post) {
    setSelectedPost(post);
    document.body.style.overflow = "hidden";
  }

  function handleCloseModal() {
    setSelectedPost(null);
    document.body.style.overflow = "unset";
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

        {/* --- CONTROL BAR --- */}
        <section className="sticky top-20 z-20 backdrop-blur-xl bg-black/60 border-y border-white/10 shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Left Side: Sort Dropdown */}
            <div className="relative w-full md:w-auto group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Filter size={16} />
              </div>
              <select
                value={sort}
                onChange={(e) =>
                  setSort(e.target.value as "latest" | "likes")
                }
                className="w-full md:w-48 appearance-none bg-white/5 hover:bg-white/10 border border-white/10 rounded-full py-2.5 pl-10 pr-10 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-all cursor-pointer"
              >
                <option value="latest" className="bg-gray-900">Latest Posts</option>
                <option value="likes" className="bg-gray-900">Most Liked</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <ChevronDown size={16} />
              </div>
            </div>

            {/* Right Side: Search & Create Button */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search topics..."
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 transition-all"
                />
              </div>

              <button
                onClick={() => router.push("/profile/editor")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold shadow-lg shadow-purple-500/20 transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">Create</span>
              </button>
            </div>
          </div>

          {/* Tags */}
          {allTags.length > 0 && (
            <div className="max-w-7xl mx-auto px-6 pb-4 pt-2 border-t border-white/5">
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        active
                          ? "bg-pink-500 text-white shadow-lg shadow-pink-500/25"
                          : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        <main className="max-w-7xl mx-auto px-6 py-16">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white/5 border border-white/10 rounded-3xl p-6 animate-pulse"
                >
                  <div className="w-full h-48 bg-white/10 rounded-2xl mb-4" />
                  <div className="h-6 bg-white/10 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-white/10 rounded w-full mb-2" />
                  <div className="h-4 bg-white/10 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <div
                  key={post._id}
                  onClick={() => handlePostClick(post)}
                  className="group bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-pink-500/30 hover:shadow-2xl hover:shadow-pink-500/10 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                >
                  {post.coverImage && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      {/* Floating Category Badge (First Tag) */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-xs font-medium text-white">
                            #{post.tags[0]}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-pink-400 transition-colors">
                      {post.title}
                    </h3>

                    <p className="text-gray-400 text-sm line-clamp-3 mb-4 leading-relaxed">
                      {post.content}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        {post.author.avatar ? (
                          <img
                            src={post.author.avatar}
                            alt={post.author.username}
                            className="w-8 h-8 rounded-full object-cover border border-white/20"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                            {post.author.username[0].toUpperCase()}
                          </div>
                        )}
                        <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                          {post.author.username}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <span>❤️ {post.likes.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        <footer className="border-t border-white/10 py-10 text-center text-gray-400">
          © {new Date().getFullYear()} Blogify — Discover great writing
        </footer>
      </div>

      {selectedPost && (
        <PostModal
          post={selectedPost}
          onClose={handleCloseModal}
          currentUsername={currentUsername}
          currentUserId={currentUserId}
          onPostUpdated={handlePostUpdate}
        />
      )}
    </div>
  );
}