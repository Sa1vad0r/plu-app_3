'use client';

import {
  CustomerOrder,
  OrderStatus,
  ORDER_STATUS_CONFIG,
  formatDate,
  formatTime,
  formatOrderForClipboard,
  isOverdue,
} from '@/types/order';
import BottomSheet from './BottomSheet';

interface OrderDetailProps {
  order: CustomerOrder | null;
  open: boolean;
  onClose: () => void;
  onEdit: (order: CustomerOrder) => void;
  onStatusChange: (id: string, status: OrderStatus) => void;
  onToast: (msg: string, type?: 'success' | 'error') => void;
}

const statusFlow: OrderStatus[] = ['pending', 'ready', 'picked_up'];

export default function OrderDetail({
  order,
  open,
  onClose,
  onEdit,
  onStatusChange,
  onToast,
}: OrderDetailProps) {
  if (!order) return null;

  const overdue = isOverdue(order);

  const handleCopy = async () => {
    const text = formatOrderForClipboard(order);
    try {
      await navigator.clipboard.writeText(text);
      onToast('Order copied to clipboard!');
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      onToast('Order copied to clipboard!');
    }
  };

  const handleCall = () => {
    if (order.phone) {
      window.open(`tel:${order.phone.replace(/\D/g, '')}`);
    }
  };

  const handleText = () => {
    if (order.phone) {
      const body = encodeURIComponent(
        `Hi ${order.customerName}, your order is ready for pickup!`
      );
      window.open(`sms:${order.phone.replace(/\D/g, '')}?body=${body}`);
    }
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="Order Detail">
      {/* Customer Info */}
      <div className="mb-4">
        <div className="text-xl font-bold text-zinc-100 mb-1">
          {order.customerName}
        </div>
        {order.phone && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-400 font-mono">
              {order.phone}
            </span>
            <button
              onClick={handleCall}
              className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 font-bold"
            >
              📞 Call
            </button>
            <button
              onClick={handleText}
              className="text-xs px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-400 font-bold"
            >
              💬 Text
            </button>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="mb-4">
        <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
          Status
        </div>
        <div className="flex gap-1.5">
          {statusFlow.map((s) => {
            const config = ORDER_STATUS_CONFIG[s];
            const isActive = order.status === s;
            return (
              <button
                key={s}
                onClick={() => onStatusChange(order.id, s)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  isActive
                    ? `${config.bg} ${config.color} border border-current`
                    : 'bg-zinc-900 text-zinc-600 border border-zinc-800'
                }`}
              >
                {config.label}
              </button>
            );
          })}
        </div>
        {order.status === 'pending' && (
          <button
            onClick={() => onStatusChange(order.id, 'cancelled')}
            className="mt-2 text-xs text-zinc-600 hover:text-heb-red-400 transition-colors"
          >
            Cancel order
          </button>
        )}
        {overdue && (
          <div className="mt-2 text-xs text-heb-red-400 font-semibold">
            ⚠ This order is past its pickup time
          </div>
        )}
      </div>

      {/* Pickup */}
      <div className="space-y-0 divide-y divide-zinc-800 mb-4">
        <div className="flex justify-between py-2.5 text-sm">
          <span className="text-zinc-500">Pickup Date</span>
          <span className="text-zinc-200">{formatDate(order.pickupDate)}</span>
        </div>
        {order.pickupTime && (
          <div className="flex justify-between py-2.5 text-sm">
            <span className="text-zinc-500">Pickup Time</span>
            <span className="text-zinc-200">
              {formatTime(order.pickupTime)}
            </span>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="mb-4">
        <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
          Items ({order.items.length})
        </div>
        <div className="space-y-2">
          {order.items.map((item, i) => (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800"
            >
              <div className="flex items-start justify-between">
                <div className="text-sm font-semibold text-zinc-200">
                  {i + 1}. {item.name}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {item.plu && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-heb-red-500/15 text-heb-red-400 font-mono font-semibold">
                    PLU: {item.plu}
                  </span>
                )}
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 font-semibold">
                  Qty: {item.quantity}
                </span>
                {item.weight && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 font-semibold">
                    {item.weight}
                  </span>
                )}
                {item.notes && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-400/15 text-amber-400 font-semibold">
                    {item.notes}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="mb-4">
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
            Notes
          </div>
          <div className="text-sm text-zinc-300">{order.notes}</div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={handleCopy}
          className="w-full py-3.5 rounded-xl bg-zinc-800 text-zinc-200 font-bold text-[15px] hover:bg-zinc-700 active:scale-[0.97] transition-all flex items-center justify-center gap-2"
        >
          📋 Copy Order to Clipboard
        </button>
        <button
          onClick={() => {
            onClose();
            setTimeout(() => onEdit(order), 200);
          }}
          className="w-full py-3.5 rounded-xl bg-heb-red-500 text-white font-bold text-[15px] hover:bg-heb-red-600 active:scale-[0.97] transition-all"
        >
          Edit Order
        </button>
      </div>
    </BottomSheet>
  );
}
