'use client';

import { useEffect } from 'react';
import { useBillingStore } from '@/lib/store/billing';

/**
 * Hydrate all stores on app mount.
 * Call this ONCE in the shell layout.
 */
export function useHydrate(isAuthenticated: boolean) {
  const fetchBalance = useBillingStore((s) => s.fetchBalance);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBalance();
    }
  }, [isAuthenticated, fetchBalance]);
}
