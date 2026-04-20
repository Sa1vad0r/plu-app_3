'use client';

import { useState, useMemo, useCallback } from 'react';
import { CustomerOrder, OrderStatus, isToday, isOverdue } from '@/types/order';
import { PLUEntry } from '@/types/plu';
import { useOrderStore } from '@/lib/orderStore';
import OrderCard from './OrderCard';
import OrderForm from './OrderForm';
import OrderDetail from './OrderDetail';

interface OrdersTabProps {
  pluItems: PLUEntry[];
  onToast: (msg: string, type?: 'success' | 'error') => void;
}

type FilterView = 'active' | 'today' | 'all';

export default function OrdersTab({ pluItems, onToast }: OrdersTabProps) {
  const { orders, addOrder, updateOrder, deleteOrder, updateStatus } =
    useOrderStore();

  const [formOpen, setFormOpen] = useState(false);
  const [editOrder, setEditOrder] = useState<CustomerOrder | null>(null);
  const [detailOrder, setDetailOrder] = useState<CustomerOrder | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [filter, setFilter] = useState<FilterView>('active');

  const todayCount = useMemo(
    () =>
      orders.filter(
        (o) =>
          isToday(o.pickupDate) &&
          o.status !== 'picked_up' &&
          o.status !== 'cancelled'
      ).length,
    [orders]
  );

  const filtered = useMemo(() => {
    let list = [...orders];

    switch (filter) {
      case 'today':
        list = list.filter(
          (o) =>
            isToday(o.pickupDate) &&
            o.status !== 'picked_up' &&
            o.status !== 'cancelled'
        );
        break;
      case 'active':
        list = list.filter(
          (o) => o.status === 'pending' || o.status === 'ready'
        );
        break;
      case 'all':
        break;
    }

    // Sort: overdue first, then by pickup date/time
    list.sort((a, b) => {
      const aOverdue = isOverdue(a) ? 0 : 1;
      const bOverdue = isOverdue(b) ? 0 : 1;
      if (aOverdue !== bOverdue) return aOverdue - bOverdue;
      const aDate = `${a.pickupDate}T${a.pickupTime || '23:59'}`;
      const bDate = `${b.pickupDate}T${b.pickupTime || '23:59'}`;
      return aDate.localeCompare(bDate);
    });

    return list;
  }, [orders, filter]);

  const handleSave = useCallback(
    (order: CustomerOrder) => {
      if (editOrder) {
        updateOrder(order);
        onToast('Order updated!');
      } else {
        addOrder(order);
        onToast('Order created!');
      }
    },
    [editOrder, addOrder, updateOrder, onToast]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteOrder(id);
      onToast('Order deleted', 'error');
    },
    [deleteOrder, onToast]
  );

  const handleStatusChange = useCallback(
    (id: string, status: OrderStatus) => {
      updateStatus(id, status);
      // Refresh detail if open
      setDetailOrder((prev) =>
        prev?.id === id ? { ...prev, status, updated: Date.now() } : prev
      );
      onToast(`Status: ${status.replace('_', ' ')}`);
    },
    [updateStatus, onToast]
  );

  const openAdd = () => {
    setEditOrder(null);
    setFormOpen(true);
  };

  const openEdit = (order: CustomerOrder) => {
    setEditOrder(order);
    setFormOpen(true);
  };

  const openDetail = (order: CustomerOrder) => {
    setDetailOrder(order);
    setDetailOpen(true);
  };

  return (
    <div>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800/50">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between px-4 pt-3 pb-2.5">
            <div>
              <span className="font-mono font-bold text-xl text-red-500 tracking-tight">
                Orders
              </span>
              {todayCount > 0 && (
                <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-400">
                  {todayCount} today
                </span>
              )}
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-0 px-4">
            {(['active', 'today', 'all'] as FilterView[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-[13px] font-semibold whitespace-nowrap border-b-2 transition-colors capitalize ${
                  filter === f
                    ? 'text-red-500 border-red-500'
                    : 'text-zinc-500 border-transparent hover:text-zinc-300'
                }`}
              >
                {f === 'active'
                  ? `Active (${orders.filter((o) => o.status === 'pending' || o.status === 'ready').length})`
                  : f === 'today'
                    ? `Today (${todayCount})`
                    : `All (${orders.length})`}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* List */}
      <main className="max-w-lg mx-auto px-4 pb-28">
        {filtered.length === 0 ? (
          <div className="text-center py-16 px-5">
            <div className="text-5xl mb-3">📋</div>
            <h3 className="text-base font-bold text-zinc-200 mb-1.5">
              {orders.length === 0 ? 'No orders yet' : 'No orders here'}
            </h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              {orders.length === 0
                ? 'Tap the + button when a customer places an order.'
                : 'Try switching to a different filter.'}
            </p>
          </div>
        ) : (
          <>
            <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest font-mono mt-4 mb-2">
              Orders{' '}
              <span className="font-normal text-zinc-600">
                {filtered.length}
              </span>
            </div>
            <div className="space-y-2">
              {filtered.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onClick={() => openDetail(order)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* FAB */}
      <button
        onClick={openAdd}
        className="fixed bottom-20 right-5 w-14 h-14 rounded-2xl bg-red-500 text-white text-3xl flex items-center justify-center shadow-lg shadow-red-500/30 hover:bg-red-600 active:scale-90 transition-all z-40"
      >
        +
      </button>

      {/* Form */}
      <OrderForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
        editOrder={editOrder}
        pluItems={pluItems}
      />

      {/* Detail */}
      <OrderDetail
        order={detailOrder}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onEdit={openEdit}
        onStatusChange={handleStatusChange}
        onToast={onToast}
      />
    </div>
  );
}
