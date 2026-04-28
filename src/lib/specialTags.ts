export interface SpecialTag {
  key: string;
  label: string;
  badgeClass: string; // Tailwind classes for the badge pill
  dotClass: string;   // Tailwind classes for the left-edge accent stripe
  matches: string[];  // substrings to match against tag text (lowercase)
}

// Order matters: first match wins the left-edge accent stripe.
// Grade hierarchy (premium first), then packaging, then cut type.
export const SPECIAL_TAGS: SpecialTag[] = [
  // ── Beef grades ────────────────────────────────────────────────────────
  {
    key: 'wagyu',
    label: 'WAGYU',
    // Deep charcoal with gold — ultra-premium HEB Wagyu label feel
    badgeClass: 'bg-zinc-900 text-amber-300 border border-amber-500 font-black tracking-widest',
    dotClass: 'bg-amber-400',
    matches: ['wagyu'],
  },
  {
    key: 'grass-fed',
    label: '🌿 GRASS FED',
    // HEB Natural Grass Fed — green packaging
    badgeClass: 'bg-emerald-700 text-white border border-emerald-900 font-bold',
    dotClass: 'bg-emerald-600',
    matches: ['grass fed', 'grass-fed', 'grassfed'],
  },
  {
    key: 'prime',
    label: '⭐ PRIME',
    // HEB Prime — black label with gold text
    badgeClass: 'bg-zinc-800 text-yellow-300 border border-zinc-600 font-black tracking-wide',
    dotClass: 'bg-yellow-400',
    matches: ['prime'],
  },
  {
    key: 'choice',
    label: 'CHOICE',
    // HEB Choice — matches HEB corporate red
    badgeClass: 'bg-heb-red-500 text-white border border-heb-red-700 font-bold tracking-wide',
    dotClass: 'bg-heb-red-500',
    matches: ['choice'],
  },
  {
    key: 'select',
    label: 'SELECT',
    // USDA Select — industry blue
    badgeClass: 'bg-blue-600 text-white border border-blue-800 font-bold tracking-wide',
    dotClass: 'bg-blue-500',
    matches: ['select'],
  },
  {
    key: 'value',
    label: 'VALUE',
    // Value beef — yellow/budget
    badgeClass: 'bg-yellow-400 text-yellow-900 border border-yellow-600 font-bold tracking-wide',
    dotClass: 'bg-yellow-400',
    matches: ['value beef', 'value grade'],
  },
  // ── Packaging types ────────────────────────────────────────────────────
  {
    key: 'vp',
    label: 'VP',
    // Value Pack — bold orange, large text
    badgeClass: 'bg-orange-500 text-white border border-orange-700 font-black text-[12px] px-2.5',
    dotClass: 'bg-orange-500',
    matches: ['value pack', 'vp', 'family pack'],
  },
  {
    key: 'texas-pack',
    label: '⭐ TX PACK',
    // Texas Pack — Texas flag deep blue
    badgeClass: 'bg-blue-900 text-white border border-blue-700 font-bold',
    dotClass: 'bg-blue-800',
    matches: ['texas pack', 'tx pack'],
  },
  // ── Cut type ───────────────────────────────────────────────────────────
  {
    key: 'thick',
    label: 'THICK CUT',
    badgeClass: 'bg-orange-100 text-orange-800 border border-orange-400 font-bold',
    dotClass: 'bg-orange-400',
    matches: ['thick cut', 'thick'],
  },
  {
    key: 'thin',
    label: 'THIN CUT',
    badgeClass: 'bg-cyan-100 text-cyan-800 border border-cyan-400 font-bold',
    dotClass: 'bg-cyan-400',
    matches: ['thin cut', 'thin'],
  },
];

export function getSpecialTags(tags: string[]): SpecialTag[] {
  const lower = tags.map((t) => t.toLowerCase());
  return SPECIAL_TAGS.filter((st) =>
    st.matches.some((m) => lower.some((t) => t.includes(m)))
  );
}

// Returns tag strings not covered by any special badge (avoids duplication)
export function regularTags(tags: string[]): string[] {
  return tags.filter((t) => {
    const tl = t.toLowerCase();
    return !SPECIAL_TAGS.some((st) => st.matches.some((m) => tl.includes(m)));
  });
}
