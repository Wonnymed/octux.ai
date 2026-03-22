"use client";
import React from "react";

type BadgeType = "confidence" | "status" | "recommendation" | "severity" | "stage";

interface StatusBadgeProps {
  value: string;
  type: BadgeType;
}

const GREEN = new Set(["high", "clear", "go", "hire_now", "launch", "scale"]);
const YELLOW = new Set(["medium", "promising", "test_first", "interview_further", "mixed", "validation", "pilot", "act_soon"]);
const ORANGE = new Set(["low", "fragile", "delay", "delay_hire", "use_contractor"]);
const RED = new Set(["blocked", "no_go", "reject", "critical", "act_now"]);
const PURPLE = new Set(["idea"]);

function getColor(value: string): string {
  const v = value.toLowerCase().replace(/[\s-]/g, "_");
  if (GREEN.has(v)) return "var(--positive)";
  if (YELLOW.has(v)) return "var(--warning)";
  if (ORANGE.has(v)) return "#F59E0B";
  if (RED.has(v)) return "var(--negative)";
  if (PURPLE.has(v)) return "#A855F7";
  return "var(--text-tertiary)";
}

function getBg(value: string): string {
  const v = value.toLowerCase().replace(/[\s-]/g, "_");
  if (GREEN.has(v)) return "rgba(62,207,142,0.08)";
  if (YELLOW.has(v)) return "rgba(245,158,11,0.08)";
  if (ORANGE.has(v)) return "rgba(245,158,11,0.06)";
  if (RED.has(v)) return "rgba(239,68,68,0.08)";
  if (PURPLE.has(v)) return "rgba(168,85,247,0.08)";
  return "rgba(113,113,122,0.08)";
}

const STATUS_LABELS: Record<string, string> = {
  clear: "Clear path forward",
  promising: "Promising",
  fragile: "Fragile",
  blocked: "Blocked",
  mixed: "Mixed signals",
};

const REC_LABELS: Record<string, string> = {
  hire_now: "Hire Now",
  interview_further: "Interview Further",
  delay_hire: "Delay Hire",
  reject: "Reject",
  use_contractor: "Use Contractor",
};

export default function StatusBadge({ value, type }: StatusBadgeProps) {
  if (!value) return null;
  const color = getColor(value);
  const bg = getBg(value);
  const normalized = value.toLowerCase().replace(/[\s-]/g, "_");
  const label = type === "confidence" ? `${value} confidence`
    : type === "status" ? (STATUS_LABELS[normalized] || value.replace(/_/g, " "))
    : type === "recommendation" ? (REC_LABELS[normalized] || value.replace(/_/g, " "))
    : value.replace(/_/g, " ");

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontSize: 11,
        fontFamily: "var(--font-mono)",
        letterSpacing: 0.5,
        padding: "3px 10px",
        borderRadius: 100,
        color,
        background: bg,
        border: `1px solid ${color}22`,
        textTransform: "capitalize",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}
