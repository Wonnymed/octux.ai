"use client";
import { useState } from "react";
import { Microscope, Loader2 } from "lucide-react";
import { signuxFetch } from "../lib/api-client";
import MarkdownRenderer from "./MarkdownRenderer";

type AutopsyResult = {
  decision_score?: number;
  score_explanation?: string;
  what_went_right?: Array<{ factor: string; domain: string; lesson: string }>;
  what_went_wrong?: Array<{ factor: string; domain: string; lesson: string }>;
  domains_not_consulted?: Array<{ domain: string; would_have_revealed: string; impact: string }>;
  key_lessons?: string[];
  next_time_checklist?: string[];
  raw?: string;
};

export default function DecisionAutopsy({ lang }: { lang: string }) {
  const [decision, setDecision] = useState("");
  const [outcome, setOutcome] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AutopsyResult | null>(null);

  const runAutopsy = async () => {
    if (!decision.trim() || !outcome.trim() || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await signuxFetch("/api/autopsy", {
        method: "POST",
        body: JSON.stringify({ decision: decision.trim(), outcome: outcome.trim(), context: context.trim(), lang }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ raw: "Analysis failed. Please try again." });
    }
    setLoading(false);
  };

  const scoreColor = (score: number) =>
    score >= 7 ? "#22c55e" : score >= 4 ? "#f59e0b" : "#ef4444";

  const impactColor = (impact: string) =>
    impact === "HIGH" ? "#ef4444" : impact === "MEDIUM" ? "#f59e0b" : "#22c55e";

  if (result) {
    if (result.raw) {
      return (
        <div style={{ padding: "20px 16px", maxWidth: 720, margin: "0 auto" }}>
          <button onClick={() => setResult(null)} style={{
            fontSize: 12, color: "var(--text-tertiary)", background: "none", border: "none", cursor: "pointer", marginBottom: 12,
          }}>
            ← Run another autopsy
          </button>
          <MarkdownRenderer content={result.raw} />
        </div>
      );
    }

    return (
      <div style={{ padding: "20px 16px", maxWidth: 720, margin: "0 auto" }}>
        <button onClick={() => setResult(null)} style={{
          fontSize: 12, color: "var(--text-tertiary)", background: "none", border: "none", cursor: "pointer", marginBottom: 16,
        }}>
          ← Run another autopsy
        </button>

        {/* Score */}
        {result.decision_score != null && (
          <div style={{
            display: "flex", alignItems: "center", gap: 16, marginBottom: 20,
            padding: "16px 20px", borderRadius: 12,
            border: "1px solid var(--card-border)", background: "var(--card-bg)",
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              border: `3px solid ${scoreColor(result.decision_score)}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-brand)", fontSize: 24, fontWeight: 700,
              color: scoreColor(result.decision_score),
            }}>
              {result.decision_score}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
                Process Quality Score
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                {result.score_explanation}
              </div>
            </div>
          </div>
        )}

        {/* What went right */}
        {result.what_went_right && result.what_went_right.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#22c55e", marginBottom: 8 }}>What went right</div>
            {result.what_went_right.map((item, i) => (
              <div key={i} style={{
                padding: "10px 12px", borderRadius: 8, marginBottom: 6,
                border: "1px solid rgba(34,197,94,0.15)", background: "rgba(34,197,94,0.03)",
              }}>
                <div style={{ fontSize: 13, color: "var(--text-primary)", marginBottom: 4 }}>{item.factor}</div>
                <div style={{ fontSize: 10, color: "#22c55e", fontFamily: "var(--font-mono)" }}>{item.domain}</div>
                <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 4 }}>{item.lesson}</div>
              </div>
            ))}
          </div>
        )}

        {/* What went wrong */}
        {result.what_went_wrong && result.what_went_wrong.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#ef4444", marginBottom: 8 }}>What went wrong</div>
            {result.what_went_wrong.map((item, i) => (
              <div key={i} style={{
                padding: "10px 12px", borderRadius: 8, marginBottom: 6,
                border: "1px solid rgba(239,68,68,0.15)", background: "rgba(239,68,68,0.03)",
              }}>
                <div style={{ fontSize: 13, color: "var(--text-primary)", marginBottom: 4 }}>{item.factor}</div>
                <div style={{ fontSize: 10, color: "#ef4444", fontFamily: "var(--font-mono)" }}>{item.domain}</div>
                <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 4 }}>{item.lesson}</div>
              </div>
            ))}
          </div>
        )}

        {/* Domains not consulted */}
        {result.domains_not_consulted && result.domains_not_consulted.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#f59e0b", marginBottom: 8 }}>Domains you didn&apos;t consult</div>
            {result.domains_not_consulted.map((item, i) => (
              <div key={i} style={{
                padding: "10px 12px", borderRadius: 8, marginBottom: 6,
                border: "1px solid rgba(245,158,11,0.15)", background: "rgba(245,158,11,0.03)",
                display: "flex", alignItems: "flex-start", gap: 10,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{item.domain.replace(/_/g, " ")}</div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>{item.would_have_revealed}</div>
                </div>
                <span style={{
                  fontSize: 9, fontFamily: "var(--font-mono)", fontWeight: 600,
                  padding: "2px 6px", borderRadius: 4,
                  color: impactColor(item.impact),
                  background: item.impact === "HIGH" ? "rgba(239,68,68,0.08)" : item.impact === "MEDIUM" ? "rgba(245,158,11,0.08)" : "rgba(34,197,94,0.08)",
                }}>
                  {item.impact}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Key lessons */}
        {result.key_lessons && result.key_lessons.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>Key lessons</div>
            {result.key_lessons.map((lesson, i) => (
              <div key={i} style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 4, paddingLeft: 12, borderLeft: "2px solid var(--accent)" }}>
                {lesson}
              </div>
            ))}
          </div>
        )}

        {/* Checklist */}
        {result.next_time_checklist && result.next_time_checklist.length > 0 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>Next time checklist</div>
            {result.next_time_checklist.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>
                <div style={{ width: 14, height: 14, borderRadius: 3, border: "1px solid var(--border-secondary)", flexShrink: 0 }} />
                {item}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "32px 16px",
      maxWidth: 560, margin: "0 auto",
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: "rgba(168,85,247,0.08)", display: "flex",
        alignItems: "center", justifyContent: "center", marginBottom: 12,
      }}>
        <Microscope size={20} style={{ color: "#A855F7" }} />
      </div>

      <h2 style={{
        fontFamily: "var(--font-brand)", fontWeight: 700,
        fontSize: 24, letterSpacing: 4, color: "var(--text-primary)",
        marginBottom: 4, textAlign: "center",
      }}>
        DECISION AUTOPSY
      </h2>
      <p style={{
        fontSize: 12, color: "var(--text-tertiary)", textAlign: "center",
        marginBottom: 24, maxWidth: 400,
      }}>
        Describe a past decision and its outcome. We&apos;ll analyze what went right, what went wrong, and which intelligence domains would have helped.
      </p>

      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <label style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-tertiary)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4, display: "block" }}>
            What was the decision?
          </label>
          <textarea
            value={decision}
            onChange={e => setDecision(e.target.value)}
            placeholder="e.g. I decided to hire 3 sales reps instead of investing in inbound marketing..."
            style={{
              width: "100%", minHeight: 64, padding: "10px 12px", borderRadius: 10,
              border: "1px solid var(--card-border)", background: "var(--card-bg)",
              color: "var(--text-primary)", fontSize: 14, resize: "none", outline: "none",
              fontFamily: "var(--font-sans)",
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-tertiary)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4, display: "block" }}>
            What was the outcome?
          </label>
          <textarea
            value={outcome}
            onChange={e => setOutcome(e.target.value)}
            placeholder="e.g. 2 of the 3 reps quit within 4 months, burned $45K, and pipeline didn't grow..."
            style={{
              width: "100%", minHeight: 64, padding: "10px 12px", borderRadius: 10,
              border: "1px solid var(--card-border)", background: "var(--card-bg)",
              color: "var(--text-primary)", fontSize: 14, resize: "none", outline: "none",
              fontFamily: "var(--font-sans)",
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-tertiary)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4, display: "block" }}>
            Additional context (optional)
          </label>
          <textarea
            value={context}
            onChange={e => setContext(e.target.value)}
            placeholder="e.g. We were a 5-person startup, $200K ARR, B2B SaaS..."
            style={{
              width: "100%", minHeight: 48, padding: "10px 12px", borderRadius: 10,
              border: "1px solid var(--card-border)", background: "var(--card-bg)",
              color: "var(--text-primary)", fontSize: 14, resize: "none", outline: "none",
              fontFamily: "var(--font-sans)",
            }}
          />
        </div>

        <button
          onClick={runAutopsy}
          disabled={!decision.trim() || !outcome.trim() || loading}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "12px 24px", borderRadius: 50,
            background: decision.trim() && outcome.trim() ? "#A855F7" : "var(--bg-tertiary)",
            color: decision.trim() && outcome.trim() ? "#fff" : "var(--text-tertiary)",
            border: "none", cursor: decision.trim() && outcome.trim() && !loading ? "pointer" : "not-allowed",
            fontSize: 14, fontWeight: 600, fontFamily: "var(--font-brand)", letterSpacing: 1,
            marginTop: 8,
          }}
        >
          {loading ? <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} /> : <Microscope size={16} />}
          {loading ? "Analyzing..." : "Run Autopsy"}
        </button>
      </div>
    </div>
  );
}
