# HOTFIX — Marketing Sections Missing + Scroll Blocked

## Problems
1. Hero div `h-dvh` constrains to viewport — marketing below is unreachable
2. Main area needs proper scroll behavior

## Fixes
- Hero: `h-dvh` → `min-h-dvh` (allows content below)
- Shell: ensure `overflow-y-auto` on main
- Marketing components already exist at `components/landing/` and are imported

HOTFIX-MARKETING-SCROLL completo.
