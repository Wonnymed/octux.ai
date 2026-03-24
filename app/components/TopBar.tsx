"use client";
import { useState } from "react";
import { HelpCircle } from "lucide-react";
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
 * Shows Log in + Sign up for free + help icon, right-aligned.
 */
export default function TopBar({ authUser, isMobile }: TopBarProps) {
  const [loginHovered, setLoginHovered] = useState(false);
  const [signupHovered, setSignupHovered] = useState(false);
  const [helpHovered, setHelpHovered] = useState(false);

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
      padding: isMobile ? "0 16px" : "0 24px",
      background: "var(--bg-primary)",
      flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <button
          onClick={() => { window.location.href = "/login"; }}
          onMouseEnter={() => setLoginHovered(true)}
          onMouseLeave={() => setLoginHovered(false)}
          style={{
            padding: "7px 16px",
            borderRadius: 8,
            background: "transparent",
            border: "none",
            color: loginHovered ? "var(--text-primary)" : "var(--text-secondary)",
            fontSize: 13,
            fontWeight: 450,
            cursor: "pointer",
            transition: "color 180ms ease-out",
            whiteSpace: "nowrap",
          }}
        >
          Log in
        </button>
        <button
          onClick={() => { window.location.href = "/signup"; }}
          onMouseEnter={() => setSignupHovered(true)}
          onMouseLeave={() => setSignupHovered(false)}
          style={{
            padding: "7px 20px",
            borderRadius: 8,
            background: "transparent",
            border: `1px solid ${signupHovered ? GOLD : `${GOLD}50`}`,
            color: signupHovered ? GOLD : `${GOLD}BB`,
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 200ms ease-out",
            whiteSpace: "nowrap",
            letterSpacing: 0.2,
          }}
        >
          Sign up free
        </button>
        <button
          onClick={() => { window.location.href = "/about"; }}
          onMouseEnter={() => setHelpHovered(true)}
          onMouseLeave={() => setHelpHovered(false)}
          style={{
            width: 32, height: 32,
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: helpHovered ? "var(--text-secondary)" : "var(--text-tertiary)",
            transition: "color 180ms ease-out",
            marginLeft: 4,
          }}
          title="About Signux"
        >
          <HelpCircle size={16} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
