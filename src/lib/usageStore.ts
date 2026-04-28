'use client';

import { useState, useEffect, useCallback } from 'react';

const USAGE_KEY = 'plu_usage_v1';

export type UsageCounts = Record<string, number>; // PLU id → tap count

export function useUsageStore() {
  const [counts, setCounts] = useState<UsageCounts>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(USAGE_KEY);
      if (raw) setCounts(JSON.parse(raw));
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
  }, []);

  return { counts, increment };
}
