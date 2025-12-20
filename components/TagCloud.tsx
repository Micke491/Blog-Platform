"use client";

type TagCloudProps = {
  tags: { name: string; count: number }[];
  onTagClick?: (tag: string) => void;
  selectedTag?: string;
};

export function TagCloud({ tags, onTagClick, selectedTag }: TagCloudProps) {
  if (tags.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        No tags available
      </div>
    );
  }

  const maxCount = Math.max(...tags.map((t) => t.count));

  return (
    <div className="flex flex-wrap gap-3">
      {tags.map((tag) => {
        const scale = 0.7 + (tag.count / maxCount) * 0.6;
        const isSelected = selectedTag === tag.name;

        return (
          <button
            key={tag.name}
            onClick={() => onTagClick?.(tag.name)}
            style={{ fontSize: `${scale}rem` }}
            className={`px-4 py-2 rounded-full transition ${
              isSelected
                ? "bg-indigo-500 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            #{tag.name}
            <span className="ml-2 text-xs opacity-70">({tag.count})</span>
          </button>
        );
      })}
    </div>
  );
}