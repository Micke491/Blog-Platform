"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/button"
import Link from "next/link"

export default function HomePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
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

  const trendingTopics = ["Technology", "Travel", "Lifestyle", "Food", "Art", "Music"];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-black to-pink-900 opacity-50"></div>
      
      {/* Moving gradient orbs */}
      <div 
        className="fixed w-96 h-96 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 blur-3xl opacity-20 transition-all duration-1000 ease-out"
        style={{
          left: `${mousePosition.x - 192}px`,
          top: `${mousePosition.y - 192}px`,
          pointerEvents: 'none'
        }}
      ></div>
      
      <div className="relative z-10">
        <Navbar variant="default" />
        
        <main className="max-w-7xl mx-auto px-6 pt-24 pb-32">
          {/* Hero Section */}
          <div className="text-center mb-32">
            <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-sm font-medium">Join 10,000+ creators today</span>
            </div>
            
            <h1 className="text-8xl font-black mb-6 leading-tight">
              <span className="inline-block hover:scale-110 transition-transform cursor-default">Your</span>{" "}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent inline-block hover:scale-110 transition-transform cursor-default">Voice</span>
              <br/>
              <span className="inline-block hover:scale-110 transition-transform cursor-default">Amplified</span>
            </h1>
            
            <p className="text-2xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
              Create, share, and discover stories that matter. Build your audience and connect with readers who care about what you have to say.
            </p>
            
            <div className="flex justify-center gap-6 mb-16">
              <Link href="/register">
                <Button size="lg" className="text-lg h-16 px-10 group relative overflow-hidden cursor-pointer">
                  <span className="relative z-10 flex items-center gap-2">
                    Start Creating
                    <span className="group-hover:translate-x-2 transition-transform">→</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Button>
              </Link>
              <Link href="/explore">
                <Button size="lg" variant="outline" className="text-lg h-16 px-10 bg-white/5 backdrop-blur-sm border-white/30 hover:bg-white hover:text-black cursor-pointer">
                  Explore Stories
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-32">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all duration-300 cursor-pointer hover:-translate-y-2"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-90"></div>
            <div className="relative z-10 p-16 text-center">
              <h2 className="text-5xl font-bold mb-6">Ready to share your story?</h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join thousands of writers who are already building their audience on Blogify.
              </p>
              <Link href="/register">
                <Button size="lg" className="text-lg h-16 px-12 bg-black hover:bg-gray-900 text-white border-2 border-white/20">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 py-12 text-center text-gray-400">
            <p>© {new Date().getFullYear()} Blogify. Made with heart for creators.</p>
        </footer>
      </div>
    </div>
  );
}