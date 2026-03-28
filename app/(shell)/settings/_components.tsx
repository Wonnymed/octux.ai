'use client';

import { cn } from '@/lib/design/cn';

export function SettingSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('space-y-4', className)}>
      <div>
        <h2 className="text-base font-medium text-gray-900 dark:text-white/90">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-white/40">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

export function SettingField({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-white/60">{label}</label>
        {hint && <p className="text-xs text-gray-400 dark:text-white/30">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return (
    <div
      className={cn('h-px w-full bg-gray-200 dark:bg-white/[0.06]', className)}
      role="separator"
    />
  );
}

export function SettingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-2">
        <div className="h-4 w-32 rounded bg-gray-200 dark:bg-white/[0.08]" />
        <div className="h-3 w-full max-w-md rounded bg-gray-100 dark:bg-white/[0.06]" />
      </div>
      <div className="h-10 w-full max-w-lg rounded-lg bg-gray-100 dark:bg-white/[0.06]" />
      <div className="h-24 w-full max-w-lg rounded-lg bg-gray-50 dark:bg-white/[0.04]" />
    </div>
  );
}
