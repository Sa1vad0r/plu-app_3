export interface SpecialTag {
  key: string;
  label: string;
  badgeClass: string; // Tailwind classes for the badge pill (includes rounding)
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
    // Dark gray bg, light blue-purple text
    badgeClass: 'bg-zinc-800 text-violet-300 border border-violet-600 font-black tracking-widest rounded-md',
    dotClass: 'bg-violet-400',
    matches: ['wagyu'],
  },
  {
    key: 'grass-fed',
    label: '🌿 GRASS FED',
    // Slightly lighter than before
    badgeClass: 'bg-emerald-800 text-emerald-100 border border-emerald-600 font-bold rounded-md',
    dotClass: 'bg-emerald-700',
    matches: ['grass fed', 'grass-fed', 'grassfed'],
  },
  {
    key: 'prime',
    label: 'PRIME',
    // Dark gray bg, light red text
    badgeClass: 'bg-zinc-800 text-heb-red-300 border border-zinc-600 font-black tracking-wide rounded-md',
    dotClass: 'bg-heb-red-400',
    matches: ['prime'],
  },
  {
    key: 'choice',
    label: 'CHOICE',
    badgeClass: 'bg-blue-600 text-white border border-blue-800 font-bold tracking-wide rounded-md',
    dotClass: 'bg-blue-600',
    matches: ['choice'],
  },
  {
    key: 'select',
    label: 'SELECT',
    badgeClass: 'bg-heb-red-500 text-white border border-heb-red-700 font-bold tracking-wide rounded-md',
    dotClass: 'bg-heb-red-500',
    matches: ['select'],
  },
  {
    key: 'value',
    label: 'VALUE',
    // Dusty bright orange bg, mid red border and text
    badgeClass: 'bg-orange-400 text-red-600 border border-red-500 font-bold tracking-wide rounded-md',
    dotClass: 'bg-orange-500',
    matches: ['value beef', 'value grade'],
  },
  // ── Packaging types ────────────────────────────────────────────────────
  {
    key: 'vp',
    label: 'VP',
    // Square sticker — solid HEB red, minimal rounding
    badgeClass: 'bg-heb-red-500 text-white border border-heb-red-700 font-black text-[12px] px-2.5 rounded-sm',
    dotClass: 'bg-heb-red-500',
    matches: ['value pack', 'vp', 'family pack'],
  },
  {
    key: 'texas-pack',
    label: 'TX',
    // Square sticker — Texas flag blue bg, Texas flag red border, same size as VP
    badgeClass: 'bg-blue-700 text-white border border-red-500 font-black text-[12px] px-2.5 rounded-sm',
    dotClass: 'bg-blue-700',
    // 'tx' covers tags entered as just "TX" (matches 'vp' pattern)
    matches: ['texas pack', 'tx pack', 'tx'],
  },
  // ── Cut type ───────────────────────────────────────────────────────────
  {
    key: 'thick',
    label: 'THICK',
    // Lipstick red — solid dark rose
    badgeClass: 'bg-rose-700 text-white border border-rose-900 font-bold rounded-md',
    dotClass: 'bg-rose-700',
    matches: ['thick cut', 'thick'],
  },
  {
    key: 'thin',
    label: 'THIN',
    // Inverse of thick — light rose bg, rose text/border
    badgeClass: 'bg-rose-50 text-rose-700 border border-rose-600 font-bold rounded-md',
    dotClass: 'bg-rose-500',
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
