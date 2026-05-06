// src/lib/ToastProvider.jsx
//
// Mount this once inside App so the imperative toast.success() calls work.

import { useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { setToastFn } from '@/lib/toast';

export default function ToastProvider({ children }) {
  const { toast } = useToast();

  useEffect(() => {
    setToastFn(toast);
  }, [toast]);

  return children;
}