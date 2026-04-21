'use client';

import { CATEGORIES } from '@/types/plu';

interface CategoryTabsProps {
  active: string;
  onChange: (cat: string) => void;
}

export default function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  const tabs = [{ value: 'all', label: 'All' }, ...CATEGORIES];

  return (
    <div className="flex gap-0 overflow-x-auto scrollbar-hide">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`px-4 py-2 text-[13px] font-semibold whitespace-nowrap border-b-2 transition-colors ${
            active === tab.value
              ? 'text-heb-red-500 border-heb-red-500'
              : 'text-zinc-400 dark:text-zinc-500 border-transparent hover:text-zinc-600 dark:hover:text-zinc-300'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
