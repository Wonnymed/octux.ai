import { type ReactNode } from 'react';
import { Badge, type BadgeProps } from '@/components/ui/shadcn/badge';
import { cn } from '@/lib/design/cn';

type VerdictType = 'proceed' | 'delay' | 'abandon';
type ConfidenceType = 'high' | 'medium' | 'low' | 'contested';
type TierType = 'free' | 'pro' | 'max' | 'kraken';

interface OctBadgeProps extends BadgeProps {
  icon?: ReactNode;
  dot?: boolean;
  dotColor?: string;
  verdict?: VerdictType;
  confidence?: ConfidenceType;
  tier?: TierType;
  grade?: string;
  category?: 'investment' | 'relationships' | 'career' | 'business' | 'life';
}

const confidenceMap: Record<ConfidenceType, string> = {
  high: 'bg-confidence-high/15 text-confidence-high',
  medium: 'bg-confidence-medium/15 text-confidence-medium',
  low: 'bg-confidence-low/15 text-confidence-low',
  contested: 'bg-confidence-contested/15 text-confidence-contested',
};

const tierMap: Record<TierType, string> = {
  free: 'bg-surface-2 text-txt-tertiary',
  pro: 'bg-accent-muted text-accent',
  max: 'bg-tier-max/15 text-tier-max',
  kraken: 'bg-tier-kraken/15 text-tier-kraken',
};

const gradeMap: Record<string, string> = {
  A: 'bg-grade-a/15 text-grade-a', B: 'bg-grade-b/15 text-grade-b',
  C: 'bg-grade-c/15 text-grade-c', D: 'bg-grade-d/15 text-grade-d', F: 'bg-grade-f/15 text-grade-f',
};

const categoryMap: Record<string, string> = {
  investment: 'bg-category-investment/15 text-category-investment',
  relationships: 'bg-category-relationships/15 text-category-relationships',
  career: 'bg-category-career/15 text-category-career',
  business: 'bg-category-business/15 text-category-business',
  life: 'bg-category-life/15 text-category-life',
};

export default function OctBadge({
  children, icon, dot, dotColor, verdict, confidence, tier, grade, category,
  variant, size, className, ...props
}: OctBadgeProps) {
  let resolvedVariant = variant;
  let extraClass = '';

  if (verdict) {
    resolvedVariant = verdict;
  } else if (confidence) {
    extraClass = confidenceMap[confidence] || '';
  } else if (tier) {
    extraClass = tierMap[tier] || '';
  } else if (grade) {
    const letter = grade.charAt(0).toUpperCase();
    extraClass = gradeMap[letter] || 'bg-surface-2 text-txt-secondary';
  } else if (category) {
    extraClass = categoryMap[category] || '';
  }

  return (
    <Badge
      variant={resolvedVariant}
      size={size}
      className={cn(extraClass, className)}
      {...props}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: dotColor || 'currentColor' }} />}
      {icon && <span className="shrink-0 [&>svg]:w-3 [&>svg]:h-3">{icon}</span>}
      {children}
    </Badge>
  );
}
