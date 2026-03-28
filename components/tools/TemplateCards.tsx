'use client';

import { useState } from 'react';
import { cn } from '@/lib/design/cn';

const DOMAINS = [
  {
    id: 'investment',
    label: 'Investment',
    blurb: 'Capital allocation, diversification, entry and exit.',
  },
  {
    id: 'career',
    label: 'Career',
    blurb: 'Role changes, compensation, hiring, and trajectory.',
  },
  {
    id: 'business',
    label: 'Business',
    blurb: 'Launch, pivot, partnerships, and go-to-market.',
  },
] as const;

export default function TemplateCards() {
  const [selected, setSelected] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {DOMAINS.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setSelected(d.id)}
            className={cn(
              'text-left rounded-2xl border p-5 transition-all duration-150',
              selected === d.id
                ? 'border-accent/35 bg-accent/[0.06] shadow-lg shadow-black/20'
                : 'border-border-subtle bg-surface-0 hover:border-border-default hover:bg-surface-2',
            )}
          >
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--bg-hover)]">
              <span className="text-sm font-semibold text-txt-secondary">{d.label[0]}</span>
            </div>
            <h3 className="text-sm font-medium text-txt-primary mb-1">{d.label}</h3>
            <p className="text-xs text-white/40 leading-relaxed">{d.blurb}</p>
          </button>
        ))}
      </div>

      {selected && (
        <div className="rounded-2xl border border-border-subtle bg-surface-1 p-6 space-y-4">
          <p className="text-xs font-medium text-txt-tertiary uppercase tracking-wider">
            Decision brief
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={6}
            placeholder="Fill in context: options, constraints, what good looks like…"
            className="w-full rounded-xl bg-surface-2 border border-border-subtle px-4 py-3 text-sm text-txt-secondary placeholder:text-txt-disabled outline-none focus:border-accent/25 resize-y"
          />
          <p className="text-micro text-txt-disabled">
            This form is local-only for now — persistence ships in a later release.
          </p>
        </div>
      )}
    </div>
  );
}
