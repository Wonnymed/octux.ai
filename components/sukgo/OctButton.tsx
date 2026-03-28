'use client';

import { forwardRef, type ReactNode } from 'react';
import { Button, type ButtonProps } from '@/components/ui/shadcn/button';
import { cn } from '@/lib/design/cn';

interface OctButtonProps extends ButtonProps {
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

const OctButton = forwardRef<HTMLButtonElement, OctButtonProps>(({
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
    <Button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
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
    </Button>
  );
});
OctButton.displayName = 'OctButton';
export default OctButton;
