"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut, User, Home, Search, Plus } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

type UserInfo = {
  _id: string;
  username: string;
};

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setIsLoggedIn(!!token);

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUser({ _id: payload.id || payload.userId || payload._id, username: payload.username });
      } catch (e) {
        console.error("Invalid token");
        setIsLoggedIn(false);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    setCurrentUser(null);
    router.push("/");
  };

  return (
    <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <Link href="/" className="text-2xl font-bold text-black dark:text-white hover:text-indigo-400 transition">
            BlogPlatform
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/explore"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                pathname === "/explore"
                  ? "bg-indigo-500/20 text-indigo-400"
                  : "text-gray-700 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800"
              }`}
            >
              <Search className="w-4 h-4" />
              Explore
            </Link>

            {isLoggedIn && currentUser && (
              <>
                <Link
                  href={`/profile/${currentUser.username}`}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                    pathname === `/profile/${currentUser.username}`
                      ? "bg-indigo-500/20 text-indigo-400"
                      : "text-gray-700 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
              </>
            )}
          </nav>

          {/* Auth Section */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {isLoggedIn && currentUser ? (
              <div className="flex items-center gap-4">
                <span className="text-gray-700 dark:text-slate-300 hidden sm:block">
                  Welcome, <span className="text-indigo-400 font-medium">{currentUser.username}</span>
                </span>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-black dark:hover:text-white"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => router.push("/login")}
                  variant="outline"
                  size="sm"
                  className="border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-black dark:hover:text-white"
                >
                  Login
                </Button>
                <Button
                  onClick={() => router.push("/register")}
                  size="sm"
                  className="bg-indigo-500 hover:bg-indigo-600"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}