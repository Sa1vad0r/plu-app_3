'use client';

import { useRef, useEffect } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="relative">
      <svg
        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-zinc-400 dark:text-zinc-500 pointer-events-none"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search PLU, name, or tag..."
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        className="w-full py-3 pl-11 pr-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 text-zinc-900 dark:text-zinc-100 text-base font-medium placeholder:text-zinc-400 dark:placeholder:text-zinc-600 outline-none focus:border-brand-red-500 transition-colors"
      />
      {value && (
        <button
          onClick={() => {
            onChange('');
            inputRef.current?.focus();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-500 flex items-center justify-center text-sm hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  );
}
