"use client";

import { ISLANDS, EXTRA_SECTIONS, IslandSlot } from "@/types/island";
import type { WeekPlan } from "@/types/island";

export type SlotLocation =
  | { type: "cell"; key: string; label: string }
  | { type: "endcap"; endcapNum: string; label: string }
  | { type: "extra"; extraId: string; label: string };

interface IslandMapProps {
  plan: WeekPlan;
  selectedKey: string | null;
  onSelect: (loc: SlotLocation) => void;
}

function Cell({
  filled,
  selected,
  onClick,
}: {
  filled: IslandSlot | null;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`h-7 flex items-center justify-center transition-all text-center overflow-hidden ${
        selected
          ? "bg-amber-600 outline outline-2 outline-amber-400 -outline-offset-1 z-10 relative"
          : filled
            ? "bg-emerald-900 hover:bg-emerald-800"
            : "bg-zinc-900/50 hover:bg-zinc-800/80"
      }`}
    >
      {filled ? (
        <span className="text-[7px] font-semibold text-emerald-300 truncate px-0.5 leading-tight">
          {filled.productName}
        </span>
      ) : (
        <span className="text-zinc-700 text-xs">+</span>
      )}
    </button>
  );
}

function EndcapBlock({
  label,
  items,
  selected,
  onClick,
}: {
  label: string;
  items: IslandSlot[];
  selected: boolean;
  onClick: () => void;
}) {
  const filled = items.length > 0;
  return (
    <button
      onClick={onClick}
      className={`w-full min-h-[44px] rounded-lg flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 transition-all ${
        selected
          ? "bg-amber-600 outline outline-2 outline-amber-400 -outline-offset-1"
          : filled
            ? "bg-emerald-900 border border-emerald-700 hover:bg-emerald-800"
            : "bg-zinc-900/50 border border-dashed border-zinc-700 hover:border-zinc-500"
      }`}
    >
      <span
        className={`text-[9px] font-bold uppercase tracking-wider ${
          selected
            ? "text-amber-200"
            : filled
              ? "text-emerald-500"
              : "text-zinc-600"
        }`}
      >
        {label}
      </span>
      {filled ? (
        items.map((item, i) => (
          <div key={i} className="text-center">
            <div
              className={`text-[9px] font-semibold leading-tight ${
                selected ? "text-amber-100" : "text-emerald-300"
              }`}
            >
              {item.productName}
            </div>
            {item.price && (
              <div
                className={`text-[8px] font-mono ${
                  selected ? "text-amber-200" : "text-emerald-400"
                }`}
              >
                {item.price}
              </div>
            )}
          </div>
        ))
      ) : (
        <span
          className={`text-lg ${selected ? "text-amber-300" : "text-zinc-700"}`}
        >
          +
        </span>
      )}
    </button>
  );
}

function ExtraBlock({
  label,
  items,
  selected,
  onClick,
}: {
  label: string;
  items: IslandSlot[];
  selected: boolean;
  onClick: () => void;
}) {
  const filled = items.length > 0;
  return (
    <button
      onClick={onClick}
      className={`w-full min-h-[56px] rounded-xl flex flex-col items-center justify-center gap-0.5 px-3 py-2 transition-all ${
        selected
          ? "bg-amber-600 outline outline-2 outline-amber-400 -outline-offset-1"
          : filled
            ? "bg-emerald-900 border border-emerald-700 hover:bg-emerald-800"
            : "bg-zinc-900/50 border border-dashed border-zinc-700 hover:border-zinc-500"
      }`}
    >
      <span
        className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${
          selected
            ? "text-amber-200"
            : filled
              ? "text-emerald-500"
              : "text-zinc-600"
        }`}
      >
        {label}
      </span>
      {filled ? (
        items.map((item, i) => (
          <div key={i} className="text-center">
            <div
              className={`text-[10px] font-semibold ${
                selected ? "text-amber-100" : "text-emerald-300"
              }`}
            >
              {item.productName}
            </div>
            {item.price && (
              <div
                className={`text-[8px] font-mono ${
                  selected ? "text-amber-200" : "text-emerald-400"
                }`}
              >
                {item.price}
              </div>
            )}
          </div>
        ))
      ) : (
        <span
          className={`text-lg ${selected ? "text-amber-300" : "text-zinc-700"}`}
        >
          +
        </span>
      )}
    </button>
  );
}

export default function IslandMap({
  plan,
  selectedKey,
  onSelect,
}: IslandMapProps) {
  const island3 = ISLANDS.find((i) => i.id === "island3")!;
  const island1 = ISLANDS.find((i) => i.id === "island1")!;
  const island2 = ISLANDS.find((i) => i.id === "island2")!;

  const renderIsland = (island: (typeof ISLANDS)[0], widthClass: string) => (
    <div key={island.id} className={`flex flex-col items-center ${widthClass}`}>
      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono mb-1.5 text-center">
        {island.label}
      </div>

      <EndcapBlock
        label={`ENDCAP ${island.topEndcap}`}
        items={plan.endcaps[island.topEndcap] || []}
        selected={selectedKey === `ec-${island.topEndcap}`}
        onClick={() =>
          onSelect({
            type: "endcap",
            endcapNum: island.topEndcap,
            label: `Endcap ${island.topEndcap}`,
          })
        }
      />

      <div className="w-full grid grid-cols-2 gap-px bg-zinc-800/50 border-x border-zinc-800/50 my-px">
        {Array.from({ length: island.rows }).flatMap((_, r) =>
          (["L", "R"] as const).map((side) => {
            const key = `${island.id}-${r}-${side}`;
            return (
              <Cell
                key={key}
                filled={plan.slots[key] || null}
                selected={selectedKey === key}
                onClick={() =>
                  onSelect({
                    type: "cell",
                    key,
                    label: `${island.label}, Row ${r + 1} ${side === "L" ? "Left" : "Right"}`,
                  })
                }
              />
            );
          }),
        )}
      </div>

      <EndcapBlock
        label={`ENDCAP ${island.bottomEndcap}`}
        items={plan.endcaps[island.bottomEndcap] || []}
        selected={selectedKey === `ec-${island.bottomEndcap}`}
        onClick={() =>
          onSelect({
            type: "endcap",
            endcapNum: island.bottomEndcap,
            label: `Endcap ${island.bottomEndcap}`,
          })
        }
      />
    </div>
  );

  const extraBlocks = (
    <div className="flex flex-col gap-3">
      {EXTRA_SECTIONS.map((extra) => (
        <ExtraBlock
          key={extra.id}
          label={extra.label}
          items={plan.extras[extra.id] || []}
          selected={selectedKey === `extra-${extra.id}`}
          onClick={() =>
            onSelect({
              type: "extra",
              extraId: extra.id,
              label: extra.label,
            })
          }
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-2" id="island-map">
      {/* Top row: Island 1 (left) + Extras (right) — same width columns */}
      <div className="flex gap-2 items-start">
        <div className="flex-1">{renderIsland(island1, "w-full")}</div>
        <div className="flex-1 pt-6">{extraBlocks}</div>
      </div>

      {/* Bottom row: Island 3 (left) + Island 2 (right) — same width columns */}
      <div className="flex gap-2 items-start">
        <div className="flex-1">{renderIsland(island3, "w-full")}</div>
        <div className="flex-1">{renderIsland(island2, "w-full")}</div>
      </div>
    </div>
  );
}
