"use client";

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/button"

export function Navbar({ variant = "default" }: { variant?: "default" | "auth" }) {
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Check if user is authenticated
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    setIsAuthenticated(!!token);
  }, []);

  const handleProfileClick = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    if (token) {
      router.push("/profile/[username]");
    } else {
      router.push("/login");
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 transition-all duration-300 ${
      scrolled 
        ? 'bg-black/80 backdrop-blur-lg border-b border-white/10 shadow-lg' 
        : 'bg-transparent'
    }`}>
      <Link href="/" className="text-2xl font-black group">
        <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent group-hover:from-pink-400 group-hover:to-purple-400 transition-all">
          Blogify
        </span>
      </Link>
      
      {variant === "default" && (
        <div className="flex gap-3 items-center">
          <Link href="/explore">
            <Button variant="ghost" className="text-white hover:text-purple-400 cursor-pointer">
              Explore
            </Button>
          </Link>
          
          {isAuthenticated ? (
            <Button 
              onClick={handleProfileClick}
              className="shadow-lg shadow-purple-500/30 cursor-pointer"
            >
              Profile
            </Button>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" className="cursor-pointer">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="shadow-lg shadow-purple-500/30 cursor-pointer">
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>
      )}
      
      {variant === "auth" && (
        <div className="flex gap-3 items-center">
          {/* Empty space or back button if needed */}
        </div>
      )}
    </nav>
  )
}