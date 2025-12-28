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
  
  // Modal state
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string>("");

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
            "Authorization": `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.username) {
          setCurrentUsername(data.username);
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

    async function load() {
      setLoading(true);

      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/posts", {
          headers: {
            "Authorization": `Bearer ${token}`,
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

  function handlePostClick(post: Post) {
    setSelectedPost(post);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  }

  function handleCloseModal() {
    setSelectedPost(null);
    // Restore body scroll
    document.body.style.overflow = 'unset';
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

            {/* SearchBar - You'll need to uncomment this in your actual app */}
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts..."
              className="flex-1 max-w-md rounded-full bg-white/5 border border-white/20 px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-pink-400"
            />
          </div>

          {allTags.length > 0 && (
            <div className="max-w-7xl mx-auto px-6 pb-4">
              {/* TagCloud - You'll need to uncomment this in your actual app */}
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                        active
                          ? "bg-pink-500 text-white"
                          : "bg-white/5 text-gray-300 hover:bg-white/10"
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
          {/* PostList - You'll need to import and use your actual component */}
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
                  className="group bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-pink-400/50 hover:shadow-2xl hover:shadow-pink-500/20 transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
                >
                  {post.coverImage && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                  )}

                  <div className="p-6">
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-pink-400 transition-colors">
                      {post.title}
                    </h3>

                    <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                      {post.content}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                          {post.author.username[0].toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-400">
                          {post.author.username}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-400 text-sm">
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

      {/* Post Modal */}
      {selectedPost && (
        <PostModal
          post={selectedPost}
          onClose={handleCloseModal}
          currentUsername={currentUsername}
        />
      )}
    </div>
  );
}

// PostModal Component (inline for demo)
import { X, Heart, MessageCircle, Send } from "lucide-react";

function PostModal({ post, onClose, currentUsername }: { post: Post | null; onClose: () => void; currentUsername?: string }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!post) return;
    setLikeCount(post.likes.length);
    setLiked(false);
    
    // Fetch comments from API
    async function fetchComments() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/posts/${post!._id}/comment`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setComments(data.comments || []);
      } catch (error) {
        console.error("Error fetching comments:", error);
        setComments([]);
      }
    }
    
    fetchComments();
  }, [post]);

  if (!post) return null;

  const handleLike = async () => {
    if (!post) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/posts/${post!._id}/like`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setLikeCount(data.likes);
      setLiked(!liked);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || isSubmitting || !post) return;
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/posts/${post!._id}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment }),
      });
      const data = await response.json();
      if (data.comment) {
        setComments([data.comment, ...comments]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-gradient-to-br from-gray-900 to-black rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white/80 hover:text-white transition-all"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
          {post.coverImage && (
            <div className="md:w-1/2 bg-black flex items-center justify-center">
              <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className={`${post.coverImage ? 'md:w-1/2' : 'w-full'} flex flex-col`}>
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  {post.author.username[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-white">{post.author.username}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-3">{post.title}</h2>

              {post.tags && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full text-xs bg-purple-500/20 text-purple-300">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-6 pt-3">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 transition-all ${liked ? "text-pink-500" : "text-gray-400 hover:text-pink-400"}`}
                >
                  <Heart size={22} fill={liked ? "currentColor" : "none"} />
                  <span className="font-semibold">{likeCount}</span>
                </button>
                <div className="flex items-center gap-2 text-gray-400">
                  <MessageCircle size={22} />
                  <span className="font-semibold">{comments.length}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>

              <div className="border-t border-white/10 pt-6">
                <h3 className="text-lg font-bold text-white mb-4">Comments ({comments.length})</h3>
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment._id} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                          {comment.author.username[0].toUpperCase()}
                        </div>
                        <p className="font-semibold text-white text-sm">{comment.author.username}</p>
                      </div>
                      <p className="text-gray-300 text-sm">{comment.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-white/10 bg-black/50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
                  placeholder="Add a comment..."
                  className="flex-1 px-4 py-3 rounded-full bg-white/5 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-pink-400"
                />
                <button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim()}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}