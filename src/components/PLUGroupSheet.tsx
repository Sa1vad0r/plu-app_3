'use client';

import { PLUEntry } from '@/types/plu';
import { PLUGroup, getVariantSuffix } from '@/lib/grouping';
import BottomSheet from './BottomSheet';

interface PLUGroupSheetProps {
  group: PLUGroup | null;
  open: boolean;
  onClose: () => void;
  onSelect: (item: PLUEntry) => void;
}

export default function PLUGroupSheet({
  group,
  open,
  onClose,
  onSelect,
}: PLUGroupSheetProps) {
  if (!group) return null;

  const rawKey = group.key.split('|')[1];

  return (
    <BottomSheet open={open} onClose={onClose} title={group.displayName}>
      <div className="space-y-2">
        {group.items.map((item) => {
          const variant = getVariantSuffix(item.name, rawKey);
          const meta = [item.tray, item.notes].filter(Boolean).join(' · ');
          return (
            <button
              key={item.id}
              onClick={() => {
                onClose();
                setTimeout(() => onSelect(item), 200);
              }}
              className="w-full text-left flex items-center gap-3 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 active:scale-[0.985] transition-all"
            >
              <div className="flex-shrink-0 font-mono font-bold text-brand-red-500 text-sm w-14 text-right">
                {item.plu}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {variant || item.name}
                </div>
                {meta && (
                  <div className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                    {meta}
                  </div>
                )}
              </div>
              <svg
                className="flex-shrink-0 text-zinc-300 dark:text-zinc-600"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}
