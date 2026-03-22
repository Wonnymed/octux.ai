"use client";
import { useMemo } from "react";
import { motion } from "framer-motion";

interface RoundData {
  round: number;
  sentiment: string;
  confidence: number;
  changedMind: boolean;
}

interface AgentEvolution {
  agentId: string;
  name: string;
  avatar?: string;
  color: string;
  arc?: RoundData[];
  sentimentOverRounds?: RoundData[];
}

interface Props {
  evolution?: AgentEvolution[];
  agents?: AgentEvolution[];
  activeRound?: number;
  onSelectRound?: (r: number) => void;
  onAgentClick?: (agentId: string) => void;
  isMobile?: boolean;
  compact?: boolean;
}

const SENTIMENT_MAP: Record<string, number> = {
  confident: 9, optimistic: 8, excited: 8, convinced: 9,
  cautious: 5, neutral: 5, skeptical: 3, worried: 2,
  concerned: 2, contrarian: 4,
};

/* Agent name → color mapping (matches AgentCard) */
const AGENT_NAME_COLORS: Record<string, string> = {
  strategist: "#A8A29E", strategy: "#A8A29E", base: "#A8A29E",
  finance: "#7DD3FC", financial: "#7DD3FC", unit: "#7DD3FC",
  operator: "#FCD34D", operations: "#FCD34D", execution: "#FCD34D",
  market: "#6EE7B7", demand: "#6EE7B7",
  risk: "#FCA5A5", regulatory: "#FCA5A5", regime: "#FCA5A5",
  innovator: "#C4B5FD", innovation: "#C4B5FD", intervention: "#C4B5FD",
  devil: "#FDBA74", adversary: "#FDBA74", competitive: "#FDBA74",
  global: "#5EEAD4",
  human: "#F9A8D4", customer: "#F9A8D4",
  futurist: "#A5B4FC", decision: "#A5B4FC",
};

function getAgentColor(name: string, fallback: string): string {
  const lower = (name || "").toLowerCase();
  for (const [key, color] of Object.entries(AGENT_NAME_COLORS)) {
    if (lower.includes(key)) return color;
  }
  return fallback;
}

export function sentimentColor(s: string) {
  const map: Record<string, string> = {
    confident: "#3ECF8E", optimistic: "#3ECF8E", excited: "#3ECF8E", convinced: "#3ECF8E",
    cautious: "#F59E0B", neutral: "#6B7280", skeptical: "#F59E0B",
    worried: "#F75B5B", concerned: "#F75B5B", contrarian: "#EC4899",
  };
  return map[s] || "#6B7280";
}

