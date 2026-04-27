import { describe, it, expect } from 'vitest';
import { getGroupKey, getVariantSuffix, groupPLUItems } from './grouping';
import type { PLUEntry } from '@/types/plu';

function makePLU(overrides: Partial<PLUEntry>): PLUEntry {
  return {
    id: 'id_1',
    plu: '1000',
    name: 'Beef Ribeye Steak',
    category: 'beef',
    tray: '4S',
    weight: '',
    tags: [],
    photo: null,
    notes: '',
    updated: 0,
    ...overrides,
  };
}

describe('getGroupKey', () => {
  it('returns first 3 words, lowercased', () => {
    expect(getGroupKey('Beef Ribeye Steak Premium')).toBe('beef ribeye steak');
  });

  it('returns all words when fewer than 3', () => {
    expect(getGroupKey('Chicken Thighs')).toBe('chicken thighs');
  });

  it('returns the single word when only one word is given', () => {
    expect(getGroupKey('Beef')).toBe('beef');
  });

  it('replaces special characters with spaces', () => {
    expect(getGroupKey('Beef/Ribeye Steak!')).toBe('beef ribeye steak');
  });

  it('collapses multiple spaces', () => {
    expect(getGroupKey('Beef   Ribeye   Steak')).toBe('beef ribeye steak');
  });

  it('handles a name that is only special characters', () => {
    // After stripping and trimming, this becomes an empty string → slice(0,3) on [] returns []
    expect(getGroupKey('---')).toBe('');
  });
});

describe('getVariantSuffix', () => {
  it('returns words beyond the group key word count', () => {
    expect(getVariantSuffix('Beef Ribeye Steak Boneless', 'beef ribeye steak')).toBe('Boneless');
  });

  it('returns multiple trailing words', () => {
    expect(getVariantSuffix('Beef Ribeye Steak Bone-In Thick', 'beef ribeye steak')).toBe('Bone-In Thick');
  });

  it('falls back to the full name when there are no words beyond the key', () => {
    expect(getVariantSuffix('Beef Ribeye Steak', 'beef ribeye steak')).toBe('Beef Ribeye Steak');
  });

  it('falls back to the full name when key has 1 word and name has 1 word', () => {
    expect(getVariantSuffix('Beef', 'beef')).toBe('Beef');
  });
});

describe('groupPLUItems', () => {
  it('groups items with the same category and group key', () => {
    const items = [
      makePLU({ id: '1', plu: '1000', name: 'Beef Ribeye Steak Boneless' }),
      makePLU({ id: '2', plu: '1001', name: 'Beef Ribeye Steak Bone-In' }),
    ];
    const groups = groupPLUItems(items);
    expect(groups).toHaveLength(1);
    expect(groups[0].items).toHaveLength(2);
  });

  it('does not group items with the same name but different categories', () => {
    const items = [
      makePLU({ id: '1', plu: '1000', name: 'Ground Beef 80/20', category: 'beef' }),
      makePLU({ id: '2', plu: '2000', name: 'Ground Beef 80/20', category: 'pork' }),
    ];
    const groups = groupPLUItems(items);
    expect(groups).toHaveLength(2);
  });

  it('sorts items within a group by name', () => {
    const items = [
      makePLU({ id: '1', plu: '1001', name: 'Beef Ribeye Steak Thick' }),
      makePLU({ id: '2', plu: '1000', name: 'Beef Ribeye Steak Boneless' }),
    ];
    const [group] = groupPLUItems(items);
    expect(group.items[0].name).toBe('Beef Ribeye Steak Boneless');
    expect(group.items[1].name).toBe('Beef Ribeye Steak Thick');
  });

  it('preserves the category from the grouped items', () => {
    const items = [makePLU({ category: 'chicken' })];
    const [group] = groupPLUItems(items);
    expect(group.category).toBe('chicken');
  });

  it('title-cases the displayName from the group key', () => {
    const items = [makePLU({ name: 'beef ribeye steak premium' })];
    const [group] = groupPLUItems(items);
    expect(group.displayName).toBe('Beef Ribeye Steak');
  });

  it('returns an empty array for no input', () => {
    expect(groupPLUItems([])).toEqual([]);
  });

  it('returns one group per unique category+key combination', () => {
    const items = [
      makePLU({ id: '1', plu: '1000', name: 'Beef Chuck Roast', category: 'beef' }),
      makePLU({ id: '2', plu: '2000', name: 'Beef Ribeye Steak', category: 'beef' }),
      makePLU({ id: '3', plu: '3000', name: 'Chicken Breast Boneless', category: 'chicken' }),
    ];
    expect(groupPLUItems(items)).toHaveLength(3);
  });
});
