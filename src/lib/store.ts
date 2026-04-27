'use client';

import { useState, useEffect, useCallback } from 'react';
import { PLUEntry } from '@/types/plu';

const DB_KEY = 'plu_data_v2';

export function usePLUStore() {
  const [items, setItems] = useState<PLUEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DB_KEY);
      setItems(raw ? JSON.parse(raw) : []);
    } catch {
      setItems([]);
    }
    setLoaded(true);
  }, []);

  const persist = useCallback((next: PLUEntry[]) => {
    setItems(next);
    localStorage.setItem(DB_KEY, JSON.stringify(next));
  }, []);

  const addItem = useCallback(
    (entry: PLUEntry) => {
      persist([...items, entry]);
    },
    [items, persist]
  );

  const updateItem = useCallback(
    (entry: PLUEntry) => {
      persist(items.map((i) => (i.id === entry.id ? entry : i)));
    },
    [items, persist]
  );

  const deleteItem = useCallback(
    (id: string) => {
      persist(items.filter((i) => i.id !== id));
    },
    [items, persist]
  );

  const importItems = useCallback(
    (data: PLUEntry[]) => {
      let added = 0;
      const existing = new Set(items.map((i) => i.plu));
      const merged = [...items];
      data.forEach((item) => {
        if (!existing.has(item.plu)) {
          merged.push(item);
          existing.add(item.plu);
          added++;
        }
      });
      persist(merged);
      return added;
    },
    [items, persist]
  );

  const exportItems = useCallback(() => {
    const blob = new Blob([JSON.stringify(items, null, 2)], {
      type: 'application/json',
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `plu_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [items]);

  return {
    items,
    loaded,
    addItem,
    updateItem,
    deleteItem,
    importItems,
    exportItems,
  };
}

// Score a PLUEntry's relevance to a query (higher = more relevant)
export function searchScore(item: { plu: string; name: string }, query: string): number {
  if (!query) return 0;
  const q = query.toLowerCase();
  const plu = item.plu.toLowerCase();
  const name = item.name.toLowerCase();
  if (plu === q) return 100;
  if (name === q) return 90;
  if (plu.startsWith(q)) return 80;
  if (name.startsWith(q)) return 70;
  if (plu.includes(q)) return 60;
  if (name.includes(q)) return 50;
  return 10; // fuzzy match on other fields
}

// Fuzzy search
export function fuzzyMatch(text: string, query: string): boolean {
  if (!query) return true;
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  if (lower.includes(q)) return true;
  let qi = 0;
  for (let i = 0; i < lower.length && qi < q.length; i++) {
    if (lower[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

export function highlightMatch(text: string, query: string): string {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return `${text.slice(0, idx)}<mark>${text.slice(idx, idx + query.length)}</mark>${text.slice(idx + query.length)}`;
}

// Compress image for storage
export function compressImage(file: File, maxSize = 400): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width,
          h = img.height;
        if (w > h) {
          if (w > maxSize) {
            h = (h * maxSize) / w;
            w = maxSize;
          }
        } else {
          if (h > maxSize) {
            w = (w * maxSize) / h;
            h = maxSize;
          }
        }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = reject;
      img.src = ev.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
