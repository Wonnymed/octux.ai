"use client";
import { motion } from "framer-motion";
import { sentimentColor } from "./AgentCard";

type EvolutionAgent = {
  agentId: string;
  name: string;
  avatar: string;
  color: string;
  arc: {
    round: number;
    sentiment: string;
    confidence: number;
    changedMind: boolean;
  }[];
};

type EvolutionTrackerProps = {
  evolution: EvolutionAgent[];
  activeRound?: number;
  onSelectRound?: (r: number) => void;
  isMobile?: boolean;
  compact?: boolean;
};

function sentimentToNum(s: string): number {
  const map: Record<string, number> = {
    confident: 9, optimistic: 8, excited: 8, convinced: 9,
    cautious: 5, neutral: 5,
    skeptical: 3, worried: 2, concerned: 3, contrarian: 4,
  };
  return map[s] || 5;
}

export default function EvolutionTracker({
  evolution,
  activeRound,
  onSelectRound,
  isMobile,
  compact,
}: EvolutionTrackerProps) {
  if (!evolution || evolution.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        padding: compact ? "12px 14px" : "16px 20px",
        borderRadius: 12,
        background: "var(--card-bg)",
        border: "1px solid var(--border-secondary)",
      }}
    >
      <div style={{
        fontSize: 10,
        fontFamily: "var(--font-mono)",
        color: "var(--text-tertiary)",
        textTransform: "uppercase" as const,
        letterSpacing: 1,
        marginBottom: compact ? 8 : 12,
      }}>
        Agent Evolution
      </div>

      {evolution.map((agent) => {
        const points = (agent.arc || []).map((r) => sentimentToNum(r.sentiment));
        const maxRound = agent.arc?.length || 0;
        const changedCount = (agent.arc || []).filter(p => p.changedMind).length;

        return (
          <div
            key={agent.agentId}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: compact ? 4 : 6,
            }}
          >
            <span style={{ fontSize: compact ? 12 : 14, width: 20, textAlign: "center" as const }}>
              {agent.avatar}
            </span>
            <span style={{
              fontSize: 10,
              color: agent.color,
              width: isMobile ? 60 : 100,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap" as const,
              fontWeight: 500,
            }}>
              {agent.name}
            </span>

            {/* SVG Sparkline */}
            <svg
              width={isMobile ? 80 : 120}
              height={compact ? 14 : 18}
              viewBox={`0 0 ${isMobile ? 80 : 120} ${compact ? 14 : 18}`}
              style={{ flexShrink: 0 }}
            >
              {/* Sparkline path */}
              {points.length > 1 && (
                <polyline
                  points={points
                    .map((p, i) => {
                      const w = isMobile ? 80 : 120;
                      const h = compact ? 14 : 18;
                      const x = (i / (points.length - 1)) * (w - 4) + 2;
                      const y = h - 2 - ((p / 10) * (h - 4));
                      return `${x},${y}`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke={agent.color}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.7}
                />
              )}

              {/* Dots for each round */}
              {points.map((p, i) => {
                const w = isMobile ? 80 : 120;
                const h = compact ? 14 : 18;
                const x = points.length > 1 ? (i / (points.length - 1)) * (w - 4) + 2 : w / 2;
                const y = h - 2 - ((p / 10) * (h - 4));
                const isLast = i === points.length - 1;
                const isActiveRd = activeRound === i + 1;
                const changed = agent.arc?.[i]?.changedMind;

                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r={isActiveRd ? 3.5 : isLast ? 3 : changed ? 2.5 : 1.5}
                    fill={changed ? "#D4AF37" : sentimentColor(agent.arc?.[i]?.sentiment || "neutral")}
                    stroke={isActiveRd ? "#D4AF37" : "none"}
                    strokeWidth={isActiveRd ? 1.5 : 0}
                    opacity={isActiveRd || isLast ? 1 : 0.6}
                    style={{ cursor: onSelectRound ? "pointer" : "default" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRound?.(i + 1);
                    }}
                  />
                );
              })}
            </svg>

            {/* Current confidence */}
            <span style={{
              fontSize: 10,
              color: "var(--text-tertiary)",
              fontFamily: "var(--font-mono)",
              width: 28,
              textAlign: "right" as const,
            }}>
              {points.length > 0 ? `${points[points.length - 1]}` : "–"}/10
            </span>

            {/* Changed count */}
            {changedCount > 0 && !compact && (
              <span style={{
                fontSize: 8,
                padding: "1px 5px",
                borderRadius: 3,
                background: "rgba(212,175,55,0.08)",
                color: "#D4AF37",
                fontWeight: 600,
                fontFamily: "var(--font-mono)",
              }}>
                {changedCount}x
              </span>
            )}
          </div>
        );
      })}
    </motion.div>
  );
}
