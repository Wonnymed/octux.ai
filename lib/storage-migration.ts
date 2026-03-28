/**
 * One-time migration of legacy browser storage keys to the Sukgo namespace.
 * Preserves user data: copies old value to new key, then removes old key.
 */

export const STORAGE_MIGRATION_FLAG_KEY = "sukgo_storage_migrated";

const LOCAL_KEY_MAP: Record<string, string> = {
  octux_theme: "sukgo_theme",
  "octux:theme": "sukgo:theme",
  octux_sidebar_expanded: "sukgo_sidebar_expanded",
  octux_sidebar_open: "sukgo_sidebar_open",
  octux_pinned_sims: "sukgo_pinned_sims",
  octux_pending_question: "sukgo_pending_question",
  octux_agent_category: "sukgo_agent_category",
  octux_agent_category_mode: "sukgo_agent_category_mode",
  octux_hero_question: "sukgo_hero_question",
  octux_post_auth_redirect: "sukgo_post_auth_redirect",
  "octux-theme": "sukgo-theme",
  "octux:conversations-cache": "sukgo:conversations-cache",
  signux_active_project: "sukgo_active_project",
  signux_profile: "sukgo_profile",
  signux_last_active: "sukgo_last_active",
  signux_streak: "sukgo_streak",
  "signux-conversations": "sukgo-conversations",
  "signux-guest-tokens": "sukgo-guest-tokens",
  "signux-theme": "sukgo-theme",
};

function migrateLocalStorageKeys() {
  for (const [oldKey, newKey] of Object.entries(LOCAL_KEY_MAP)) {
    try {
      const value = localStorage.getItem(oldKey);
      if (value !== null && localStorage.getItem(newKey) === null) {
        localStorage.setItem(newKey, value);
        localStorage.removeItem(oldKey);
      }
    } catch {
      /* ignore quota / private mode */
    }
  }
}

/** Session keys use dynamic suffixes; migrate any key that starts with legacy prefixes. */
function migrateSessionStoragePrefixes() {
  try {
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k) keys.push(k);
    }
    for (const key of keys) {
      if (key.startsWith("octux:")) {
        const newKey = `sukgo:${key.slice("octux:".length)}`;
        if (sessionStorage.getItem(newKey) === null) {
          const v = sessionStorage.getItem(key);
          if (v !== null) {
            sessionStorage.setItem(newKey, v);
            sessionStorage.removeItem(key);
          }
        } else {
          sessionStorage.removeItem(key);
        }
      }
    }
  } catch {
    /* ignore */
  }
}

export function migrateBrowserStorage() {
  if (typeof window === "undefined") return;
  try {
    if (localStorage.getItem(STORAGE_MIGRATION_FLAG_KEY) === "true") return;

    migrateLocalStorageKeys();
    migrateSessionStoragePrefixes();

    localStorage.setItem(STORAGE_MIGRATION_FLAG_KEY, "true");
  } catch {
    /* ignore */
  }
}
