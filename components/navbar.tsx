"use client";

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      
      <div className="flex gap-3 items-center">
        <Link href="/explore">
          <Button variant="ghost" className="text-white hover:text-purple-400 cursor-pointer">
            Explore
          </Button>
        </Link>
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
      </div>
    </nav>
  )
}