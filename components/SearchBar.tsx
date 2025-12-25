"use client";

import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative w-full sm:w-80">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search stories..."
        className="w-full pl-12 pr-4 py-3 rounded-full bg-white/5 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-pink-400"
      />
    </div>
  );
}
