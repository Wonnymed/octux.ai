"use client";
import React from "react";

interface ScoreGaugeProps {
  score: number | string;
  label: string;
  max?: number;
  icon?: React.ReactNode;
}

function scoreColor(value: number): string {
  if (value >= 7) return "var(--positive)";
  if (value >= 5) return "var(--warning)";
  return "var(--negative)";
}

/* For string values like "low" / "medium" / "high" */
const STRING_COLORS: Record<string, string> = {
  low: "var(--negative)",
  medium: "var(--warning)",
  high: "var(--positive)",
};

const STRING_BG: Record<string, string> = {
  low: "rgba(247,91,91,0.08)",
  medium: "rgba(245,158,11,0.08)",
  high: "rgba(62,207,142,0.08)",
};

export default function ScoreGauge({ score, label, max = 10, icon }: ScoreGaugeProps) {
  const isNumeric = typeof score === "number";

  if (!isNumeric) {
    /* String score (e.g. role_clarity: "high") */
    const key = String(score).toLowerCase();
    const color = STRING_COLORS[key] || "var(--text-tertiary)";
    const bg = STRING_BG[key] || "rgba(113,113,122,0.08)";
    return (
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border-primary)",
        borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {icon}
          <span style={{
            fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: 1.5,
            textTransform: "uppercase", color: "var(--text-tertiary)",
          }}>
            {label}
          </span>
        </div>
        <span style={{
          fontSize: 13, fontFamily: "var(--font-mono)", padding: "4px 12px",
          borderRadius: 100, background: bg, color, textTransform: "uppercase", letterSpacing: 0.5,
          alignSelf: "flex-start",
        }}>
          {score}
        </span>
      </div>
    );
  }

  /* Numeric score */
  const clamped = Math.max(0, Math.min(max, score));
  const color = scoreColor(clamped);
  const pct = (clamped / max) * 100;

  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border-primary)",
      borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8,
      flex: 1, minWidth: 120,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {icon}
        <span style={{
          fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: 1,
          textTransform: "uppercase", color: "var(--text-tertiary)",
        }}>
          {label}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ fontSize: 28, fontWeight: 300, color, fontFamily: "var(--font-mono)" }}>
          {clamped}
        </span>
        <span style={{ fontSize: 13, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
          /{max}
        </span>
      </div>
      <div style={{ height: 3, borderRadius: 2, background: "var(--border-secondary)", overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 2, width: `${pct}%`, background: color, transition: "width 500ms ease" }} />
      </div>
    </div>
  );
}
