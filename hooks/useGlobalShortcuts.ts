'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export function useGlobalShortcuts(openPalette: () => void) {
  const router = useRouter();
  const leaderRef = useRef<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }

      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key.toLowerCase();

      if (key === 'g' && !leaderRef.current) {
        leaderRef.current = 'g';
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => { leaderRef.current = null; }, 500);
        return;
      }

      if (leaderRef.current === 'g') {
        leaderRef.current = null;
        if (timerRef.current) clearTimeout(timerRef.current);

        const engines = ['simulate', 'build', 'grow', 'hire', 'protect', 'compete'];

        switch (key) {
          case 'h': e.preventDefault(); router.push('/'); return;
          case '1': case '2': case '3': case '4': case '5': case '6':
            e.preventDefault();
            router.push(`/?engine=${engines[parseInt(key) - 1]}`);
            return;
        }
        return;
      }

      switch (key) {
        case 'c':
          e.preventDefault();
          router.push('/');
          setTimeout(() => {
            document.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
          }, 100);
          return;
        case '/':
          e.preventDefault();
          openPalette();
          return;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [router, openPalette]);
}
