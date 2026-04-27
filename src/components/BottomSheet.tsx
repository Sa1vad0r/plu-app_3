'use client';

import { useEffect, ReactNode } from 'react';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
}

export default function BottomSheet({
  open,
  onClose,
  title,
  children,
}: BottomSheetProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-60 flex items-end justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-zinc-950 w-full max-w-lg max-h-[92vh] rounded-t-2xl overflow-y-auto animate-slide-up">
        <div className="sticky top-0 z-10 flex items-center justify-between p-5 pb-3 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-200/50 dark:border-zinc-800/50">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{title}</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 flex items-center justify-center text-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-5 pt-4">{children}</div>
      </div>
    </div>
  );
}
