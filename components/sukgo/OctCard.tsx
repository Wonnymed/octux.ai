'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/design/cn';

interface OctCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outline' | 'ghost' | 'interactive' | 'accent';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  header?: ReactNode;
  footer?: ReactNode;
  hoverable?: boolean;
  selected?: boolean;
  disabled?: boolean;
}

const variantStyles: Record<string, string> = {
  default: 'bg-surface-1 border border-border-subtle',
  elevated: 'bg-surface-raised border border-border-subtle shadow-md',
  outline: 'bg-transparent border border-border-default',
  ghost: 'bg-transparent',
  interactive: 'bg-surface-1 border border-border-subtle cursor-pointer hover:border-border-strong hover:shadow-sm active:bg-surface-2',
  accent: 'bg-accent-subtle border border-accent/20',
};

const paddingStyles: Record<string, string> = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-6' };

const OctCard = forwardRef<HTMLDivElement, OctCardProps>(({
  variant = 'default', padding = 'md', header, footer,
  hoverable = false, selected = false, disabled = false,
  className, children, ...props
}, ref) => {
  return (
    <div ref={ref} className={cn(
      'rounded-lg transition-all duration-normal ease-out',
      variantStyles[variant],
      hoverable && 'hover:border-border-strong hover:shadow-sm cursor-pointer',
      selected && 'border-accent ring-1 ring-accent/30',
      disabled && 'opacity-50 pointer-events-none',
      !header && !footer && paddingStyles[padding],
      className,
    )} {...props}>
      {header && (
        <div className={cn('border-b border-border-subtle', padding === 'sm' ? 'px-3 py-2' : padding === 'lg' ? 'px-6 py-4' : 'px-4 py-3')}>
          {header}
        </div>
      )}
      {header || footer ? <div className={paddingStyles[padding]}>{children}</div> : children}
      {footer && (
        <div className={cn('border-t border-border-subtle', padding === 'sm' ? 'px-3 py-2' : padding === 'lg' ? 'px-6 py-4' : 'px-4 py-3')}>
          {footer}
        </div>
      )}
    </div>
  );
});
OctCard.displayName = 'OctCard';
export default OctCard;
