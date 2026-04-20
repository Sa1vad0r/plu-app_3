'use client';

import { useState, useEffect } from 'react';
import {
  CustomerOrder,
  OrderItem,
  generateOrderId,
  generateItemId,
} from '@/types/order';
import { PLUEntry } from '@/types/plu';
import BottomSheet from './BottomSheet';

interface OrderFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (order: CustomerOrder) => void;
  onDelete?: (id: string) => void;
  editOrder?: CustomerOrder | null;
  pluItems: PLUEntry[]; // for PLU lookup
}

export default function OrderForm({
  open,
  onClose,
  onSave,
  onDelete,
  editOrder,
  pluItems,
}: OrderFormProps) {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [notes, setNotes] = useState('');

  // Item being added
  const [itemPlu, setItemPlu] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemQty, setItemQty] = useState('1');
  const [itemWeight, setItemWeight] = useState('');
  const [itemNotes, setItemNotes] = useState('');
  const [pluSuggestions, setPluSuggestions] = useState<PLUEntry[]>([]);
  const [showAddItem, setShowAddItem] = useState(false);

  useEffect(() => {
    if (open) {
      if (editOrder) {
        setCustomerName(editOrder.customerName);
        setPhone(editOrder.phone);
        setPickupDate(editOrder.pickupDate);
        setPickupTime(editOrder.pickupTime);
        setItems([...editOrder.items]);
        setNotes(editOrder.notes);
      } else {
        setCustomerName('');
        setPhone('');
        setPickupDate(new Date().toISOString().slice(0, 10));
        setPickupTime('');
        setItems([]);
        setNotes('');
      }
      setShowAddItem(false);
      clearItemFields();
    }
  }, [open, editOrder]);

  const clearItemFields = () => {
    setItemPlu('');
    setItemName('');
    setItemQty('1');
    setItemWeight('');
    setItemNotes('');
    setPluSuggestions([]);
  };

  const handlePluSearch = (val: string) => {
    setItemPlu(val);
    if (val.length >= 1) {
      const q = val.toLowerCase();
      const matches = pluItems
        .filter(
          (p) =>
            p.plu.toLowerCase().includes(q) ||
            p.name.toLowerCase().includes(q)
        )
        .slice(0, 5);
      setPluSuggestions(matches);
    } else {
      setPluSuggestions([]);
    }
  };

  const selectPlu = (entry: PLUEntry) => {
    setItemPlu(entry.plu);
    setItemName(entry.name);
    setPluSuggestions([]);
  };

  const addItem = () => {
    if (!itemName.trim()) return;
    const newItem: OrderItem = {
      id: generateItemId(),
      plu: itemPlu.trim(),
      name: itemName.trim(),
      quantity: parseInt(itemQty) || 1,
      weight: itemWeight.trim(),
      notes: itemNotes.trim(),
    };
    setItems([...items, newItem]);
    clearItemFields();
    setShowAddItem(false);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const handleSave = () => {
    if (!customerName.trim() || items.length === 0) return;
    const order: CustomerOrder = {
      id: editOrder?.id || generateOrderId(),
      customerName: customerName.trim(),
      phone: phone.trim(),
      pickupDate,
      pickupTime,
      items,
      status: editOrder?.status || 'pending',
      notes: notes.trim(),
      created: editOrder?.created || Date.now(),
      updated: Date.now(),
    };
    onSave(order);
    onClose();
  };

  const handleDelete = () => {
    if (editOrder && onDelete && confirm('Delete this order?')) {
      onDelete(editOrder.id);
      onClose();
    }
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={editOrder ? 'Edit Order' : 'New Order'}
    >
      <div className="space-y-4">
        {/* Customer Name */}
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
            Customer Name *
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="e.g. John Smith"
            className="w-full py-3 px-3.5 rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-100 text-[15px] outline-none focus:border-red-500 transition-colors placeholder:text-zinc-600"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
            Phone Number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(210) 555-1234"
            className="w-full py-3 px-3.5 rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-100 text-[15px] outline-none focus:border-red-500 transition-colors placeholder:text-zinc-600"
          />
        </div>

        {/* Pickup Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
              Pickup Date *
            </label>
            <input
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="w-full py-3 px-3.5 rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-100 text-[15px] outline-none focus:border-red-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
              Pickup Time
            </label>
            <input
              type="time"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="w-full py-3 px-3.5 rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-100 text-[15px] outline-none focus:border-red-500 transition-colors"
            />
          </div>
        </div>

        {/* Items List */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Items *
            </label>
            <span className="text-xs text-zinc-600">{items.length} item{items.length !== 1 ? 's' : ''}</span>
          </div>

          {items.length > 0 && (
            <div className="space-y-2 mb-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-2 p-3 rounded-xl bg-zinc-900/80 border border-zinc-800"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-zinc-200 truncate">
                      {item.name}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {item.plu && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-red-500/15 text-red-400 font-mono font-semibold">
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
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-zinc-600 hover:text-red-400 text-lg leading-none mt-0.5"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Item Section */}
          {showAddItem ? (
            <div className="p-3 rounded-xl border border-zinc-700 bg-zinc-900/50 space-y-3">
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Add Item
              </div>

              {/* PLU Search */}
              <div className="relative">
                <input
                  type="text"
                  value={itemPlu}
                  onChange={(e) => handlePluSearch(e.target.value)}
                  placeholder="Search PLU or product name..."
                  className="w-full py-2.5 px-3 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100 text-sm outline-none focus:border-red-500 transition-colors placeholder:text-zinc-600"
                />
                {pluSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden z-10 shadow-xl">
                    {pluSuggestions.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => selectPlu(s)}
                        className="w-full text-left px-3 py-2.5 hover:bg-zinc-800 transition-colors border-b border-zinc-800 last:border-0"
                      >
                        <span className="font-mono text-red-500 text-sm font-bold">
                          {s.plu}
                        </span>
                        <span className="text-zinc-300 text-sm ml-2">
                          {s.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Name */}
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Product name *"
                className="w-full py-2.5 px-3 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100 text-sm outline-none focus:border-red-500 transition-colors placeholder:text-zinc-600"
              />

              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  value={itemQty}
                  onChange={(e) => setItemQty(e.target.value)}
                  placeholder="Qty"
                  min="1"
                  className="py-2.5 px-3 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100 text-sm outline-none focus:border-red-500 transition-colors placeholder:text-zinc-600"
                />
                <input
                  type="text"
                  value={itemWeight}
                  onChange={(e) => setItemWeight(e.target.value)}
                  placeholder="Weight"
                  className="py-2.5 px-3 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100 text-sm outline-none focus:border-red-500 transition-colors placeholder:text-zinc-600"
                />
                <input
                  type="text"
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                  placeholder="Cut style"
                  className="py-2.5 px-3 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100 text-sm outline-none focus:border-red-500 transition-colors placeholder:text-zinc-600"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    clearItemFields();
                    setShowAddItem(false);
                  }}
                  className="flex-1 py-2.5 rounded-lg border border-zinc-700 text-zinc-400 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={addItem}
                  disabled={!itemName.trim()}
                  className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-bold disabled:opacity-40"
                >
                  Add
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddItem(true)}
              className="w-full py-3 rounded-xl border border-dashed border-zinc-700 text-zinc-500 text-sm font-semibold hover:border-zinc-500 hover:text-zinc-300 transition-colors"
            >
              + Add Item
            </button>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any special requests..."
            rows={2}
            className="w-full py-3 px-3.5 rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-100 text-[15px] outline-none focus:border-red-500 transition-colors resize-y placeholder:text-zinc-600"
          />
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={!customerName.trim() || items.length === 0}
          className="w-full py-3.5 rounded-xl bg-red-500 text-white font-bold text-[15px] hover:bg-red-600 active:scale-[0.97] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {editOrder ? 'Update Order' : 'Save Order'}
        </button>

        {editOrder && onDelete && (
          <button
            onClick={handleDelete}
            className="w-full py-3 rounded-xl border border-red-800 text-red-400 font-semibold text-sm hover:bg-red-900/20 transition-colors"
          >
            Delete Order
          </button>
        )}
      </div>
    </BottomSheet>
  );
}
