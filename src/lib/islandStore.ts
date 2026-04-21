'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  WeekPlan,
  createEmptyWeekPlan,
  getCurrentWedLabel,
  getNextWedLabel,
} from '@/types/island';

const ISLAND_KEY = 'plu_islands_v2';

interface IslandStore {
  currentWeek: WeekPlan;
  nextWeek: WeekPlan;
}

function loadStore(): IslandStore {
  try {
    const raw = localStorage.getItem(ISLAND_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    currentWeek: createEmptyWeekPlan(getCurrentWedLabel()),
    nextWeek: createEmptyWeekPlan(getNextWedLabel()),
  };
}

export function useIslandStore() {
  const [store, setStore] = useState<IslandStore>(() => ({
    currentWeek: createEmptyWeekPlan(getCurrentWedLabel()),
    nextWeek: createEmptyWeekPlan(getNextWedLabel()),
  }));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setStore(loadStore());
    setLoaded(true);
  }, []);

  const persist = useCallback((next: IslandStore) => {
    setStore(next);
    localStorage.setItem(ISLAND_KEY, JSON.stringify(next));
  }, []);

  const updateCurrentWeek = useCallback(
    (plan: WeekPlan) => {
      persist({ ...store, currentWeek: { ...plan, updated: Date.now() } });
    },
    [store, persist]
  );

  const updateNextWeek = useCallback(
    (plan: WeekPlan) => {
      persist({ ...store, nextWeek: { ...plan, updated: Date.now() } });
    },
    [store, persist]
  );

  const rollWeek = useCallback(() => {
    const newNext = createEmptyWeekPlan(getNextWedLabel());
    persist({
      currentWeek: { ...store.nextWeek, weekLabel: getCurrentWedLabel() },
      nextWeek: newNext,
    });
  }, [store, persist]);

  return {
    currentWeek: store.currentWeek,
    nextWeek: store.nextWeek,
    loaded,
    updateCurrentWeek,
    updateNextWeek,
    rollWeek,
  };
}
