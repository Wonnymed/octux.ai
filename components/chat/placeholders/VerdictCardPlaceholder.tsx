'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function VerdictCardPlaceholder({ verdict, simulationId, conversationId, onRefine }: any) {
  if (!verdict) return null;
  const rec = (verdict.recommendation || 'unknown').toUpperCase();
  const prob = verdict.probability || 0;

  return (
    <div className="my-4 p-4 rounded-xl border-2 border-verdict-proceed/20 bg-verdict-proceed/5">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl font-light text-txt-primary">{prob}%</span>
        <span className="text-xs font-bold px-2 py-0.5 rounded bg-verdict-proceed/15 text-verdict-proceed">{rec}</span>
      </div>
      <p className="text-xs text-txt-tertiary">{verdict.one_liner || 'Verdict received'}</p>
      <p className="text-micro text-txt-disabled mt-2">Full verdict card coming in PF-14</p>
    </div>
  );
}