export default function EvolutionTracker({
  evolution, agents: agentsProp, activeRound = 1,
  onSelectRound, onAgentClick, isMobile, compact,
}: Props) {
  const raw = Array.isArray(agentsProp) ? agentsProp : Array.isArray(evolution) ? evolution : [];

  const normalized = useMemo(() => raw.map(a => ({
    ...a,
    rounds: a.sentimentOverRounds || a.arc || [],
  })), [raw]);

  const sorted = useMemo(() => {
    return [...normalized].sort((a, b) => {
      const aLast = a.rounds[a.rounds.length - 1]?.confidence || 5;
      const bLast = b.rounds[b.rounds.length - 1]?.confidence || 5;
      return bLast - aLast;
    });
  }, [normalized]);

  if (raw.length === 0) return null;

  const changedCount = normalized.filter(a =>
    a.rounds.some(r => r.changedMind)
  ).length;

  const svgW = isMobile ? 64 : 120;
  const svgH = 20;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        padding: compact ? "14px 16px" : "20px",
        borderRadius: 12,
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
      }}
    >
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: compact ? 10 : 16,
      }}>
        <span style={{
          fontSize: 10, fontFamily: "var(--font-mono)",
          color: "var(--text-tertiary)",
          letterSpacing: 2,
        }}>
          AGENT EVOLUTION
        </span>
        <span style={{
          fontSize: 11, fontFamily: "var(--font-mono)",
          color: "var(--text-tertiary)",
        }}>
          {changedCount}/{normalized.length} changed position
        </span>
      </div>

      {/* Agent rows */}
      {sorted.map(agent => {
        const points = agent.rounds.map(r => SENTIMENT_MAP[r.sentiment] || 5);
        const confidences = agent.rounds.map(r => r.confidence);
        const lastConfidence = confidences[confidences.length - 1] || 5;
        const firstConfidence = confidences[0] || 5;
        const delta = lastConfidence - firstConfidence;
        const changedTimes = agent.rounds.filter(r => r.changedMind).length;
        const nameColor = getAgentColor(agent.name, agent.color);

        return (
          <div
            key={agent.agentId}
            onClick={() => onAgentClick?.(agent.agentId)}
            style={{
              display: "flex", alignItems: "center", gap: isMobile ? 6 : 10,
              padding: "4px 0",
              marginBottom: 2,
              cursor: onAgentClick ? "pointer" : "default",
            }}
          >
            {/* Name */}
            <span style={{
              fontSize: 12, color: nameColor,
              width: isMobile ? 64 : 90,
              overflow: "hidden", textOverflow: "ellipsis",
              whiteSpace: "nowrap" as const, fontWeight: 500,
              flexShrink: 0,
            }}>
              {agent.name.replace("The ", "")}
            </span>

            {/* Sparkline */}
            <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} style={{ flexShrink: 0 }}>
              {/* Line */}
              {points.length > 1 && (
                <polyline
                  points={points.map((p, i) => {
                    const x = (i / (points.length - 1)) * (svgW - 4) + 2;
                    const y = svgH - 2 - (p / 10) * (svgH - 4);
                    return `${x},${y}`;
                  }).join(" ")}
                  fill="none"
                  stroke={nameColor}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.5}
                />
              )}

              {/* Dots — only changed, active, and last */}
              {points.map((p, i) => {
                const x = points.length > 1 ? (i / (points.length - 1)) * (svgW - 4) + 2 : svgW / 2;
                const y = svgH - 2 - (p / 10) * (svgH - 4);
                const changed = agent.rounds[i]?.changedMind;
                const isActive = activeRound === i + 1;
                const isLast = i === points.length - 1;
                const sentiment = agent.rounds[i]?.sentiment || "neutral";

                if (!changed && !isActive && !isLast) return null;

                let fill: string;
                if (changed) fill = "var(--accent, #C8A84E)";
                else if (sentimentColor(sentiment) === "#3ECF8E") fill = "#3ECF8E";
                else if (sentimentColor(sentiment) === "#F75B5B") fill = "#F75B5B";
                else fill = nameColor;

                return (
                  <circle
                    key={i}
                    cx={x} cy={y}
                    r={changed || isActive ? 3 : 2}
                    fill={fill}
                    opacity={isActive ? 1 : 0.8}
                    style={{ cursor: onSelectRound ? "pointer" : "default" }}
                    onClick={(e) => { e.stopPropagation(); onSelectRound?.(i + 1); }}
                  />
                );
              })}
            </svg>

            {/* Confidence */}
            <span style={{
              fontSize: 12, fontFamily: "var(--font-mono)",
              color: "var(--text-secondary)",
              width: 22, textAlign: "right" as const,
              flexShrink: 0,
            }}>
              {lastConfidence}
            </span>

            {/* Delta */}
            <span style={{
              fontSize: 11, fontFamily: "var(--font-mono)",
              width: 28, textAlign: "right" as const,
              flexShrink: 0,
              color: delta > 0 ? "#3ECF8E" : delta < 0 ? "#F75B5B" : "var(--text-tertiary)",
            }}>
              {delta > 0 ? `+${delta}` : delta === 0 ? "—" : String(delta)}
            </span>

            {/* Changed badge */}
            {changedTimes > 0 && (
              <span style={{
                fontSize: 9, padding: "1px 5px", borderRadius: 50,
                background: "rgba(200,168,78,0.08)",
                color: "var(--accent, #C8A84E)",
                fontWeight: 600,
                fontFamily: "var(--font-mono)",
                flexShrink: 0,
              }}>
                {changedTimes}x
              </span>
            )}
          </div>
        );
      })}

      {/* Legend */}
      {!compact && (
        <div style={{
          display: "flex", gap: 14, marginTop: 12, paddingTop: 10,
          borderTop: "1px solid var(--border-primary)",
        }}>
          {[
            { color: "var(--accent, #C8A84E)", label: "Changed mind" },
            { color: "#3ECF8E", label: "Positive" },
            { color: "#F75B5B", label: "Negative" },
          ].map(l => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: l.color }} />
              <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>{l.label}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
