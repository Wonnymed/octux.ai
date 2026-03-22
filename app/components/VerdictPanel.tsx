"use client";
import { motion, AnimatePresence } from "framer-motion";

type PatternData = {
  type: string;
  title: string;
  description: string;
  agents_involved?: string[];
};

type DissentData = {
  avatar?: string;
  agent: string;
  note: string | null;
};

type VerdictPanelProps = {
  verdict: {
    proceedCount: number;
    stopCount: number;
    avgConfidence: number;
    viability: number;
    estimatedROI?: string;
    verdict?: string;
    keyRisk?: string;
    keyOpportunity?: string;
    patterns?: PatternData[];
    dissents?: DissentData[];
    votes?: any[];
  };
  isMobile?: boolean;
  stats?: {
    agents: number;
    rounds: number;
    interactions: number;
    elapsed: string;
  };
};

const PATTERN_COLORS: Record<string, string> = {
  consensus: "#22c55e",
  emerging_risk: "#ef4444",
  blind_spot: "#f59e0b",
  opportunity: "#3b82f6",
  tension: "#ec4899",
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

function getAgentColor(name: string): string {
  const lower = (name || "").toLowerCase();
  for (const [key, color] of Object.entries(AGENT_NAME_COLORS)) {
    if (lower.includes(key)) return color;
  }
  return "var(--text-secondary)";
}

export default function VerdictPanel({ verdict, isMobile, stats }: VerdictPanelProps) {
  if (!verdict || typeof verdict !== "object") return null;
  const isProceed = (verdict.proceedCount || 0) >= (verdict.stopCount || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ display: "flex", flexDirection: "column", gap: 24 }}
    >
      {/* 1. HEADER */}
      <div>
        <h2 style={{
          fontSize: 24,
          fontWeight: 400,
          color: "var(--text-primary)",
          margin: 0,
          lineHeight: 1.2,
        }}>
          Analysis complete
        </h2>
        {stats && (
          <p style={{
            fontSize: 12,
            fontFamily: "var(--font-mono)",
            color: "var(--text-tertiary)",
            margin: "8px 0 0",
          }}>
            {stats.agents} agents · {stats.rounds} rounds · {stats.interactions} interactions · {stats.elapsed}
          </p>
        )}
      </div>

      {/* 2. VOTE BLOCK */}
      <div style={{
        display: "flex",
        alignItems: isMobile ? "flex-start" : "center",
        gap: isMobile ? 24 : 40,
        flexWrap: "wrap",
      }}>
        {/* Vote count */}
        <div>
          <div style={{
            fontSize: 42,
            fontWeight: 300,
            fontFamily: "var(--font-mono)",
            lineHeight: 1,
            display: "flex",
            alignItems: "baseline",
            gap: 4,
          }}>
            <span style={{ color: isProceed ? "var(--positive, #3ECF8E)" : "var(--negative, #F75B5B)" }}>
              {isProceed ? verdict.proceedCount : verdict.stopCount}
            </span>
            <span style={{ color: "var(--text-tertiary)", fontSize: 28, fontWeight: 300 }}>–</span>
            <span style={{ color: isProceed ? "var(--negative, #F75B5B)" : "var(--positive, #3ECF8E)" }}>
              {isProceed ? verdict.stopCount : verdict.proceedCount}
            </span>
          </div>
          <div style={{
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            color: isProceed ? "var(--positive, #3ECF8E)" : "var(--negative, #F75B5B)",
            letterSpacing: 2,
            marginTop: 4,
          }}>
            {isProceed ? "PROCEED" : "STOP"}
          </div>
        </div>

        {/* Viability */}
        <div>
          <div style={{
            fontSize: 36,
            fontWeight: 300,
            fontFamily: "var(--font-mono)",
            color: "var(--text-secondary)",
            lineHeight: 1,
          }}>
            {verdict.viability}/10
          </div>
          <div style={{
            fontSize: 10,
            fontFamily: "var(--font-mono)",
            color: "var(--text-tertiary)",
            letterSpacing: 2,
            marginTop: 4,
          }}>
            VIABILITY
          </div>
        </div>

        {/* Avg Confidence */}
        <div>
          <div style={{
            fontSize: 24,
            fontWeight: 300,
            fontFamily: "var(--font-mono)",
            color: "var(--text-tertiary)",
            lineHeight: 1,
          }}>
            {verdict.avgConfidence}
          </div>
          <div style={{
            fontSize: 10,
            fontFamily: "var(--font-mono)",
            color: "var(--text-tertiary)",
            letterSpacing: 2,
            marginTop: 4,
          }}>
            AVG CONF
          </div>
        </div>

        {/* ROI */}
        {verdict.estimatedROI && verdict.estimatedROI !== "N/A" && (
          <div>
            <div style={{
              fontSize: 24,
              fontWeight: 300,
              fontFamily: "var(--font-mono)",
              color: (typeof verdict.estimatedROI === "string" && verdict.estimatedROI.startsWith("-"))
                ? "var(--negative, #F75B5B)" : "var(--positive, #3ECF8E)",
              lineHeight: 1,
            }}>
              {String(verdict.estimatedROI)}
            </div>
            <div style={{
              fontSize: 10,
              fontFamily: "var(--font-mono)",
              color: "var(--text-tertiary)",
              letterSpacing: 2,
              marginTop: 4,
            }}>
              EST. ROI
            </div>
          </div>
        )}
      </div>

      {/* 4. PROGRESS BAR */}
      <div style={{
        display: "flex",
        height: 4,
        borderRadius: 2,
        overflow: "hidden",
        background: "var(--border-primary)",
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(verdict.proceedCount / Math.max(verdict.proceedCount + verdict.stopCount, 1)) * 100}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            background: "var(--positive, #3ECF8E)",
            borderRadius: "2px 0 0 2px",
          }}
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(verdict.stopCount / Math.max(verdict.proceedCount + verdict.stopCount, 1)) * 100}%` }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          style={{
            background: "var(--negative, #F75B5B)",
            borderRadius: "0 2px 2px 0",
          }}
        />
      </div>

      {/* 3. VOTE BADGES */}
      {verdict.votes && Array.isArray(verdict.votes) && verdict.votes.length > 0 && (
        <div style={{
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
        }}>
          {verdict.votes.map((v: any, i: number) => {
            const isP = v.vote === "PROCEED";
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px",
                  borderRadius: 50,
                  background: isP ? "rgba(62,207,142,0.06)" : "rgba(247,91,91,0.06)",
                  border: `1px solid ${isP ? "rgba(62,207,142,0.12)" : "rgba(247,91,91,0.12)"}`,
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                }}
              >
                <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>
                  {typeof v.agent === "string" ? v.agent.split(" ").pop() : "Agent"}:
                </span>
                <span style={{
                  color: isP ? "#3ECF8E" : "#F75B5B",
                  fontWeight: 600,
                }}>
                  {v.vote}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Verdict text */}
      {verdict.verdict && (
        <p style={{
          fontSize: 14,
          fontWeight: 400,
          color: "var(--text-primary)",
          lineHeight: 1.6,
          margin: 0,
        }}>
          {typeof verdict.verdict === "string" ? verdict.verdict : String(verdict.verdict ?? "")}
        </p>
      )}

      {/* Key Risk + Key Opportunity */}
      {(verdict.keyRisk || verdict.keyOpportunity) && (
        <div style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
        }}>
          {verdict.keyRisk && (
            <div style={{
              flex: 1,
              minWidth: 180,
              padding: "12px 16px",
              borderRadius: 12,
              background: "var(--bg-card)",
              border: "1px solid var(--border-primary)",
            }}>
              <div style={{
                fontSize: 10,
                fontFamily: "var(--font-mono)",
                color: "var(--negative, #F75B5B)",
                letterSpacing: 2,
                marginBottom: 6,
              }}>
                KEY RISK
              </div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                {typeof verdict.keyRisk === "string" ? verdict.keyRisk : String(verdict.keyRisk ?? "")}
              </div>
            </div>
          )}
          {verdict.keyOpportunity && (
            <div style={{
              flex: 1,
              minWidth: 180,
              padding: "12px 16px",
              borderRadius: 12,
              background: "var(--bg-card)",
              border: "1px solid var(--border-primary)",
            }}>
              <div style={{
                fontSize: 10,
                fontFamily: "var(--font-mono)",
                color: "var(--positive, #3ECF8E)",
                letterSpacing: 2,
                marginBottom: 6,
              }}>
                KEY OPPORTUNITY
              </div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                {typeof verdict.keyOpportunity === "string" ? verdict.keyOpportunity : String(verdict.keyOpportunity ?? "")}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Emergent Patterns */}
      {verdict.patterns && verdict.patterns.length > 0 && (
        <div>
          <div style={{
            fontSize: 10,
            fontFamily: "var(--font-mono)",
            color: "var(--text-tertiary)",
            textTransform: "uppercase" as const,
            letterSpacing: 2,
            marginBottom: 10,
          }}>
            EMERGENT PATTERNS
          </div>
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}>
            {verdict.patterns.map((p, i) => {
              const pColor = PATTERN_COLORS[p.type] || "#6B7280";
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-primary)",
                  }}
                >
                  <div style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    marginTop: 5,
                    background: pColor,
                    flexShrink: 0,
                  }} />
                  <div>
                    <div style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--text-primary)",
                      marginBottom: 2,
                    }}>
                      {typeof p.title === "string" ? p.title : String(p.title ?? "")}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      {typeof p.description === "string" ? p.description : String(p.description ?? "")}
                    </div>
                    {p.agents_involved && Array.isArray(p.agents_involved) && p.agents_involved.length > 0 && (
                      <div style={{ marginTop: 6, display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {p.agents_involved.map((a, ai) => (
                          <span key={ai} style={{
                            fontSize: 10,
                            padding: "2px 6px",
                            borderRadius: 4,
                            background: "rgba(255,255,255,0.03)",
                            color: "var(--text-tertiary)",
                            border: "1px solid var(--border-primary)",
                          }}>{typeof a === "string" ? a : String(a)}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. DISSENT NOTES */}
      {verdict.dissents && verdict.dissents.length > 0 && (
        <div style={{
          padding: "16px 18px",
          borderRadius: 12,
          background: "var(--bg-card)",
          border: "1px solid var(--border-primary)",
        }}>
          <div style={{
            fontSize: 10,
            fontFamily: "var(--font-mono)",
            color: "var(--text-tertiary)",
            textTransform: "uppercase" as const,
            letterSpacing: 2,
            marginBottom: 12,
          }}>
            DISSENT NOTES
          </div>
          {verdict.dissents.map((d, i) => (
            <div
              key={i}
              style={{
                padding: "10px 0",
                borderTop: i > 0 ? "1px solid var(--border-secondary)" : "none",
              }}
            >
              <div style={{
                fontSize: 13,
                fontWeight: 500,
                color: getAgentColor(typeof d.agent === "string" ? d.agent : ""),
                marginBottom: 4,
              }}>
                {typeof d.agent === "string" ? d.agent : "Agent"}
              </div>
              <div style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                lineHeight: 1.6,
              }}>
                {typeof d.note === "string" ? d.note : String(d.note ?? "")}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
