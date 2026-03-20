"use client";
import { useState, useEffect } from "react";
import {
  MessageSquare, Zap, Shield, Rocket, Globe, TrendingUp, Settings,
} from "lucide-react";

interface ModeTransitionProps {
  mode: string;
  isTransitioning: boolean;
  onComplete: () => void;
}

const MODE_CONFIG: Record<string, {
  icon: React.ComponentType<any>;
  color: string;
  label: string;
  animClass: string;
}> = {
  chat: { icon: MessageSquare, color: "#D4AF37", label: "CHAT", animClass: "anim-draw" },
  simulate: { icon: Zap, color: "#D4AF37", label: "SIMULATE", animClass: "anim-flash" },
  intel: { icon: Shield, color: "#EF4444", label: "INTEL", animClass: "anim-assemble" },
  launchpad: { icon: Rocket, color: "#14B8A6", label: "LAUNCHPAD", animClass: "anim-launch" },
  globalops: { icon: Globe, color: "#8B5CF6", label: "GLOBAL OPS", animClass: "anim-spin" },
  invest: { icon: TrendingUp, color: "#3B82F6", label: "INVEST", animClass: "anim-trace" },
  settings: { icon: Settings, color: "#666666", label: "SETTINGS", animClass: "anim-gear" },
};

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`
    : "212,175,55";
}

export default function ModeTransition({ mode, isTransitioning, onComplete }: ModeTransitionProps) {
  const [phase, setPhase] = useState<"idle" | "opening" | "icon" | "expanding" | "done">("idle");
  const config = MODE_CONFIG[mode];
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  useEffect(() => {
    if (!isTransitioning || !config) return;

    setPhase("opening");

    const t1 = setTimeout(() => setPhase("icon"), isMobile ? 100 : 150);
    const t2 = setTimeout(() => setPhase("expanding"), isMobile ? 500 : 800);
    const t3 = setTimeout(() => setPhase("done"), isMobile ? 700 : 1100);
    const t4 = setTimeout(() => {
      setPhase("idle");
      onComplete();
    }, isMobile ? 800 : 1300);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [isTransitioning, mode, config, onComplete, isMobile]);

  if (phase === "idle" || !config) return null;

  const IconComponent = config.icon;
  const rgb = hexToRgb(config.color);
  const windowSize = isMobile ? 220 : 280;
  const windowHeight = isMobile ? 140 : 180;

  return (
    <div
      className={`mode-transition-overlay ${phase}`}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: phase === "done" ? "none" : "auto",
      }}
    >
      {/* Dark overlay */}
      <div
        style={{
          position: "absolute", inset: 0,
          background: "rgba(0,0,0,0.7)",
          opacity: phase === "done" ? 0 : phase === "opening" ? 0 : 1,
          transition: "opacity 200ms ease",
        }}
      />

      {/* Horizontal window */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          width: phase === "opening" ? "0px"
            : phase === "icon" ? `${windowSize}px`
            : "100vw",
          height: phase === "opening" ? "2px"
            : phase === "icon" ? `${windowHeight}px`
            : "100vh",
          background: phase === "expanding" || phase === "done"
            ? "transparent"
            : `radial-gradient(ellipse at center, rgba(${rgb},0.06) 0%, rgba(0,0,0,0.95) 70%)`,
          borderRadius: phase === "expanding" || phase === "done" ? 0 : 20,
          border: phase === "expanding" || phase === "done"
            ? "none"
            : `1px solid rgba(${rgb},0.2)`,
          overflow: "hidden",
          transition: phase === "opening"
            ? "all 200ms cubic-bezier(0.34, 1.56, 0.64, 1)"
            : phase === "icon"
            ? "all 150ms ease"
            : "all 300ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* Horizontal accent lines */}
        {phase === "icon" && (
          <>
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 1,
              background: `linear-gradient(90deg, transparent, ${config.color}60, transparent)`,
            }} />
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: 1,
              background: `linear-gradient(90deg, transparent, ${config.color}60, transparent)`,
            }} />
          </>
        )}

        {/* Icon */}
        {phase === "icon" && (
          <div className={`transition-icon ${config.animClass}`}>
            <IconComponent
              size={isMobile ? 36 : 48}
              strokeWidth={1.5}
              style={{
                color: config.color,
                filter: `drop-shadow(0 0 20px ${config.color}40)`,
              }}
            />
          </div>
        )}

        {/* Label */}
        {phase === "icon" && (
          <span
            className="transition-label"
            style={{
              fontFamily: "var(--font-brand, 'Outfit', sans-serif)",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 4,
              color: config.color,
              opacity: 0.8,
            }}
          >
            {config.label}
          </span>
        )}
      </div>
    </div>
  );
}
