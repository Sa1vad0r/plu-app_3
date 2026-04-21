"use client";

import { useState, useCallback, useRef } from "react";
import {
  IslandSlot,
  WeekPlan,
  ISLANDS,
  countFilledSlots,
} from "@/types/island";
import { PLUEntry } from "@/types/plu";
import { useIslandStore } from "@/lib/islandStore";
import { compressImage } from "@/lib/store";
import IslandMap, { SlotLocation } from "./IslandMap";
import SlotEditor from "./SlotEditor";

interface IslandsTabProps {
  pluItems: PLUEntry[];
  onToast: (msg: string, type?: "success" | "error") => void;
}

type WeekView = "current" | "next";

export default function IslandsTab({ pluItems, onToast }: IslandsTabProps) {
  const { currentWeek, nextWeek, updateCurrentWeek, updateNextWeek, rollWeek } =
    useIslandStore();

  const [weekView, setWeekView] = useState<WeekView>("current");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editLocation, setEditLocation] = useState<SlotLocation | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [showAdImage, setShowAdImage] = useState(false);
  const adInputRef = useRef<HTMLInputElement>(null);

  const activePlan = weekView === "current" ? currentWeek : nextWeek;
  const updatePlan =
    weekView === "current" ? updateCurrentWeek : updateNextWeek;

  const handleSelect = (loc: SlotLocation) => {
    if (loc.type === "cell") {
      setSelectedKey(loc.key);
    } else if (loc.type === "endcap") {
      setSelectedKey(`ec-${loc.endcapNum}`);
    } else {
      setSelectedKey(`extra-${loc.extraId}`);
    }
    setEditLocation(loc);
    setEditorOpen(true);
  };

  // Single cell save
  const handleSaveSingle = useCallback(
    (slot: IslandSlot) => {
      if (!editLocation || editLocation.type !== "cell") return;
      const plan = { ...activePlan, slots: { ...activePlan.slots } };
      plan.slots[editLocation.key] = slot;
      updatePlan(plan);
      onToast("Slot updated!");
    },
    [editLocation, activePlan, updatePlan, onToast],
  );

  const handleClearSingle = useCallback(() => {
    if (!editLocation || editLocation.type !== "cell") return;
    const plan = { ...activePlan, slots: { ...activePlan.slots } };
    plan.slots[editLocation.key] = null;
    updatePlan(plan);
    onToast("Slot cleared", "error");
  }, [editLocation, activePlan, updatePlan, onToast]);

  // Multi save (endcaps, extras)
  const handleSaveMulti = useCallback(
    (items: IslandSlot[]) => {
      if (!editLocation) return;
      const plan = { ...activePlan };
      if (editLocation.type === "endcap") {
        plan.endcaps = { ...plan.endcaps, [editLocation.endcapNum]: items };
      } else if (editLocation.type === "extra") {
        plan.extras = { ...plan.extras, [editLocation.extraId]: items };
      }
      updatePlan(plan);
      onToast("Updated!");
    },
    [editLocation, activePlan, updatePlan, onToast],
  );

  const handleAdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 800);
      updatePlan({ ...activePlan, adImage: compressed });
      onToast("Ad sheet uploaded!");
    } catch {
      onToast("Failed to upload", "error");
    }
    e.target.value = "";
  };

  const handleExport = () => {
    const lines: string[] = [];
    lines.push(`🏝️ ISLAND PLAN — ${activePlan.weekLabel}`);
    lines.push("━━━━━━━━━━━━━━━━━━━━━━━━");

    // Extras
    ["meal_deal", "freezer_display"].forEach((id) => {
      const arr = activePlan.extras[id] || [];
      if (arr.length > 0) {
        const lbl = id === "meal_deal" ? "Meal Deal" : "Freezer Display";
        lines.push(`\n${lbl}:`);
        arr.forEach((item) => {
          lines.push(
            `  • ${item.productName}${item.price ? " — " + item.price : ""}`,
          );
        });
      }
    });

    ISLANDS.forEach((island) => {
      lines.push(`\n--- ${island.label} ---`);
      const topEC = activePlan.endcaps[island.topEndcap] || [];
      if (topEC.length > 0) {
        lines.push(`  ENDCAP ${island.topEndcap}:`);
        topEC.forEach((item) =>
          lines.push(
            `    • ${item.productName}${item.price ? " — " + item.price : ""}`,
          ),
        );
      }

      for (let r = 0; r < island.rows; r++) {
        const left = activePlan.slots[`${island.id}-${r}-L`];
        const right = activePlan.slots[`${island.id}-${r}-R`];
        if (left || right) {
          const lStr = left ? left.productName : "(empty)";
          const rStr = right ? right.productName : "(empty)";
          lines.push(
            `  Row ${(r + 1).toString().padStart(2)}: ${lStr} | ${rStr}`,
          );
        }
      }

      const botEC = activePlan.endcaps[island.bottomEndcap] || [];
      if (botEC.length > 0) {
        lines.push(`  Endcap ${island.bottomEndcap}:`);
        botEC.forEach((item) =>
          lines.push(
            `    • ${item.productName}${item.price ? " — " + item.price : ""}`,
          ),
        );
      }
    });

    navigator.clipboard.writeText(lines.join("\n")).then(
      () => onToast("Plan copied!"),
      () => onToast("Failed to copy", "error"),
    );
  };

  const handleRollWeek = () => {
    if (
      confirm("Move next week to current? This replaces the current week plan.")
    ) {
      rollWeek();
      setWeekView("current");
      onToast("Week rolled forward!");
    }
  };

  // Editor props based on location type
  const getEditorProps = () => {
    if (!editLocation) return null;
    if (editLocation.type === "cell") {
      return {
        mode: "single" as const,
        slot: activePlan.slots[editLocation.key] || null,
        onSaveSingle: handleSaveSingle,
        onClearSingle: handleClearSingle,
      };
    }
    if (editLocation.type === "endcap") {
      return {
        mode: "multi" as const,
        items: activePlan.endcaps[editLocation.endcapNum] || [],
        onSaveMulti: handleSaveMulti,
      };
    }
    if (editLocation.type === "extra") {
      return {
        mode: "multi" as const,
        items: activePlan.extras[editLocation.extraId] || [],
        onSaveMulti: handleSaveMulti,
      };
    }
    return null;
  };

  const editorProps = getEditorProps();
  const filled = countFilledSlots(activePlan);

  return (
    <div>
      <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800/50">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between px-4 pt-3 pb-2.5">
            <div>
              <span className="font-mono font-bold text-xl text-red-500 tracking-tight">
                Islands
              </span>
              <span className="text-zinc-600 text-xs font-normal ml-1.5">
                {filled} filled
              </span>
            </div>
            <div className="flex gap-2">
              {activePlan.adImage && (
                <button
                  onClick={() => setShowAdImage(true)}
                  className="w-10 h-10 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 flex items-center justify-center text-lg hover:bg-zinc-800 active:scale-95 transition-all"
                >
                  📰
                </button>
              )}
              <button
                onClick={() => adInputRef.current?.click()}
                className="w-10 h-10 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 flex items-center justify-center text-lg hover:bg-zinc-800 active:scale-95 transition-all"
              >
                📷
              </button>
              <button
                onClick={handleExport}
                className="w-10 h-10 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 flex items-center justify-center text-lg hover:bg-zinc-800 active:scale-95 transition-all"
              >
                📋
              </button>
            </div>
          </div>

          <div className="flex gap-0 px-4">
            <button
              onClick={() => setWeekView("current")}
              className={`flex-1 py-2 text-[13px] font-semibold border-b-2 transition-colors ${
                weekView === "current"
                  ? "text-red-500 border-red-500"
                  : "text-zinc-500 border-transparent"
              }`}
            >
              {currentWeek.weekLabel}
              <span className="text-zinc-600 text-[10px] ml-1">(current)</span>
            </button>
            <button
              onClick={() => setWeekView("next")}
              className={`flex-1 py-2 text-[13px] font-semibold border-b-2 transition-colors ${
                weekView === "next"
                  ? "text-red-500 border-red-500"
                  : "text-zinc-500 border-transparent"
              }`}
            >
              {nextWeek.weekLabel}
              <span className="text-zinc-600 text-[10px] ml-1">(next)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Legend */}
      <div className="max-w-lg mx-auto flex gap-4 justify-center px-4 py-2.5">
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
          <div className="w-3 h-3 rounded-sm bg-zinc-900/50 border border-zinc-700" />
          Empty
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
          <div className="w-3 h-3 rounded-sm bg-emerald-900 border border-emerald-700" />
          Filled
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
          <div className="w-3 h-3 rounded-sm bg-amber-600 border border-amber-400" />
          Selected
        </div>
      </div>

      <main className="max-w-lg mx-auto px-3 pb-28">
        <IslandMap
          plan={activePlan}
          selectedKey={selectedKey}
          onSelect={handleSelect}
        />

        {weekView === "current" && (
          <div className="mt-6">
            <button
              onClick={handleRollWeek}
              className="w-full py-3 rounded-xl border border-zinc-700 text-zinc-400 text-sm font-semibold hover:border-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Roll Next Week → Current
            </button>
          </div>
        )}
      </main>

      {/* Slot Editor */}
      {editorProps && (
        <SlotEditor
          open={editorOpen}
          onClose={() => {
            setEditorOpen(false);
            setSelectedKey(null);
          }}
          label={editLocation?.label || ""}
          pluItems={pluItems}
          {...editorProps}
        />
      )}

      {/* Ad Image Viewer */}
      {showAdImage && activePlan.adImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowAdImage(false)}
        >
          <div className="relative max-w-full max-h-full">
            <img
              src={activePlan.adImage}
              alt="Ad sheet"
              className="max-w-full max-h-[85vh] object-contain rounded-xl"
            />
            <button
              onClick={() => setShowAdImage(false)}
              className="absolute top-2 right-2 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center text-xl"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <input
        ref={adInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleAdUpload}
        className="hidden"
      />
    </div>
  );
}
