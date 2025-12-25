"use client";

interface TagCloudProps {
  tags: string[];
  selected: string[];
  onToggle: (tag: string) => void;
}

export default function TagCloud({
  tags,
  selected,
  onToggle,
}: TagCloudProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const active = selected.includes(tag);
        return (
          <button
            key={tag}
            onClick={() => onToggle(tag)}
            className={`px-4 py-1.5 rounded-full text-sm transition-all ${
              active
                ? "bg-pink-500 text-white"
                : "bg-white/5 text-gray-300 hover:bg-white/10"
            }`}
          >
            #{tag}
          </button>
        );
      })}
    </div>
  );
}
