"use client";
import { useEffect, useState, useCallback } from "react";
import { Zap, Hammer, TrendingUp, UserCheck, Shield, Swords, Check } from "lucide-react";
import { ENGINES, type EngineId } from "../lib/engines";

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Zap, Hammer, TrendingUp, UserCheck, Shield, Swords,
};

type EngineIntroProps = {
  engineId: string;
  onComplete: () => void;
};

type Phase = "idle" | "icon" | "name" | "line" | "tagline" | "features" | "micro" | "ready" | "exit" | "done";

const PHASE_TIMINGS: Record<Phase, number> = {
  idle: 0,
  icon: 100,
  name: 400,
  line: 650,
  tagline: 850,
  features: 1100,
  micro: 1800,
  ready: 2400,
  exit: 2800,
  done: 3100,
};

export default function EngineIntro({ engineId, onComplete }: EngineIntroProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [shouldRender, setShouldRender] = useState(false);
  const storageKey = `signux-intro-${engineId}`;

  const finish = useCallback(() => {
    localStorage.setItem(storageKey, "seen");
    setPhase("exit");
    setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 300);
  }, [storageKey, onComplete]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = localStorage.getItem(storageKey);
    if (seen === "seen") {
      onComplete();
      return;
    }
    setShouldRender(true);
  }, [storageKey, onComplete]);

  useEffect(() => {
    if (!shouldRender) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    const phases: Phase[] = ["icon", "name", "line", "tagline", "features", "micro", "ready"];

    phases.forEach((p) => {
      timers.push(setTimeout(() => setPhase(p), PHASE_TIMINGS[p]));
    });

    // Auto-complete after ready
    timers.push(setTimeout(finish, PHASE_TIMINGS.exit));

    return () => timers.forEach(clearTimeout);
  }, [shouldRender, finish]);

  if (!shouldRender || phase === "done") return null;

  const engine = ENGINES[engineId as EngineId];
  if (!engine) {
    onComplete();
    return null;
  }

  const Icon = ICON_MAP[engine.icon] || Zap;
  const color = engine.color;
  const intro = engine.intro;
  const features = intro.features;

  const phaseIndex = (Object.keys(PHASE_TIMINGS) as Phase[]).indexOf(phase);
  const reached = (target: Phase) => phaseIndex >= (Object.keys(PHASE_TIMINGS) as Phase[]).indexOf(target);

  const isExiting = phase === "exit";

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      zIndex: 20,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg-primary)",
      opacity: isExiting ? 0 : 1,
      transition: "opacity 300ms ease-out",
    }}>
      {/* Skip button */}
      <button
        onClick={finish}
        style={{
          position: "absolute",
          top: 16,
          right: 24,
          fontSize: 11,
          fontFamily: "var(--font-mono)",
          letterSpacing: 0.5,
          color: "var(--text-tertiary)",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "6px 12px",
          borderRadius: 6,
          opacity: reached("name") ? 0.5 : 0,
          transition: "opacity 300ms ease-out",
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = "0.9"; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = "0.5"; }}
      >
        Skip
      </button>

      {/* Content container */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
        maxWidth: 400,
        padding: "0 24px",
        textAlign: "center",
      }}>
        {/* Icon with glow */}
        <div style={{
          position: "relative",
          marginBottom: 20,
          opacity: reached("icon") ? 1 : 0,
          transform: reached("icon") ? "scale(1)" : "scale(0.7)",
          transition: "opacity 400ms ease-out, transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}>
          {/* Glow behind icon */}
          <div style={{
            position: "absolute",
            inset: -20,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
            animation: reached("icon") ? "introGlow 2s ease-in-out infinite" : "none",
          }} />
          {/* Icon circle */}
          <div style={{
            position: "relative",
            width: 64,
            height: 64,
            borderRadius: 16,
            background: `${color}0A`,
            border: `1px solid ${color}20`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Icon
              size={28}
              strokeWidth={1.5}
              style={{
                color,
                filter: `drop-shadow(0 0 12px ${color}40)`,
                animation: reached("icon") ? "introPulse 2s ease-in-out infinite" : "none",
              }}
            />
          </div>
        </div>

        {/* Engine name */}
        <div style={{
          fontSize: 28,
          fontWeight: 300,
          letterSpacing: 8,
          color,
          fontFamily: "var(--font-brand)",
          textTransform: "uppercase",
          marginBottom: 0,
          opacity: reached("name") ? 1 : 0,
          transform: reached("name") ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 350ms ease-out, transform 350ms ease-out",
        }}>
          {engine.name}
        </div>

        {/* Accent line */}
        <div style={{
          width: reached("line") ? 40 : 0,
          height: 2,
          background: color,
          borderRadius: 1,
          margin: "12px auto 14px",
          transition: "width 300ms ease-out",
        }} />

        {/* Tagline */}
        <p style={{
          fontSize: 14,
          color: "var(--text-secondary, #A1A1AA)",
          lineHeight: 1.6,
          margin: "0 0 28px",
          maxWidth: 340,
          opacity: reached("tagline") ? 1 : 0,
          transform: reached("tagline") ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 300ms ease-out, transform 300ms ease-out",
        }}>
          {engine.subtitle}
        </p>

        {/* Feature chips */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          marginBottom: 24,
          width: "100%",
          maxWidth: 280,
        }}>
          {features.map((feature, i) => (
            <div
              key={feature}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 14px",
                borderRadius: 8,
                background: `${color}08`,
                border: `1px solid ${color}15`,
                opacity: reached("features") ? 1 : 0,
                transform: reached("features") ? "translateY(0)" : "translateY(6px)",
                transition: `opacity 250ms ease-out ${i * 150}ms, transform 250ms ease-out ${i * 150}ms`,
              }}
            >
              <Check size={13} strokeWidth={2} style={{ color, flexShrink: 0 }} />
              <span style={{
                fontSize: 12.5,
                color: "var(--text-primary, #E4E4E7)",
                fontWeight: 450,
                letterSpacing: 0.1,
              }}>
                {feature}
              </span>
            </div>
          ))}
        </div>

        {/* Micro line */}
        <span style={{
          fontSize: 11,
          fontFamily: "var(--font-mono)",
          letterSpacing: 0.8,
          color: "var(--text-tertiary, #52525B)",
          opacity: reached("micro") ? 1 : 0,
          transform: reached("micro") ? "translateY(0)" : "translateY(4px)",
          transition: "opacity 300ms ease-out, transform 300ms ease-out",
        }}>
          {intro.micro}
        </span>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes introGlow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes introPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
      `}</style>
    </div>
  );
}
