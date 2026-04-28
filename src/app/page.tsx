'use client';

import { useState, useCallback } from 'react';
import { usePLUStore } from '@/lib/store';
import TabNav, { AppTab } from '@/components/TabNav';
import PLUTab from '@/components/PLUTab';
import FavoritesTab from '@/components/FavoritesTab';
import OrdersTab from '@/components/OrdersTab';
import IslandsTab from '@/components/IslandsTab';
import WrapTab from '@/components/WrapTab';
import Toast from '@/components/Toast';
import { useUsageStore } from '@/lib/usageStore';

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
    toggleFavorite,
    importItems,
    exportItems,
  } = usePLUStore();

  const { counts: usageCounts, recentIds, increment: incrementUsage, removeRecent } = useUsageStore();

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' = 'success') => {
      setToast({ message, type });
    },
    []
  );

  if (!loaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-zinc-400 text-sm animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Tab Content */}
      <div className={activeTab === 'plu' ? '' : 'hidden'}>
        <PLUTab
          items={items}
          onAdd={addItem}
          onUpdate={updateItem}
          onDelete={deleteItem}
          onToggleFavorite={toggleFavorite}
          onImport={importItems}
          onExport={exportItems}
          onToast={showToast}
          usageCounts={usageCounts}
          incrementUsage={incrementUsage}
          recentIds={recentIds}
          removeRecent={removeRecent}
        />
      </div>

      <div className={activeTab === 'favorites' ? '' : 'hidden'}>
        <FavoritesTab
          items={items}
          onToggleFavorite={toggleFavorite}
          onUpdate={updateItem}
          onDelete={deleteItem}
          onToast={showToast}
          incrementUsage={incrementUsage}
        />
      </div>

      <div className={activeTab === 'wrap' ? '' : 'hidden'}>
        <WrapTab
          items={items}
          usageCounts={usageCounts}
          incrementUsage={incrementUsage}
          recentIds={recentIds}
          removeRecent={removeRecent}
        />
      </div>

      <div className={activeTab === 'orders' ? '' : 'hidden'}>
        <OrdersTab pluItems={items} onToast={showToast} />
      </div>

      <div className={activeTab === 'islands' ? '' : 'hidden'}>
        <IslandsTab pluItems={items} onToast={showToast} />
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
