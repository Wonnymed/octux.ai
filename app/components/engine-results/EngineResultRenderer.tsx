"use client";
import React, { useState } from "react";
import { ChevronDown, ChevronUp, Circle, Zap, Radio, DollarSign, FlaskConical, Target, ShieldAlert, Crosshair, Swords, Scale, Wrench, Eye, Star, Clock, Briefcase } from "lucide-react";
import type { EngineResponse } from "../../lib/types";
import StatusBadge from "./StatusBadge";
import MetricCard from "./MetricCard";
import RiskCard from "./RiskCard";
import ActionList from "./ActionList";
import InsightCard from "./InsightCard";
import ScoreGauge from "./ScoreGauge";
import MarkdownResult from "../MarkdownResult";

interface EngineResultRendererProps {
  response: EngineResponse;
  isMobile?: boolean;
}

/* ─── shared styles ─── */
const sectionLabel: React.CSSProperties = {
  fontSize: 10,
  fontFamily: "var(--font-mono)",
  letterSpacing: 1.5,
  textTransform: "uppercase",
  color: "var(--text-tertiary)",
  marginBottom: 4,
};

const sectionLabelColored = (color: string): React.CSSProperties => ({
  ...sectionLabel,
  color,
  display: "flex",
  alignItems: "center",
  gap: 6,
});

/* ─── shared header ─── */
function Header({ response }: { response: EngineResponse }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
      {response.title && (
        <h2 style={{ fontSize: 22, fontWeight: 400, color: "var(--text-primary)", margin: 0, lineHeight: 1.3 }}>
          {response.title}
        </h2>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <StatusBadge value={response.confidence} type="confidence" />
        <StatusBadge value={response.status} type="status" />
      </div>
    </div>
  );
}

/* ─── shared executive summary ─── */
function Summary({ text, subtext }: { text: string; subtext?: string }) {
  if (!text) return null;
  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border-primary)",
      borderRadius: 10, padding: "16px 20px", marginBottom: 20,
    }}>
      <span style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>{text}</span>
      {subtext && (
        <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-tertiary)", fontStyle: "italic" }}>{subtext}</div>
      )}
    </div>
  );
}

/* ─── shared recommendation ─── */
function Recommendation({ text, label }: { text: string; label?: string }) {
  if (!text) return null;
  return <InsightCard title={label || "Main Recommendation"} content={text} type="action" />;
}

