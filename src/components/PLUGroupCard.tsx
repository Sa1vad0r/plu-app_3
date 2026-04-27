'use client';

import { getCategoryIcon } from '@/types/plu';
import { PLUGroup, getVariantSuffix } from '@/lib/grouping';

interface PLUGroupCardProps {
  group: PLUGroup;
  query: string;
  onClick: () => void;
}

export default function PLUGroupCard({ group, query, onClick }: PLUGroupCardProps) {
  // Build a short preview of variant suffixes (e.g. "Bone In · Boneless · Thin …")
  const previews = group.items
    .slice(0, 4)
    .map((item) => getVariantSuffix(item.name, group.key.split('|')[1]))
    .filter(Boolean);
  const previewText = previews.join(' · ') + (group.items.length > 4 ? ' …' : '');

  return (
    <button
      onClick={onClick}
      className="w-full flex gap-3 items-start p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 active:scale-[0.985] transition-all text-left"
    >
      {/* Icon */}
      <div className="w-14 h-14 rounded-xl bg-zinc-200 dark:bg-zinc-800 flex-shrink-0 flex items-center justify-center text-2xl">
        {getCategoryIcon(group.category)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
            {group.displayName}
          </span>
          <span className="flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-heb-red-500 text-white">
            {group.items.length}
          </span>
        </div>
        <div className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate leading-snug">
          {previewText}
        </div>
        <div className="flex flex-wrap gap-1 mt-1.5">
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold font-mono capitalize">
            {group.category}
          </span>
        </div>
      </div>

      {/* Chevron */}
      <div className="flex-shrink-0 self-center text-zinc-300 dark:text-zinc-600 ml-1">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    </button>
  );
}
