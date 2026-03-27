'use client';

import { cn } from '@/lib/design/cn';

interface GlobalFooterProps {
  className?: string;
  ctaLabel?: string;
  ctaHref?: string;
  oneLiner?: string;
  compact?: boolean;
}

const groups = [
  {
    title: 'Produto',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Agent Lab', href: '/agents' },
    ],
  },
  {
    title: 'Recursos',
    links: [
      { label: 'Tools', href: '/tools/compare' },
      { label: 'Risk Matrix', href: '/tools/risk-matrix' },
      { label: 'Templates', href: '/tools/templates' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
      { label: 'Security', href: '#' },
    ],
  },
  {
    title: 'Redes',
    links: [
      { label: 'X / Twitter', href: '#' },
      { label: 'LinkedIn', href: '#' },
      { label: 'GitHub', href: 'https://github.com/Wonnymed/octux.ai' },
    ],
  },
] as const;

export default function GlobalFooter({
  className,
  ctaLabel = 'Comecar com uma decisao',
  ctaHref = '/pricing',
  oneLiner = 'Decision AI: 10 especialistas debatendo a sua decisao em segundos.',
  compact = false,
}: GlobalFooterProps) {
  return (
    <footer className={cn('border-t border-border-subtle bg-surface-1/50', className)}>
      <div className="mx-auto w-full max-w-landing px-6 py-10">
        <div className="mb-8 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-accent">Decision AI</p>
            <p className="mt-1 max-w-reading text-sm text-txt-secondary">{oneLiner}</p>
          </div>
          <a
            href={ctaHref}
            className="rounded-radius-md bg-accent px-4 py-2 text-sm font-medium text-txt-on-accent transition-colors hover:bg-accent-hover"
          >
            {ctaLabel}
          </a>
        </div>

        {!compact && (
          <>
            <div className="hidden grid-cols-4 gap-8 border-t border-border-subtle/70 pt-8 md:grid">
              {groups.map((group) => (
                <div key={group.title}>
                  <p className="mb-2 text-xs uppercase tracking-[0.08em] text-txt-tertiary">{group.title}</p>
                  <div className="space-y-1">
                    {group.links.map((link) => (
                      <a key={link.label} href={link.href} className="block text-sm text-txt-secondary hover:text-txt-primary">
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border-subtle/70 pt-5 md:hidden">
              <div className="space-y-2">
                {groups.map((group) => (
                  <details key={group.title} className="rounded-radius-md border border-border-subtle bg-surface-0/50 px-3 py-2">
                    <summary className="cursor-pointer list-none text-sm font-medium text-txt-primary">{group.title}</summary>
                    <div className="mt-2 space-y-1">
                      {group.links.map((link) => (
                        <a key={link.label} href={link.href} className="block text-sm text-txt-secondary hover:text-txt-primary">
                          {link.label}
                        </a>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="mt-8 flex flex-col items-start justify-between gap-2 border-t border-border-subtle/70 pt-4 text-xs text-txt-disabled sm:flex-row sm:items-center">
          <p>© 2026 Octux AI</p>
          <p className="flex items-center gap-2">
            <span>Infra:</span>
            <a href="https://supabase.com" className="hover:text-txt-tertiary">Supabase</a>
            <span>·</span>
            <a href="https://vercel.com" className="hover:text-txt-tertiary">Vercel</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
