"use client";

import { useState, useEffect } from "react";
import {
  IslandSlot,
  SlotFlag,
  SLOT_FLAGS,
  createEmptySlot,
} from "@/types/island";
import { PLUEntry } from "@/types/plu";
import { fuzzyMatch } from "@/lib/store";
import BottomSheet from "./BottomSheet";

interface SlotEditorProps {
  open: boolean;
  onClose: () => void;
  label: string;
  mode: "single" | "multi"; // single = regular cell, multi = endcap/extra
  // Single mode
  slot?: IslandSlot | null;
  onSaveSingle?: (slot: IslandSlot) => void;
  onClearSingle?: () => void;
  // Multi mode
  items?: IslandSlot[];
  onSaveMulti?: (items: IslandSlot[]) => void;
  pluItems: PLUEntry[];
}

export default function SlotEditor({
  open,
  onClose,
  label,
  mode,
  slot,
  onSaveSingle,
  onClearSingle,
  items = [],
  onSaveMulti,
  pluItems,
}: SlotEditorProps) {
  // Single mode state
  const [productName, setProductName] = useState("");
  const [plu, setPlu] = useState("");
  const [price, setPrice] = useState("");
  const [flags, setFlags] = useState<SlotFlag[]>([]);
  const [notes, setNotes] = useState("");
  const [suggestions, setSuggestions] = useState<PLUEntry[]>([]);

  // Multi mode state
  const [multiItems, setMultiItems] = useState<IslandSlot[]>([]);
  const [addingNew, setAddingNew] = useState(false);

  useEffect(() => {
    if (open) {
      setSuggestions([]);
      if (mode === "single") {
        setProductName(slot?.productName || "");
        setPlu(slot?.plu || "");
        setPrice(slot?.price || "");
        setFlags(slot?.flags ? [...slot.flags] : []);
        setNotes(slot?.notes || "");
      } else {
        setMultiItems([...items]);
        setAddingNew(false);
        resetAddFields();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const resetAddFields = () => {
    setProductName("");
    setPlu("");
    setPrice("");
    setFlags([]);
    setNotes("");
    setSuggestions([]);
  };

  const [suggestionSource, setSuggestionSource] = useState<'plu' | 'name'>('plu');

  const handlePluSearch = (val: string) => {
    setPlu(val);
    setSuggestionSource('plu');
    if (val.length >= 1) {
      setSuggestions(
        pluItems
          .filter((p) => fuzzyMatch(p.plu + ' ' + p.name, val))
          .slice(0, 5),
      );
    } else {
      setSuggestions([]);
    }
  };

  const handleNameSearch = (val: string) => {
    setProductName(val);
    setSuggestionSource('name');
    if (val.length >= 1) {
      setSuggestions(
        pluItems
          .filter((p) => fuzzyMatch(p.name + ' ' + p.plu, val))
          .slice(0, 5),
      );
    } else {
      setSuggestions([]);
    }
  };

  const selectPlu = (entry: PLUEntry) => {
    setPlu(entry.plu);
    setProductName(entry.name);
    setSuggestions([]);
  };

  const toggleFlag = (flag: SlotFlag) => {
    setFlags((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag],
    );
  };

  // Single mode save
  const handleSaveSingle = () => {
    if (!productName.trim() || !onSaveSingle) return;
    onSaveSingle({
      id: slot?.id || createEmptySlot().id,
      productName: productName.trim(),
      plu: plu.trim(),
      price: price.trim(),
      flags,
      notes: notes.trim(),
    });
    onClose();
  };

  // Multi mode: add product to list
  const handleAddToMulti = () => {
    if (!productName.trim()) return;
    const newItem: IslandSlot = {
      id: createEmptySlot().id,
      productName: productName.trim(),
      plu: plu.trim(),
      price: price.trim(),
      flags: [...flags],
      notes: notes.trim(),
    };
    setMultiItems([...multiItems, newItem]);
    resetAddFields();
    setAddingNew(false);
  };

  const removeFromMulti = (id: string) => {
    setMultiItems(multiItems.filter((i) => i.id !== id));
  };

  const handleSaveMulti = () => {
    if (onSaveMulti) {
      onSaveMulti(multiItems);
    }
    onClose();
  };

  const formFields = (
    <>
      <div className="relative">
        <label className="block text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-1.5">
          PLU Code
        </label>
        <input
          type="text"
          value={plu}
          onChange={(e) => handlePluSearch(e.target.value)}
          placeholder="Search PLU or product..."
          className="w-full py-3 px-3.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-[15px] outline-none focus:border-heb-red-500 transition-colors placeholder:text-zinc-400"
        />
        {suggestions.length > 0 && suggestionSource === 'plu' && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-lg overflow-hidden z-10 shadow-lg">
            {suggestions.map((s) => (
              <button
                key={s.id}
                onClick={() => selectPlu(s)}
                className="w-full text-left px-3 py-2.5 hover:bg-zinc-50 transition-colors border-b border-zinc-100 last:border-0"
              >
                <span className="font-mono text-heb-red-500 text-sm font-bold">
                  {s.plu}
                </span>
                <span className="text-zinc-600 text-sm ml-2">{s.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <label className="block text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-1.5">
          Product Name *
        </label>
        <input
          type="text"
          value={productName}
          onChange={(e) => handleNameSearch(e.target.value)}
          placeholder="e.g. Beef Ribeye Steak"
          className="w-full py-3 px-3.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-[15px] outline-none focus:border-heb-red-500 transition-colors placeholder:text-zinc-400"
        />
        {suggestions.length > 0 && suggestionSource === 'name' && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-lg overflow-hidden z-10 shadow-lg">
            {suggestions.map((s) => (
              <button
                key={s.id}
                onClick={() => selectPlu(s)}
                className="w-full text-left px-3 py-2.5 hover:bg-zinc-50 transition-colors border-b border-zinc-100 last:border-0"
              >
                <span className="font-mono text-heb-red-500 text-sm font-bold">
                  {s.plu}
                </span>
                <span className="text-zinc-600 text-sm ml-2">{s.name}</span>
              </button>
            ))}
          </div>
        )}

      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-1.5">
            Price
          </label>
          <input
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="$5.99/lb"
            className="w-full py-3 px-3.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-[15px] outline-none focus:border-heb-red-500 transition-colors placeholder:text-zinc-400"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-1.5">
            Notes
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any notes..."
            className="w-full py-3 px-3.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-[15px] outline-none focus:border-heb-red-500 transition-colors placeholder:text-zinc-400"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-1.5">
          Flags
        </label>
        <div className="flex flex-wrap gap-2">
          {SLOT_FLAGS.map((f) => (
            <button
              key={f.value}
              onClick={() => toggleFlag(f.value)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                flags.includes(f.value)
                  ? f.color + " border border-current"
                  : "bg-zinc-50 text-zinc-600 border border-zinc-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <BottomSheet open={open} onClose={onClose} title={label}>
      {mode === "single" ? (
        <div className="space-y-4">
          {formFields}
          <button
            onClick={handleSaveSingle}
            disabled={!productName.trim()}
            className="w-full py-3.5 rounded-xl bg-emerald-600 text-white font-bold text-[15px] hover:bg-emerald-700 active:scale-[0.97] transition-all disabled:opacity-40"
          >
            Save
          </button>
          {slot && onClearSingle && (
            <button
              onClick={() => {
                onClearSingle();
                onClose();
              }}
              className="w-full py-3 rounded-xl border border-heb-red-200 text-heb-red-500 font-semibold text-sm hover:bg-heb-red-50 transition-colors"
            >
              Clear slot
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Existing items */}
          {multiItems.length > 0 && (
            <div className="space-y-2">
              {multiItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-emerald-700 truncate">
                      {item.productName}
                    </div>
                    <div className="flex gap-1.5 mt-0.5">
                      {item.plu && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500 font-mono">
                          {item.plu}
                        </span>
                      )}
                      {item.price && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500 font-mono">
                          {item.price}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromMulti(item.id)}
                    className="text-zinc-600 hover:text-heb-red-400 text-lg"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add new item form */}
          {addingNew ? (
            <div className="p-3 rounded-xl border border-zinc-200 bg-zinc-50 space-y-3">
              <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                Add product
              </div>
              {formFields}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setAddingNew(false);
                    resetAddFields();
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-zinc-500 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddToMulti}
                  disabled={!productName.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold disabled:opacity-40"
                >
                  Add
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingNew(true)}
              className="w-full py-3 rounded-xl border border-dashed border-zinc-300 text-zinc-400 text-sm font-semibold hover:border-zinc-400 hover:text-zinc-600 transition-colors"
            >
              + Add product
            </button>
          )}

          <button
            onClick={handleSaveMulti}
            className="w-full py-3.5 rounded-xl bg-emerald-600 text-white font-bold text-[15px] hover:bg-emerald-700 active:scale-[0.97] transition-all"
          >
            Save {label}
          </button>
        </div>
      )}
    </BottomSheet>
  );
}
