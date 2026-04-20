'use client';

import { useState, useEffect, useCallback } from 'react';
import { CustomerOrder } from '@/types/order';

const ORDERS_KEY = 'plu_orders_v1';

export function useOrderStore() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ORDERS_KEY);
      setOrders(raw ? JSON.parse(raw) : []);
    } catch {
      setOrders([]);
    }
    setLoaded(true);
  }, []);

  const persist = useCallback((next: CustomerOrder[]) => {
    setOrders(next);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(next));
  }, []);

  const addOrder = useCallback(
    (order: CustomerOrder) => {
      persist([order, ...orders]);
    },
    [orders, persist]
  );

  const updateOrder = useCallback(
    (order: CustomerOrder) => {
      persist(orders.map((o) => (o.id === order.id ? order : o)));
    },
    [orders, persist]
  );

  const deleteOrder = useCallback(
    (id: string) => {
      persist(orders.filter((o) => o.id !== id));
    },
    [orders, persist]
  );

  const updateStatus = useCallback(
    (id: string, status: CustomerOrder['status']) => {
      persist(
        orders.map((o) =>
          o.id === id ? { ...o, status, updated: Date.now() } : o
        )
      );
    },
    [orders, persist]
  );

  return { orders, loaded, addOrder, updateOrder, deleteOrder, updateStatus };
}
