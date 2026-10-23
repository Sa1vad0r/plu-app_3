'use client';

import {
  CustomerOrder,
  ORDER_STATUS_CONFIG,
  formatDate,
  formatTime,
  isToday,
  isOverdue,
} from '@/types/order';

interface OrderCardProps {
  order: CustomerOrder;
  onClick: () => void;
}

export default function OrderCard({ order, onClick }: OrderCardProps) {
  const status = ORDER_STATUS_CONFIG[order.status];
  const overdue = isOverdue(order);
  const today = isToday(order.pickupDate);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3.5 rounded-xl border transition-all active:scale-[0.985] ${
        overdue
          ? 'border-brand-red-300 bg-brand-red-50/60'
          : 'border-zinc-200 bg-white hover:bg-zinc-50'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="text-[15px] font-bold text-zinc-900 truncate">
            {order.customerName}
          </div>
          {order.phone && (
            <div className="text-xs text-zinc-600 font-mono mt-0.5">
              {order.phone}
            </div>
          )}
        </div>
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg whitespace-nowrap ${status.color} ${status.bg}`}
        >
          {overdue ? '⚠ OVERDUE' : status.label}
        </span>
      </div>

      {/* Pickup info */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-zinc-600">
          {today ? (
            <span className="text-amber-400 font-bold">TODAY</span>
          ) : (
            formatDate(order.pickupDate)
          )}
        </span>
        {order.pickupTime && (
          <>
            <span className="text-zinc-300">·</span>
            <span className="text-xs text-zinc-600">
              {formatTime(order.pickupTime)}
            </span>
          </>
        )}
        <span className="text-zinc-700">·</span>
        <span className="text-xs text-zinc-600">
          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Items preview */}
      <div className="flex flex-wrap gap-1">
        {order.items.slice(0, 3).map((item) => (
          <span
            key={item.id}
            className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 font-semibold truncate max-w-[150px]"
          >
            {item.quantity > 1 ? `${item.quantity}× ` : ''}
            {item.name}
          </span>
        ))}
        {order.items.length > 3 && (
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 font-semibold">
            +{order.items.length - 3} more
          </span>
        )}
      </div>
    </button>
  );
}
