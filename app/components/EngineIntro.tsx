"use client";
import { useEffect, useState } from "react";
import { ENGINES, type EngineId } from "../lib/engines";

type EngineIntroProps = {
  engineId: string;
  onComplete: () => void;
};

export default function EngineIntro({ engineId, onComplete }: EngineIntroProps) {
  const [visible, setVisible] = useState(false);
  const storageKey = `signux-intro-${engineId}`;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = localStorage.getItem(storageKey);
    if (seen === "seen") {
      onComplete();
      return;
    }
    setVisible(true);
  }, [storageKey, onComplete]);

  if (!visible) return null;

  const engine = ENGINES[engineId as EngineId];
  if (!engine) {
    onComplete();
    return null;
  }

  const handleSkip = () => {
    localStorage.setItem(storageKey, "seen");
    setVisible(false);
    onComplete();
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "60px 24px",
      textAlign: "center",
      animation: "engineIntroFadeIn 400ms ease-out",
    }}>
      <span style={{
        fontSize: 28,
        fontWeight: 300,
        letterSpacing: 6,
        color: engine.color,
        fontFamily: "var(--font-brand)",
        textTransform: "uppercase",
        marginBottom: 12,
      }}>
        {engine.name}
      </span>
      <p style={{
        fontSize: 13,
        color: "var(--text-tertiary)",
        maxWidth: 360,
        lineHeight: 1.6,
        margin: "0 0 32px",
      }}>
        {engine.subtitle}
      </p>
      <button
        onClick={handleSkip}
        style={{
          fontSize: 11,
          color: "var(--text-tertiary)",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "4px 12px",
          opacity: 0.6,
          transition: "opacity 180ms ease-out",
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = "1"; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = "0.6"; }}
      >
        Skip
      </button>
      <style>{`
        @keyframes engineIntroFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
