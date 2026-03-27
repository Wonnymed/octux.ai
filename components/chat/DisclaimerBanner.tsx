'use client';

import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/design/cn';

interface DisclaimerBannerProps {
  text: string;
  className?: string;
}

export default function DisclaimerBanner({ text, className }: DisclaimerBannerProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-xl border px-4 py-3',
        'border-verdict-delay/20 bg-verdict-delay/10',
        'text-sm leading-relaxed text-verdict-delay',
        className,
      )}
    >
      <AlertTriangle size={13} className="mt-0.5 shrink-0 text-verdict-delay" />
      <span className="text-verdict-delay">{text}</span>
    </div>
  );
}
