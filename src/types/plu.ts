export interface PLUEntry {
  id: string;
  plu: string;
  name: string;
  category: Category | '';
  tray: TraySize | '';
  weight: string;
  tags: string[];
  photo: string | null;
  notes: string;
  updated: number;
  favorite?: boolean;
}

export type Category =
  | 'beef'
  | 'pork'
  | 'chicken'
  | 'turkey'
  | 'seafood'
  | 'lamb'
  | 'other';

export type TraySize =
  | '2S'
  | '2D'
  | '4S'
  | '4D'
  | '8S'
  | '8D'
  | '10S'
  | '17S'
  | '25S'
  | '25D'
  | '48S'
  | 'CL'
  | 'bag'
  | 'tube'
  | 'other';

export const CATEGORIES: { value: Category; label: string; icon: string }[] = [
  { value: 'beef', label: 'Beef', icon: '🥩' },
  { value: 'pork', label: 'Pork', icon: '🐖' },
  { value: 'chicken', label: 'Chicken', icon: '🍗' },
  { value: 'turkey', label: 'Turkey', icon: '🦃' },
  { value: 'seafood', label: 'Seafood', icon: '🐟' },
  { value: 'lamb', label: 'Lamb', icon: '🐑' },
  { value: 'other', label: 'Other', icon: '📦' },
];

export const TRAY_SIZES: { value: TraySize; label: string }[] = [
  { value: '2S', label: '2S' },
  { value: '2D', label: '2D' },
  { value: '4S', label: '4S' },
  { value: '4D', label: '4D' },
  { value: '8S', label: '8S' },
  { value: '8D', label: '8D' },
  { value: '10S', label: '10S' },
  { value: '17S', label: '17S' },
  { value: '25S', label: '25S' },
  { value: '25D', label: '25D' },
  { value: '48S', label: '48S' },
  { value: 'CL', label: 'CL (Clamshell)' },
  { value: 'bag', label: 'Bag' },
  { value: 'tube', label: 'Tube / Chub' },
  { value: 'other', label: 'Other' },
];

export function getCategoryIcon(cat: string): string {
  return CATEGORIES.find((c) => c.value === cat)?.icon || '📦';
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
