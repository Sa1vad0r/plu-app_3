'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onDone: () => void;
}

export default function Toast({ message, type = 'success', onDone }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 300);
    }, 2000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[999] px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg transition-all duration-300 ${
        type === 'error' ? 'bg-red-600' : 'bg-emerald-500'
      } ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      {message}
    </div>
  );
}
