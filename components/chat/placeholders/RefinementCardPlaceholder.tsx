'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function RefinementCardPlaceholder({ data }: { data: any }) {
  if (!data) return null;

  return (
    <div className="my-3 p-3 rounded-xl border border-accent/15 bg-accent-subtle/10">
      <span className="text-xs font-medium text-accent">Refinement</span>
      <p className="text-xs text-txt-secondary mt-1">
        {data.refinedAssessment || 'Refinement result received'}
      </p>
      <p className="text-micro text-txt-disabled mt-2">Full refinement card coming in PF-17</p>
    </div>
  );
}
