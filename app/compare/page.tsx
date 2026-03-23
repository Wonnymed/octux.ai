"use client";
import { useState, useRef } from "react";
import {
  ArrowLeft, GitCompareArrows, ChevronRight, Trophy, AlertTriangle,
  Shield, Zap, TrendingUp, RotateCcw, Save, FileText, Loader2, Lock,
  ArrowRight, Scale, Target, Clock, DollarSign, Puzzle, Gauge,
} from "lucide-react";
import { useIsMobile } from "../lib/useIsMobile";
import { useAuth } from "../lib/auth";
import { useUserTier } from "../lib/useUserTier";
import { signuxFetch } from "../lib/api-client";
import { SIGNUX_GOLD, ENGINES, type EngineId } from "../lib/engines";

/* ═══ Comparison dimensions ═══ */
const DIMENSIONS = [
  { key: "upside", label: "Upside potential", icon: TrendingUp },
  { key: "downside", label: "Downside risk", icon: AlertTriangle },
  { key: "speed", label: "Speed to result", icon: Clock },
  { key: "cost", label: "Capital intensity", icon: DollarSign },
  { key: "complexity", label: "Execution complexity", icon: Puzzle },
  { key: "strategic_fit", label: "Strategic fit", icon: Target },
] as const;

type ComparisonResult = {
  winner: "A" | "B" | "tie";
  winnerLabel: string;
  reasons: string[];
  tradeoff: string;
  riskA: string;
  riskB: string;
  nextAction: string;
  dimensions: Record<string, { a: number; b: number; note: string }>;
};

