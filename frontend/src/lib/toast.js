// src/lib/toast.js
//
// Thin wrapper so pages can do:
//   import { toast } from '@/lib/toast'
//   toast.success('Done!')
//   toast.error('Something went wrong')
//
// This avoids the mismatch between sonner and @/components/ui/toaster

import { useToast } from '@/components/ui/use-toast';

// For use inside React components via the hook
export { useToast };

// Standalone imperative helper (works outside components too)
// We lazily grab the toast fn from the module that shadcn exposes
let _toast = null;
export const setToastFn = (fn) => { _toast = fn; };

const make = (variant) => (message, opts = {}) => {
  if (_toast) {
    _toast({ title: message, variant: variant === 'error' ? 'destructive' : 'default', ...opts });
  } else {
    // Fallback to console if called before provider mounts
    variant === 'error' ? console.error(message) : console.log(message);
  }
};

export const toast = {
  success: make('success'),
  error:   make('error'),
  info:    make('info'),
};