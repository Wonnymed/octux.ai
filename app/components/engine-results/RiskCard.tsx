"use client";
import React from "react";
import { AlertTriangle } from "lucide-react";

interface RiskCardProps {
  risk: string;
  likelihood: string;
  impact: string;
  description?: string;
  mitigation?: string;
}

const LEVEL_COLOR: Record<string, string> = {
  low: "var(--positive)",
  medium: "var(--warning)",
  high: "var(--negative)",
  catastrophic: "#DC2626",
};

function levelColor(v: string): string {
  return LEVEL_COLOR[v?.toLowerCase()] || "var(--text-tertiary)";
}

function riskScore(likelihood: string, impact: string): number {
  const w: Record<string, number> = { low: 1, medium: 2, high: 3, catastrophic: 4 };
  return (w[likelihood?.toLowerCase()] || 1) * (w[impact?.toLowerCase()] || 1);
}

function cellBg(score: number): string {
  if (score >= 9) return "rgba(239,68,68,0.06)";
  if (score >= 6) return "rgba(249,115,22,0.06)";
  if (score >= 4) return "rgba(245,158,11,0.06)";
  return "var(--bg-card)";
}

function cellBorder(score: number): string {
  if (score >= 9) return "rgba(239,68,68,0.15)";
  if (score >= 6) return "rgba(249,115,22,0.15)";
  if (score >= 4) return "rgba(245,158,11,0.15)";
  return "var(--border-primary)";
}

export default function RiskCard({ risk, likelihood, impact, description, mitigation }: RiskCardProps) {
  const score = riskScore(likelihood, impact);

  return (
    <div
      style={{
        background: cellBg(score),
        border: `1px solid ${cellBorder(score)}`,
        borderRadius: 10,
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <AlertTriangle size={13} color="var(--negative)" style={{ marginTop: 2, flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.4 }}>
          {risk}
        </span>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <span
          style={{
            fontSize: 10,
            fontFamily: "var(--font-mono)",
            letterSpacing: 0.5,
            padding: "2px 8px",
            borderRadius: 100,
            color: levelColor(likelihood),
            border: `1px solid var(--border-secondary)`,
          }}
        >
          {likelihood} likelihood
        </span>
        <span
          style={{
            fontSize: 10,
            fontFamily: "var(--font-mono)",
            letterSpacing: 0.5,
            padding: "2px 8px",
            borderRadius: 100,
            color: levelColor(impact),
            border: `1px solid var(--border-secondary)`,
          }}
        >
          {impact} impact
        </span>
      </div>

      {description && (
        <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
          {description}
        </div>
      )}

      {mitigation && (
        <div style={{ fontSize: 11, color: "var(--text-tertiary)", lineHeight: 1.5 }}>
          Mitigation: {mitigation}
        </div>
      )}
    </div>
  );
}
