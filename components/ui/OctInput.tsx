'use client';

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/design/cn';

type InputSize = 'sm' | 'md' | 'lg';

interface OctInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  inputSize?: InputSize;
}

const sizeStyles: Record<InputSize, { wrapper: string; input: string }> = {
  sm: { wrapper: 'h-8', input: 'text-xs px-2.5' },
  md: { wrapper: 'h-9', input: 'text-sm px-3' },
  lg: { wrapper: 'h-11', input: 'text-base px-4' },
};

const OctInput = forwardRef<HTMLInputElement, OctInputProps>(({
  label,
  error,
  helperText,
  iconLeft,
  iconRight,
  inputSize = 'md',
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const sizes = sizeStyles[inputSize];

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-txt-secondary">
          {label}
        </label>
      )}
      <div className={cn(
        'relative flex items-center rounded-md border transition-all duration-normal ease-out',
        'bg-surface-1',
        error
          ? 'border-verdict-abandon focus-within:border-verdict-abandon focus-within:ring-1 focus-within:ring-verdict-abandon/30'
          : 'border-border-default focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/30',
        props.disabled && 'opacity-40 cursor-not-allowed',
        sizes.wrapper,
      )}>
        {iconLeft && (
          <span className="pl-3 text-icon-secondary [&>svg]:w-4 [&>svg]:h-4 shrink-0">{iconLeft}</span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full h-full bg-transparent text-txt-primary placeholder:text-txt-disabled outline-none',
            'disabled:cursor-not-allowed',
            sizes.input,
            iconLeft && 'pl-2',
            iconRight && 'pr-2',
          )}
          {...props}
        />
        {iconRight && (
          <span className="pr-3 text-icon-secondary [&>svg]:w-4 [&>svg]:h-4 shrink-0">{iconRight}</span>
        )}
      </div>
      {error && <p className="text-micro text-verdict-abandon">{error}</p>}
      {helperText && !error && <p className="text-micro text-txt-tertiary">{helperText}</p>}
    </div>
  );
});
OctInput.displayName = 'OctInput';
export default OctInput;
