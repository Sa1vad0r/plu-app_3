'use client';

import { useState, useMemo, useCallback } from 'react';
import { PLUEntry } from '@/types/plu';
import { groupPLUItems, PLUGroup } from '@/lib/grouping';
import { fuzzyMatch, searchScore } from '@/lib/store';
import { useDebounce } from '@/hooks/useDebounce';
import SearchBar from './SearchBar';
import PLUCard from './PLUCard';
import PLUGroupCard from './PLUGroupCard';
import PLUGroupSheet from './PLUGroupSheet';
import PLUDetail from './PLUDetail';
import PLUForm from './PLUForm';

const QUICK_FILTERS: { id: string; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'beef', label: '🥩 Beef' },
  { id: 'turkey', label: '🦃 Turkey' },
  { id: 'chicken', label: '🍗 Chicken' },
  { id: 'cooked', label: '🍳 Cooked' },
  { id: 'wagyu', label: '🐄 Wagyu' },
  { id: 'prime', label: '⭐ Prime' },
  { id: 'grass-fed', label: '🌿 Grass Fed' },
];

function matchesQuickFilter(item: PLUEntry, filter: string): boolean {
  if (filter === 'all') return true;
  if (filter === 'beef' || filter === 'turkey' || filter === 'chicken') {
    return item.category === filter;
  }
  const haystack = [item.name, ...item.tags].join(' ').toLowerCase();
  if (filter === 'grass-fed') {
    return (
      haystack.includes('grass fed') ||
      haystack.includes('grass-fed') ||
      haystack.includes('grassfed')
    );
  }
  return haystack.includes(filter);
}

interface FavoritesTabProps {
  items: PLUEntry[];
  onToggleFavorite: (id: string) => void;
  onUpdate: (entry: PLUEntry) => void;
  onDelete: (id: string) => void;
  onToast: (msg: string, type?: 'success' | 'error') => void;
}

export default function FavoritesTab({
  items,
  onToggleFavorite,
  onUpdate,
  onDelete,
  onToast,
}: FavoritesTabProps) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 150);
  const [activeFilter, setActiveFilter] = useState('all');
  const [detailItem, setDetailItem] = useState<PLUEntry | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editItem, setEditItem] = useState<PLUEntry | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [groupDetail, setGroupDetail] = useState<PLUGroup | null>(null);
  const [groupOpen, setGroupOpen] = useState(false);

  const favorites = useMemo(() => items.filter((i) => i.favorite), [items]);

  const filtered = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    return favorites
      .filter((item) => {
        if (!matchesQuickFilter(item, activeFilter)) return false;
        if (query) {
          const blob = [
            item.plu,
            item.name,
            item.category,
            item.tray,
            item.weight,
            item.notes,
            ...item.tags,
          ]
            .join(' ')
            .toLowerCase();
          if (!fuzzyMatch(blob, query)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (!query) return a.name.localeCompare(b.name);
        const diff = searchScore(b, query) - searchScore(a, query);
        return diff !== 0 ? diff : a.name.localeCompare(b.name);
      });
  }, [favorites, debouncedSearch, activeFilter]);

  const groups = useMemo(() => groupPLUItems(filtered), [filtered]);
  const query = debouncedSearch.trim().toLowerCase();

  const openItem = useCallback((item: PLUEntry) => {
    setDetailItem(item);
    setDetailOpen(true);
  }, []);

  const handleSave = useCallback(
    (entry: PLUEntry) => {
      onUpdate(entry);
      onToast('PLU updated!');
    },
    [onUpdate, onToast]
  );

  const handleDelete = useCallback(
    (id: string) => {
      onDelete(id);
      setDetailOpen(false);
      onToast('PLU deleted', 'error');
    },
    [onDelete, onToast]
  );

  return (
    <div>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-zinc-200/50">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center px-4 pt-3 pb-2.5 gap-2">
            <span className="text-xl text-amber-400 leading-none">★</span>
            <span className="font-mono font-bold text-xl text-zinc-800 tracking-tight">
              Favorites
            </span>
            <span className="ml-auto text-xs font-bold text-zinc-400 font-mono">
              {favorites.length} saved
            </span>
          </div>

          <div className="px-4 pb-2.5">
            <SearchBar value={search} onChange={setSearch} />
          </div>

          {/* Quick-filter chips */}
          <div className="flex overflow-x-auto scrollbar-hide px-3 pb-2.5 gap-1.5">
            {QUICK_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${
                  activeFilter === f.id
                    ? 'bg-amber-400 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* List */}
      <main className="max-w-lg mx-auto px-4 pb-28">
        {favorites.length === 0 ? (
          <div className="text-center py-16 px-5">
            <div className="text-5xl mb-3">☆</div>
            <h3 className="text-base font-bold text-zinc-700 mb-1.5">
              No favorites yet
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Tap the{' '}
              <strong className="text-amber-400">★</strong> on any PLU to save
              it here for quick access.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 px-5">
            <div className="text-5xl mb-3">🔍</div>
            <h3 className="text-base font-bold text-zinc-700 mb-1.5">
              No matches
            </h3>
            <p className="text-sm text-zinc-400">
              Try a different filter or search.
            </p>
          </div>
        ) : (
          <>
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest font-mono mt-4 mb-2">
              {groups.length === filtered.length ? (
                <>
                  Results <span className="font-normal">{filtered.length}</span>
                </>
              ) : (
                <>
                  {groups.length} groups{' '}
                  <span className="font-normal text-zinc-400">
                    · {filtered.length} PLUs
                  </span>
                </>
              )}
            </div>
            <div className="space-y-2">
              {groups.map((group) =>
                group.items.length === 1 ? (
                  <PLUCard
                    key={group.items[0].id}
                    item={group.items[0]}
                    query={query}
                    onClick={() => openItem(group.items[0])}
                    onToggleFavorite={onToggleFavorite}
                  />
                ) : (
                  <PLUGroupCard
                    key={group.key}
                    group={group}
                    query={query}
                    onClick={() => {
                      setGroupDetail(group);
                      setGroupOpen(true);
                    }}
                  />
                )
              )}
            </div>
          </>
        )}
      </main>

      <PLUGroupSheet
        group={groupDetail}
        open={groupOpen}
        onClose={() => setGroupOpen(false)}
        onSelect={openItem}
      />

      <PLUForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
        editItem={editItem}
      />

      <PLUDetail
        item={detailItem}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onEdit={(item) => {
          setEditItem(item);
          setFormOpen(true);
        }}
        onToggleFavorite={onToggleFavorite}
      />
    </div>
  );
}
