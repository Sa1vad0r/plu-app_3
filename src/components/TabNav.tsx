'use client';

export type AppTab = 'plu' | 'favorites' | 'wrap' | 'orders' | 'islands';

interface TabNavProps {
  active: AppTab;
  onChange: (tab: AppTab) => void;
}

const tabs: { id: AppTab; label: string; icon: string }[] = [
  { id: 'plu', label: 'PLU', icon: '🔍' },
  { id: 'favorites', label: 'Saved', icon: '★' },
  { id: 'wrap', label: 'Wrap', icon: '🏷️' },
  { id: 'orders', label: 'Orders', icon: '📋' },
  { id: 'islands', label: 'Islands', icon: '🏝️' },
];

export default function TabNav({ active, onChange }: TabNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-zinc-200/50">
      <div className="max-w-lg mx-auto flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
              active === tab.id
                ? tab.id === 'favorites'
                  ? 'text-amber-400'
                  : 'text-heb-red-500'
                : 'text-zinc-500 active:text-zinc-700'
            }`}
          >
            <span className={`text-xl leading-none ${tab.id === 'favorites' ? 'font-normal' : ''}`}>{tab.icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
