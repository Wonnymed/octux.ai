'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/design/cn';

type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface OctDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: DialogSize;
  children: ReactNode;
  footer?: ReactNode;
  closeOnOverlay?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

const sizeStyles: Record<DialogSize, string> = {
  sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl', full: 'max-w-[90vw] max-h-[90vh]',
};

export default function OctDialog({
  open, onClose, title, description, size = 'md', children, footer,
  closeOnOverlay = true, closeOnEscape = true, showCloseButton = true, className,
}: OctDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const el = dialogRef.current;
    if (!el) return;
    const focusable = el.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    focusable?.focus();
  }, [open]);

  useEffect(() => {
    if (!open || !closeOnEscape) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, closeOnEscape, onClose]);

  useEffect(() => {
    if (open) { document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = ''; }; }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-surface-overlay backdrop-blur-sm animate-fade-in" onClick={closeOnOverlay ? onClose : undefined} aria-hidden="true" />
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label={title} className={cn(
        'relative z-10 w-full mx-4 animate-scale-in',
        'bg-surface-raised border border-border-subtle rounded-xl shadow-xl',
        'flex flex-col overflow-hidden', sizeStyles[size], className,
      )}>
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between px-5 pt-5 pb-0">
            <div>
              {title && <h2 className="text-lg font-medium text-txt-primary">{title}</h2>}
              {description && <p className="text-sm text-txt-tertiary mt-1">{description}</p>}
            </div>
            {showCloseButton && (
              <button onClick={onClose} className="p-1 rounded-md text-icon-secondary hover:text-icon-primary hover:bg-surface-2 transition-colors duration-normal" aria-label="Close dialog">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4l8 8M12 4l-8 8" /></svg>
              </button>
            )}
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border-subtle">{footer}</div>}
      </div>
    </div>
  );
}
