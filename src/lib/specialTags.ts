export interface SpecialTag {
  key: string;
  label: string;
  badgeClass: string; // Tailwind classes for the badge
  dotClass: string;   // Tailwind classes for the left-edge dot
  matches: string[];  // substrings to check against tag text (lowercase)
}

export const SPECIAL_TAGS: SpecialTag[] = [
  {
    key: 'wagyu',
    label: 'WAGYU',
    badgeClass: 'bg-purple-100 text-purple-700 border border-purple-300 font-black',
    dotClass: 'bg-purple-400',
    matches: ['wagyu'],
  },
  {
    key: 'prime',
    label: '⭐ PRIME',
    badgeClass: 'bg-amber-100 text-amber-700 border border-amber-300 font-black',
    dotClass: 'bg-amber-400',
    matches: ['prime'],
  },
  {
    key: 'grass-fed',
    label: '🌿 GRASS FED',
    badgeClass: 'bg-emerald-100 text-emerald-700 border border-emerald-300 font-bold',
    dotClass: 'bg-emerald-400',
    matches: ['grass fed', 'grass-fed', 'grassfed'],
  },
  {
    key: 'thin',
    label: 'THIN CUT',
    badgeClass: 'bg-sky-100 text-sky-700 border border-sky-300 font-bold',
    dotClass: 'bg-sky-400',
    matches: ['thin cut', 'thin'],
  },
  {
    key: 'thick',
    label: 'THICK CUT',
    badgeClass: 'bg-orange-100 text-orange-700 border border-orange-300 font-bold',
    dotClass: 'bg-orange-400',
    matches: ['thick cut', 'thick'],
  },
];

export function getSpecialTags(tags: string[]): SpecialTag[] {
  const lower = tags.map((t) => t.toLowerCase());
  return SPECIAL_TAGS.filter((st) =>
    st.matches.some((m) => lower.some((t) => t.includes(m)))
  );
}

// Returns tag strings that are NOT covered by a special badge
export function regularTags(tags: string[]): string[] {
  return tags.filter((t) => {
    const tl = t.toLowerCase();
    return !SPECIAL_TAGS.some((st) => st.matches.some((m) => tl.includes(m)));
  });
}
