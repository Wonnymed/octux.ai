import { cn } from '@/lib/design/cn';

type SkeletonVariant = 'text' | 'heading' | 'avatar' | 'button' | 'card' | 'badge' | 'circle' | 'custom';

interface OctSkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  lines?: number;
  className?: string;
}

const variantStyles: Record<SkeletonVariant, string> = {
  text: 'h-3.5 rounded-sm', heading: 'h-5 w-48 rounded-sm', avatar: 'w-8 h-8 rounded-full',
  button: 'h-9 w-24 rounded-md', card: 'h-32 rounded-lg', badge: 'h-5 w-16 rounded-sm',
  circle: 'w-10 h-10 rounded-full', custom: '',
};

export default function OctSkeleton({ variant = 'text', width, height, lines = 1, className }: OctSkeletonProps) {
  const baseClass = cn('bg-surface-2 animate-shimmer', 'bg-gradient-to-r from-surface-2 via-surface-3 to-surface-2 bg-[length:200%_100%]');

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('flex flex-col gap-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className={cn(baseClass, variantStyles.text, i === lines - 1 && 'w-3/4')}
            style={{ width: i === lines - 1 ? '75%' : width || '100%' }} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn(baseClass, variantStyles[variant], className)}
      style={{ width: typeof width === 'number' ? `${width}px` : width, height: typeof height === 'number' ? `${height}px` : height }} />
  );
}

export function AgentCardSkeleton() {
  return (
    <div className="bg-surface-1 border border-border-subtle rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-3">
        <OctSkeleton variant="avatar" />
        <div className="flex-1 space-y-1.5"><OctSkeleton variant="text" width="60%" /><OctSkeleton variant="text" width="40%" /></div>
        <OctSkeleton variant="badge" />
      </div>
      <OctSkeleton variant="text" lines={3} />
    </div>
  );
}

export function VerdictCardSkeleton() {
  return (
    <div className="bg-surface-1 border border-border-subtle rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-4">
        <OctSkeleton variant="circle" className="w-16 h-16" />
        <div className="flex-1 space-y-2"><OctSkeleton variant="heading" /><OctSkeleton variant="text" width="80%" /></div>
      </div>
      <OctSkeleton variant="text" lines={2} />
      <div className="flex gap-2"><OctSkeleton variant="badge" /><OctSkeleton variant="badge" /><OctSkeleton variant="badge" /></div>
    </div>
  );
}
