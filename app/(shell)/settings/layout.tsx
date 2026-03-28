'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, CreditCard, Shield, Key } from 'lucide-react';
import { cn } from '@/lib/design/cn';
import { TRANSITIONS } from '@/lib/design/transitions';
import { useAuth } from '@/components/auth/AuthProvider';

const NAV = [
  { href: '/settings/profile', label: 'Profile', Icon: User },
  { href: '/settings/billing', label: 'Billing', Icon: CreditCard },
  { href: '/settings/data', label: 'Data & Privacy', Icon: Shield },
  { href: '/settings/account', label: 'Account', Icon: Key },
] as const;

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div
      data-octux-settings
      className="flex min-h-0 w-full flex-1 flex-col bg-white transition-colors dark:bg-[#0a0a0f]"
    >
      <div className="shrink-0 border-b border-gray-200 px-6 py-8 dark:border-white/[0.06] md:px-10">
        <h1 className="text-xl font-medium tracking-tight text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-white/40">
          Manage your Octux account and preferences.
        </p>
      </div>

      {!isLoading && !isAuthenticated && (
        <div className="octx-banner-warning mx-6 mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm md:mx-10">
          Sign in to save profile changes, export data, and manage billing.
          <button
            type="button"
            className="ml-2 font-medium text-accent underline-offset-2 hover:underline"
            onClick={() => window.dispatchEvent(new CustomEvent('octux:show-auth', { detail: { mode: 'login' } }))}
          >
            Sign in
          </button>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col gap-6 px-4 py-6 md:flex-row md:gap-0 md:px-0 md:py-0">
        <nav
          className="relative z-10 flex shrink-0 gap-1 overflow-x-auto pb-1 md:hidden"
          aria-label="Settings sections"
        >
          {NAV.map(({ href, label, Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-colors',
                  active
                    ? 'bg-gray-100 font-medium text-gray-900 ring-1 ring-[color:rgba(232,89,60,0.35)] dark:bg-white/[0.06] dark:text-white/90 dark:ring-[color:rgba(232,89,60,0.35)]'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-white/50 dark:hover:bg-white/[0.04] dark:hover:text-white/70',
                )}
              >
                <Icon
                  size={14}
                  className={cn(
                    'shrink-0',
                    active
                      ? 'text-gray-700 dark:text-white/70'
                      : 'text-gray-400 dark:text-white/35',
                  )}
                  strokeWidth={1.75}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        <nav
          className="relative z-10 hidden w-[240px] shrink-0 flex-col gap-1 border-r border-gray-200 bg-white p-6 dark:border-white/[0.06] dark:bg-[#0a0a0f] md:flex"
          aria-label="Settings sections"
        >
          {NAV.map(({ href, label, Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'relative flex items-center gap-3 rounded-lg py-2.5 pl-3 pr-3 text-[13px] font-medium transition-colors duration-150',
                  active
                    ? 'bg-gray-100 text-gray-900 dark:bg-white/[0.06] dark:text-white/90'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-white/50 dark:hover:bg-white/[0.04] dark:hover:text-white/70',
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="settings-nav-indicator"
                    className="absolute bottom-2 left-0 top-2 w-0.5 rounded-r bg-[#e8593c]"
                    transition={TRANSITIONS.spring}
                    aria-hidden
                  />
                ) : null}
                <Icon
                  size={18}
                  className={cn(
                    'shrink-0',
                    active ? 'text-gray-700 dark:text-white/70' : 'text-gray-400 dark:text-white/35',
                  )}
                  strokeWidth={1.75}
                />
                <span className="min-w-0">{label}</span>
              </Link>
            );
          })}
        </nav>

        <main className="relative z-0 flex min-h-0 min-w-0 flex-1 flex-col bg-white p-6 dark:bg-[#0a0a0f] md:p-8">
          {/* Tab transitions: PageTransition in ChatLayout (pathname key) */}
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        </main>
      </div>
    </div>
  );
}
