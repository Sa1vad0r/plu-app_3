'use client';

import { useState, useCallback } from 'react';
import { usePLUStore } from '@/lib/store';
import TabNav, { AppTab } from '@/components/TabNav';
import PLUTab from '@/components/PLUTab';
import OrdersTab from '@/components/OrdersTab';
import Toast from '@/components/Toast';

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<AppTab>('plu');
  const [toast, setToast] = useState<ToastState | null>(null);

  const {
    items,
    loaded,
    addItem,
    updateItem,
    deleteItem,
    importItems,
    exportItems,
  } = usePLUStore();

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' = 'success') => {
      setToast({ message, type });
    },
    []
  );

  if (!loaded) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-500 text-sm animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Tab Content */}
      <div className={activeTab === 'plu' ? '' : 'hidden'}>
        <PLUTab
          items={items}
          onAdd={addItem}
          onUpdate={updateItem}
          onDelete={deleteItem}
          onImport={importItems}
          onExport={exportItems}
          onToast={showToast}
        />
      </div>

      <div className={activeTab === 'orders' ? '' : 'hidden'}>
        <OrdersTab pluItems={items} onToast={showToast} />
      </div>

      <div className={activeTab === 'islands' ? '' : 'hidden'}>
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="text-center">
            <div className="text-5xl mb-3">🏝️</div>
            <h3 className="text-base font-bold text-zinc-200 mb-1.5">
              Island Planner
            </h3>
            <p className="text-sm text-zinc-500">Coming soon</p>
          </div>
        </div>
      </div>

      {/* Bottom Tab Navigation */}
      <TabNav active={activeTab} onChange={setActiveTab} />

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}
    </div>
  );
}
