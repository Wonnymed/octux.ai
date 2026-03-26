'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/lib/store/theme';

/** Applies saved theme after mount (FOUC handled by inline script in layout). */
export default function ThemeInitializer() {
  const initialize = useThemeStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return null;
}