export default function ComparePage() {
  const isMobile = useIsMobile();
  const { authUser } = useAuth();
  const { tier } = useUserTier(!!authUser);

  const [scenarioA, setScenarioA] = useState("");
  const [scenarioB, setScenarioB] = useState("");
  const [question, setQuestion] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const canCompare = tier === "pro" || tier === "max" || tier === "founding";
  const hasInput = scenarioA.trim().length > 10 && scenarioB.trim().length > 10;

  /* ═══ Cmd+Enter to run ═══ */
  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleCompare();
    }
  }

  /* ═══ Run comparison ═══ */
  async function handleCompare() {
    if (!hasInput || running) return;
    setRunning(true);
    setError(null);
    setResult(null);

    try {
      const prompt = `You are a strategic decision analyst. Compare these two options and return a structured JSON comparison.

SCENARIO A:
${scenarioA.trim()}

SCENARIO B:
${scenarioB.trim()}

${question.trim() ? `COMPARISON QUESTION: ${question.trim()}` : ""}

Return ONLY valid JSON with this exact structure:
{
  "winner": "A" or "B" or "tie",
  "winnerLabel": "brief label for the winning scenario",
  "reasons": ["reason 1", "reason 2", "reason 3"],
  "tradeoff": "what the winning option gains vs what it sacrifices",
  "riskA": "biggest risk of scenario A",
  "riskB": "biggest risk of scenario B",
  "nextAction": "recommended next action based on comparison",
  "dimensions": {
    "upside": { "a": 1-10, "b": 1-10, "note": "brief comparison" },
    "downside": { "a": 1-10, "b": 1-10, "note": "brief comparison (lower is better)" },
    "speed": { "a": 1-10, "b": 1-10, "note": "brief comparison" },
    "cost": { "a": 1-10, "b": 1-10, "note": "brief comparison (lower cost = higher score)" },
    "complexity": { "a": 1-10, "b": 1-10, "note": "brief comparison (lower complexity = higher score)" },
    "strategic_fit": { "a": 1-10, "b": 1-10, "note": "brief comparison" }
  }
}`;

      const res = await signuxFetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          mode: "simulate" as any,
        }),
      });

      if (!res.ok) throw new Error("Comparison failed");

      const text = await res.text();
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Could not parse comparison result");

      const parsed = JSON.parse(jsonMatch[0]) as ComparisonResult;
      setResult(parsed);

      // Scroll to result
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setRunning(false);
    }
  }

  /* ═══ Reset ═══ */
  function handleReset() {
    setScenarioA("");
    setScenarioB("");
    setQuestion("");
    setResult(null);
    setError(null);
  }

  /* ═══ Styles ═══ */
  const card: React.CSSProperties = {
    borderRadius: 14,
    border: "1px solid var(--border-primary, #E8E8E3)",
    background: "var(--bg-secondary, #FAFAF7)",
    padding: isMobile ? 16 : 20,
  };

  const sectionTitle: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: "var(--text-tertiary, #9CA3AF)",
    marginBottom: 12,
    marginTop: 0,
  };

  const textarea: React.CSSProperties = {
    width: "100%",
    minHeight: 120,
    padding: "14px 16px",
    borderRadius: 10,
    border: "1px solid var(--border-primary, #E8E8E3)",
    background: "var(--bg-primary, #FFFFFF)",
    color: "var(--text-primary, #111111)",
    fontSize: 14,
    lineHeight: 1.6,
    resize: "vertical",
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 180ms ease-out",
    boxSizing: "border-box",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-primary, #FFFFFF)",
      color: "var(--text-primary, #111111)",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 900,
        margin: "0 auto",
        padding: isMobile ? "24px 16px 64px" : "40px 32px 80px",
      }}>

        {/* ═══ Back link ═══ */}
        <a
          href="/chat"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            color: "var(--text-tertiary, #9CA3AF)",
            fontSize: 12,
            textDecoration: "none",
            marginBottom: 20,
            transition: "color 180ms ease-out",
          }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--text-secondary, #5B5B5B)"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--text-tertiary, #9CA3AF)"}
        >
          <ArrowLeft size={13} strokeWidth={1.5} /> Back to Signux
        </a>

        {/* ═══ Page Header ═══ */}
        <div style={{
          display: "flex",
          alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "space-between",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 12 : 0,
          marginBottom: 32,
        }}>
          <div>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 6,
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: `${SIGNUX_GOLD}10`,
                border: `1px solid ${SIGNUX_GOLD}25`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Scale size={16} strokeWidth={1.5} style={{ color: SIGNUX_GOLD }} />
              </div>
              <h1 style={{
                fontSize: isMobile ? 20 : 22,
                fontWeight: 500,
                color: "var(--text-primary, #111111)",
                margin: 0,
                letterSpacing: 0.2,
              }}>
                Compare
              </h1>
            </div>
            <p style={{
              fontSize: 13,
              color: "var(--text-secondary, #5B5B5B)",
              margin: 0,
              lineHeight: 1.5,
            }}>
              Evaluate two options side by side before you commit.
            </p>
          </div>

          {result && (
            <button
              onClick={handleReset}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 8,
                background: "var(--bg-secondary, #FAFAF7)",
                border: "1px solid var(--border-primary, #E8E8E3)",
                color: "var(--text-secondary, #5B5B5B)",
                fontSize: 12.5,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 180ms ease-out",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "var(--border-hover, #D4D4CF)";
                e.currentTarget.style.color = "var(--text-primary, #111111)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "var(--border-primary, #E8E8E3)";
                e.currentTarget.style.color = "var(--text-secondary, #5B5B5B)";
              }}
            >
              <RotateCcw size={13} strokeWidth={1.5} /> New comparison
            </button>
          )}
        </div>

        {/* ═══ Auth gate ═══ */}
        {!authUser && (
          <div style={{
            ...card,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px 24px",
            border: "1px dashed var(--border-primary, #E8E8E3)",
            textAlign: "center",
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: "var(--bg-secondary, #FAFAF7)",
              border: "1px solid var(--border-primary, #E8E8E3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 20,
            }}>
              <Lock size={24} strokeWidth={1.5} style={{ color: "var(--text-tertiary, #9CA3AF)" }} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 500, color: "var(--text-primary)", margin: "0 0 8px" }}>
              Sign in to compare
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", maxWidth: 340, lineHeight: 1.5, margin: "0 0 24px" }}>
              Compare helps you evaluate two strategic options before committing to a path.
            </p>
            <button
              onClick={() => { window.location.href = "/login"; }}
              style={{
                padding: "10px 24px",
                borderRadius: 8,
                background: SIGNUX_GOLD,
                border: "none",
                color: "#FFFFFF",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Sign in
            </button>
          </div>
        )}

        {/* ═══ Plan gate ═══ */}
        {authUser && !canCompare && (
          <div style={{
            ...card,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 24px",
            border: "1px dashed var(--border-primary, #E8E8E3)",
            textAlign: "center",
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: `${SIGNUX_GOLD}10`,
              border: `1px solid ${SIGNUX_GOLD}25`,
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 20,
            }}>
              <Scale size={24} strokeWidth={1.5} style={{ color: SIGNUX_GOLD }} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 500, color: "var(--text-primary)", margin: "0 0 8px" }}>
              Compare is a Pro feature
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", maxWidth: 380, lineHeight: 1.5, margin: "0 0 24px" }}>
              Upgrade to Pro or Max to compare strategic options side by side and see structured tradeoff analysis.
            </p>
            <button
              onClick={() => { window.location.href = "/billing"; }}
              style={{
                padding: "10px 24px",
                borderRadius: 8,
                background: SIGNUX_GOLD,
                border: "none",
                color: "#FFFFFF",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Upgrade plan
            </button>
          </div>
        )}

        {/* ═══ Main workflow — only for eligible users ═══ */}
        {authUser && canCompare && !result && (
          <>
            {/* ═══ ZONE A: Input setup ═══ */}
            <div style={{ marginBottom: 24 }}>
              <h2 style={sectionTitle}>Scenarios</h2>

              <div style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: 16,
                marginBottom: 20,
              }}>
                {/* Scenario A */}
                <div style={card}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 12,
                  }}>
                    <span style={{
                      width: 24, height: 24, borderRadius: 6,
                      background: `${SIGNUX_GOLD}15`,
                      border: `1px solid ${SIGNUX_GOLD}30`,
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 700, color: SIGNUX_GOLD,
                    }}>A</span>
                    <span style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--text-primary, #111111)",
                    }}>Scenario A</span>
                  </div>
                  <textarea
                    value={scenarioA}
                    onChange={e => setScenarioA(e.target.value)}
                    placeholder="Describe the first option you're considering..."
                    style={textarea}
                    onKeyDown={handleKeyDown}
                    onFocus={e => e.currentTarget.style.borderColor = SIGNUX_GOLD}
                    onBlur={e => e.currentTarget.style.borderColor = "var(--border-primary, #E8E8E3)"}
                  />
                </div>

                {/* Scenario B */}
                <div style={card}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 12,
                  }}>
                    <span style={{
                      width: 24, height: 24, borderRadius: 6,
                      background: "var(--bg-primary, #FFFFFF)",
                      border: "1px solid var(--border-primary, #E8E8E3)",
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 700, color: "var(--text-secondary, #5B5B5B)",
                    }}>B</span>
                    <span style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--text-primary, #111111)",
                    }}>Scenario B</span>
                  </div>
                  <textarea
                    value={scenarioB}
                    onChange={e => setScenarioB(e.target.value)}
                    placeholder="Describe the second option you're considering..."
                    style={textarea}
                    onKeyDown={handleKeyDown}
                    onFocus={e => e.currentTarget.style.borderColor = SIGNUX_GOLD}
                    onBlur={e => e.currentTarget.style.borderColor = "var(--border-primary, #E8E8E3)"}
                  />
                </div>
              </div>

              {/* Optional question */}
              <div style={{ ...card, marginBottom: 24 }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 10,
                }}>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "var(--text-secondary, #5B5B5B)",
                  }}>
                    Comparison question
                  </span>
                  <span style={{
                    fontSize: 10,
                    color: "var(--text-tertiary, #9CA3AF)",
                    padding: "1px 6px",
                    borderRadius: 4,
                    background: "var(--bg-primary, #FFFFFF)",
                    border: "1px solid var(--border-primary, #E8E8E3)",
                  }}>optional</span>
                </div>
                <input
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  placeholder="e.g. Which gives better upside with less fragility?"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 10,
                    border: "1px solid var(--border-primary, #E8E8E3)",
                    background: "var(--bg-primary, #FFFFFF)",
                    color: "var(--text-primary, #111111)",
                    fontSize: 14,
                    outline: "none",
                    fontFamily: "inherit",
                    transition: "border-color 180ms ease-out",
                    boxSizing: "border-box",
                  }}
                  onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); handleCompare(); } }}
                  onFocus={e => e.currentTarget.style.borderColor = SIGNUX_GOLD}
                  onBlur={e => e.currentTarget.style.borderColor = "var(--border-primary, #E8E8E3)"}
                />
              </div>
            </div>

            {/* ═══ Run CTA ═══ */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              marginBottom: 40,
            }}>
              <button
                onClick={handleCompare}
                disabled={!hasInput || running}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 32px",
                  borderRadius: 10,
                  background: hasInput ? SIGNUX_GOLD : "var(--bg-secondary, #FAFAF7)",
                  border: hasInput ? "none" : "1px solid var(--border-primary, #E8E8E3)",
                  color: hasInput ? "#FFFFFF" : "var(--text-tertiary, #9CA3AF)",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: hasInput && !running ? "pointer" : "default",
                  transition: "all 200ms ease-out",
                  opacity: running ? 0.7 : 1,
                }}
              >
                {running ? (
                  <>
                    <Loader2 size={16} strokeWidth={2} style={{ animation: "spin 1s linear infinite" }} />
                    Comparing...
                  </>
                ) : (
                  <>
                    <Scale size={16} strokeWidth={1.5} />
                    Run Comparison
                  </>
                )}
              </button>
              {!hasInput && !running && (
                <span style={{ fontSize: 11.5, color: "var(--text-tertiary, #9CA3AF)" }}>
                  Describe both scenarios to compare
                </span>
              )}
              {hasInput && !running && (
                <span style={{ fontSize: 10.5, color: "var(--text-tertiary, #9CA3AF)" }}>
                  &#8984;+Enter to run
                </span>
              )}
              {running && (
                <span style={{ fontSize: 11.5, color: "var(--text-secondary, #5B5B5B)" }}>
                  Signux is analyzing both options...
                </span>
              )}
            </div>

            {/* Error */}
            {error && (
              <div style={{
                ...card,
                border: "1px solid var(--error, #EF4444)30",
                background: "var(--error, #EF4444)08",
                textAlign: "center",
                padding: 20,
              }}>
                <p style={{ fontSize: 13, color: "var(--error, #EF4444)", margin: 0 }}>
                  {error}
                </p>
              </div>
            )}

            {/* ═══ Empty state ═══ */}
            {!running && !error && (
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "48px 24px",
                textAlign: "center",
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: "var(--bg-secondary, #FAFAF7)",
                  border: "1px solid var(--border-primary, #E8E8E3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 16,
                }}>
                  <GitCompareArrows size={20} strokeWidth={1.5} style={{ color: "var(--text-tertiary, #9CA3AF)" }} />
                </div>
                <span style={{
                  fontSize: 14, fontWeight: 500,
                  color: "var(--text-secondary, #5B5B5B)",
                  marginBottom: 6,
                }}>
                  Compare two strategic options
                </span>
                <span style={{
                  fontSize: 12.5,
                  color: "var(--text-tertiary, #9CA3AF)",
                  maxWidth: 340,
                  lineHeight: 1.5,
                }}>
                  Use Signux to evaluate tradeoffs before choosing a path.
                </span>
              </div>
            )}
          </>
        )}

        {/* ═══ RESULTS ═══ */}
        {authUser && canCompare && result && (
          <div ref={resultRef}>
            {/* ═══ Input summary (collapsed) ═══ */}
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: 12,
              marginBottom: 24,
            }}>
              <div style={{ ...card, padding: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: 4,
                    background: `${SIGNUX_GOLD}15`,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, fontWeight: 700, color: SIGNUX_GOLD,
                  }}>A</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-primary)", letterSpacing: 0.3 }}>
                    Scenario A
                  </span>
                  {result.winner === "A" && (
                    <Trophy size={11} style={{ color: SIGNUX_GOLD, marginLeft: "auto" }} />
                  )}
                </div>
                <p style={{
                  fontSize: 12, color: "var(--text-secondary)", margin: 0,
                  lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical", overflow: "hidden",
                }}>{scenarioA}</p>
              </div>
              <div style={{ ...card, padding: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: 4,
                    background: "var(--bg-primary)",
                    border: "1px solid var(--border-primary)",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, fontWeight: 700, color: "var(--text-secondary)",
                  }}>B</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-primary)", letterSpacing: 0.3 }}>
                    Scenario B
                  </span>
                  {result.winner === "B" && (
                    <Trophy size={11} style={{ color: SIGNUX_GOLD, marginLeft: "auto" }} />
                  )}
                </div>
                <p style={{
                  fontSize: 12, color: "var(--text-secondary)", margin: 0,
                  lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical", overflow: "hidden",
                }}>{scenarioB}</p>
              </div>
            </div>

            {/* ═══ ZONE C: Recommendation ═══ */}
            <div style={{
              ...card,
              borderColor: `${SIGNUX_GOLD}40`,
              background: `${SIGNUX_GOLD}06`,
              marginBottom: 20,
              padding: isMobile ? 20 : 24,
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 14,
              }}>
                <Trophy size={18} strokeWidth={1.5} style={{ color: SIGNUX_GOLD }} />
                <span style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                  color: SIGNUX_GOLD,
                }}>
                  Recommendation
                </span>
              </div>
              <h3 style={{
                fontSize: isMobile ? 18 : 20,
                fontWeight: 600,
                color: "var(--text-primary, #111111)",
                margin: "0 0 12px",
                lineHeight: 1.3,
              }}>
                {result.winner === "tie"
                  ? "Both options are similarly strong"
                  : `Recommended: Scenario ${result.winner}`}
              </h3>
              {result.winnerLabel && (
                <p style={{
                  fontSize: 13,
                  color: "var(--text-secondary, #5B5B5B)",
                  margin: "0 0 16px",
                  lineHeight: 1.5,
                }}>
                  {result.winnerLabel}
                </p>
              )}

              {/* Reasons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {result.reasons.map((r, i) => (
                  <div key={i} style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                  }}>
                    <ChevronRight
                      size={14}
                      strokeWidth={2}
                      style={{ color: SIGNUX_GOLD, marginTop: 2, flexShrink: 0 }}
                    />
                    <span style={{
                      fontSize: 13,
                      color: "var(--text-primary, #111111)",
                      lineHeight: 1.5,
                    }}>
                      {r}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ═══ Dimension comparison ═══ */}
            <div style={{ marginBottom: 20 }}>
              <h2 style={sectionTitle}>Side-by-side analysis</h2>
              <div style={{
                ...card,
                padding: 0,
                overflow: "hidden",
              }}>
                {DIMENSIONS.map((dim, i) => {
                  const d = result.dimensions[dim.key];
                  if (!d) return null;
                  const Icon = dim.icon;
                  const maxVal = Math.max(d.a, d.b);
                  return (
                    <div
                      key={dim.key}
                      style={{
                        padding: isMobile ? "14px 16px" : "14px 20px",
                        borderBottom: i < DIMENSIONS.length - 1 ? "1px solid var(--border-secondary, #F0F0EB)" : "none",
                      }}
                    >
                      <div style={{
                        display: "flex",
                        alignItems: isMobile ? "flex-start" : "center",
                        flexDirection: isMobile ? "column" : "row",
                        gap: isMobile ? 10 : 16,
                      }}>
                        {/* Label */}
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          minWidth: 160,
                          flexShrink: 0,
                        }}>
                          <Icon size={14} strokeWidth={1.5} style={{ color: "var(--text-tertiary, #9CA3AF)" }} />
                          <span style={{
                            fontSize: 12.5,
                            fontWeight: 500,
                            color: "var(--text-primary, #111111)",
                          }}>
                            {dim.label}
                          </span>
                        </div>

                        {/* Bars */}
                        <div style={{ flex: 1, width: "100%", display: "flex", flexDirection: "column", gap: 4 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{
                              fontSize: 10, fontWeight: 700, color: SIGNUX_GOLD,
                              width: 14, textAlign: "center", flexShrink: 0,
                            }}>A</span>
                            <div style={{
                              flex: 1,
                              height: 6,
                              borderRadius: 3,
                              background: "var(--border-secondary, #F0F0EB)",
                              overflow: "hidden",
                            }}>
                              <div style={{
                                width: `${(d.a / 10) * 100}%`,
                                height: "100%",
                                borderRadius: 3,
                                background: d.a >= d.b ? SIGNUX_GOLD : "var(--text-tertiary, #9CA3AF)",
                                transition: "width 600ms ease-out",
                              }} />
                            </div>
                            <span style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: d.a >= d.b ? SIGNUX_GOLD : "var(--text-tertiary, #9CA3AF)",
                              width: 20,
                              textAlign: "right",
                              flexShrink: 0,
                            }}>{d.a}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{
                              fontSize: 10, fontWeight: 700, color: "var(--text-secondary, #5B5B5B)",
                              width: 14, textAlign: "center", flexShrink: 0,
                            }}>B</span>
                            <div style={{
                              flex: 1,
                              height: 6,
                              borderRadius: 3,
                              background: "var(--border-secondary, #F0F0EB)",
                              overflow: "hidden",
                            }}>
                              <div style={{
                                width: `${(d.b / 10) * 100}%`,
                                height: "100%",
                                borderRadius: 3,
                                background: d.b > d.a ? SIGNUX_GOLD : "var(--text-tertiary, #9CA3AF)",
                                transition: "width 600ms ease-out",
                              }} />
                            </div>
                            <span style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: d.b > d.a ? SIGNUX_GOLD : "var(--text-tertiary, #9CA3AF)",
                              width: 20,
                              textAlign: "right",
                              flexShrink: 0,
                            }}>{d.b}</span>
                          </div>
                        </div>
                      </div>
                      {/* Note */}
                      {d.note && (
                        <p style={{
                          fontSize: 11.5,
                          color: "var(--text-tertiary, #9CA3AF)",
                          margin: "8px 0 0",
                          paddingLeft: isMobile ? 0 : 182,
                          lineHeight: 1.4,
                        }}>
                          {d.note}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ═══ Tradeoff + Risks ═══ */}
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: 16,
              marginBottom: 20,
            }}>
              {/* Key tradeoff */}
              <div style={{ ...card, gridColumn: isMobile ? undefined : "1 / -1" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <Gauge size={14} strokeWidth={1.5} style={{ color: "var(--text-tertiary)" }} />
                  <h2 style={{ ...sectionTitle, marginBottom: 0 }}>Key tradeoff</h2>
                </div>
                <p style={{
                  fontSize: 13.5,
                  color: "var(--text-primary, #111111)",
                  lineHeight: 1.6,
                  margin: 0,
                }}>
                  {result.tradeoff}
                </p>
              </div>

              {/* Risk A */}
              <div style={card}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                  <AlertTriangle size={13} strokeWidth={1.5} style={{ color: "#EF4444" }} />
                  <h2 style={{ ...sectionTitle, marginBottom: 0 }}>Risk in A</h2>
                </div>
                <p style={{
                  fontSize: 13,
                  color: "var(--text-primary, #111111)",
                  lineHeight: 1.5,
                  margin: 0,
                }}>
                  {result.riskA}
                </p>
              </div>

              {/* Risk B */}
              <div style={card}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                  <AlertTriangle size={13} strokeWidth={1.5} style={{ color: "#F59E0B" }} />
                  <h2 style={{ ...sectionTitle, marginBottom: 0 }}>Risk in B</h2>
                </div>
                <p style={{
                  fontSize: 13,
                  color: "var(--text-primary, #111111)",
                  lineHeight: 1.5,
                  margin: 0,
                }}>
                  {result.riskB}
                </p>
              </div>
            </div>

            {/* ═══ Best next action ═══ */}
            <div style={{
              ...card,
              borderColor: `${SIGNUX_GOLD}30`,
              marginBottom: 28,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <ArrowRight size={14} strokeWidth={1.5} style={{ color: SIGNUX_GOLD }} />
                <h2 style={{ ...sectionTitle, marginBottom: 0, color: SIGNUX_GOLD }}>Best next action</h2>
              </div>
              <p style={{
                fontSize: 13.5,
                color: "var(--text-primary, #111111)",
                lineHeight: 1.6,
                margin: 0,
              }}>
                {result.nextAction}
              </p>
            </div>

            {/* ═══ ZONE D: Follow-up actions ═══ */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              flexWrap: "wrap",
              paddingTop: 8,
              borderTop: "1px solid var(--border-secondary, #F0F0EB)",
              paddingBottom: 12,
            }}>
              <ActionBtn
                label="New comparison"
                icon={<RotateCcw size={13} strokeWidth={1.5} />}
                onClick={handleReset}
              />
              <ActionBtn
                label="Open in Simulate"
                icon={<Zap size={13} strokeWidth={1.5} />}
                onClick={() => {
                  const winner = result.winner === "A" ? scenarioA : scenarioB;
                  window.location.href = `/chat?mode=simulate&q=${encodeURIComponent(winner)}`;
                }}
              />
            </div>
          </div>
        )}

        {/* ═══ Spin animation ═══ */}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}

/* ═══ Follow-up action button ═══ */
function ActionBtn({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 16px",
        borderRadius: 8,
        background: "var(--bg-secondary, #FAFAF7)",
        border: "1px solid var(--border-primary, #E8E8E3)",
        color: "var(--text-secondary, #5B5B5B)",
        fontSize: 12.5,
        fontWeight: 500,
        cursor: "pointer",
        transition: "all 180ms ease-out",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "var(--border-hover, #D4D4CF)";
        e.currentTarget.style.color = "var(--text-primary, #111111)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "var(--border-primary, #E8E8E3)";
        e.currentTarget.style.color = "var(--text-secondary, #5B5B5B)";
      }}
    >
      {icon}
      {label}
    </button>
  );
}
