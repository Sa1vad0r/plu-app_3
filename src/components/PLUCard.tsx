'use client';

import { PLUEntry, getCategoryIcon } from '@/types/plu';

interface PLUCardProps {
  item: PLUEntry;
  query: string;
  onClick: () => void;
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-heb-red-500/30 text-zinc-900 dark:text-zinc-100 rounded-sm px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function PLUCard({ item, query, onClick }: PLUCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex gap-3 items-start p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 active:scale-[0.985] transition-all text-left"
    >
      {/* Thumbnail */}
      <div className="w-14 h-14 rounded-xl bg-zinc-200 dark:bg-zinc-800 flex-shrink-0 flex items-center justify-center text-2xl overflow-hidden">
        {item.photo ? (
          <img
            src={item.photo}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          getCategoryIcon(item.category)
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="font-mono font-bold text-base text-heb-red-500 mb-0.5">
          <Highlight text={item.plu} query={query} />
        </div>
        <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 truncate mb-1">
          <Highlight text={item.name} query={query} />
        </div>
        <div className="flex flex-wrap gap-1">
          {item.category && (
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold font-mono">
              {item.category}
            </span>
          )}
          {item.tray && (
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold font-mono">
              Tray: {item.tray}
            </span>
          )}
          {item.weight && (
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold font-mono">
              {item.weight}
            </span>
          )}
          {item.tags.map((t) => (
            <span
              key={t}
              className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold font-mono"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}
