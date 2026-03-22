"use client";
import { useState, useEffect } from "react";
import { Zap, Shield, Rocket, Globe, TrendingUp } from "lucide-react";
import { useIsMobile } from "../lib/useIsMobile";
import ChatInput, { type FileAttachment } from "./ChatInput";
import { SignuxIcon } from "./SignuxIcon";
import type { Mode } from "../lib/types";

type WelcomeScreenProps = {
  profileName: string;
  input: string;
  setInput: (v: string) => void;
  onSend: (text?: string) => void;
  loading: boolean;
  attachments: FileAttachment[];
  onAttachmentsChange: (atts: FileAttachment[]) => void;
  onToast?: (msg: string, type: "success" | "error" | "info") => void;
  onSwitchToSimulate?: () => void;
  onSwitchToResearch?: () => void;
  onSwitchMode?: (mode: Mode) => void;
  onOpenThreatRadar?: () => void;
  onOpenDealXRay?: () => void;
  onOpenWarGame?: () => void;
  onOpenCausalMap?: () => void;
  onOpenScenarios?: () => void;
  lang?: string;
};

const MODE_ICONS: { mode: Mode; icon: typeof Zap; color: string; tooltip: string }[] = [
  { mode: "simulate", icon: Zap, color: "#C8A84E", tooltip: "Simulate" },
  { mode: "intel", icon: Shield, color: "#EF4444", tooltip: "Intel" },
  { mode: "launchpad", icon: Rocket, color: "#3B82F6", tooltip: "Launchpad" },
  { mode: "globalops", icon: Globe, color: "#10B981", tooltip: "Global Ops" },
  { mode: "invest", icon: TrendingUp, color: "#8B5CF6", tooltip: "Invest" },
];

export default function WelcomeScreen({
  input, setInput, onSend, loading, attachments, onAttachmentsChange,
  onToast, onSwitchMode,
}: WelcomeScreenProps) {
  const isMobile = useIsMobile();
  const [showScrollHint, setShowScrollHint] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      setShowScrollHint(scrollY < 80);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      minHeight: isMobile ? "calc(100vh - 52px)" : "calc(100vh - 60px)",
      padding: isMobile ? "0 20px" : "0 32px",
      paddingTop: isMobile ? "12vh" : "clamp(80px, 18vh, 200px)",
      width: "100%",
      position: "relative",
    }}>

      {/* Logo block */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: isMobile ? 8 : 12,
        marginBottom: isMobile ? "clamp(40px, 8vh, 80px)" : "clamp(60px, 12vh, 160px)",
      }}>
        <SignuxIcon size={isMobile ? 44 : 72} />
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{
            fontFamily: "var(--font-brand)",
            fontSize: isMobile ? 28 : "clamp(32px, 3vw, 48px)",
            fontWeight: 800,
            letterSpacing: "clamp(6px, 0.6vw, 10px)",
            color: "var(--text-primary)",
          }}>
            SIGNUX
          </span>
          <span style={{
            fontFamily: "var(--font-brand)",
            fontSize: isMobile ? 28 : "clamp(32px, 3vw, 48px)",
            fontWeight: 300,
            letterSpacing: "clamp(6px, 0.6vw, 10px)",
            color: "var(--text-tertiary)",
            opacity: 0.3,
          }}>
            AI
          </span>
        </div>
      </div>

      {/* Composer — viewport-proportional width */}
      <div style={{
        width: "100%",
        maxWidth: isMobile ? 680 : "clamp(600px, 52vw, 820px)",
        marginBottom: "clamp(16px, 3vh, 36px)",
      }}>
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={() => onSend()}
          loading={loading}
          showDisclaimer={false}
          showVoice={false}
          attachments={attachments}
          onAttachmentsChange={onAttachmentsChange}
          onToast={onToast}
          placeholder="Ask anything about your business..."
        />
      </div>

      {/* Mode icons */}
      <div style={{
        display: "flex",
        gap: isMobile ? 10 : "clamp(8px, 0.8vw, 14px)",
        marginBottom: 32,
      }}>
        {MODE_ICONS.map(({ mode, icon: Icon, color, tooltip }) => (
          <button
            key={mode}
            onClick={() => onSwitchMode?.(mode)}
            data-tooltip={tooltip}
            className="tooltip-bottom"
            style={{
              width: isMobile ? 44 : 42,
              height: isMobile ? 44 : 42,
              borderRadius: 12,
              border: `1px solid ${color}30`,
              background: `${color}08`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 200ms cubic-bezier(0.34, 1.56, 0.64, 1)",
              position: "relative",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = `${color}60`;
              e.currentTarget.style.background = `${color}12`;
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = `0 4px 14px ${color}18`;
              const icon = e.currentTarget.querySelector("svg");
              if (icon) (icon as HTMLElement).style.color = color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = `${color}30`;
              e.currentTarget.style.background = `${color}08`;
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
              const icon = e.currentTarget.querySelector("svg");
              if (icon) (icon as HTMLElement).style.color = `${color}80`;
            }}
          >
            <Icon
              size={isMobile ? 16 : 18}
              strokeWidth={1.5}
              style={{ color: `${color}80`, transition: "color 200ms" }}
            />
          </button>
        ))}
      </div>

      {/* Scroll Hint — apenas visual, não é botão */}
      <div
        style={{
          position: "absolute",
          bottom: isMobile ? 20 : 28,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
          opacity: showScrollHint ? 1 : 0,
          transition: "opacity 0.5s ease",
          pointerEvents: "none",
          cursor: "default",
          userSelect: "none",
        }}
      >
        <svg
          width={isMobile ? 18 : 20}
          height={isMobile ? 18 : 20}
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ animation: "scrollHintBounce 2.5s ease-in-out infinite" }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}
