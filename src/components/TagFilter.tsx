'use client';

interface TagFilterProps {
  tags: string[];
  active: string;
  onChange: (tag: string) => void;
}

export default function TagFilter({ tags, active, onChange }: TagFilterProps) {
  if (tags.length === 0) return null;

  return (
    <div className="flex gap-1.5 px-4 py-2.5 overflow-x-auto scrollbar-hide">
      <button
        onClick={() => onChange('')}
        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all active:scale-95 ${
          active === ''
            ? 'bg-red-500 border-red-500 text-white'
            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 hover:border-zinc-400 dark:hover:border-zinc-600'
        }`}
      >
        All Tags
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => onChange(tag)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all active:scale-95 ${
            active === tag
              ? 'bg-red-500 border-red-500 text-white'
              : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 hover:border-zinc-400 dark:hover:border-zinc-600'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
