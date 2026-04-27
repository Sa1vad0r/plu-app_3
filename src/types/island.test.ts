import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  createEmptyWeekPlan,
  getCurrentWedLabel,
  getNextWedLabel,
  countFilledSlots,
  createEmptySlot,
  ISLANDS,
  EXTRA_SECTIONS,
} from './island';
import type { WeekPlan } from './island';

afterEach(() => {
  vi.useRealTimers();
});

// Jan 2024: Wed=10, Thu=11, Fri=12, Sat=13, Sun=14, Mon=8, Tue=9
// Previous Wed for Jan 8–14 is Jan 10 (except Mon Jan 8 and Tue Jan 9 → Jan 3)
const CASES_CURRENT: [string, string, string][] = [
  ['2024-01-10', 'Wednesday', 'Ad 1/10'],
  ['2024-01-11', 'Thursday',  'Ad 1/10'],
  ['2024-01-12', 'Friday',    'Ad 1/10'],
  ['2024-01-13', 'Saturday',  'Ad 1/10'],
  ['2024-01-14', 'Sunday',    'Ad 1/10'],
  ['2024-01-08', 'Monday',    'Ad 1/3'],
  ['2024-01-09', 'Tuesday',   'Ad 1/3'],
];

const CASES_NEXT: [string, string, string][] = [
  ['2024-01-10', 'Wednesday', 'Ad 1/17'],
  ['2024-01-11', 'Thursday',  'Ad 1/17'],
  ['2024-01-08', 'Monday',    'Ad 1/10'],
  ['2024-01-09', 'Tuesday',   'Ad 1/10'],
];

describe('getCurrentWedLabel', () => {
  it.each(CASES_CURRENT)('on %s (%s) returns "%s"', (dateStr, _day, expected) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(`${dateStr}T12:00:00`));
    expect(getCurrentWedLabel()).toBe(expected);
  });
});

describe('getNextWedLabel', () => {
  it.each(CASES_NEXT)('on %s (%s) returns "%s"', (dateStr, _day, expected) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(`${dateStr}T12:00:00`));
    expect(getNextWedLabel()).toBe(expected);
  });
});

describe('createEmptyWeekPlan', () => {
  it('uses the provided weekLabel', () => {
    const plan = createEmptyWeekPlan('Ad 1/10');
    expect(plan.weekLabel).toBe('Ad 1/10');
  });

  it('initialises all island slot keys to null', () => {
    const plan = createEmptyWeekPlan('test');
    for (const island of ISLANDS) {
      for (let r = 0; r < island.rows; r++) {
        expect(plan.slots[`${island.id}-${r}-L`]).toBeNull();
        expect(plan.slots[`${island.id}-${r}-R`]).toBeNull();
      }
    }
  });

  it('creates the correct total number of slot keys', () => {
    const plan = createEmptyWeekPlan('test');
    const expected = ISLANDS.reduce((sum, i) => sum + i.rows * 2, 0);
    expect(Object.keys(plan.slots).length).toBe(expected);
  });

  it('initialises endcap arrays as empty', () => {
    const plan = createEmptyWeekPlan('test');
    for (const island of ISLANDS) {
      expect(plan.endcaps[island.topEndcap]).toEqual([]);
      expect(plan.endcaps[island.bottomEndcap]).toEqual([]);
    }
  });

  it('initialises extras arrays as empty', () => {
    const plan = createEmptyWeekPlan('test');
    for (const section of EXTRA_SECTIONS) {
      expect(plan.extras[section.id]).toEqual([]);
    }
  });

  it('sets adImage to null', () => {
    expect(createEmptyWeekPlan('test').adImage).toBeNull();
  });
});

describe('countFilledSlots', () => {
  function emptyPlan(): WeekPlan {
    return createEmptyWeekPlan('test');
  }

  it('returns 0 for a fully empty plan', () => {
    expect(countFilledSlots(emptyPlan())).toBe(0);
  });

  it('counts a filled island slot', () => {
    const plan = emptyPlan();
    plan.slots['island1-0-L'] = createEmptySlot();
    expect(countFilledSlots(plan)).toBe(1);
  });

  it('counts multiple filled slots', () => {
    const plan = emptyPlan();
    plan.slots['island1-0-L'] = createEmptySlot();
    plan.slots['island1-0-R'] = createEmptySlot();
    plan.slots['island3-5-L'] = createEmptySlot();
    expect(countFilledSlots(plan)).toBe(3);
  });

  it('counts endcap items', () => {
    const plan = emptyPlan();
    plan.endcaps['1'] = [createEmptySlot(), createEmptySlot()];
    expect(countFilledSlots(plan)).toBe(2);
  });

  it('counts extras items', () => {
    const plan = emptyPlan();
    plan.extras['meal_deal'] = [createEmptySlot()];
    expect(countFilledSlots(plan)).toBe(1);
  });

  it('sums slots, endcaps, and extras together', () => {
    const plan = emptyPlan();
    plan.slots['island1-0-L'] = createEmptySlot();
    plan.endcaps['1'] = [createEmptySlot()];
    plan.extras['meal_deal'] = [createEmptySlot()];
    expect(countFilledSlots(plan)).toBe(3);
  });
});
