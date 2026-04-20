"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { PLUEntry } from "@/types/plu";
import { usePLUStore, fuzzyMatch } from "@/lib/store";
import SearchBar from "@/components/SearchBar";
import CategoryTabs from "@/components/CategoryTabs";
import TagFilter from "@/components/TagFilter";
import PLUCard from "@/components/PLUCard";
import PLUForm from "@/components/PLUForm";
import PLUDetail from "@/components/PLUDetail";
import Toast from "@/components/Toast";

interface ToastState {
  message: string;
  type: "success" | "error";
}

export default function Home() {
  const {
    items,
    loaded,
    addItem,
    updateItem,
    deleteItem,
    importItems,
    exportItems,
  } = usePLUStore();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTag, setActiveTag] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<PLUEntry | null>(null);
  const [detailItem, setDetailItem] = useState<PLUEntry | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [dark, setDark] = useState(true);
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const isDark = stored !== "light";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const allTags = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => i.tags.forEach((t) => set.add(t)));
    return [...set].sort();
  }, [items]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items
      .filter((item) => {
        if (activeCategory !== "all" && item.category !== activeCategory)
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
            .join(" ")
            .toLowerCase();
          if (!fuzzyMatch(blob, query)) return false;
        }
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items, search, activeCategory, activeTag]);

  const showToast = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      setToast({ message, type });
    },
    [],
  );

  const handleSave = useCallback(
    (entry: PLUEntry) => {
      if (editItem) {
        updateItem(entry);
        showToast("PLU updated!");
      } else {
        addItem(entry);
        showToast("PLU added!");
      }
    },
    [editItem, addItem, updateItem, showToast],
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteItem(id);
      showToast("PLU deleted", "error");
    },
    [deleteItem, showToast],
  );

  const handleImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (!Array.isArray(data)) throw new Error("Invalid");
          const added = importItems(data);
          showToast(`Imported ${added} new PLUs!`);
        } catch {
          showToast("Invalid file format", "error");
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [importItems, showToast],
  );

  const openAdd = () => {
    setEditItem(null);
    setFormOpen(true);
  };

  const openEdit = (item: PLUEntry) => {
    setEditItem(item);
    setFormOpen(true);
  };

  const openDetail = (item: PLUEntry) => {
    setDetailItem(item);
    setDetailOpen(true);
  };

  if (!loaded) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
        <div className="text-zinc-400 dark:text-zinc-500 text-sm animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-zinc-50/95 dark:bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-200/50 dark:border-zinc-800/50">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between px-4 pt-3 pb-2.5">
            <div>
              <span className="font-mono font-bold text-xl text-red-500 tracking-tight">
                PLU
              </span>
              <span className="text-zinc-400 dark:text-zinc-600 text-sm font-normal ml-1.5">
                // quick search
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={toggleTheme}
                title="Toggle theme"
                className="w-10 h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 flex items-center justify-center text-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 transition-all"
              >
                {dark ? "☀️" : "🌙"}
              </button>
              <button
                onClick={exportItems}
                title="Export"
                className="w-10 h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 flex items-center justify-center text-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 transition-all"
              >
                📤
              </button>
              <button
                onClick={() => importRef.current?.click()}
                title="Import"
                className="w-10 h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 flex items-center justify-center text-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 transition-all"
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
                setActiveTag("");
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
            <h3 className="text-base font-bold text-zinc-700 dark:text-zinc-200 mb-1.5">
              No PLUs yet
            </h3>
            <p className="text-sm text-zinc-400 dark:text-zinc-500 leading-relaxed">
              Tap the <strong className="text-red-500">+</strong> button to add
              your first PLU.
              <br />
              Take pics of the book next shift!
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 px-5">
            <div className="text-5xl mb-3">🔍</div>
            <h3 className="text-base font-bold text-zinc-700 dark:text-zinc-200 mb-1.5">
              No matches
            </h3>
            <p className="text-sm text-zinc-400 dark:text-zinc-500">
              Try a different search or filter.
            </p>
          </div>
        ) : (
          <>
            <div className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-mono mt-4 mb-2">
              Results{" "}
              <span className="font-normal text-zinc-400 dark:text-zinc-600">
                {filtered.length}
              </span>
            </div>
            <div className="space-y-2">
              {filtered.map((item) => (
                <PLUCard
                  key={item.id}
                  item={item}
                  query={search.trim().toLowerCase()}
                  onClick={() => openDetail(item)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* FAB */}
      <button
        onClick={openAdd}
        className="fixed bottom-6 right-5 w-14 h-14 rounded-2xl bg-red-500 text-white text-3xl flex items-center justify-center shadow-lg shadow-red-500/30 hover:bg-red-600 active:scale-90 transition-all z-40"
      >
        +
      </button>

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
        onEdit={openEdit}
      />

      <input
        ref={importRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}
    </div>
  );
}
