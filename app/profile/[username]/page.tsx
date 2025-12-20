"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { SearchBar } from "@/components/SearchBar";
import { PostEditor } from "@/components/PostEditor";
import { PostCard } from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Plus, User as UserIcon, Calendar, MapPin, Search, X } from "lucide-react";

type AuthorDto = {
  _id: string;
  username: string;
  bio?: string;
  avatar?: string;
  createdAt?: string;
};

type PostDto = {
  _id: string;
  title: string;
  content: string;
  author?: AuthorDto;
  tags: string[];
  likes: string[];
  comments: string[];
  coverImage?: string;
  createdAt: string;
};

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;

  const [user, setUser] = useState<AuthorDto | null>(null);
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<PostDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthorDto | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setIsLoggedIn(!!token);
    if (token) {
      // Decode token to get current user
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUser({ _id: payload.id, username: payload.username });
      } catch (e) {
        console.error("Invalid token");
      }
    }
    fetchUserAndPosts();
  }, [username]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = posts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredPosts(filtered);
    } else {
      setFilteredPosts(posts);
    }
  }, [posts, searchQuery]);

  const fetchUserAndPosts = async () => {
    try {
      // Fetch user info
      const userRes = await fetch(`/api/users/${username}`);
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.user);
      } else if (userRes.status === 404) {
        // If not found, and it's the current user, create a default profile
        if (currentUser && currentUser.username === username) {
          setUser({
            _id: currentUser._id,
            username: currentUser.username,
            bio: "Welcome to my profile!",
            avatar: undefined,
            createdAt: new Date().toISOString(),
          });
        } else {
          setUser(null);
          setLoading(false);
          return;
        }
      }

      // Fetch user's posts
      const isOwnProfile = currentUser && currentUser.username === username;
      const postsRes = await fetch(`/api/posts?author=${username}${isOwnProfile ? '&includePrivate=true' : ''}`);
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData.posts || []);
      }
    } catch (err) {
      console.error(err);
      setUser(null);
    }
    setLoading(false);
  };

  const handleCreatePost = async (title: string, content: string, coverImage: string, tags: string[], published: boolean) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content, coverImage, tags, published }),
      });

      if (res.ok) {
        const data = await res.json();
        setPosts([data.post, ...posts]);
        setShowEditor(false);
      }
    } catch (err) {
      console.error("Error creating post:", err);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-8">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-300">Loading profile...</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Card className="bg-slate-800/50 border-slate-700 max-w-md mx-auto">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">User Not Found</h2>
              <p className="text-slate-400 mb-6">
                The user <span className="text-indigo-400 font-medium">@{username}</span> doesn't exist or may have been deleted.
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => router.push("/explore")}
                  className="bg-indigo-500 hover:bg-indigo-600"
                >
                  Explore Posts
                </Button>
                <Button
                  onClick={() => router.push("/")}
                  variant="outline"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser.username === username;

  return (
    <div className="min-h-screen">
      {/* Profile Cover/Banner */}
      <div className="h-48 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative">
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="container mx-auto px-4 -mt-16 relative z-10">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-slate-800/95 backdrop-blur border-slate-700 shadow-2xl">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center border-4 border-slate-800 shadow-lg">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.username} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <UserIcon className="w-16 h-16 text-white" />
                    )}
                  </div>
                  {isOwnProfile && (
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-slate-800 flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full" />
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h1 className="text-4xl font-bold text-white mb-2">{user.username}</h1>
                      {user.bio && <p className="text-slate-300 text-lg mb-4 max-w-2xl">{user.bio}</p>}
                      <div className="flex items-center gap-6 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Joined {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4" />
                          {posts.length} posts
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    {isOwnProfile && (
                      <Button
                        onClick={() => setShowEditor(true)}
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-lg hover:shadow-indigo-500/50 transition-all duration-300"
                        size="lg"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Create Post
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <SearchBar onSearch={handleSearch} placeholder="Search posts..." />
        </motion.div>

        {/* Post Editor Modal */}
        {showEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowEditor(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl"
            >
              <Card className="bg-slate-800/95 backdrop-blur border-slate-700 shadow-2xl max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                  <h2 className="text-2xl font-bold text-white">Create New Post</h2>
                  <button
                    onClick={() => setShowEditor(false)}
                    className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
                <CardContent className="p-6 max-h-[calc(90vh-80px)] overflow-y-auto">
                  <PostEditor
                    onSave={handleCreatePost}
                    onCancel={() => setShowEditor(false)}
                    submitLabel="Publish Post"
                  />
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* Posts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {filteredPosts.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  {searchQuery ? (
                    <Search className="w-8 h-8 text-slate-400" />
                  ) : (
                    <Plus className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {searchQuery ? "No posts found" : "No posts yet"}
                </h3>
                <p className="text-slate-400 mb-6">
                  {searchQuery
                    ? `No posts match your search for "${searchQuery}".`
                    : isOwnProfile
                      ? "Create your first post to get started!"
                      : `${user.username} hasn't published any posts yet.`
                  }
                </p>
                {isOwnProfile && !searchQuery && (
                  <Button
                    onClick={() => setShowEditor(true)}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-lg hover:shadow-indigo-500/50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Post
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PostCard post={post} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}