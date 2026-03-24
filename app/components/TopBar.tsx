"use client";
import { useState } from "react";
import type { Mode } from "../lib/types";
import type { AuthUser } from "../lib/auth";

const GOLD = "#C8A84E";

type TopBarProps = {
  mode: Mode;
  isMobile: boolean;
  authUser?: AuthUser | null;
  onOpenSidebar: () => void;
  sidebarOpen: boolean;
};

/**
 * TopBar — ONLY visible when NOT logged in.
 * Shows "Log in" ghost + "Start free" gold button, right-aligned.
 * When logged in: returns null (TopBar doesn't exist).
 */
export default function TopBar({ authUser, isMobile }: TopBarProps) {
  const [loginHovered, setLoginHovered] = useState(false);
  const [signupHovered, setSignupHovered] = useState(false);

  // Logged in → no top bar at all
  if (authUser) return null;

  return (
    <div style={{
      position: isMobile ? "fixed" : "sticky",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      height: 52,
      padding: isMobile ? "0 16px" : "0 28px",
      background: "var(--bg-primary)",
      flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <button
          onClick={() => { window.location.href = "/login"; }}
          onMouseEnter={() => setLoginHovered(true)}
          onMouseLeave={() => setLoginHovered(false)}
          style={{
            padding: "7px 18px",
            borderRadius: 8,
            background: "transparent",
            border: "none",
            color: loginHovered ? "var(--text-primary)" : "var(--text-secondary)",
            fontSize: 13,
            fontWeight: 450,
            cursor: "pointer",
            transition: "color 180ms ease-out",
            whiteSpace: "nowrap",
            letterSpacing: 0.1,
          }}
        >
          Log in
        </button>
        <button
          onClick={() => { window.location.href = "/signup"; }}
          onMouseEnter={() => setSignupHovered(true)}
          onMouseLeave={() => setSignupHovered(false)}
          style={{
            padding: "7px 22px",
            borderRadius: 8,
            background: "transparent",
            border: `1px solid ${signupHovered ? GOLD : `${GOLD}60`}`,
            color: signupHovered ? GOLD : `${GOLD}CC`,
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 200ms ease-out",
            whiteSpace: "nowrap",
            letterSpacing: 0.2,
          }}
        >
          Start free
        </button>
      </div>
    </div>
  );
}
