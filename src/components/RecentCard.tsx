'use client';

import { useState, useRef } from 'react';
import { PLUEntry } from '@/types/plu';
import { getSpecialTags } from '@/lib/specialTags';

interface RecentCardProps {
  item: PLUEntry;
  onOpen: (item: PLUEntry) => void;
  onRemove: (id: string) => void;
}

export default function RecentCard({ item, onOpen, onRemove }: RecentCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const specials = getSpecialTags(item.tags);
  const accentDot = specials[0]?.dotClass;

  const startHold = () => {
    holdTimer.current = setTimeout(() => setConfirmDelete(true), 500);
  };

  const cancelHold = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  };

  const handleClick = () => {
    if (confirmDelete) {
      setConfirmDelete(false);
      return;
    }
    onOpen(item);
  };

  return (
    <div className="relative select-none">
      <button
        onPointerDown={startHold}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        onClick={handleClick}
        className={`w-full flex flex-col items-start p-4 rounded-xl border bg-white active:scale-[0.97] transition-all text-left overflow-hidden ${
          confirmDelete ? 'border-red-300' : 'border-zinc-200'
        }`}
      >
        {/* Grade accent stripe */}
        {accentDot && (
          <span className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${accentDot}`} />
        )}

        <div className={`w-full ${accentDot ? 'pl-1' : ''}`}>
          <div className="font-mono font-bold text-2xl text-heb-red-500 leading-none mb-1.5">
            {item.plu}
          </div>
          <div className="text-xs font-semibold text-zinc-700 leading-snug w-full break-words">
            {item.name}
          </div>
          {/* Special badges */}
          {specials.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {specials.map((st) => (
                <span key={st.key} className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${st.badgeClass}`}>
                  {st.label}
                </span>
              ))}
            </div>
          )}
          {item.tray && (
            <div className="text-[10px] text-zinc-400 font-mono mt-1">
              Tray {item.tray}
            </div>
          )}
        </div>
      </button>

      {confirmDelete && (
        <div className="absolute inset-0 rounded-xl flex items-center justify-center gap-2 bg-zinc-950/70">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onRemove(item.id);
            }}
            className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-bold active:scale-95 transition-all"
          >
            Remove
          </button>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setConfirmDelete(false);
            }}
            className="px-3 py-2 rounded-xl bg-zinc-700 text-white text-sm font-bold active:scale-95 transition-all"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
