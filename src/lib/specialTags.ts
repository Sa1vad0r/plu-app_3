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
    badgeClass: 'bg-zinc-900 text-purple-400 border border-purple-700 font-black tracking-widest rounded-md',
    dotClass: 'bg-purple-500',
    matches: ['wagyu'],
  },
  {
    key: 'grass-fed',
    label: '🌿 GRASS FED',
    badgeClass: 'bg-emerald-900 text-emerald-100 border border-emerald-700 font-bold rounded-md',
    dotClass: 'bg-emerald-900',
    matches: ['grass fed', 'grass-fed', 'grassfed'],
  },
  {
    key: 'prime',
    label: 'PRIME',
    badgeClass: 'bg-black text-heb-red-500 border border-zinc-700 font-black tracking-wide rounded-md',
    dotClass: 'bg-heb-red-500',
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
    badgeClass: 'bg-orange-800 text-heb-red-400 border border-red-600 font-bold tracking-wide rounded-md',
    dotClass: 'bg-orange-800',
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
    matches: ['texas pack', 'tx pack'],
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
