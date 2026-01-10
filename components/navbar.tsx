"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/button";
import { Menu, X } from "lucide-react";

export function Navbar({
  variant = "default",
}: {
  variant?: "default" | "auth";
}) {
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setIsAuthenticated(!!token);
  }, []);

  // Uklonio sam useEffect za overflow:hidden jer za dropdown obično želimo da korisnik može da skroluje

  const handleProfileClick = () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      router.push("/profile/[username]");
    } else {
      router.push("/login");
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || mobileMenuOpen // Dodao sam da ostane tamna pozadina i kad je meni otvoren
          ? "bg-black/80 backdrop-blur-lg border-b border-white/10 shadow-lg"
          : "bg-transparent"
      }`}
    >
      {/* Glavni kontejner za gornji deo (Logo i Dugmići) */}
      <div className="flex items-center justify-between px-4 sm:px-8 py-4">
        <Link href="/" className="text-xl sm:text-2xl font-black group">
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent group-hover:from-pink-400 group-hover:to-purple-400 transition-all">
            Blogify
          </span>
        </Link>

        {variant === "default" && (
          <>
            {/* Desktop Menu */}
            <div className="hidden md:flex gap-3 items-center">
              <Link href="/explore">
                <Button
                  variant="ghost"
                  className="text-white hover:text-purple-400 cursor-pointer"
                >
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

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white hover:text-purple-400 transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </>
        )}
      </div>

      {/* Mobile Menu Dropdown Sekcija */}
      {/* Promenjeno: Absolute positioning umesto fixed overlay */}
      {variant === "default" && mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-black/95 backdrop-blur-xl border-b border-white/10 shadow-2xl md:hidden flex flex-col p-4 gap-4 animate-in slide-in-from-top-5 fade-in duration-200">
          <Link
            href="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full"
          >
            <Button
              variant="ghost"
              className="text-white hover:text-purple-400 cursor-pointer text-lg w-full justify-start"
            >
              Explore
            </Button>
          </Link>

          {isAuthenticated ? (
            <Button
              onClick={handleProfileClick}
              className="shadow-lg shadow-purple-500/30 cursor-pointer text-lg w-full"
            >
              Profile
            </Button>
          ) : (
            <div className="flex flex-col gap-3 w-full">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full"
              >
                <Button
                  variant="outline"
                  className="cursor-pointer text-lg w-full"
                >
                  Login
                </Button>
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full"
              >
                <Button className="shadow-lg shadow-purple-500/30 cursor-pointer text-lg w-full">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
