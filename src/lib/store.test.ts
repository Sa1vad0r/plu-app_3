import { describe, it, expect } from 'vitest';
import { fuzzyMatch, searchScore, highlightMatch } from './store';

describe('fuzzyMatch', () => {
  it('returns true for an empty query', () => {
    expect(fuzzyMatch('anything', '')).toBe(true);
  });

  it('returns true for an exact match', () => {
    expect(fuzzyMatch('ribeye', 'ribeye')).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(fuzzyMatch('Ribeye Steak', 'ribeye')).toBe(true);
    expect(fuzzyMatch('ribeye steak', 'RIBEYE')).toBe(true);
  });

  it('returns true for a substring match', () => {
    expect(fuzzyMatch('beef ribeye steak', 'ribeye')).toBe(true);
  });

  it('returns true for a non-contiguous subsequence', () => {
    // 'b', 'f', 'r' appear in order in 'beef ribeye'
    expect(fuzzyMatch('beef ribeye', 'bfr')).toBe(true);
  });

  it('returns false when the query cannot be matched as a subsequence', () => {
    expect(fuzzyMatch('chicken', 'xyz')).toBe(false);
  });

  it('returns false when text is empty and query is non-empty', () => {
    expect(fuzzyMatch('', 'abc')).toBe(false);
  });

  it('returns true when both text and query are empty', () => {
    expect(fuzzyMatch('', '')).toBe(true);
  });
});

describe('searchScore', () => {
  const item = { plu: '1234', name: 'beef ribeye steak' };

  it('returns 0 for an empty query', () => {
    expect(searchScore(item, '')).toBe(0);
  });

  it('returns 100 for an exact PLU match', () => {
    expect(searchScore(item, '1234')).toBe(100);
  });

  it('returns 90 for an exact name match', () => {
    expect(searchScore(item, 'beef ribeye steak')).toBe(90);
  });

  it('returns 80 when PLU starts with the query', () => {
    expect(searchScore(item, '12')).toBe(80);
  });

  it('returns 70 when name starts with the query', () => {
    expect(searchScore(item, 'beef')).toBe(70);
  });

  it('returns 60 when PLU contains the query (non-prefix)', () => {
    expect(searchScore(item, '234')).toBe(60);
  });

  it('returns 50 when name contains the query (non-prefix)', () => {
    expect(searchScore(item, 'ribeye')).toBe(50);
  });

  it('returns 10 when the query matches neither PLU nor name by any tier', () => {
    expect(searchScore(item, 'zzz')).toBe(10);
  });

  it('higher scores beat lower scores — useful for sorting', () => {
    const exact = searchScore(item, '1234');
    const starts = searchScore(item, '12');
    const contains = searchScore(item, '234');
    expect(exact).toBeGreaterThan(starts);
    expect(starts).toBeGreaterThan(contains);
  });
});

describe('highlightMatch', () => {
  it('returns the text unchanged when query is empty', () => {
    expect(highlightMatch('Beef Ribeye', '')).toBe('Beef Ribeye');
  });

  it('wraps the matching substring in a <mark> tag', () => {
    expect(highlightMatch('Beef Ribeye', 'Ribeye')).toBe('Beef <mark>Ribeye</mark>');
  });

  it('is case-insensitive for locating the match but preserves original casing', () => {
    expect(highlightMatch('Beef Ribeye', 'ribeye')).toBe('Beef <mark>Ribeye</mark>');
  });

  it('returns the text unchanged when there is no match', () => {
    expect(highlightMatch('Beef Ribeye', 'chicken')).toBe('Beef Ribeye');
  });

  it('highlights the first occurrence only when the query appears multiple times', () => {
    const result = highlightMatch('beef beef', 'beef');
    expect(result).toBe('<mark>beef</mark> beef');
  });

  it('highlights a match at the very start', () => {
    expect(highlightMatch('Ribeye Steak', 'Ribeye')).toBe('<mark>Ribeye</mark> Steak');
  });

  it('highlights a match at the very end', () => {
    expect(highlightMatch('Beef Ribeye', 'Ribeye')).toBe('Beef <mark>Ribeye</mark>');
  });
});
