import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  resolved: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
  initialize: () => void;
}

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode;
}

function applyThemeToDOM(resolved: 'light' | 'dark') {
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
  }

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', resolved === 'dark' ? '#0F0F13' : '#FAFAFA');
  }
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'system',
  resolved: 'dark',

  setMode: (mode) => {
    set({ mode });
    if (typeof window === 'undefined') return;
    localStorage.setItem('octux:theme', mode);
    const resolved = resolveTheme(mode);
    applyThemeToDOM(resolved);
    set({ resolved });
  },

  initialize: () => {
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem('octux:theme') as ThemeMode | null;
    const mode = saved || 'system';
    const resolved = resolveTheme(mode);
    applyThemeToDOM(resolved);
    set({ mode, resolved });

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (get().mode === 'system') {
        const r = resolveTheme('system');
        applyThemeToDOM(r);
        set({ resolved: r });
      }
    };
    mq.addEventListener('change', onChange);
  },
}));
