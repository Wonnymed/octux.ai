"use client";
import { Zap, Search, Rocket, Globe, TrendingUp } from "lucide-react";
import { t } from "../lib/i18n";
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
};

const PARTICLES = [
  { top: "15%", left: "20%", size: 1.5, anim: "float1", dur: "8s", delay: "0s" },
  { top: "30%", left: "78%", size: 1, anim: "float2", dur: "10s", delay: "1s" },
  { top: "60%", left: "12%", size: 1.5, anim: "float1", dur: "12s", delay: "2s" },
  { top: "55%", left: "88%", size: 1, anim: "float2", dur: "9s", delay: "3s" },
  { top: "82%", left: "42%", size: 1, anim: "float1", dur: "11s", delay: "1.5s" },
];

const MODE_CARDS: { mode: Mode; icon: any; color: string; name: string; desc: string }[] = [
  { mode: "simulate", icon: Zap, color: "#D4AF37", name: "Simulate", desc: "Predict outcomes with AI agents" },
  { mode: "research", icon: Search, color: "#6B8AFF", name: "Research", desc: "Multi-source analysis" },
  { mode: "launchpad", icon: Rocket, color: "#14B8A6", name: "Launchpad", desc: "From idea to business" },
  { mode: "globalops", icon: Globe, color: "#22C55E", name: "Global Ops", desc: "Cross-border intelligence" },
  { mode: "invest", icon: TrendingUp, color: "#A855F7", name: "Invest", desc: "Quantitative deal analysis" },
];

const USE_CASES = [
  "Marketing strategy", "Business structure", "Market entry", "Pricing models",
  "Hiring plans", "Automation", "Supply chain", "Fundraising",
  "Compliance", "Competitor analysis", "Growth hacking", "Unit economics",
];

export default function WelcomeScreen({
  input, setInput, onSend, loading, attachments, onAttachmentsChange,
  onToast, onSwitchMode,
}: WelcomeScreenProps) {
  const isMobile = useIsMobile();
  const particleCount = isMobile ? 3 : 5;

  const handleModeClick = (mode: Mode) => {
    onSwitchMode?.(mode);
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", flex: 1,
      minHeight: "calc(100vh - 60px)",
      padding: isMobile ? "32px 16px 24px" : "40px 32px",
      position: "relative", overflow: "hidden",
    }}>
      {/* Floating particles */}
      {PARTICLES.slice(0, particleCount).map((p, i) => (
        <div key={`p-${i}`} style={{
          position: "absolute", top: p.top, left: p.left,
          width: p.size, height: p.size, borderRadius: "50%",
          background: "rgba(255,255,255,0.12)",
          pointerEvents: "none",
          animation: `${p.anim} ${p.dur} ease-in-out infinite`,
          animationDelay: p.delay,
        }} />
      ))}

      {/* Radial glow */}
      <div style={{
        position: "absolute", top: "28%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 700, height: 700,
        background: "radial-gradient(circle, rgba(212,175,55,0.012) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 680, width: "100%", position: "relative", zIndex: 1 }}>

        {/* ── HEADER ── */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          marginBottom: 48, animation: "fadeIn 0.4s ease-out",
        }}>
          {/* Logo row */}
          <div style={{
            display: "flex", alignItems: "center",
            gap: isMobile ? 12 : 16,
          }}>
            {/* Icon with ring */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{
                position: "absolute", inset: -8, borderRadius: "50%",
                border: "1px solid rgba(212,175,55,0.06)",
                animation: "ringPulse 4s ease-in-out infinite",
              }} />
              <SignuxIcon variant="gold" size={isMobile ? 44 : 52} />
            </div>

            {/* Text */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 0 }}>
              <span style={{
                fontFamily: "var(--font-brand)",
                fontSize: isMobile ? 40 : 48,
                fontWeight: 700, letterSpacing: 6,
                color: "#fff",
              }}>
                SIGNUX
              </span>
              <span style={{
                fontFamily: "var(--font-brand)",
                fontSize: isMobile ? 40 : 48,
                fontWeight: 300, letterSpacing: 4,
                color: "#fff", opacity: 0.22,
                marginLeft: 8,
              }}>
                AI
              </span>
            </div>
          </div>

          {/* Tagline */}
          <div style={{
            marginTop: 16, fontSize: 14,
            color: "rgba(255,255,255,0.35)",
            letterSpacing: 0.5,
            textAlign: "center",
            maxWidth: 420,
            lineHeight: 1.5,
          }}>
            {t("chat.tagline")}
          </div>
        </div>

        {/* ── INPUT ── */}
        <div style={{
          width: "100%", marginBottom: 24,
          animation: "fadeIn 0.5s ease-out",
        }}>
          <ChatInput
            value={input}
            onChange={setInput}
            onSend={() => onSend()}
            loading={loading}
            showDisclaimer={false}
            attachments={attachments}
            onAttachmentsChange={onAttachmentsChange}
            onToast={onToast}
            placeholder={t("chat.placeholder")}
          />
        </div>

        {/* ── MODE BANNERS GRID ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr",
          gap: 8,
          marginBottom: 24,
          maxWidth: 680,
          width: "100%",
          animation: "fadeIn 0.6s ease-out",
        }}>
          {MODE_CARDS.map(({ mode, icon: Icon, color, name, desc }) => {
            const colorAlpha = (a: number) => {
              const r = parseInt(color.slice(1, 3), 16);
              const g = parseInt(color.slice(3, 5), 16);
              const b = parseInt(color.slice(5, 7), 16);
              return `rgba(${r},${g},${b},${a})`;
            };
            return (
              <button
                key={mode}
                onClick={() => handleModeClick(mode)}
                style={{
                  padding: "12px 14px", borderRadius: 12,
                  border: `1px solid ${colorAlpha(0.07)}`,
                  background: `linear-gradient(135deg, ${colorAlpha(0.02)}, transparent)`,
                  cursor: "pointer", transition: "all 200ms",
                  textAlign: "left",
                  display: "flex", flexDirection: "column", gap: 8,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = colorAlpha(0.16);
                  e.currentTarget.style.background = colorAlpha(0.04);
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = colorAlpha(0.07);
                  e.currentTarget.style.background = `linear-gradient(135deg, ${colorAlpha(0.02)}, transparent)`;
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: 7,
                  background: colorAlpha(0.08),
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={14} style={{ color }} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.75)" }}>
                  {name}
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", lineHeight: 1.3 }}>
                  {desc}
                </div>
              </button>
            );
          })}
        </div>

        {/* ── USE CASE PILLS ── */}
        <div style={{
          display: "flex", flexWrap: "wrap", justifyContent: "center",
          gap: 6,
          marginBottom: 20,
          animation: "fadeIn 0.7s ease-out",
        }}>
          {USE_CASES.map(uc => (
            <span key={uc} style={{
              fontSize: 12, color: "rgba(255,255,255,0.16)",
              padding: "4px 10px", borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.05)",
            }}>
              {uc}
            </span>
          ))}
        </div>

        {/* ── DISCLAIMER ── */}
        <div style={{
          textAlign: "center",
          fontSize: 11, color: "rgba(255,255,255,0.1)",
          animation: "fadeIn 0.8s ease-out",
        }}>
          {t("common.disclaimer")}
        </div>

      </div>
    </div>
  );
}
