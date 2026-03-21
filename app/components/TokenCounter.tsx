"use client";
import { Zap } from "lucide-react";

interface TokenCounterProps {
  available: number;
  monthlyTotal: number;
  plan: string;
  compact?: boolean;
  onClick?: () => void;
}

export default function TokenCounter({ available, monthlyTotal, plan, compact, onClick }: TokenCounterProps) {
  const pct = monthlyTotal > 0 ? Math.round((available / monthlyTotal) * 100) : 0;
  const isLow = pct < 20;
  const isEmpty = available <= 0;

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: compact ? 4 : 6,
        padding: compact ? "3px 8px" : "4px 10px", borderRadius: 8,
        background: isEmpty ? "rgba(239,68,68,0.08)" : isLow ? "rgba(239,68,68,0.06)" : "rgba(212,175,55,0.06)",
        border: `1px solid ${isEmpty ? "rgba(239,68,68,0.2)" : isLow ? "rgba(239,68,68,0.15)" : "rgba(212,175,55,0.1)"}`,
        cursor: onClick ? "pointer" : "default",
        transition: "all 200ms",
      }}
    >
      <Zap size={compact ? 10 : 12} style={{ color: isEmpty || isLow ? "#EF4444" : "#D4AF37" }} />
      <span style={{
        fontSize: compact ? 10 : 11, fontWeight: 600, fontFamily: "var(--font-mono)",
        color: isEmpty || isLow ? "#EF4444" : "#D4AF37",
      }}>
        {available.toLocaleString()}
      </span>
      {!compact && (
        <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>
          / {monthlyTotal.toLocaleString()} ST
        </span>
      )}
    </div>
  );
}
