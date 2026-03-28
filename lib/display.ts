// Client-safe display helpers — no SDK imports
// This file can be safely imported from 'use client' components

// Shows PRODUCTION model names in UI (not the test model)
export function getDisplayModel(_tier?: string): string {
  return 'Sonnet';
}
