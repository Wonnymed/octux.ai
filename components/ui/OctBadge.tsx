import { type ReactNode } from 'react';
import { cn } from '@/lib/design/cn';

type BadgeVariant = 'default' | 'verdict' | 'confidence' | 'tier' | 'grade' | 'category' | 'outline';
type BadgeSize = 'xs' | 'sm' | 'md';

interface OctBadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  color?: string;
  icon?: ReactNode;
  dot?: boolean;
  dotColor?: string;
  className?: string;
  verdict?: 'proceed' | 'delay' | 'abandon';
  confidence?: 'high' | 'medium' | 'low' | 'contested';
  tier?: 'free' | 'pro' | 'max' | 'kraken';
  grade?: string;
  category?: 'investment' | 'relationships' | 'career' | 'business' | 'life';
}

const sizeStyles: Record<BadgeSize, string> = {
  xs: 'h-4 px-1.5 text-[10px] gap-0.5 rounded-sm',
  sm: 'h-5 px-2 text-micro gap-1 rounded-sm',
  md: 'h-6 px-2.5 text-xs gap-1.5 rounded-md',
};

export default function OctBadge({
  children, variant = 'default', size = 'sm', color, icon, dot, dotColor, className,
  verdict, confidence, tier, grade, category,
}: OctBadgeProps) {
  let resolvedStyle = '';

  if (verdict) {
    const m: Record<string, string> = {
      proceed: 'bg-verdict-proceed-muted text-verdict-proceed',
      delay: 'bg-verdict-delay-muted text-verdict-delay',
      abandon: 'bg-verdict-abandon-muted text-verdict-abandon',
    };
    resolvedStyle = m[verdict] || '';
  } else if (confidence) {
    const m: Record<string, string> = {
      high: 'bg-confidence-high/15 text-confidence-high',
      medium: 'bg-confidence-medium/15 text-confidence-medium',
      low: 'bg-confidence-low/15 text-confidence-low',
      contested: 'bg-confidence-contested/15 text-confidence-contested',
    };
    resolvedStyle = m[confidence] || '';
  } else if (tier) {
    const m: Record<string, string> = {
      free: 'bg-surface-2 text-txt-tertiary',
      pro: 'bg-accent-muted text-accent',
      max: 'bg-tier-max/15 text-tier-max',
      kraken: 'bg-tier-kraken/15 text-tier-kraken',
    };
    resolvedStyle = m[tier] || '';
  } else if (grade) {
    const letter = grade.charAt(0).toUpperCase();
    const m: Record<string, string> = {
      A: 'bg-grade-a/15 text-grade-a', B: 'bg-grade-b/15 text-grade-b',
      C: 'bg-grade-c/15 text-grade-c', D: 'bg-grade-d/15 text-grade-d', F: 'bg-grade-f/15 text-grade-f',
    };
    resolvedStyle = m[letter] || 'bg-surface-2 text-txt-secondary';
  } else if (category) {
    const m: Record<string, string> = {
      investment: 'bg-category-investment/15 text-category-investment',
      relationships: 'bg-category-relationships/15 text-category-relationships',
      career: 'bg-category-career/15 text-category-career',
      business: 'bg-category-business/15 text-category-business',
      life: 'bg-category-life/15 text-category-life',
    };
    resolvedStyle = m[category] || '';
  } else if (variant === 'outline') {
    resolvedStyle = 'bg-transparent border border-border-default text-txt-secondary';
  } else {
    resolvedStyle = 'bg-surface-2 text-txt-secondary';
  }

  return (
    <span className={cn(
      'inline-flex items-center font-medium whitespace-nowrap select-none shrink-0',
      sizeStyles[size], resolvedStyle, className,
    )} style={color ? { backgroundColor: `${color}20`, color } : undefined}>
      {dot && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: dotColor || 'currentColor' }} />}
      {icon && <span className="shrink-0 [&>svg]:w-3 [&>svg]:h-3">{icon}</span>}
      {children}
    </span>
  );
}
