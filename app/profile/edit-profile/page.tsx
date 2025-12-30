"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { useToast } from "@/components/Toast";

export default function EditProfilePage() {
  const router = useRouter();
  const { toast, Toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(null);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    // Load current user data
    async function loadUser() {
      try {
        const response = await fetch("/api/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setBio(data.bio || "");
          setAvatar(data.avatar || null);
          setCurrentAvatar(data.avatar || null);
          setUsername(data.username || "");
        }
      } catch (error) {
        console.error("Error loading user:", error);
      }
    }

    loadUser();
  }, [router]);

  async function uploadAvatar(file: File) {
    setUploading(true);
    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const error = await res.json();
        toast(error.error || "Upload failed", "error");
        setUploading(false);
        return;
      }

      const data = await res.json();
      setAvatar(data.url);
      toast("Profile photo uploaded successfully!", "success");
    } catch (error) {
      toast("Failed to upload image", "error");
    } finally {
      setUploading(false);
    }
  }

  async function saveProfile() {
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/edit_profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bio: bio.trim(),
          avatar: avatar,
        }),
      });

      if (res.ok) {
        toast("Profile updated successfully!", "success");
        setTimeout(() => router.push(`/profile/${username}`), 1000);
      } else {
        const error = await res.json();
        toast(error.message || "Failed to update profile", "error");
      }
    } catch (error) {
      toast("Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 pt-32 pb-20 space-y-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black">Edit Profile</h1>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded-full border border-white/20 hover:bg-white/10 transition cursor-pointer"
          >
            Cancel
          </button>
        </div>

        {/* Avatar Section */}
        <div className="space-y-4">
          <label className="text-lg font-semibold">Profile Photo</label>
          <div className="flex items-center gap-6">
            <div className="relative">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-2 border-white/20"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl font-black border-2 border-white/20">
                  {username[0]?.toUpperCase() || "U"}
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files && uploadAvatar(e.target.files[0])}
                disabled={uploading}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500/20 file:text-purple-300 hover:file:bg-purple-500/30 file:cursor-pointer disabled:opacity-50 cursor-pointer"
              />
              <p className="text-xs text-gray-500">
                JPG, PNG or GIF. Max size 10MB.
              </p>
              {avatar && avatar !== currentAvatar && (
                <button
                  onClick={() => {
                    setAvatar(currentAvatar);
                    toast("Photo removed", "info");
                  }}
                  className="text-sm text-red-400 hover:text-red-300 transition cursor-pointer"
                >
                  Remove photo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="space-y-4">
          <label htmlFor="bio" className="text-lg font-semibold">
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={6}
            maxLength={500}
            placeholder="Tell us about yourself..."
            className="w-full bg-white/5 border border-white/20 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
          />
          <p className="text-xs text-gray-500 text-right">
            {bio.length}/500 characters
          </p>
        </div>

        {/* Save Button */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={saveProfile}
            disabled={loading || uploading}
            className="flex-1 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 font-semibold hover:scale-[1.02] transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Saving..." : uploading ? "Uploading..." : "Save Changes"}
          </button>
        </div>
      </main>
      <Toast />
    </div>
  );
}

