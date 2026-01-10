"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import PostModal from "@/components/PostModal";

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

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUsername, setCurrentUsername] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<string>("");

  // Auth guard
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    setIsAuthenticated(true);

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

    fetchUser();
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated || !params.id) return;

    async function loadPost() {
      setLoading(true);

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/posts/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setPost(data.post);
        } else {
          router.replace("/explore");
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        router.replace("/explore");
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, [isAuthenticated, params.id, router]);

  const handleClose = () => {
    router.push("/explore");
  };

  // Loading State
  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          {/* Added a spinner for better UX */}
          <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Not Found State
  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
          <div className="text-white text-xl font-bold">Post not found</div>
          <button
            onClick={() => router.push("/explore")}
            className="text-purple-400 hover:text-purple-300 underline"
          >
            Go back to Explore
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Navbar />

      <PostModal
        post={post}
        onClose={handleClose} // Uses the safe navigation logic
        currentUsername={currentUsername}
        currentUserId={currentUserId}
        // If the user deletes the post while on its specific page, redirect to explore
        onPostUpdated={(updatedPost) => {
          if (updatedPost === null) {
            router.push("/explore");
          } else {
            setPost(updatedPost);
          }
        }}
      />
    </div>
  );
}
