export interface OrderItem {
  id: string;
  plu: string;
  name: string;
  quantity: number;
  weight: string;
  notes: string; // thick cut, butterflied, etc.
}

export interface CustomerOrder {
  id: string;
  customerName: string;
  phone: string;
  pickupDate: string; // YYYY-MM-DD
  pickupTime: string; // HH:MM
  items: OrderItem[];
  status: OrderStatus;
  notes: string;
  created: number;
  updated: number;
}

export type OrderStatus = 'pending' | 'ready' | 'picked_up' | 'cancelled';

export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string }
> = {
  pending: { label: 'Pending', color: 'text-amber-400', bg: 'bg-amber-400/15' },
  ready: { label: 'Ready', color: 'text-emerald-400', bg: 'bg-emerald-400/15' },
  picked_up: { label: 'Picked Up', color: 'text-zinc-400', bg: 'bg-zinc-400/15' },
  cancelled: { label: 'Cancelled', color: 'text-brand-red-400', bg: 'bg-brand-red-400/15' },
};

export function generateOrderId(): string {
  return 'ord_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

export function generateItemId(): string {
  return 'itm_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

export function formatOrderForClipboard(order: CustomerOrder): string {
  const lines: string[] = [];
  lines.push(`📋 CUSTOMER ORDER`);
  lines.push(`━━━━━━━━━━━━━━━━`);
  lines.push(`Name: ${order.customerName}`);
  lines.push(`Phone: ${order.phone}`);
  lines.push(`Pickup: ${formatDate(order.pickupDate)} @ ${formatTime(order.pickupTime)}`);
  lines.push(`Status: ${ORDER_STATUS_CONFIG[order.status].label}`);
  lines.push(``);
  lines.push(`Items:`);
  order.items.forEach((item, i) => {
    let line = `  ${i + 1}. ${item.name}`;
    if (item.plu) line += ` (PLU: ${item.plu})`;
    if (item.quantity > 1) line += ` × ${item.quantity}`;
    if (item.weight) line += ` — ${item.weight}`;
    if (item.notes) line += ` [${item.notes}]`;
    lines.push(line);
  });
  if (order.notes) {
    lines.push(``);
    lines.push(`Notes: ${order.notes}`);
  }
  return lines.join('\n');
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${parseInt(m)}/${parseInt(d)}/${y}`;
}

export function formatTime(timeStr: string): string {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export function isToday(dateStr: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return dateStr === today;
}

export function isOverdue(order: CustomerOrder): boolean {
  if (order.status !== 'pending' && order.status !== 'ready') return false;
  const now = new Date();
  const pickup = new Date(`${order.pickupDate}T${order.pickupTime || '23:59'}`);
  return now > pickup;
}
