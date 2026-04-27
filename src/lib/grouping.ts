import { PLUEntry } from '@/types/plu';

export interface PLUGroup {
  key: string;
  displayName: string;
  category: string;
  items: PLUEntry[];
}

// Normalize a name to its 3-word group key
export function getGroupKey(name: string): string {
  const normalized = name
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return normalized.split(' ').slice(0, 3).join(' ');
}

function toTitleCase(str: string): string {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

// The part of a full name that differs from the group key — used as variant label
export function getVariantSuffix(fullName: string, groupKey: string): string {
  const keyWordCount = groupKey.split(' ').length;
  const words = fullName.trim().split(/\s+/);
  const suffix = words.slice(keyWordCount).join(' ');
  return suffix || fullName;
}

export function groupPLUItems(items: PLUEntry[]): PLUGroup[] {
  const map = new Map<string, PLUEntry[]>();

  for (const item of items) {
    const key = item.category + '|' + getGroupKey(item.name);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }

  const groups: PLUGroup[] = [];
  for (const [key, groupItems] of map.entries()) {
    const rawKey = key.split('|')[1];
    groups.push({
      key,
      displayName: toTitleCase(rawKey),
      category: groupItems[0].category,
      items: groupItems.sort((a, b) => a.name.localeCompare(b.name)),
    });
  }

  return groups;
}
