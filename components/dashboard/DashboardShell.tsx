'use client';

import { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/design/cn';
import { DARK_THEME } from '@/lib/dashboard/theme';
import DashboardSidebar from '@/components/dashboard/Sidebar';

const MD = 768;

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [viewport, setViewport] = useState<'mobile' | 'desktop' | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useLayoutEffect(() => {
    const mobile = window.innerWidth < MD;
    setViewport(mobile ? 'mobile' : 'desktop');
  }, []);

  useEffect(() => {
    const onResize = () => setViewport(window.innerWidth < MD ? 'mobile' : 'desktop');
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isMobile = viewport === 'mobile';

  useEffect(() => {
    if (!isMobile) setMobileOpen(false);
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile || !mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [isMobile, mobileOpen]);

  const openMenu = useCallback(() => setMobileOpen(true), []);
  const closeMenu = useCallback(() => setMobileOpen(false), []);

  return (
    <div
      className="flex min-h-0 h-[100dvh] w-full overflow-hidden"
      style={{ backgroundColor: DARK_THEME.bg_primary, color: DARK_THEME.text_primary }}
    >
      {viewport === 'desktop' && <DashboardSidebar />}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {isMobile && (
          <header
            className="flex h-12 shrink-0 items-center gap-2 border-b px-3"
            style={{ borderColor: DARK_THEME.border_default, backgroundColor: DARK_THEME.bg_primary }}
          >
            <button
              type="button"
              onClick={openMenu}
              className="rounded-md p-2 text-white/70 transition-colors hover:bg-white/[0.06]"
              aria-label="Open menu"
            >
              <Menu size={20} strokeWidth={1.75} />
            </button>
            <span className="text-[14px] font-medium text-white/90">Octux</span>
          </header>
        )}

        <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
      </div>

      {isMobile && mobileOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={closeMenu}
          />
          <aside
            className={cn(
              'fixed inset-y-0 left-0 z-[110] flex w-[min(250px,88vw)] max-w-full flex-col shadow-xl',
              'animate-slide-in-left pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]',
            )}
            style={{
              backgroundColor: DARK_THEME.bg_sidebar,
              borderRight: `1px solid ${DARK_THEME.border_default}`,
            }}
          >
            <DashboardSidebar />
          </aside>
        </>
      )}
    </div>
  );
}
