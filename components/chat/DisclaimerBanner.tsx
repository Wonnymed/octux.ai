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
        'octx-banner-warning flex items-start gap-2',
        className,
      )}
    >
      <AlertTriangle size={13} className="mt-0.5 shrink-0 text-state-warning" />
      <span className="text-state-warning">{text}</span>
    </div>
  );
}
