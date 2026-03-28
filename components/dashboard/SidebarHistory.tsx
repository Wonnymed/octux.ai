'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store/app';
import { DARK_THEME } from '@/lib/dashboard/theme';

function resultFromVerdict(v: string | null): 'proceed' | 'delay' | 'abandon' {
  if (v === 'delay' || v === 'abandon' || v === 'proceed') return v;
  return 'proceed';
}

const RESULT_DOT: Record<'proceed' | 'delay' | 'abandon', string> = {
  proceed: DARK_THEME.success,
  delay: DARK_THEME.warning,
  abandon: DARK_THEME.danger,
};

export default function SidebarHistory() {
  const router = useRouter();
  const conversations = useAppStore((s) => s.conversations);
  const fetchConversations = useAppStore((s) => s.fetchConversations);

  useEffect(() => {
    void fetchConversations({ silent: true });
  }, [fetchConversations]);

  const items = conversations.slice(0, 20);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-2">
      <p
        className="mb-2 px-1 text-[9px] font-medium uppercase tracking-[0.2em]"
        style={{ color: DARK_THEME.text_tertiary }}
      >
        History
      </p>
      {items.length === 0 ? (
        <p className="px-2 text-[11px]" style={{ color: DARK_THEME.text_tertiary }}>
          No simulations yet
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {items.map((c) => {
            const result = c.has_simulation ? resultFromVerdict(c.latest_verdict) : 'proceed';
            return (
              <li key={c.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-white/[0.04]"
                  onClick={() => router.push(`/c/${c.id}`)}
                >
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor: c.has_simulation ? RESULT_DOT[result] : DARK_THEME.text_tertiary,
                    }}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 truncate text-[12px] text-white/80">{c.title}</span>
                  <span
                    className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
                    style={{
                      color: DARK_THEME.accent,
                      backgroundColor: `${DARK_THEME.accent}22`,
                    }}
                  >
                    {c.has_simulation ? 'sim' : 'chat'}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
