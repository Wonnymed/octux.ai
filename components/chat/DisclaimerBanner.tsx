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
        'flex items-start gap-2 px-3 py-2 rounded-lg',
        'bg-verdict-delay/5 border border-verdict-delay/10',
        'text-xs text-verdict-delay leading-relaxed',
        className,
      )}
    >
      <AlertTriangle size={13} className="shrink-0 mt-0.5 opacity-70" />
      <span>{text}</span>
    </div>
  );
}
