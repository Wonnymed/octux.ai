'use client';

import { Zap } from 'lucide-react';

export default function SimulationBlockPlaceholder({ question, streamUrl }: { question: string; streamUrl?: string }) {
  return (
    <div className="my-4 p-4 rounded-xl border-2 border-accent/15 bg-accent-subtle/20">
      <div className="flex items-center gap-2 mb-2">
        <Zap size={15} className="text-accent animate-pulse" />
        <span className="text-sm font-medium text-accent">Deep Simulation</span>
      </div>
      <p className="text-xs text-txt-tertiary italic">&ldquo;{question}&rdquo;</p>
      <p className="text-micro text-txt-disabled mt-2">Simulation streaming UI coming in PF-09→PF-13</p>
    </div>
  );
}
