'use client';

import { useSyncExternalStore } from 'react';

function subscribe(onChange: () => void) {
  const mq = window.matchMedia('(pointer: coarse)');
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

function getSnapshot() {
  return window.matchMedia('(pointer: coarse)').matches;
}

function getServerSnapshot() {
  return false;
}

/** True when the primary pointer is coarse (typical touch). SSR: false until hydrated. */
export function usePrefersCoarsePointer(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
