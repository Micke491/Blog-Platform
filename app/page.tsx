"use client";

import { useRef, useEffect } from "react";
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/button"
import Link from "next/link"

export default function HomePage() {
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.innerWidth < 768) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (orbRef.current) {
        orbRef.current.style.left = `${e.clientX - 192}px`;
        orbRef.current.style.top = `${e.clientY - 192}px`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    { icon: "✍️", title: "Rich Editor", desc: "Create beautiful posts with our intuitive editor" },
    { icon: "📸", title: "Photo Stories", desc: "Share moments through stunning visuals" },
    { icon: "💬", title: "Engage", desc: "Connect through comments and reactions" },
    { icon: "📊", title: "Analytics", desc: "Track your content performance" }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden"> {/* Prevent horizontal scroll */}
      {/* Animated gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-black to-pink-900 opacity-50"></div>
      
      {/* Moving gradient orbs - Hidden on mobile (hidden md:block) for performance and UI clarity */}
      <div 
        ref={orbRef}
        className="hidden md:block fixed w-96 h-96 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 blur-3xl opacity-20 pointer-events-none transition-transform duration-100 ease-out"
        style={{ left: '-50%', top: '-50%' }}
      ></div>
      
      {/* Mobile-only static glow to replace the moving orb */}
      <div className="md:hidden absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-600 blur-[100px] opacity-20 pointer-events-none"></div>
      
      <div className="relative z-10">
        <Navbar variant="default" />
        
        {/* Adjusted padding: smaller on mobile (px-4), larger on desktop */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16 md:pb-32">
          
          {/* Hero Section */}
          <div className="text-center mb-16 md:mb-32">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-6 md:mb-8 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-xs md:text-sm font-medium">Join 10,000+ creators today</span>
            </div>
            
            {/* H1: Responsive text size (text-5xl -> text-8xl) */}
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-black mb-6 leading-tight tracking-tight">
              <span className="inline-block hover:scale-110 transition-transform cursor-default">Your</span>{" "}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent inline-block hover:scale-110 transition-transform cursor-default">Voice</span>
              <br className="hidden md:block" /> {/* Break line differently on mobile vs desktop */}
              <span className="inline-block hover:scale-110 transition-transform cursor-default"> Amplified</span>
            </h1>
            
            {/* Paragraph: Responsive text size and width */}
            <p className="text-lg md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8 md:mb-12 leading-relaxed px-2">
              Create, share, and discover stories that matter. Build your audience and connect with readers who care.
            </p>
            
            {/* Buttons: Stack vertically on mobile (flex-col), row on desktop */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mb-16">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-lg h-14 md:h-16 px-10 group relative overflow-hidden cursor-pointer">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Start Creating
                    <span className="group-hover:translate-x-2 transition-transform">→</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Button>
              </Link>
              <Link href="/explore" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 md:h-16 px-10 bg-white/5 backdrop-blur-sm border-white/30 hover:bg-white hover:text-black cursor-pointer">
                  Explore Stories
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          {/* Adjusted margins and gaps for mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-16 md:mb-32">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group p-6 md:p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all duration-300 cursor-pointer active:scale-95 md:active:scale-100 hover:-translate-y-1 md:hover:-translate-y-2"
              >
                <div className="text-4xl md:text-5xl mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-sm md:text-base text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-90"></div>
            {/* Reduced padding for mobile (p-8 vs p-16) */}
            <div className="relative z-10 p-8 md:p-16 text-center">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">Ready to share your story?</h2>
              <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join thousands of writers who are already building their audience on Blogify.
              </p>
              <Link href="/register" className="block w-full sm:inline-block sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-lg h-14 md:h-16 px-12 bg-black hover:bg-gray-900 text-white border-2 border-white/20">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 py-8 md:py-12 text-center text-gray-400 text-sm md:text-base">
            <p>© {new Date().getFullYear()} Blogify. Made with heart for creators.</p>
        </footer>
      </div>
    </div>
  );
}