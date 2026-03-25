'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/design/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface OctButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-white hover:bg-accent-hover active:bg-accent-active shadow-sm disabled:opacity-40 disabled:pointer-events-none',
  secondary: 'bg-surface-2 text-txt-primary hover:bg-surface-3 active:bg-surface-3 border border-border-subtle disabled:opacity-40 disabled:pointer-events-none',
  ghost: 'bg-transparent text-txt-secondary hover:bg-surface-2 hover:text-txt-primary active:bg-surface-3 disabled:opacity-30 disabled:pointer-events-none',
  danger: 'bg-verdict-abandon/10 text-verdict-abandon hover:bg-verdict-abandon/20 active:bg-verdict-abandon/30 disabled:opacity-40 disabled:pointer-events-none',
  accent: 'bg-accent-muted text-accent hover:bg-accent-glow active:bg-accent/20 disabled:opacity-40 disabled:pointer-events-none',
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'h-6 px-2 text-micro gap-1 rounded-sm',
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-md',
  md: 'h-9 px-4 text-sm gap-2 rounded-md',
  lg: 'h-11 px-6 text-base gap-2.5 rounded-lg',
};

const OctButton = forwardRef<HTMLButtonElement, OctButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  iconLeft,
  iconRight,
  fullWidth = false,
  className,
  disabled,
  children,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-normal ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-1 focus-visible:ring-offset-surface-0',
        'select-none whitespace-nowrap',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        loading && 'cursor-wait',
        className,
      )}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : iconLeft ? (
        <span className="shrink-0 [&>svg]:w-4 [&>svg]:h-4">{iconLeft}</span>
      ) : null}
      {children && <span>{children}</span>}
      {iconRight && !loading && (
        <span className="shrink-0 [&>svg]:w-4 [&>svg]:h-4">{iconRight}</span>
      )}
    </button>
  );
});
OctButton.displayName = 'OctButton';
export default OctButton;
