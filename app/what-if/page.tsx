"use client";
import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, FlaskConical, ChevronRight, ArrowRight, AlertTriangle,
  TrendingUp, TrendingDown, Minus, RotateCcw, Zap, Loader2, Lock,
  BookOpen, ArrowUpRight, ArrowDownRight, Equal, Gauge, Shield, Target,
} from "lucide-react";
import { useIsMobile } from "../lib/useIsMobile";
import { useAuth } from "../lib/auth";
import { useUserTier } from "../lib/useUserTier";
import { signuxFetch } from "../lib/api-client";
import { SIGNUX_GOLD, ENGINES, type EngineId } from "../lib/engines";

/* ═══ Types ═══ */
type Baseline = {
  id?: string;
  scenario: string;
  engine?: string;
  probability?: number;
  recommendation?: string;
  mainRisk?: string;
  leveragePoint?: string;
  summary?: string;
};

type WhatIfResult = {
  probability: number;
  recommendation: string;
  mainRisk: string;
  leveragePoint: string;
  summary: string;
  delta: {
    probabilityDelta: number;
    recommendationChanged: boolean;
    riskChanged: boolean;
    leverageChanged: boolean;
    explanation: string;
  };
  nextAction: string;
};

export default function WhatIfPage() {
  const isMobile = useIsMobile();
  const { authUser } = useAuth();
  const { tier } = useUserTier(!!authUser);

  /* ═══ State ═══ */
  const [baseline, setBaseline] = useState<Baseline | null>(null);
  const [manualScenario, setManualScenario] = useState("");
  const [variable, setVariable] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<WhatIfResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedSims, setSavedSims] = useState<any[]>([]);
  const [loadingSims, setLoadingSims] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const canUse = tier === "pro" || tier === "max" || tier === "founding";
  const hasInput = !!baseline && variable.trim().length > 5;

  /* ═══ Load saved simulations for picker ═══ */
  useEffect(() => {
    if (!authUser || !canUse) return;
    setLoadingSims(true);
    signuxFetch("/api/simulations/list")
      .then(r => r.ok ? r.json() : [])
      .then(setSavedSims)
      .catch(() => {})
      .finally(() => setLoadingSims(false));
  }, [authUser, canUse]);

  /* ═══ Check URL params for preloaded baseline ═══ */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const scenario = params.get("scenario");
    const prob = params.get("probability");
    const rec = params.get("recommendation");
    const risk = params.get("risk");
    const engine = params.get("engine");
    if (scenario) {
      setBaseline({
        scenario,
        engine: engine || undefined,
        probability: prob ? parseInt(prob) : undefined,
        recommendation: rec || undefined,
        mainRisk: risk || undefined,
      });
    }
  }, []);

  /* ═══ Select from saved ═══ */
  function selectSaved(sim: any) {
    setBaseline({
      id: sim.id,
      scenario: sim.scenario || "",
      engine: sim.engine || "simulate",
      probability: sim.verdict?.viabilityScore,
      recommendation: sim.verdict?.result,
      mainRisk: sim.verdict?.reasoning?.slice(0, 200),
      summary: sim.verdict?.reasoning?.slice(0, 150),
    });
    setShowPicker(false);
    setResult(null);
  }

  /* ═══ Create manual baseline ═══ */
  function createManualBaseline() {
    if (!manualScenario.trim()) return;
    setBaseline({
      scenario: manualScenario.trim(),
    });
    setManualScenario("");
    setResult(null);
  }

  /* ═══ Run what-if ═══ */
  async function handleRun() {
    if (!hasInput || running || !baseline) return;
    setRunning(true);
    setError(null);
    setResult(null);

    try {
      const prompt = `You are a strategic decision analyst. A user has an existing scenario and wants to see how ONE variable change affects the outcome.

ORIGINAL SCENARIO:
${baseline.scenario}

${baseline.probability !== undefined ? `ORIGINAL PROBABILITY: ${baseline.probability}%` : ""}
${baseline.recommendation ? `ORIGINAL RECOMMENDATION: ${baseline.recommendation}` : ""}
${baseline.mainRisk ? `ORIGINAL MAIN RISK: ${baseline.mainRisk}` : ""}

THE VARIABLE THAT CHANGES:
${variable.trim()}

Analyze how this single change affects the decision. Return ONLY valid JSON:
{
  "probability": <new probability 0-100>,
  "recommendation": "GO" or "CAUTION" or "STOP",
  "mainRisk": "the new main risk after the change",
  "leveragePoint": "the new key leverage point",
  "summary": "2-3 sentence summary of the updated scenario",
  "delta": {
    "probabilityDelta": <change in probability, positive or negative>,
    "recommendationChanged": true/false,
    "riskChanged": true/false,
    "leverageChanged": true/false,
    "explanation": "2-3 sentences explaining what changed and why"
  },
  "nextAction": "recommended next step based on the updated analysis"
}`;

      const res = await signuxFetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          mode: "simulate" as any,
        }),
      });

      if (!res.ok) throw new Error("Analysis failed");

      const text = await res.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Could not parse result");

      const parsed = JSON.parse(jsonMatch[0]) as WhatIfResult;
      setResult(parsed);

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
    setBaseline(null);
    setVariable("");
    setResult(null);
    setError(null);
    setManualScenario("");
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

  /* ═══ Helpers ═══ */
  function recColor(rec?: string): string {
    if (!rec) return "var(--text-tertiary)";
    const r = rec.toUpperCase();
    if (r === "GO") return "var(--success, #3ECF8E)";
    if (r === "CAUTION") return "var(--warning, #F59E0B)";
    if (r === "STOP") return "var(--error, #EF4444)";
    return "var(--text-tertiary)";
  }

  function recLabel(rec?: string): string {
    if (!rec) return "—";
    const r = rec.toUpperCase();
    if (r === "GO") return "Go";
    if (r === "CAUTION") return "Caution";
    if (r === "STOP") return "Stop";
    return rec;
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-primary, #FFFFFF)",
      color: "var(--text-primary, #111111)",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 860,
        margin: "0 auto",
        padding: isMobile ? "24px 16px 64px" : "40px 32px 80px",
      }}>

        {/* ═══ Back link ═══ */}
        <a
          href="/chat"
          style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            color: "var(--text-tertiary, #9CA3AF)", fontSize: 12,
            textDecoration: "none", marginBottom: 20, transition: "color 180ms ease-out",
          }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--text-secondary, #5B5B5B)"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--text-tertiary, #9CA3AF)"}
        >
          <ArrowLeft size={13} strokeWidth={1.5} /> Back to Signux
        </a>

        {/* ═══ Header ═══ */}
        <div style={{
          display: "flex",
          alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "space-between",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 12 : 0,
          marginBottom: 32,
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: `${SIGNUX_GOLD}10`, border: `1px solid ${SIGNUX_GOLD}25`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <FlaskConical size={16} strokeWidth={1.5} style={{ color: SIGNUX_GOLD }} />
              </div>
              <h1 style={{
                fontSize: isMobile ? 20 : 22, fontWeight: 500,
                color: "var(--text-primary)", margin: 0, letterSpacing: 0.2,
              }}>What-if</h1>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-secondary, #5B5B5B)", margin: 0, lineHeight: 1.5 }}>
              Change one variable and see how the decision shifts.
            </p>
          </div>

          {(baseline || result) && (
            <button
              onClick={handleReset}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 16px", borderRadius: 8,
                background: "var(--bg-secondary, #FAFAF7)",
                border: "1px solid var(--border-primary, #E8E8E3)",
                color: "var(--text-secondary, #5B5B5B)",
                fontSize: 12.5, fontWeight: 500, cursor: "pointer",
                transition: "all 180ms ease-out",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-hover, #D4D4CF)"; e.currentTarget.style.color = "var(--text-primary)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-primary, #E8E8E3)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
            >
              <RotateCcw size={13} strokeWidth={1.5} /> Start over
            </button>
          )}
        </div>

        {/* ═══ Auth gate ═══ */}
        {!authUser && (
          <div style={{
            ...card,
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", padding: "80px 24px",
            border: "1px dashed var(--border-primary, #E8E8E3)", textAlign: "center",
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: "var(--bg-secondary, #FAFAF7)",
              border: "1px solid var(--border-primary, #E8E8E3)",
              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20,
            }}>
              <Lock size={24} strokeWidth={1.5} style={{ color: "var(--text-tertiary)" }} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 500, color: "var(--text-primary)", margin: "0 0 8px" }}>
              Sign in to use What-if
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", maxWidth: 340, lineHeight: 1.5, margin: "0 0 24px" }}>
              Refine your decisions by changing one variable and seeing how the outcome shifts.
            </p>
            <button
              onClick={() => { window.location.href = "/login"; }}
              style={{
                padding: "10px 24px", borderRadius: 8,
                background: SIGNUX_GOLD, border: "none",
                color: "#FFFFFF", fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}
            >Sign in</button>
          </div>
        )}

        {/* ═══ Plan gate ═══ */}
        {authUser && !canUse && (
          <div style={{
            ...card,
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", padding: "60px 24px",
            border: "1px dashed var(--border-primary, #E8E8E3)", textAlign: "center",
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: `${SIGNUX_GOLD}10`, border: `1px solid ${SIGNUX_GOLD}25`,
              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20,
            }}>
              <FlaskConical size={24} strokeWidth={1.5} style={{ color: SIGNUX_GOLD }} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 500, color: "var(--text-primary)", margin: "0 0 8px" }}>
              What-if is a Pro feature
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", maxWidth: 380, lineHeight: 1.5, margin: "0 0 24px" }}>
              Upgrade to Pro or Max to iterate on decisions and see how changes affect the outcome.
            </p>
            <button
              onClick={() => { window.location.href = "/billing"; }}
              style={{
                padding: "10px 24px", borderRadius: 8,
                background: SIGNUX_GOLD, border: "none",
                color: "#FFFFFF", fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}
            >Upgrade plan</button>
          </div>
        )}

        {/* ═══ Main workflow ═══ */}
        {authUser && canUse && (
          <>
            {/* ═══ ZONE A: Baseline selection ═══ */}
            {!baseline && (
              <div style={{ marginBottom: 32 }}>
                <h2 style={sectionTitle}>Choose a baseline</h2>

                {/* From saved decisions */}
                <div style={{ ...card, marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <BookOpen size={14} strokeWidth={1.5} style={{ color: "var(--text-tertiary)" }} />
                      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
                        From a saved decision
                      </span>
                    </div>
                    {savedSims.length > 0 && (
                      <button
                        onClick={() => setShowPicker(!showPicker)}
                        style={{
                          fontSize: 12, color: SIGNUX_GOLD, background: "none",
                          border: "none", cursor: "pointer", fontWeight: 500,
                        }}
                      >{showPicker ? "Hide" : `Browse (${savedSims.length})`}</button>
                    )}
                  </div>

                  {loadingSims && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 0" }}>
                      <Loader2 size={14} style={{ color: "var(--text-tertiary)", animation: "spin 1s linear infinite" }} />
                      <span style={{ fontSize: 12.5, color: "var(--text-tertiary)" }}>Loading saved decisions...</span>
                    </div>
                  )}

                  {!loadingSims && savedSims.length === 0 && (
                    <p style={{ fontSize: 12.5, color: "var(--text-tertiary)", margin: 0, lineHeight: 1.5 }}>
                      No saved decisions yet. Run a simulation first, or create a manual baseline below.
                    </p>
                  )}

                  {showPicker && savedSims.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 240, overflowY: "auto" }}>
                      {savedSims.slice(0, 10).map((sim: any) => (
                        <button
                          key={sim.id}
                          onClick={() => selectSaved(sim)}
                          style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "10px 14px", borderRadius: 8,
                            border: "1px solid var(--border-primary, #E8E8E3)",
                            background: "var(--bg-primary, #FFFFFF)",
                            cursor: "pointer", textAlign: "left", width: "100%",
                            transition: "border-color 180ms ease-out",
                          }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = SIGNUX_GOLD}
                          onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border-primary, #E8E8E3)"}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{
                              fontSize: 13, fontWeight: 500, color: "var(--text-primary)",
                              display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            }}>{sim.scenario || "Untitled"}</span>
                            <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                              {sim.verdict?.result || "—"} · {sim.verdict?.viabilityScore ? `${sim.verdict.viabilityScore}%` : "—"}
                            </span>
                          </div>
                          <ChevronRight size={14} style={{ color: "var(--text-tertiary)", flexShrink: 0 }} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Manual baseline */}
                <div style={card}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <Zap size={14} strokeWidth={1.5} style={{ color: "var(--text-tertiary)" }} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
                      Or describe a baseline scenario
                    </span>
                  </div>
                  <textarea
                    value={manualScenario}
                    onChange={e => setManualScenario(e.target.value)}
                    placeholder="Describe the original decision or scenario you want to iterate on..."
                    style={{
                      width: "100%", minHeight: 100, padding: "14px 16px", borderRadius: 10,
                      border: "1px solid var(--border-primary, #E8E8E3)",
                      background: "var(--bg-primary, #FFFFFF)", color: "var(--text-primary)",
                      fontSize: 14, lineHeight: 1.6, resize: "vertical", outline: "none",
                      fontFamily: "inherit", transition: "border-color 180ms ease-out", boxSizing: "border-box",
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = SIGNUX_GOLD}
                    onBlur={e => e.currentTarget.style.borderColor = "var(--border-primary, #E8E8E3)"}
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                    <button
                      onClick={createManualBaseline}
                      disabled={!manualScenario.trim()}
                      style={{
                        padding: "8px 20px", borderRadius: 8,
                        background: manualScenario.trim() ? SIGNUX_GOLD : "var(--bg-secondary)",
                        border: manualScenario.trim() ? "none" : "1px solid var(--border-primary)",
                        color: manualScenario.trim() ? "#FFFFFF" : "var(--text-tertiary)",
                        fontSize: 13, fontWeight: 600, cursor: manualScenario.trim() ? "pointer" : "default",
                      }}
                    >Set as baseline</button>
                  </div>
                </div>

                {/* Empty state hint */}
                <div style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  padding: "48px 24px", textAlign: "center",
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: "var(--bg-secondary, #FAFAF7)",
                    border: "1px solid var(--border-primary, #E8E8E3)",
                    display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
                  }}>
                    <FlaskConical size={20} strokeWidth={1.5} style={{ color: "var(--text-tertiary)" }} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>
                    Refine an existing decision
                  </span>
                  <span style={{ fontSize: 12.5, color: "var(--text-tertiary)", maxWidth: 340, lineHeight: 1.5 }}>
                    Change one variable and see how the decision changes before committing.
                  </span>
                </div>
              </div>
            )}

            {/* ═══ ZONE A (selected): Baseline reference ═══ */}
            {baseline && !result && (
              <div style={{ marginBottom: 24 }}>
                <h2 style={sectionTitle}>Baseline scenario</h2>
                <div style={{ ...card, marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: 14, fontWeight: 500, color: "var(--text-primary)",
                        margin: "0 0 8px", lineHeight: 1.5,
                      }}>{baseline.scenario}</p>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {baseline.engine && (
                          <span style={{
                            fontSize: 10, fontWeight: 600, letterSpacing: 0.5,
                            padding: "2px 8px", borderRadius: 4,
                            background: `${(ENGINES as any)[baseline.engine]?.color || SIGNUX_GOLD}12`,
                            color: (ENGINES as any)[baseline.engine]?.color || SIGNUX_GOLD,
                            textTransform: "uppercase",
                          }}>{(ENGINES as any)[baseline.engine]?.name || baseline.engine}</span>
                        )}
                        {baseline.probability !== undefined && (
                          <span style={{
                            fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
                            background: "var(--bg-primary)", border: "1px solid var(--border-primary)",
                            color: "var(--text-secondary)",
                          }}>{baseline.probability}% probability</span>
                        )}
                        {baseline.recommendation && (
                          <span style={{
                            fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
                            background: `${recColor(baseline.recommendation)}15`,
                            color: recColor(baseline.recommendation),
                          }}>{recLabel(baseline.recommendation)}</span>
                        )}
                      </div>

                      {baseline.mainRisk && (
                        <p style={{ fontSize: 12, color: "var(--text-tertiary)", margin: "10px 0 0", lineHeight: 1.5 }}>
                          {baseline.mainRisk}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => { setBaseline(null); setResult(null); }}
                      style={{
                        fontSize: 11, color: "var(--text-tertiary)", background: "none",
                        border: "none", cursor: "pointer", flexShrink: 0, textDecoration: "underline",
                      }}
                    >Change</button>
                  </div>
                </div>

                {/* ═══ ZONE B: Variable change ═══ */}
                <h2 style={sectionTitle}>What changes?</h2>
                <div style={{ ...card, marginBottom: 24 }}>
                  <p style={{
                    fontSize: 12, color: "var(--text-tertiary)", margin: "0 0 12px", lineHeight: 1.5,
                  }}>
                    Describe the single variable or assumption you want to change.
                  </p>
                  <textarea
                    value={variable}
                    onChange={e => setVariable(e.target.value)}
                    placeholder="e.g. Budget increases by 20%, timeline extends to 6 months, competitor enters market sooner..."
                    style={{
                      width: "100%", minHeight: 90, padding: "14px 16px", borderRadius: 10,
                      border: "1px solid var(--border-primary, #E8E8E3)",
                      background: "var(--bg-primary, #FFFFFF)", color: "var(--text-primary)",
                      fontSize: 14, lineHeight: 1.6, resize: "vertical", outline: "none",
                      fontFamily: "inherit", transition: "border-color 180ms ease-out", boxSizing: "border-box",
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = SIGNUX_GOLD}
                    onBlur={e => e.currentTarget.style.borderColor = "var(--border-primary, #E8E8E3)"}
                  />
                </div>

                {/* ═══ Run CTA ═══ */}
                <div style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginBottom: 32,
                }}>
                  <button
                    onClick={handleRun}
                    disabled={!hasInput || running}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "12px 32px", borderRadius: 10,
                      background: hasInput ? SIGNUX_GOLD : "var(--bg-secondary)",
                      border: hasInput ? "none" : "1px solid var(--border-primary)",
                      color: hasInput ? "#FFFFFF" : "var(--text-tertiary)",
                      fontSize: 14, fontWeight: 600,
                      cursor: hasInput && !running ? "pointer" : "default",
                      transition: "all 200ms ease-out", opacity: running ? 0.7 : 1,
                    }}
                  >
                    {running ? (
                      <><Loader2 size={16} strokeWidth={2} style={{ animation: "spin 1s linear infinite" }} /> Recalculating...</>
                    ) : (
                      <><FlaskConical size={16} strokeWidth={1.5} /> Run What-if</>
                    )}
                  </button>
                  {running && (
                    <span style={{ fontSize: 11.5, color: "var(--text-secondary)" }}>
                      Signux is analyzing how the change affects the decision...
                    </span>
                  )}
                </div>

                {error && (
                  <div style={{ ...card, borderColor: "#EF444430", textAlign: "center", padding: 20, marginBottom: 20 }}>
                    <p style={{ fontSize: 13, color: "#EF4444", margin: 0 }}>{error}</p>
                  </div>
                )}
              </div>
            )}

            {/* ═══ RESULTS: Before vs After ═══ */}
            {baseline && result && (
              <div ref={resultRef}>
                {/* Variable change summary */}
                <div style={{
                  ...card, padding: 14, marginBottom: 20,
                  display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
                }}>
                  <span style={{
                    fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase",
                    color: "var(--text-tertiary)", flexShrink: 0,
                  }}>Variable changed</span>
                  <span style={{
                    fontSize: 13, color: "var(--text-primary)", fontWeight: 500,
                    flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{variable}</span>
                </div>

                {/* ═══ ZONE C: Before vs After cards ═══ */}
                <h2 style={sectionTitle}>Before vs After</h2>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: 16, marginBottom: 20,
                }}>
                  {/* Before */}
                  <div style={card}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
                        color: "var(--text-tertiary)",
                      }}>Before</span>
                    </div>

                    <p style={{
                      fontSize: 13, color: "var(--text-primary)", margin: "0 0 14px",
                      lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>{baseline.scenario}</p>

                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {baseline.probability !== undefined && (
                        <MetricRow
                          label="Probability"
                          value={`${baseline.probability}%`}
                          icon={<Gauge size={12} strokeWidth={1.5} />}
                        />
                      )}
                      {baseline.recommendation && (
                        <MetricRow
                          label="Recommendation"
                          value={recLabel(baseline.recommendation)}
                          color={recColor(baseline.recommendation)}
                          icon={<Target size={12} strokeWidth={1.5} />}
                        />
                      )}
                      {baseline.mainRisk && (
                        <MetricRow
                          label="Main risk"
                          value={baseline.mainRisk.length > 80 ? baseline.mainRisk.slice(0, 80) + "..." : baseline.mainRisk}
                          icon={<Shield size={12} strokeWidth={1.5} />}
                        />
                      )}
                    </div>
                  </div>

                  {/* After */}
                  <div style={{
                    ...card,
                    borderColor: `${SIGNUX_GOLD}35`,
                    background: `${SIGNUX_GOLD}04`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
                        color: SIGNUX_GOLD,
                      }}>After</span>
                      {result.delta.probabilityDelta !== 0 && (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 3,
                          fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 4,
                          background: result.delta.probabilityDelta > 0 ? "#3ECF8E15" : "#EF444415",
                          color: result.delta.probabilityDelta > 0 ? "#3ECF8E" : "#EF4444",
                        }}>
                          {result.delta.probabilityDelta > 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                          {result.delta.probabilityDelta > 0 ? "+" : ""}{result.delta.probabilityDelta}%
                        </span>
                      )}
                    </div>

                    <p style={{
                      fontSize: 13, color: "var(--text-primary)", margin: "0 0 14px", lineHeight: 1.5,
                    }}>{result.summary}</p>

                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <MetricRow
                        label="Probability"
                        value={`${result.probability}%`}
                        icon={<Gauge size={12} strokeWidth={1.5} />}
                      />
                      <MetricRow
                        label="Recommendation"
                        value={recLabel(result.recommendation)}
                        color={recColor(result.recommendation)}
                        icon={<Target size={12} strokeWidth={1.5} />}
                      />
                      <MetricRow
                        label="Main risk"
                        value={result.mainRisk.length > 80 ? result.mainRisk.slice(0, 80) + "..." : result.mainRisk}
                        icon={<Shield size={12} strokeWidth={1.5} />}
                      />
                      {result.leveragePoint && (
                        <MetricRow
                          label="Leverage point"
                          value={result.leveragePoint.length > 80 ? result.leveragePoint.slice(0, 80) + "..." : result.leveragePoint}
                          icon={<TrendingUp size={12} strokeWidth={1.5} />}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* ═══ Delta / What changed block ═══ */}
                <div style={{
                  ...card,
                  borderColor: `${SIGNUX_GOLD}30`,
                  marginBottom: 20,
                  padding: isMobile ? 20 : 24,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: 6,
                      background: `${SIGNUX_GOLD}12`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {result.delta.probabilityDelta > 0 ? (
                        <ArrowUpRight size={13} style={{ color: "#3ECF8E" }} />
                      ) : result.delta.probabilityDelta < 0 ? (
                        <ArrowDownRight size={13} style={{ color: "#EF4444" }} />
                      ) : (
                        <Equal size={13} style={{ color: "var(--text-tertiary)" }} />
                      )}
                    </div>
                    <h2 style={{ ...sectionTitle, marginBottom: 0 }}>What changed</h2>
                  </div>

                  <p style={{
                    fontSize: 13.5, color: "var(--text-primary)", lineHeight: 1.6, margin: "0 0 14px",
                  }}>{result.delta.explanation}</p>

                  {/* Change indicators */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    <DeltaChip
                      label="Recommendation"
                      changed={result.delta.recommendationChanged}
                    />
                    <DeltaChip
                      label="Risk profile"
                      changed={result.delta.riskChanged}
                    />
                    <DeltaChip
                      label="Leverage point"
                      changed={result.delta.leverageChanged}
                    />
                  </div>
                </div>

                {/* ═══ Best next action ═══ */}
                <div style={{ ...card, borderColor: `${SIGNUX_GOLD}30`, marginBottom: 28 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <ArrowRight size={14} strokeWidth={1.5} style={{ color: SIGNUX_GOLD }} />
                    <h2 style={{ ...sectionTitle, marginBottom: 0, color: SIGNUX_GOLD }}>Best next action</h2>
                  </div>
                  <p style={{ fontSize: 13.5, color: "var(--text-primary)", lineHeight: 1.6, margin: 0 }}>
                    {result.nextAction}
                  </p>
                </div>

                {/* ═══ ZONE D: Follow-up actions ═══ */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 10, flexWrap: "wrap", paddingTop: 8,
                  borderTop: "1px solid var(--border-secondary, #F0F0EB)", paddingBottom: 12,
                }}>
                  <ActionBtn
                    label="Run another What-if"
                    icon={<FlaskConical size={13} strokeWidth={1.5} />}
                    onClick={() => { setVariable(""); setResult(null); setError(null); }}
                  />
                  <ActionBtn
                    label="Start over"
                    icon={<RotateCcw size={13} strokeWidth={1.5} />}
                    onClick={handleReset}
                  />
                  <ActionBtn
                    label="Open in Simulate"
                    icon={<Zap size={13} strokeWidth={1.5} />}
                    onClick={() => {
                      window.location.href = `/chat?mode=simulate&q=${encodeURIComponent(baseline.scenario + " — with change: " + variable)}`;
                    }}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* Spin animation */}
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

/* ═══ Metric row ═══ */
function MetricRow({ label, value, color, icon }: {
  label: string;
  value: string;
  color?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
      <div style={{ color: "var(--text-tertiary)", marginTop: 2, flexShrink: 0 }}>{icon}</div>
      <div>
        <span style={{
          fontSize: 10, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase",
          color: "var(--text-tertiary)", display: "block", marginBottom: 2,
        }}>{label}</span>
        <span style={{
          fontSize: 12.5, fontWeight: 500, color: color || "var(--text-primary)",
          lineHeight: 1.4,
        }}>{value}</span>
      </div>
    </div>
  );
}

/* ═══ Delta chip ═══ */
function DeltaChip({ label, changed }: { label: string; changed: boolean }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 6,
      background: changed ? "#F59E0B10" : "var(--bg-primary, #FFFFFF)",
      border: `1px solid ${changed ? "#F59E0B30" : "var(--border-primary, #E8E8E3)"}`,
      color: changed ? "#F59E0B" : "var(--text-tertiary, #9CA3AF)",
    }}>
      {changed ? <AlertTriangle size={10} /> : <Minus size={10} />}
      {label}: {changed ? "Changed" : "Stable"}
    </span>
  );
}

/* ═══ Action button ═══ */
function ActionBtn({ label, icon, onClick }: {
  label: string; icon: React.ReactNode; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "8px 16px", borderRadius: 8,
        background: "var(--bg-secondary, #FAFAF7)",
        border: "1px solid var(--border-primary, #E8E8E3)",
        color: "var(--text-secondary, #5B5B5B)",
        fontSize: 12.5, fontWeight: 500, cursor: "pointer",
        transition: "all 180ms ease-out",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-hover, #D4D4CF)"; e.currentTarget.style.color = "var(--text-primary, #111111)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-primary, #E8E8E3)"; e.currentTarget.style.color = "var(--text-secondary, #5B5B5B)"; }}
    >
      {icon}
      {label}
    </button>
  );
}