/* ─── shared risks / opportunities grid ─── */
function RisksAndOpportunities({ risks, opportunities, isMobile }: { risks?: string[]; opportunities?: string[]; isMobile?: boolean }) {
  const hasRisks = risks && risks.length > 0;
  const hasOpps = opportunities && opportunities.length > 0;
  if (!hasRisks && !hasOpps) return null;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : (hasRisks && hasOpps ? "1fr 1fr" : "1fr"),
      gap: 12, marginBottom: 20,
    }}>
      {hasRisks && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={sectionLabelColored("var(--negative)")}>Key Risks</span>
          {risks!.map((r, i) => (
            <InsightCard key={i} title={`Risk ${i + 1}`} content={r} type="risk" />
          ))}
        </div>
      )}
      {hasOpps && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={sectionLabelColored("var(--positive)")}>Key Opportunities</span>
          {opportunities!.map((o, i) => (
            <InsightCard key={i} title={`Opportunity ${i + 1}`} content={o} type="opportunity" />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── shared footer ─── */
function Footer({ response }: { response: EngineResponse }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {response.next_actions?.length > 0 && (
        <ActionList actions={response.next_actions} title="Next Actions" />
      )}
      {response.notes?.length > 0 && (
        <div style={{
          padding: "12px 16px", borderRadius: 8,
          border: "1px solid var(--border-secondary)",
          fontSize: 12, color: "var(--text-tertiary)", lineHeight: 1.6,
        }}>
          {response.notes.map((n: string, i: number) => (
            <p key={i} style={{ margin: i < response.notes.length - 1 ? "0 0 6px" : 0 }}>{n}</p>
          ))}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   BUILD ENGINE LAYOUT
   ════════════════════════════════════════ */

function BuildLayout({ r, isMobile }: { r: EngineResponse; isMobile?: boolean }) {
  const [expandedPhase, setExpandedPhase] = useState<number | null>(0);
  const roadmap = r.roadmap || [];
  const bottleneck = r.main_bottleneck;

  return (
    <>
      {/* Stage badge */}
      {r.current_stage && (
        <div style={{ marginBottom: 16 }}>
          <StatusBadge value={r.current_stage} type="stage" />
        </div>
      )}

      {/* Main recommendation */}
      <div style={{ marginBottom: 20 }}>
        <Recommendation text={r.main_recommendation} />
      </div>

      {/* Bottleneck */}
      {bottleneck && (
        <div style={{ marginBottom: 24 }}>
          <InsightCard
            title={`Main Bottleneck${bottleneck.severity ? ` — ${bottleneck.severity}` : ""}`}
            content={`${bottleneck.description || (typeof bottleneck === "string" ? bottleneck : "")}${bottleneck.suggested_fix ? `\n\nFix: ${bottleneck.suggested_fix}` : ""}`}
            type="risk"
          />
        </div>
      )}

      {/* Roadmap timeline */}
      {roadmap.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <span style={sectionLabel}>Execution Roadmap</span>
          <div style={{ position: "relative", paddingLeft: 20, marginTop: 8 }}>
            <div style={{
              position: "absolute", left: 5, top: 8, bottom: 8, width: 1,
              background: "var(--border-primary)",
            }} />
            {roadmap.map((phase: any, i: number) => {
              const isExpanded = expandedPhase === i;
              return (
                <div key={i} style={{ position: "relative", marginBottom: i < roadmap.length - 1 ? 12 : 0 }}>
                  <div style={{
                    position: "absolute", left: -17, top: 12, width: 8, height: 8,
                    borderRadius: "50%", border: "2px solid var(--border-hover)",
                    background: i === 0 ? "var(--accent)" : "var(--bg-primary)",
                  }} />
                  <button
                    onClick={() => setExpandedPhase(isExpanded ? null : i)}
                    style={{
                      width: "100%", textAlign: "left", cursor: "pointer",
                      padding: "10px 14px", borderRadius: 8,
                      background: "var(--bg-card)", border: "1px solid var(--border-primary)",
                      transition: "all 150ms",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
                          {phase.phase || `Phase ${i + 1}`}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--text-tertiary)", marginLeft: 8, fontFamily: "var(--font-mono)" }}>
                          {phase.duration || phase.timeline || ""}
                        </span>
                      </div>
                      {isExpanded ? <ChevronUp size={14} color="var(--text-tertiary)" /> : <ChevronDown size={14} color="var(--text-tertiary)" />}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
                      {phase.goal || phase.description || ""}
                    </div>
                    {isExpanded && phase.actions?.length > 0 && (
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border-secondary)" }}>
                        {phase.actions.map((action: string, j: number) => (
                          <div key={j} style={{
                            display: "flex", alignItems: "flex-start", gap: 8,
                            padding: "4px 0", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5,
                          }}>
                            <Circle size={5} style={{ marginTop: 7, flexShrink: 0, color: "var(--text-tertiary)" }} />
                            {action}
                          </div>
                        ))}
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* First 30 / 90 days — handle both string[] and object formats */}
      {(r.first_30_days || r.first_90_days) && (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 24 }}>
          {r.first_30_days && (
            <div style={{
              padding: "14px 16px", borderRadius: 10,
              background: "var(--bg-card)", border: "1px solid var(--border-primary)",
            }}>
              <div style={{ ...sectionLabel, color: "#3ECF8E", marginBottom: 10 }}>First 30 days</div>
              {Array.isArray(r.first_30_days) ? r.first_30_days.map((item: string, i: number) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "3px 0", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-tertiary)", minWidth: 16, marginTop: 2 }}>{i + 1}.</span>
                  {item}
                </div>
              )) : (
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{typeof r.first_30_days === "string" ? r.first_30_days : JSON.stringify(r.first_30_days)}</span>
              )}
            </div>
          )}
          {r.first_90_days && (
            <div style={{
              padding: "14px 16px", borderRadius: 10,
              background: "var(--bg-card)", border: "1px solid var(--border-primary)",
            }}>
              <div style={{ ...sectionLabel, marginBottom: 10 }}>First 90 days</div>
              {Array.isArray(r.first_90_days) ? r.first_90_days.map((item: string, i: number) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "3px 0", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-tertiary)", minWidth: 16, marginTop: 2 }}>{i + 1}.</span>
                  {item}
                </div>
              )) : (
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{typeof r.first_90_days === "string" ? r.first_90_days : JSON.stringify(r.first_90_days)}</span>
              )}
            </div>
          )}
        </div>
      )}

      <RisksAndOpportunities risks={r.key_risks} opportunities={r.key_opportunities} isMobile={isMobile} />
    </>
  );
}

/* ════════════════════════════════════════
   GROW ENGINE LAYOUT
   ════════════════════════════════════════ */

const IMPACT_COLORS: Record<string, string> = { high: "var(--positive)", medium: "var(--warning)", low: "var(--text-tertiary)" };
const DIFFICULTY_COLORS: Record<string, string> = { easy: "var(--positive)", moderate: "var(--warning)", hard: "var(--negative)" };
const FIT_COLORS: Record<string, string> = { high: "var(--positive)", medium: "var(--warning)", low: "var(--text-tertiary)" };

function GrowLayout({ r, isMobile }: { r: EngineResponse; isMobile?: boolean }) {
  return (
    <>
      {/* Highest leverage move */}
      {r.highest_leverage_move && (
        <div style={{ marginBottom: 20 }}>
          <div style={{
            padding: "14px 20px", borderRadius: 10,
            background: "var(--accent-subtle)", border: "1px solid var(--accent-border)",
            display: "flex", alignItems: "flex-start", gap: 12,
          }}>
            <Zap size={16} style={{ color: "var(--accent)", marginTop: 2, flexShrink: 0 }} />
            <div>
              <div style={{ ...sectionLabel, color: "var(--accent)", marginBottom: 4 }}>Highest leverage move</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)", marginBottom: 4 }}>
                {r.highest_leverage_move.title || r.highest_leverage_move.move || ""}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                {r.highest_leverage_move.description || ""}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                {r.highest_leverage_move.expected_impact && (
                  <StatusBadge value={r.highest_leverage_move.expected_impact} type="status" />
                )}
                {r.highest_leverage_move.effort && (
                  <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", padding: "2px 8px", borderRadius: 100, color: "var(--text-tertiary)", border: "1px solid var(--border-primary)" }}>
                    {r.highest_leverage_move.effort} effort
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottleneck */}
      {r.main_bottleneck && (
        <div style={{ marginBottom: 20 }}>
          <InsightCard
            title={`Bottleneck${r.main_bottleneck.severity ? ` — ${r.main_bottleneck.severity}` : ""}`}
            content={`${r.main_bottleneck.description || ""}${r.main_bottleneck.suggested_fix ? `\n\nFix: ${r.main_bottleneck.suggested_fix}` : ""}`}
            type="risk"
          />
        </div>
      )}

      {/* Growth levers grid */}
      {r.growth_levers?.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <span style={sectionLabel}>Growth Levers</span>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10, marginTop: 8 }}>
            {r.growth_levers.map((lever: any, i: number) => (
              <div key={i} style={{
                background: "var(--bg-card)", border: "1px solid var(--border-primary)",
                borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 6,
              }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
                  {lever.name || lever.lever}
                </span>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {lever.expected_impact && (
                    <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", padding: "2px 8px", borderRadius: 100, color: IMPACT_COLORS[lever.expected_impact?.toLowerCase()] || "var(--text-tertiary)", border: "1px solid var(--border-secondary)" }}>
                      {lever.expected_impact} impact
                    </span>
                  )}
                  {lever.difficulty && (
                    <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", padding: "2px 8px", borderRadius: 100, color: DIFFICULTY_COLORS[lever.difficulty?.toLowerCase()] || "var(--text-tertiary)", border: "1px solid var(--border-secondary)" }}>
                      {lever.difficulty}
                    </span>
                  )}
                </div>
                {lever.why_it_matters && (
                  <span style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>{lever.why_it_matters}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Channel priorities */}
      {r.channel_priorities?.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={sectionLabelColored("var(--text-tertiary)")}>
            <Radio size={12} />Channel Priorities
          </div>
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border-primary)",
            borderRadius: 10, overflow: "hidden", marginTop: 8,
          }}>
            {r.channel_priorities.map((c: any, i: number) => (
              <div key={i} style={{
                padding: "12px 16px",
                borderBottom: i < r.channel_priorities.length - 1 ? "1px solid var(--border-secondary)" : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{c.channel}</span>
                  {c.fit && (
                    <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", padding: "1px 6px", borderRadius: 100, border: "1px solid var(--border-secondary)", color: FIT_COLORS[c.fit?.toLowerCase()] || "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                      {c.fit} fit
                    </span>
                  )}
                </div>
                {c.rationale && <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 4 }}>{c.rationale}</div>}
                {c.first_action && <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>First step: {c.first_action}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pricing opportunities */}
      {r.pricing_opportunities?.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={sectionLabelColored("var(--text-tertiary)")}>
            <DollarSign size={12} />Pricing Opportunities
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10, marginTop: 8 }}>
            {r.pricing_opportunities.map((p: any, i: number) => (
              <div key={i} style={{
                background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 10, padding: "12px 16px",
              }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 4 }}>{p.opportunity}</div>
                {p.rationale && <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 6 }}>{p.rationale}</div>}
                {p.expected_lift && (
                  <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", padding: "2px 8px", borderRadius: 100, background: "rgba(62,207,142,0.08)", color: "var(--positive)" }}>
                    {p.expected_lift}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Experiments */}
      {r.experiments?.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={sectionLabelColored("var(--text-tertiary)")}>
            <FlaskConical size={12} />Experiments
          </div>
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border-primary)",
            borderRadius: 10, overflow: "hidden", marginTop: 8,
          }}>
            {r.experiments.map((exp: any, i: number) => (
              <div key={i} style={{
                padding: "12px 16px",
                borderBottom: i < r.experiments.length - 1 ? "1px solid var(--border-secondary)" : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{exp.name || exp.experiment}</span>
                  {exp.timeline && (
                    <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", padding: "1px 6px", borderRadius: 100, border: "1px solid var(--border-secondary)", color: "var(--text-tertiary)" }}>
                      {exp.timeline}
                    </span>
                  )}
                </div>
                {exp.hypothesis && <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 4 }}>Hypothesis: {exp.hypothesis}</div>}
                {exp.success_metric && <div style={{ fontSize: 11, color: "var(--accent)", fontFamily: "var(--font-mono)" }}>Metric: {exp.success_metric}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <Recommendation text={r.main_recommendation} />
      </div>

      <RisksAndOpportunities risks={r.key_risks} opportunities={r.key_opportunities} isMobile={isMobile} />
    </>
  );
}

/* ════════════════════════════════════════
   HIRE ENGINE LAYOUT
   ════════════════════════════════════════ */

const REC_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  hire_now:          { color: "var(--positive)", bg: "rgba(62,207,142,0.08)", border: "rgba(62,207,142,0.2)" },
  interview_further: { color: "var(--warning)", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)" },
  delay_hire:        { color: "#F97316", bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.2)" },
  reject:            { color: "var(--negative)", bg: "rgba(247,91,91,0.08)", border: "rgba(247,91,91,0.2)" },
  use_contractor:    { color: "#6E9AFF", bg: "rgba(110,154,255,0.08)", border: "rgba(110,154,255,0.2)" },
};

const SEVERITY_COLORS: Record<string, string> = {
  low: "var(--text-tertiary)", medium: "var(--warning)", high: "var(--negative)", critical: "#DC2626",
};

function HireLayout({ r, isMobile }: { r: EngineResponse; isMobile?: boolean }) {
  const rec = REC_COLORS[r.recommendation] || REC_COLORS.interview_further;
  const scores = r.scores;
  const redFlags = r.red_flags || [];
  const strengths = r.strengths || [];

  return (
    <>
      {/* Recommendation badge */}
      {r.recommendation && (
        <div style={{
          padding: "16px 20px", borderRadius: 10,
          background: rec.bg, border: `1px solid ${rec.border}`,
          marginBottom: 20, display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: rec.bg, border: `1px solid ${rec.border}`,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <StatusBadge value={r.recommendation} type="recommendation" />
          </div>
          <div>
            {r.recommendation_rationale && (
              <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                {r.recommendation_rationale}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Score gauges */}
      {scores && (
        <div style={{ display: "flex", gap: 10, marginBottom: 24, flexDirection: isMobile ? "column" : "row" }}>
          {scores.candidate_fit != null && (
            <ScoreGauge score={scores.candidate_fit} label="Candidate Fit" icon={<Star size={12} style={{ color: "var(--text-tertiary)" }} />} />
          )}
          {scores.timing != null && (
            <ScoreGauge score={scores.timing} label="Timing" icon={<Clock size={12} style={{ color: "var(--text-tertiary)" }} />} />
          )}
          {scores.role_clarity != null && (
            <ScoreGauge score={scores.role_clarity} label="Role Clarity" icon={<Briefcase size={12} style={{ color: "var(--text-tertiary)" }} />} />
          )}
        </div>
      )}

      {/* Red flags */}
      {redFlags.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={sectionLabelColored("var(--negative)")}>
            <ShieldAlert size={12} />Red Flags
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            {redFlags.map((f: any, i: number) => (
              <div key={i} style={{
                padding: "12px 16px", borderRadius: 10,
                background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.12)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{f.flag || (typeof f === "string" ? f : "")}</span>
                  {f.severity && (
                    <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", padding: "1px 6px", borderRadius: 100, border: "1px solid rgba(239,68,68,0.2)", color: SEVERITY_COLORS[f.severity] || "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                      {f.severity}
                    </span>
                  )}
                </div>
                {f.detail && <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>{f.detail}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths */}
      {strengths.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={sectionLabelColored("var(--positive)")}>
            <Star size={12} />Strengths
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            {strengths.map((s: any, i: number) => (
              <div key={i} style={{
                padding: "12px 16px", borderRadius: 10,
                background: "rgba(62,207,142,0.04)", border: "1px solid rgba(62,207,142,0.12)",
              }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 4 }}>
                  {s.strength || (typeof s === "string" ? s : "")}
                </div>
                {s.impact && <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>{s.impact}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missing capabilities */}
      {r.missing_capabilities?.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <ActionList actions={r.missing_capabilities} title="Missing Capabilities" />
        </div>
      )}

      {/* Interview focus points */}
      {r.interview_focus_points?.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <span style={sectionLabel}>Interview Focus Points</span>
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border-primary)",
            borderRadius: 10, overflow: "hidden", marginTop: 8,
          }}>
            {r.interview_focus_points.map((pt: any, i: number) => (
              <div key={i} style={{
                padding: "12px 16px",
                borderBottom: i < r.interview_focus_points.length - 1 ? "1px solid var(--border-secondary)" : "none",
                display: "flex", alignItems: "flex-start", gap: 12,
              }}>
                <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--accent)", fontWeight: 500, minWidth: 18, marginTop: 1 }}>
                  {i + 1}.
                </span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 3 }}>{pt.question_area || pt.area || pt.topic}</div>
                  {pt.why && <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 6, lineHeight: 1.5 }}>{pt.why}</div>}
                  {pt.sample_question && (
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, padding: "6px 10px", borderRadius: 6, background: "var(--bg-secondary)", fontStyle: "italic" }}>
                      &ldquo;{pt.sample_question}&rdquo;
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <Recommendation text={r.main_recommendation} label="Best Next Action" />
      </div>

      <RisksAndOpportunities risks={r.key_risks} opportunities={r.key_opportunities} isMobile={isMobile} />
    </>
  );
}

/* ════════════════════════════════════════
   PROTECT ENGINE LAYOUT
   ════════════════════════════════════════ */

const URGENCY_CONFIG: Record<string, { label: string; color: string }> = {
  watch: { label: "Watch", color: "var(--text-tertiary)" },
  act_soon: { label: "Act Soon", color: "var(--warning)" },
  act_now: { label: "Act Now", color: "var(--negative)" },
};

function ProtectLayout({ r, isMobile }: { r: EngineResponse; isMobile?: boolean }) {
  const topThreat = r.top_threat;
  const risks = r.risk_matrix || [];
  const compliance = r.compliance_exposure || [];
  const fragilities = r.operational_fragilities || [];

  return (
    <>
      {/* Fragility badge */}
      {r.fragility_level && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <StatusBadge value={`${r.fragility_level} fragility`} type="severity" />
        </div>
      )}

      {/* Top threat */}
      {topThreat && (
        <div style={{
          padding: "16px 20px", borderRadius: 10,
          background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.15)",
          marginBottom: 24,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <ShieldAlert size={16} style={{ color: "var(--negative)" }} />
            <span style={{ ...sectionLabel, color: "var(--negative)", marginBottom: 0 }}>Top threat</span>
            {topThreat.urgency && (
              <span style={{
                fontSize: 9, fontFamily: "var(--font-mono)", padding: "1px 6px", borderRadius: 100,
                border: "1px solid rgba(239,68,68,0.2)",
                color: (URGENCY_CONFIG[topThreat.urgency] || URGENCY_CONFIG.watch).color,
                textTransform: "uppercase", letterSpacing: 0.5, marginLeft: "auto",
              }}>
                {(URGENCY_CONFIG[topThreat.urgency] || URGENCY_CONFIG.watch).label}
              </span>
            )}
          </div>
          <div style={{ fontSize: 16, fontWeight: 500, color: "var(--text-primary)", marginBottom: 6 }}>{topThreat.name}</div>
          <div style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 10 }}>{topThreat.description}</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
            {topThreat.likelihood && <StatusBadge value={`${topThreat.likelihood} likelihood`} type="severity" />}
            {topThreat.impact && <StatusBadge value={`${topThreat.impact} impact`} type="severity" />}
          </div>
          {topThreat.mitigation && (
            <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, padding: "8px 12px", borderRadius: 6, background: "rgba(239,68,68,0.04)" }}>
              Mitigation: {topThreat.mitigation}
            </div>
          )}
        </div>
      )}

      {/* Risk matrix */}
      {risks.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <span style={sectionLabel}>Risk Matrix</span>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10, marginTop: 8 }}>
            {risks.map((risk: any, i: number) => (
              <RiskCard
                key={i}
                risk={risk.name || risk.risk}
                likelihood={risk.likelihood}
                impact={risk.impact}
                description={risk.description}
                mitigation={risk.mitigation}
              />
            ))}
          </div>
        </div>
      )}

      {/* Compliance exposure */}
      {compliance.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={sectionLabelColored("var(--text-tertiary)")}>
            <Scale size={12} />Compliance Exposure
          </div>
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border-primary)",
            borderRadius: 10, overflow: "hidden", marginTop: 8,
          }}>
            {compliance.map((c: any, i: number) => (
              <div key={i} style={{
                padding: "12px 16px",
                borderBottom: i < compliance.length - 1 ? "1px solid var(--border-secondary)" : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{c.area}</span>
                  {c.severity && (
                    <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", padding: "1px 6px", borderRadius: 100, border: "1px solid var(--border-secondary)", color: SEVERITY_COLORS[c.severity] || "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                      {c.severity}
                    </span>
                  )}
                </div>
                {c.exposure && <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 4 }}>{c.exposure}</div>}
                {c.action && <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>Action: {c.action}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Operational fragilities */}
      {fragilities.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={sectionLabelColored("var(--text-tertiary)")}>
            <Wrench size={12} />Operational Fragilities
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            {fragilities.map((f: any, i: number) => (
              <div key={i} style={{
                padding: "12px 16px", borderRadius: 10,
                background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.12)",
              }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 4 }}>{f.fragility}</div>
                {f.consequence && <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 4 }}>If it breaks: {f.consequence}</div>}
                {f.fix && <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>Fix: {f.fix}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <Recommendation text={r.main_recommendation} label="Priority Mitigation" />
      </div>

      <RisksAndOpportunities risks={r.key_risks} opportunities={r.key_opportunities} isMobile={isMobile} />
    </>
  );
}

/* ════════════════════════════════════════
   COMPETE ENGINE LAYOUT
   ════════════════════════════════════════ */

const THREAT_COLORS: Record<string, { bg: string; border: string }> = {
  low:    { bg: "rgba(62,207,142,0.06)", border: "rgba(62,207,142,0.12)" },
  medium: { bg: "rgba(245,158,11,0.06)", border: "rgba(245,158,11,0.12)" },
  high:   { bg: "rgba(247,91,91,0.06)", border: "rgba(247,91,91,0.12)" },
};

function CompeteLayout({ r, isMobile }: { r: EngineResponse; isMobile?: boolean }) {
  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <Recommendation text={r.main_recommendation} label="Top Competitive Move" />
      </div>

      {/* Competitive set */}
      {r.competitive_set?.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={sectionLabelColored("var(--text-tertiary)")}>
            <Eye size={12} />Competitive Set
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
            {r.competitive_set.map((comp: any, i: number) => {
              const threat = THREAT_COLORS[comp.threat_level?.toLowerCase()] || { bg: "var(--bg-card)", border: "var(--border-primary)" };
              return (
                <div key={i} style={{
                  background: threat.bg, border: `1px solid ${threat.border}`,
                  borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8,
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 16, fontWeight: 500, color: "var(--text-primary)" }}>{comp.name}</span>
                    <div style={{ display: "flex", gap: 6 }}>
                      {comp.threat_level && <StatusBadge value={comp.threat_level} type="severity" />}
                      {comp.market_share_estimate && (
                        <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", padding: "2px 8px", borderRadius: 100, border: "1px solid var(--border-secondary)", color: "var(--text-tertiary)" }}>
                          {comp.market_share_estimate}
                        </span>
                      )}
                    </div>
                  </div>
                  {comp.positioning && <span style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>{comp.positioning}</span>}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {comp.strengths?.length > 0 && (
                      <div>
                        <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--positive)", letterSpacing: 0.5, textTransform: "uppercase" }}>Strengths</span>
                        {comp.strengths.map((s: string, j: number) => (
                          <div key={j} style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 3 }}>{s}</div>
                        ))}
                      </div>
                    )}
                    {comp.weaknesses?.length > 0 && (
                      <div>
                        <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--negative)", letterSpacing: 0.5, textTransform: "uppercase" }}>Weaknesses</span>
                        {comp.weaknesses.map((w: string, j: number) => (
                          <div key={j} style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 3 }}>{w}</div>
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

      {/* Likely competitor response */}
      {r.likely_response && (
        <div style={{ marginBottom: 20 }}>
          <div style={{
            padding: "14px 20px", borderRadius: 10,
            background: "rgba(249,115,22,0.04)", border: "1px solid rgba(249,115,22,0.12)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Target size={14} style={{ color: "#F97316" }} />
              <span style={{ ...sectionLabel, color: "#F97316", marginBottom: 0 }}>Likely Response</span>
              {r.likely_response.competitor && (
                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)", marginLeft: "auto" }}>{r.likely_response.competitor}</span>
              )}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 8 }}>{r.likely_response.scenario}</div>
            {r.likely_response.timeline && <StatusBadge value={r.likely_response.timeline} type="status" />}
            {r.likely_response.your_counter && (
              <div style={{ marginTop: 8, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, padding: "8px 12px", borderRadius: 6, background: "rgba(249,115,22,0.04)" }}>
                Your counter: {r.likely_response.your_counter}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Weakest flank + Strongest advantage */}
      {(r.weakest_flank || r.strongest_advantage) && (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 24 }}>
          {r.weakest_flank && (
            <div style={{
              padding: "14px 16px", borderRadius: 10,
              background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.12)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <ShieldAlert size={12} style={{ color: "var(--negative)" }} />
                <span style={{ ...sectionLabel, color: "var(--negative)", marginBottom: 0 }}>Weakest Flank</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 4 }}>{r.weakest_flank.area}</div>
              {r.weakest_flank.why && <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 4 }}>{r.weakest_flank.why}</div>}
              {r.weakest_flank.mitigation && <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>Defend: {r.weakest_flank.mitigation}</div>}
            </div>
          )}
          {r.strongest_advantage && (
            <div style={{
              padding: "14px 16px", borderRadius: 10,
              background: "rgba(62,207,142,0.04)", border: "1px solid rgba(62,207,142,0.12)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <Crosshair size={12} style={{ color: "var(--positive)" }} />
                <span style={{ ...sectionLabel, color: "var(--positive)", marginBottom: 0 }}>Strongest Advantage</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 4 }}>{r.strongest_advantage.area}</div>
              {r.strongest_advantage.why && <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 4 }}>{r.strongest_advantage.why}</div>}
              {r.strongest_advantage.how_to_leverage && <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>Leverage: {r.strongest_advantage.how_to_leverage}</div>}
            </div>
          )}
        </div>
      )}

      {/* Market gaps */}
      {r.market_gaps?.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <span style={sectionLabel}>Market Gaps</span>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10, marginTop: 8 }}>
            {r.market_gaps.map((gap: any, i: number) => (
              <div key={i} style={{
                background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 10, padding: "12px 16px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{gap.gap}</span>
                  {gap.opportunity_size && <StatusBadge value={gap.opportunity_size} type="status" />}
                </div>
                {gap.why_unfilled && <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 4 }}>{gap.why_unfilled}</div>}
                {gap.how_to_capture && <div style={{ fontSize: 12, color: "var(--accent)" }}>{gap.how_to_capture}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Counter-moves */}
      {r.counter_moves?.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={sectionLabelColored("var(--text-tertiary)")}>
            <Swords size={12} />Counter-Moves
          </div>
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border-primary)",
            borderRadius: 10, overflow: "hidden", marginTop: 8,
          }}>
            {r.counter_moves.map((m: any, i: number) => (
              <div key={i} style={{
                padding: "12px 16px",
                borderBottom: i < r.counter_moves.length - 1 ? "1px solid var(--border-secondary)" : "none",
                display: "flex", alignItems: "flex-start", gap: 12,
              }}>
                <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--accent)", fontWeight: 500, minWidth: 18, marginTop: 1 }}>
                  {i + 1}.
                </span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 3 }}>{m.move}</div>
                  {m.target && <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 4 }}>Target: {m.target}</div>}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {m.expected_impact && (
                      <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", padding: "2px 8px", borderRadius: 100, background: "rgba(62,207,142,0.08)", color: "var(--positive)" }}>
                        {m.expected_impact}
                      </span>
                    )}
                    {m.timeline && (
                      <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", padding: "2px 8px", borderRadius: 100, border: "1px solid var(--border-secondary)", color: "var(--text-tertiary)" }}>
                        {m.timeline}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <RisksAndOpportunities risks={r.key_risks} opportunities={r.key_opportunities} isMobile={isMobile} />
    </>
  );
}

/* ─── fallback for unknown engines ─── */
function GenericLayout({ r, isMobile }: { r: EngineResponse; isMobile?: boolean }) {
  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <Recommendation text={r.main_recommendation} />
      </div>
      <RisksAndOpportunities risks={r.key_risks} opportunities={r.key_opportunities} isMobile={isMobile} />
    </>
  );
}

/* ════════════════════════════════════════
   MASTER RENDERER
   ════════════════════════════════════════ */

function isFallbackResponse(r: any): boolean {
  return r?.notes?.some?.((n: string) => typeof n === "string" && n.includes("structured parsing failed"));
}

export default function EngineResultRenderer({ response, isMobile }: EngineResultRendererProps) {
  if (!response) return null;

  /* If structured parsing failed, render as markdown */
  if (isFallbackResponse(response)) {
    return <MarkdownResult content={response.executive_summary} />;
  }

  const LayoutMap: Record<string, React.FC<{ r: EngineResponse; isMobile?: boolean }>> = {
    build: BuildLayout,
    grow: GrowLayout,
    hire: HireLayout,
    protect: ProtectLayout,
    compete: CompeteLayout,
  };

  const Layout = LayoutMap[response.engine] || GenericLayout;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <Header response={response} />
      <Summary text={response.executive_summary} subtext={response.fragility_rationale} />
      <Layout r={response} isMobile={isMobile} />
      <Footer response={response} />
    </div>
  );
}
