# HOTFIX-SIDEBAR-REDESIGN — Okara-Quality Sidebar

## Status

**Implemented** in `components/sidebar/Sidebar.tsx` with supporting modules:

- `ConversationContextMenu.tsx` — Pin / Rename / Share / Delete (uses API `action: pin|rename`)
- `InlineRename.tsx` — inline title edit + PATCH rename
- `DeleteConfirmDialog.tsx` — delete confirmation

## Notes

- Sidebar surface: `#0E0E16` vs page `#09090F` (from `globals.css` tokens).
- Store uses `sidebarExpanded` + `toggleSidebar` (not `sidebarOpen`).
- Auth: `useAuth()` from `@/components/auth/AuthProvider` (`isAuthenticated`, `user`).
- Upgrade CTA: `octux:show-upgrade` for free tier; paid tiers show token progress bar.
- Collapsed rail: 52px; expanded: 260px.
- Active row: `layoutId="sidebar-active-indicator"` + `bg-accent/[0.08]`.

See git commit for full diff.
