'use client';

import { useState, useEffect, useRef } from 'react';
import { PLUEntry, CATEGORIES, TRAY_SIZES, generateId } from '@/types/plu';
import { compressImage } from '@/lib/store';
import TagInput from './TagInput';
import BottomSheet from './BottomSheet';

interface PLUFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (entry: PLUEntry) => void;
  onDelete?: (id: string) => void;
  editItem?: PLUEntry | null;
}

export default function PLUForm({
  open,
  onClose,
  onSave,
  onDelete,
  editItem,
}: PLUFormProps) {
  const [plu, setPlu] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [tray, setTray] = useState('');
  const [weight, setWeight] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [photo, setPhoto] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      if (editItem) {
        setPlu(editItem.plu);
        setName(editItem.name);
        setCategory(editItem.category);
        setTray(editItem.tray);
        setWeight(editItem.weight);
        setTags([...editItem.tags]);
        setPhoto(editItem.photo);
        setNotes(editItem.notes);
      } else {
        setPlu('');
        setName('');
        setCategory('');
        setTray('');
        setWeight('');
        setTags([]);
        setPhoto(null);
        setNotes('');
      }
    }
  }, [open, editItem]);

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setPhoto(compressed);
    } catch {
      console.error('Failed to process image');
    }
  };

  const handleSave = () => {
    if (!plu.trim() || !name.trim()) return;
    const entry: PLUEntry = {
      id: editItem?.id || generateId(),
      plu: plu.trim(),
      name: name.trim(),
      category: category as PLUEntry['category'],
      tray: tray as PLUEntry['tray'],
      weight: weight.trim(),
      tags,
      photo,
      notes: notes.trim(),
      updated: Date.now(),
    };
    onSave(entry);
    onClose();
  };

  const handleDelete = () => {
    if (editItem && onDelete && confirm('Delete this PLU?')) {
      onDelete(editItem.id);
      onClose();
    }
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={editItem ? 'Edit PLU' : 'Add PLU'}
    >
      <div className="space-y-4">
        {/* PLU Code */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
            PLU Code *
          </label>
          <input
            type="text"
            value={plu}
            onChange={(e) => setPlu(e.target.value)}
            placeholder="e.g. 4011"
            className="w-full py-3 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 text-zinc-900 dark:text-zinc-100 text-[15px] outline-none focus:border-red-500 transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
          />
        </div>

        {/* Product Name */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
            Product Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Beef Ribeye Steak"
            className="w-full py-3 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 text-zinc-900 dark:text-zinc-100 text-[15px] outline-none focus:border-red-500 transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full py-3 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 text-zinc-900 dark:text-zinc-100 text-[15px] outline-none focus:border-red-500 transition-colors appearance-none"
          >
            <option value="">Select category</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.icon} {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tray Size */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
            Tray Size
          </label>
          <select
            value={tray}
            onChange={(e) => setTray(e.target.value)}
            className="w-full py-3 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 text-zinc-900 dark:text-zinc-100 text-[15px] outline-none focus:border-red-500 transition-colors appearance-none"
          >
            <option value="">Select tray size</option>
            {TRAY_SIZES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Weight */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
            Weight / Pack Size
          </label>
          <input
            type="text"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="e.g. 1.5 lb, family pack"
            className="w-full py-3 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 text-zinc-900 dark:text-zinc-100 text-[15px] outline-none focus:border-red-500 transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
            Tags
          </label>
          <TagInput tags={tags} onChange={setTags} />
        </div>

        {/* Photo */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
            Photo
          </label>
          <div
            onClick={() => fileRef.current?.click()}
            className="w-full h-28 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors relative overflow-hidden"
          >
            {photo ? (
              <img
                src={photo}
                alt=""
                className="absolute inset-0 w-full h-full object-cover rounded-xl"
              />
            ) : (
              <>
                <span className="text-2xl">📷</span>
                <span className="text-zinc-400 dark:text-zinc-500 text-sm">Tap to add photo</span>
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhoto}
              className="hidden"
            />
          </div>
          {photo && (
            <button
              onClick={() => setPhoto(null)}
              className="mt-1.5 text-xs text-red-400 hover:text-red-300"
            >
              Remove photo
            </button>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Special handling, packaging notes..."
            rows={3}
            className="w-full py-3 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 text-zinc-900 dark:text-zinc-100 text-[15px] outline-none focus:border-red-500 transition-colors resize-y placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
          />
        </div>

        {/* Actions */}
        <button
          onClick={handleSave}
          disabled={!plu.trim() || !name.trim()}
          className="w-full py-3.5 rounded-xl bg-red-500 text-white font-bold text-[15px] hover:bg-red-600 active:scale-[0.97] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {editItem ? 'Update PLU' : 'Save PLU'}
        </button>

        {editItem && onDelete && (
          <button
            onClick={handleDelete}
            className="w-full py-3 rounded-xl border border-red-800 text-red-400 font-semibold text-sm hover:bg-red-900/20 transition-colors"
          >
            Delete this PLU
          </button>
        )}
      </div>
    </BottomSheet>
  );
}
