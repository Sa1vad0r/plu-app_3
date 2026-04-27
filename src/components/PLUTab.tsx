'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import { PLUEntry } from '@/types/plu';
import { fuzzyMatch, searchScore } from '@/lib/store';
import { groupPLUItems, PLUGroup } from '@/lib/grouping';
import { useDebounce } from '@/hooks/useDebounce';
import SearchBar from './SearchBar';
import CategoryTabs from './CategoryTabs';
import TagFilter from './TagFilter';
import PLUCard from './PLUCard';
import PLUGroupCard from './PLUGroupCard';
import PLUGroupSheet from './PLUGroupSheet';
import PLUForm from './PLUForm';
import PLUDetail from './PLUDetail';

interface PLUTabProps {
  items: PLUEntry[];
  onAdd: (entry: PLUEntry) => void;
  onUpdate: (entry: PLUEntry) => void;
  onDelete: (id: string) => void;
  onImport: (data: PLUEntry[]) => number;
  onExport: () => void;
  onToast: (msg: string, type?: 'success' | 'error') => void;
}

export default function PLUTab({
  items,
  onAdd,
  onUpdate,
  onDelete,
  onImport,
  onExport,
  onToast,
}: PLUTabProps) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 150);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTag, setActiveTag] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<PLUEntry | null>(null);
  const [detailItem, setDetailItem] = useState<PLUEntry | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [groupDetail, setGroupDetail] = useState<PLUGroup | null>(null);
  const [groupOpen, setGroupOpen] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => i.tags.forEach((t) => set.add(t)));
    return [...set].sort();
  }, [items]);

  const filtered = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    return items
      .filter((item) => {
        if (activeCategory !== 'all' && item.category !== activeCategory)
          return false;
        if (activeTag && !item.tags.includes(activeTag)) return false;
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
  }, [items, debouncedSearch, activeCategory, activeTag]);

  // Group filtered items; sort by variant count desc (most variants = most recommended)
  const groups = useMemo(
    () => groupPLUItems(filtered).sort((a, b) => b.items.length - a.items.length),
    [filtered]
  );

  const query = debouncedSearch.trim().toLowerCase();

  const handleSave = useCallback(
    (entry: PLUEntry) => {
      if (editItem) {
        onUpdate(entry);
        onToast('PLU updated!');
      } else {
        onAdd(entry);
        onToast('PLU added!');
      }
    },
    [editItem, onAdd, onUpdate, onToast]
  );

  const handleDelete = useCallback(
    (id: string) => {
      onDelete(id);
      onToast('PLU deleted', 'error');
    },
    [onDelete, onToast]
  );

  const handleImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (!Array.isArray(data)) throw new Error('Invalid');
          const added = onImport(data);
          onToast(`Imported ${added} new PLUs!`);
        } catch {
          onToast('Invalid file format', 'error');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    },
    [onImport, onToast]
  );

  const openItem = useCallback((item: PLUEntry) => {
    setDetailItem(item);
    setDetailOpen(true);
  }, []);

  return (
    <div>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-zinc-200/50">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between px-4 pt-3 pb-2.5">
            <div>
              <span className="font-mono font-bold text-xl text-heb-red-500 tracking-tight">
                PLU
              </span>
              <span className="text-zinc-400 text-sm font-normal ml-1.5">
                // quick search
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onExport}
                title="Export"
                className="w-10 h-10 rounded-xl border border-zinc-200 bg-white text-zinc-500 flex items-center justify-center text-lg hover:bg-zinc-100 active:scale-95 transition-all"
              >
                📤
              </button>
              <button
                onClick={() => importRef.current?.click()}
                title="Import"
                className="w-10 h-10 rounded-xl border border-zinc-200 bg-white text-zinc-500 flex items-center justify-center text-lg hover:bg-zinc-100 active:scale-95 transition-all"
              >
                📥
              </button>
            </div>
          </div>

          <div className="px-4 pb-2.5">
            <SearchBar value={search} onChange={setSearch} />
          </div>

          <div className="px-4">
            <CategoryTabs
              active={activeCategory}
              onChange={(cat) => {
                setActiveCategory(cat);
                setActiveTag('');
              }}
            />
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto">
        <TagFilter tags={allTags} active={activeTag} onChange={setActiveTag} />
      </div>

      {/* List */}
      <main className="max-w-lg mx-auto px-4 pb-28">
        {filtered.length === 0 && items.length === 0 ? (
          <div className="text-center py-16 px-5">
            <div className="text-5xl mb-3">🥩</div>
            <h3 className="text-base font-bold text-zinc-700 mb-1.5">
              No PLUs yet
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Tap the <strong className="text-heb-red-500">+</strong> button to add
              your first PLU.
              <br />
              Take pics of the book next shift!
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 px-5">
            <div className="text-5xl mb-3">🔍</div>
            <h3 className="text-base font-bold text-zinc-700 mb-1.5">
              No matches
            </h3>
            <p className="text-sm text-zinc-400">
              Try a different search or filter.
            </p>
          </div>
        ) : (
          <>
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest font-mono mt-4 mb-2">
              {groups.length === filtered.length ? (
                <>Results <span className="font-normal">{filtered.length}</span></>
              ) : (
                <>{groups.length} groups <span className="font-normal text-zinc-400">· {filtered.length} PLUs</span></>
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

      {/* FAB */}
      <button
        onClick={() => {
          setEditItem(null);
          setFormOpen(true);
        }}
        className="fixed bottom-20 right-5 w-14 h-14 rounded-2xl bg-heb-red-500 text-white text-3xl flex items-center justify-center shadow-lg shadow-heb-red-500/30 hover:bg-heb-red-600 active:scale-90 transition-all z-40"
      >
        +
      </button>

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
      />

      <input
        ref={importRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />
    </div>
  );
}
