export interface IslandSlot {
  id: string;
  productName: string;
  plu: string;
  price: string;
  flags: SlotFlag[];
  notes: string;
}

export type SlotFlag = 'coupon' | 'bogo' | 'free_item' | 'managers_special' | 'new';

export const SLOT_FLAGS: { value: SlotFlag; label: string; short: string; color: string }[] = [
  { value: 'coupon', label: 'Coupon', short: 'CPN', color: 'bg-amber-400/15 text-amber-400' },
  { value: 'bogo', label: 'BOGO', short: 'BOGO', color: 'bg-emerald-400/15 text-emerald-400' },
  { value: 'free_item', label: 'Free Item', short: 'FREE', color: 'bg-blue-400/15 text-blue-400' },
  { value: 'managers_special', label: "Manager's Special", short: 'MGR', color: 'bg-purple-400/15 text-purple-400' },
  { value: 'new', label: 'New', short: 'NEW', color: 'bg-heb-red-400/15 text-heb-red-400' },
];

export interface IslandConfig {
  id: string;
  label: string;
  topEndcap: string;
  bottomEndcap: string;
  rows: number; // rows per side (left column + right column)
  type: 'long' | 'short';
}

export const ISLANDS: IslandConfig[] = [
  { id: 'island1', label: 'Island 1', topEndcap: '4', bottomEndcap: '3', rows: 25, type: 'short' },
  { id: 'island3', label: 'Island 3', topEndcap: '2', bottomEndcap: '1', rows: 30, type: 'long' },
  { id: 'island2', label: 'Island 2', topEndcap: '6', bottomEndcap: '5', rows: 30, type: 'long' },
];

export interface ExtraSection {
  id: string;
  label: string;
}

export const EXTRA_SECTIONS: ExtraSection[] = [
  { id: 'meal_deal', label: 'Meal Deal' },
  { id: 'freezer_display', label: 'Freezer Display' },
];

// Endcaps and extras can hold multiple products
export interface WeekPlan {
  id: string;
  weekLabel: string;
  adImage: string | null;
  // Each island slot: keyed as "islandId-row-side" e.g. "island1-0-L"
  slots: Record<string, IslandSlot | null>;
  // Endcaps hold multiple products: keyed by endcap number
  endcaps: Record<string, IslandSlot[]>;
  // Extras hold multiple products
  extras: Record<string, IslandSlot[]>;
  created: number;
  updated: number;
}

export function createEmptySlot(): IslandSlot {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    productName: '',
    plu: '',
    price: '',
    flags: [],
    notes: '',
  };
}

export function createEmptyWeekPlan(weekLabel: string): WeekPlan {
  const slots: Record<string, IslandSlot | null> = {};
  ISLANDS.forEach((island) => {
    for (let r = 0; r < island.rows; r++) {
      slots[`${island.id}-${r}-L`] = null;
      slots[`${island.id}-${r}-R`] = null;
    }
  });

  const endcaps: Record<string, IslandSlot[]> = {};
  ISLANDS.forEach((island) => {
    endcaps[island.topEndcap] = [];
    endcaps[island.bottomEndcap] = [];
  });

  const extras: Record<string, IslandSlot[]> = {};
  EXTRA_SECTIONS.forEach((s) => {
    extras[s.id] = [];
  });

  return {
    id: 'week_' + Date.now().toString(36),
    weekLabel,
    adImage: null,
    slots,
    endcaps,
    extras,
    created: Date.now(),
    updated: Date.now(),
  };
}

// Wednesday-based week cycle (new ad drops every Wednesday)
export function getCurrentWedLabel(): string {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  // Find most recent Wednesday
  // Wed = 3. If today is Wed, diff=0. If Thu(4), diff=1. If Tue(2), diff=6.
  const diff = (day - 3 + 7) % 7;
  const wed = new Date(now);
  wed.setDate(now.getDate() - diff);
  return `Ad ${wed.getMonth() + 1}/${wed.getDate()}`;
}

export function getNextWedLabel(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = (day - 3 + 7) % 7;
  const wed = new Date(now);
  wed.setDate(now.getDate() - diff + 7);
  return `Ad ${wed.getMonth() + 1}/${wed.getDate()}`;
}

export function countFilledSlots(plan: WeekPlan): number {
  let count = 0;
  Object.values(plan.slots).forEach((s) => { if (s) count++; });
  Object.values(plan.endcaps).forEach((arr) => { count += arr.length; });
  Object.values(plan.extras).forEach((arr) => { count += arr.length; });
  return count;
}
