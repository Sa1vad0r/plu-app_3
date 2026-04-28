'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import { PLUEntry, CATEGORIES, getCategoryIcon } from '@/types/plu';
import { UsageCounts } from '@/lib/usageStore';
import { getSpecialTags, regularTags } from '@/lib/specialTags';
import RecentCard from './RecentCard';

interface WrapTabProps {
  items: PLUEntry[];
  usageCounts: UsageCounts;
  incrementUsage: (id: string) => void;
  recentIds: string[];
  removeRecent: (id: string) => void;
}

export default function WrapTab({ items, usageCounts, incrementUsage, recentIds, removeRecent }: WrapTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [displayItem, setDisplayItem] = useState<PLUEntry | null>(null);
  const [carouselPage, setCarouselPage] = useState(0);
  const touchStartX = useRef(0);

  const recents = useMemo(
    () => recentIds.map((id) => items.find((i) => i.id === id)).filter(Boolean) as PLUEntry[],
    [recentIds, items]
  );
  const RECENTS_PER_PAGE = 6; // 2 cols × 3 rows per page
  const totalCarouselPages = Math.ceil(recents.length / RECENTS_PER_PAGE);

  const categoryItems = useMemo(() => {
    if (!selectedCategory) return [];
    return items
      .filter((i) => i.category === selectedCategory)
      .sort((a, b) => {
        const usageDiff = (usageCounts[b.id] || 0) - (usageCounts[a.id] || 0);
        return usageDiff !== 0 ? usageDiff : a.name.localeCompare(b.name);
      });
  }, [items, selectedCategory, usageCounts]);

  const categoriesWithCounts = useMemo(
    () =>
      CATEGORIES.map((cat) => ({
        ...cat,
        count: items.filter((i) => i.category === cat.value).length,
      })).filter((cat) => cat.count > 0),
    [items]
  );

  const openItem = useCallback((item: PLUEntry) => {
    setDisplayItem(item);
    incrementUsage(item.id);
    setCarouselPage(0);
  }, [incrementUsage]);

  const handleRemoveRecent = useCallback((id: string) => {
    removeRecent(id);
    setCarouselPage(0);
  }, [removeRecent]);

  const carouselSwipeStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const carouselSwipeEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) setCarouselPage((p) => Math.min(totalCarouselPages - 1, p + 1));
      else setCarouselPage((p) => Math.max(0, p - 1));
    }
  };

  return (
    <div>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-zinc-200/50">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center px-4 pt-3 pb-3">
            <span className="font-mono font-bold text-xl text-heb-red-500 tracking-tight">Wrap</span>
            <span className="text-zinc-400 text-sm font-normal ml-1.5">// browse PLUs</span>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="ml-auto flex items-center gap-1 text-sm font-semibold text-zinc-500 hover:text-zinc-800 transition-colors"
              >
                ← All
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pb-28">

        {/* ── Recents ─────────────────────────────────────────────────── */}
        {recents.length > 0 && (
          <section className="mt-4 mb-6">
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest font-mono mb-2">
              Recent <span className="font-normal">· hold to remove</span>
            </div>

            <div>
              <div
                className="overflow-hidden"
                onTouchStart={carouselSwipeStart}
                onTouchEnd={carouselSwipeEnd}
              >
                <div
                  className="flex transition-transform duration-300 ease-out"
                  style={{ transform: `translateX(-${carouselPage * 100}%)` }}
                >
                  {Array.from({ length: totalCarouselPages }, (_, page) => (
                    <div key={page} className="w-full flex-shrink-0 grid grid-cols-2 gap-2">
                      {recents.slice(page * RECENTS_PER_PAGE, (page + 1) * RECENTS_PER_PAGE).map((item) => (
                        <RecentCard key={item.id} item={item} onOpen={openItem} onRemove={handleRemoveRecent} />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              {totalCarouselPages > 1 && (
                <div className="flex items-center justify-between mt-3 px-1">
                  <button
                    onClick={() => setCarouselPage((p) => Math.max(0, p - 1))}
                    disabled={carouselPage === 0}
                    className="w-9 h-9 rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-500 disabled:opacity-25 active:scale-95 transition-all"
                  >←</button>
                  <div className="flex gap-2 items-center">
                    {Array.from({ length: totalCarouselPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setCarouselPage(i)}
                        className={`rounded-full transition-all ${i === carouselPage ? 'w-4 h-2.5 bg-heb-red-500' : 'w-2.5 h-2.5 bg-zinc-300'}`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setCarouselPage((p) => Math.min(totalCarouselPages - 1, p + 1))}
                    disabled={carouselPage === totalCarouselPages - 1}
                    className="w-9 h-9 rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-500 disabled:opacity-25 active:scale-95 transition-all"
                  >→</button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Category grid ────────────────────────────────────────────── */}
        {selectedCategory === null ? (
          <section>
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest font-mono mb-3 mt-2">
              Browse by category
            </div>
            {items.length === 0 ? (
              <div className="text-center py-16 px-5">
                <div className="text-5xl mb-3">🥩</div>
                <h3 className="text-base font-bold text-zinc-700 mb-1.5">No PLUs yet</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Add PLUs in the <strong className="text-heb-red-500">PLU</strong> tab first.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {categoriesWithCounts.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className="flex flex-col items-center justify-center gap-2 py-6 px-4 rounded-2xl border-2 border-zinc-200 bg-white hover:border-heb-red-500/50 hover:bg-heb-red-50 active:scale-[0.97] transition-all"
                  >
                    <span className="text-5xl leading-none">{cat.icon}</span>
                    <span className="font-bold text-sm text-zinc-800">{cat.label}</span>
                    <span className="text-[10px] font-mono text-zinc-400">{cat.count} PLUs</span>
                  </button>
                ))}
              </div>
            )}
          </section>
        ) : (

        /* ── Cut list ──────────────────────────────────────────────────── */
          <section>
            <div className="flex items-center gap-2 mt-2 mb-3">
              <span className="text-lg leading-none">{getCategoryIcon(selectedCategory)}</span>
              <span className="font-bold text-base text-zinc-800 capitalize">{selectedCategory}</span>
              <span className="text-[11px] font-mono text-zinc-400 ml-auto">
                {categoryItems.length} PLUs
              </span>
            </div>
            <div className="space-y-2">
              {categoryItems.map((item) => {
                const specials = getSpecialTags(item.tags);
                const regular = regularTags(item.tags);
                const accentDot = specials[0]?.dotClass;
                return (
                  <button
                    key={item.id}
                    onClick={() => openItem(item)}
                    className="w-full flex items-center gap-4 px-4 py-4 rounded-xl border border-zinc-200 bg-white active:scale-[0.98] transition-all text-left overflow-hidden relative"
                  >
                    {accentDot && (
                      <span className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${accentDot}`} />
                    )}
                    <div className={`w-12 h-12 rounded-xl bg-zinc-100 flex-shrink-0 flex items-center justify-center text-2xl overflow-hidden ${accentDot ? 'ml-1' : ''}`}>
                      {item.photo ? (
                        <img src={item.photo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        getCategoryIcon(item.category)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-base text-zinc-900 leading-snug">
                        {item.name}
                      </div>
                      {specials.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {specials.map((st) => (
                            <span key={st.key} className={`text-[10px] px-2 py-0.5 font-mono tracking-wide ${st.badgeClass}`}>
                              {st.label}
                            </span>
                          ))}
                        </div>
                      )}
                      {regular.length > 0 && (
                        <div className="text-[11px] text-zinc-400 mt-0.5 truncate">
                          {regular.join(' · ')}
                        </div>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-mono font-bold text-xl text-heb-red-500 leading-none">
                        {item.plu}
                      </div>
                      {item.tray && (
                        <div className="text-[11px] text-zinc-400 font-mono mt-1">
                          {item.tray}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* ── Big PLU display overlay ───────────────────────────────────── */}
      {displayItem && (
        <div
          className="fixed inset-0 z-60 bg-zinc-950 flex flex-col items-center justify-center p-8"
          onClick={() => setDisplayItem(null)}
        >
          {displayItem.photo ? (
            <div className="w-28 h-28 rounded-2xl overflow-hidden mb-6 flex-shrink-0">
              <img src={displayItem.photo} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="text-6xl mb-6 flex-shrink-0">
              {getCategoryIcon(displayItem.category)}
            </div>
          )}
          <div className="text-zinc-400 text-lg font-semibold mb-2 text-center leading-snug">
            {displayItem.name}
          </div>
          <div
            className="font-mono font-bold text-white tracking-tight text-center leading-none mb-6"
            style={{ fontSize: 'clamp(72px, 22vw, 120px)' }}
          >
            {displayItem.plu}
          </div>
          {displayItem.tray && (
            <div className="bg-zinc-800 rounded-2xl px-8 py-4 text-center mb-2">
              <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest font-mono mb-1">
                Tray Size
              </div>
              <div
                className="font-mono font-bold text-white leading-none"
                style={{ fontSize: 'clamp(32px, 10vw, 48px)' }}
              >
                {displayItem.tray}
              </div>
            </div>
          )}
          <div className="mt-8 text-zinc-600 text-sm">tap anywhere to close</div>
        </div>
      )}
    </div>
  );
}
