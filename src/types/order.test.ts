import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatTime,
  isOverdue,
  formatOrderForClipboard,
} from './order';
import type { CustomerOrder, OrderItem } from './order';

function makeOrder(overrides: Partial<CustomerOrder> = {}): CustomerOrder {
  return {
    id: 'ord_test',
    customerName: 'Jane Smith',
    phone: '555-0100',
    pickupDate: '2030-06-15',
    pickupTime: '14:00',
    items: [],
    status: 'pending',
    notes: '',
    created: 0,
    updated: 0,
    ...overrides,
  };
}

function makeItem(overrides: Partial<OrderItem> = {}): OrderItem {
  return {
    id: 'itm_1',
    plu: '',
    name: 'Ribeye Steak',
    quantity: 1,
    weight: '',
    notes: '',
    ...overrides,
  };
}

describe('formatDate', () => {
  it('formats a standard date', () => {
    expect(formatDate('2024-06-15')).toBe('6/15/2024');
  });

  it('strips leading zeros from month and day', () => {
    expect(formatDate('2024-01-05')).toBe('1/5/2024');
  });

  it('handles December 31', () => {
    expect(formatDate('2024-12-31')).toBe('12/31/2024');
  });

  it('returns empty string for empty input', () => {
    expect(formatDate('')).toBe('');
  });
});

describe('formatTime', () => {
  it('formats a morning time', () => {
    expect(formatTime('09:30')).toBe('9:30 AM');
  });

  it('formats an afternoon time', () => {
    expect(formatTime('14:45')).toBe('2:45 PM');
  });

  it('formats midnight as 12:00 AM', () => {
    expect(formatTime('00:00')).toBe('12:00 AM');
  });

  it('formats noon as 12:00 PM', () => {
    expect(formatTime('12:00')).toBe('12:00 PM');
  });

  it('formats 11:59 PM correctly', () => {
    expect(formatTime('23:59')).toBe('11:59 PM');
  });

  it('pads single-digit minutes', () => {
    expect(formatTime('08:05')).toBe('8:05 AM');
  });

  it('returns empty string for empty input', () => {
    expect(formatTime('')).toBe('');
  });
});

describe('isOverdue', () => {
  it('returns false for picked_up status regardless of time', () => {
    const order = makeOrder({ status: 'picked_up', pickupDate: '2020-01-01', pickupTime: '08:00' });
    expect(isOverdue(order)).toBe(false);
  });

  it('returns false for cancelled status regardless of time', () => {
    const order = makeOrder({ status: 'cancelled', pickupDate: '2020-01-01', pickupTime: '08:00' });
    expect(isOverdue(order)).toBe(false);
  });

  it('returns true for a pending order with a past pickup time', () => {
    const order = makeOrder({ status: 'pending', pickupDate: '2020-01-01', pickupTime: '08:00' });
    expect(isOverdue(order)).toBe(true);
  });

  it('returns true for a ready order with a past pickup time', () => {
    const order = makeOrder({ status: 'ready', pickupDate: '2020-01-01', pickupTime: '08:00' });
    expect(isOverdue(order)).toBe(true);
  });

  it('returns false for a pending order with a future pickup time', () => {
    const order = makeOrder({ status: 'pending', pickupDate: '2030-12-31', pickupTime: '23:59' });
    expect(isOverdue(order)).toBe(false);
  });

  it('falls back to 23:59 when pickupTime is empty', () => {
    // pickupDate in the past with no time → treated as 23:59 that day → overdue
    const order = makeOrder({ status: 'pending', pickupDate: '2020-01-01', pickupTime: '' });
    expect(isOverdue(order)).toBe(true);
  });
});

describe('formatOrderForClipboard', () => {
  it('includes customer name, phone, pickup, and status', () => {
    const order = makeOrder({ customerName: 'Bob', phone: '555-9999', pickupDate: '2024-06-15', pickupTime: '10:00' });
    const result = formatOrderForClipboard(order);
    expect(result).toContain('Name: Bob');
    expect(result).toContain('Phone: 555-9999');
    expect(result).toContain('6/15/2024');
    expect(result).toContain('10:00 AM');
    expect(result).toContain('Status: Pending');
  });

  it('lists a basic item with name only', () => {
    const order = makeOrder({ items: [makeItem({ name: 'Sirloin', plu: '', quantity: 1, weight: '', notes: '' })] });
    const result = formatOrderForClipboard(order);
    expect(result).toContain('1. Sirloin');
    expect(result).not.toContain('PLU');
    expect(result).not.toContain('×');
  });

  it('appends PLU when present', () => {
    const order = makeOrder({ items: [makeItem({ plu: '1234' })] });
    expect(formatOrderForClipboard(order)).toContain('(PLU: 1234)');
  });

  it('appends quantity multiplier when quantity > 1', () => {
    const order = makeOrder({ items: [makeItem({ quantity: 3 })] });
    expect(formatOrderForClipboard(order)).toContain('× 3');
  });

  it('does not append quantity multiplier when quantity is 1', () => {
    const order = makeOrder({ items: [makeItem({ quantity: 1 })] });
    expect(formatOrderForClipboard(order)).not.toContain('×');
  });

  it('appends weight when present', () => {
    const order = makeOrder({ items: [makeItem({ weight: '2 lbs' })] });
    expect(formatOrderForClipboard(order)).toContain('— 2 lbs');
  });

  it('appends item notes in brackets when present', () => {
    const order = makeOrder({ items: [makeItem({ notes: 'thick cut' })] });
    expect(formatOrderForClipboard(order)).toContain('[thick cut]');
  });

  it('appends order-level notes when present', () => {
    const order = makeOrder({ notes: 'Call before 5pm' });
    expect(formatOrderForClipboard(order)).toContain('Notes: Call before 5pm');
  });

  it('omits order-level notes section when notes is empty', () => {
    const order = makeOrder({ notes: '' });
    expect(formatOrderForClipboard(order)).not.toContain('Notes:');
  });

  it('numbers multiple items sequentially', () => {
    const order = makeOrder({
      items: [makeItem({ id: '1', name: 'Ribeye' }), makeItem({ id: '2', name: 'Sirloin' })],
    });
    const result = formatOrderForClipboard(order);
    expect(result).toContain('1. Ribeye');
    expect(result).toContain('2. Sirloin');
  });
});
