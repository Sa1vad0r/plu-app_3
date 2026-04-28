'use client';

import { useState, useEffect, useCallback } from 'react';

const USAGE_KEY = 'plu_usage_v1';
const RECENTS_KEY = 'plu_recents_v1';
const MAX_RECENTS = 6;

export type UsageCounts = Record<string, number>; // PLU id → tap count

export function useUsageStore() {
  const [counts, setCounts] = useState<UsageCounts>({});
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const rawCounts = localStorage.getItem(USAGE_KEY);
      if (rawCounts) setCounts(JSON.parse(rawCounts));
      const rawRecents = localStorage.getItem(RECENTS_KEY);
      if (rawRecents) setRecentIds(JSON.parse(rawRecents));
    } catch {
      // ignore
    }
  }, []);

  const increment = useCallback((id: string) => {
    setCounts((prev) => {
      const next = { ...prev, [id]: (prev[id] || 0) + 1 };
      localStorage.setItem(USAGE_KEY, JSON.stringify(next));
      return next;
    });
    setRecentIds((prev) => {
      const deduped = prev.filter((rid) => rid !== id);
      const next = [id, ...deduped].slice(0, MAX_RECENTS);
      localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeRecent = useCallback((id: string) => {
    setRecentIds((prev) => {
      const next = prev.filter((rid) => rid !== id);
      localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { counts, recentIds, increment, removeRecent };
}
