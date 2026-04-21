'use client';

import { PLUEntry, getCategoryIcon } from '@/types/plu';
import BottomSheet from './BottomSheet';

interface PLUDetailProps {
  item: PLUEntry | null;
  open: boolean;
  onClose: () => void;
  onEdit: (item: PLUEntry) => void;
}

export default function PLUDetail({
  item,
  open,
  onClose,
  onEdit,
}: PLUDetailProps) {
  if (!item) return null;

  return (
    <BottomSheet open={open} onClose={onClose} title="PLU Detail">
      {/* Photo */}
      <div className="w-full h-48 rounded-xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-5xl overflow-hidden mb-4">
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

      {/* Code & Name */}
      <div className="font-mono font-bold text-3xl text-heb-red-500 mb-1">
        {item.plu}
      </div>
      <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">{item.name}</div>

      {/* Detail Rows */}
      <div className="space-y-0 divide-y divide-zinc-200 dark:divide-zinc-800">
        {item.category && (
          <div className="flex justify-between py-2.5 text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">Category</span>
            <span className="text-zinc-900 dark:text-zinc-100 capitalize">{item.category}</span>
          </div>
        )}
        {item.tray && (
          <div className="flex justify-between py-2.5 text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">Tray Size</span>
            <span className="text-zinc-900 dark:text-zinc-100">{item.tray}</span>
          </div>
        )}
        {item.weight && (
          <div className="flex justify-between py-2.5 text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">Weight / Pack</span>
            <span className="text-zinc-900 dark:text-zinc-100">{item.weight}</span>
          </div>
        )}
        {item.notes && (
          <div className="flex justify-between py-2.5 text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">Notes</span>
            <span className="text-zinc-900 dark:text-zinc-100 text-right max-w-[60%]">
              {item.notes}
            </span>
          </div>
        )}
      </div>

      {/* Tags */}
      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {item.tags.map((t) => (
            <span
              key={t}
              className="text-xs px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold font-mono"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Edit Button */}
      <button
        onClick={() => {
          onClose();
          setTimeout(() => onEdit(item), 200);
        }}
        className="w-full py-3.5 rounded-xl bg-heb-red-500 text-white font-bold text-[15px] hover:bg-heb-red-600 active:scale-[0.97] transition-all mt-5"
      >
        Edit
      </button>
    </BottomSheet>
  );
}
