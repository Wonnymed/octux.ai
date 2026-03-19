"use client";
import { useState } from "react";
import { Rocket, Search, Zap, TrendingUp, Globe, MessageSquare, ChevronRight } from "lucide-react";
import { SignuxIcon } from "./SignuxIcon";
import type { Mode } from "../lib/types";

type OnboardingProps = {
  onComplete: (mode: Mode) => void;
  onSkip: () => void;
};

const GOALS = [
  { label: "I'm starting a business", icon: Rocket, mode: "launchpad" as Mode, color: "#14B8A6" },
  { label: "I need to make a decision", icon: Zap, mode: "simulate" as Mode, color: "#D4AF37" },
  { label: "I'm researching a market", icon: Search, mode: "research" as Mode, color: "#6B8AFF" },
  { label: "I'm evaluating an investment", icon: TrendingUp, mode: "invest" as Mode, color: "#A855F7" },
  { label: "I operate internationally", icon: Globe, mode: "globalops" as Mode, color: "#22C55E" },
  { label: "Just exploring", icon: MessageSquare, mode: "chat" as Mode, color: "var(--text-tertiary)" },
];

const LEVELS = [
  { label: "First-time entrepreneur", value: "first-time" },
  { label: "Experienced founder", value: "experienced" },
  { label: "Corporate professional", value: "corporate" },
  { label: "Student / Learning", value: "student" },
];

const MODE_DESCRIPTIONS: Record<string, string> = {
  launchpad: "Launchpad will find the right business for your skills, validate it, and build a 90-day blueprint.",
  simulate: "Simulate will stress-test your decision with 15 AI agents debating from every angle.",
  research: "Research will search multiple sources and compile a structured report with citations.",
  invest: "Invest will evaluate your deal with quantitative formulas — expected value, Kelly, Bayesian updates.",
  globalops: "Global Ops will analyze cross-border structures, compliance, and tax optimization across 100+ jurisdictions.",
  chat: "Chat is your open canvas — ask anything about business, strategy, or operations.",
};

const MODE_LABELS: Record<string, string> = {
  launchpad: "Launchpad",
  simulate: "Simulate",
  research: "Deep Research",
  invest: "Invest",
  globalops: "Global Ops",
  chat: "Chat",
};

export default function Onboarding({ onComplete, onSkip }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState<typeof GOALS[number] | null>(null);
  const [selectedLevel, setSelectedLevel] = useState("");

  const finish = () => {
    localStorage.setItem("signux_onboarded", "true");
    if (selectedLevel) localStorage.setItem("signux_experience", selectedLevel);
    onComplete(selectedGoal?.mode || "chat");
  };

  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "40px 20px", minHeight: 0,
      animation: "fadeIn 0.3s ease-out",
    }}>
      <div style={{ maxWidth: 520, width: "100%", position: "relative" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <SignuxIcon variant="gold" size={36} />
        </div>

        {/* Step 0: Goal */}
        {step === 0 && (
          <div style={{ animation: "fadeIn 0.25s ease-out" }}>
            <div style={{
              fontSize: 22, fontWeight: 600, color: "var(--text-primary)",
              textAlign: "center", marginBottom: 8, lineHeight: 1.3,
            }}>
              What brings you here?
            </div>
            <div style={{
              fontSize: 13, color: "var(--text-secondary)",
              textAlign: "center", marginBottom: 28,
            }}>
              This helps us recommend the right starting point.
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {GOALS.map(g => {
                const Icon = g.icon;
                const selected = selectedGoal?.mode === g.mode;
                return (
                  <button
                    key={g.mode}
                    onClick={() => { setSelectedGoal(g); setStep(1); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "14px 16px", borderRadius: 10,
                      border: selected ? `1px solid ${g.color}` : "1px solid var(--card-border)",
                      background: selected ? `${g.color}08` : "var(--card-bg)",
                      cursor: "pointer", transition: "all 150ms",
                      textAlign: "left",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = g.color; }}
                    onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = "var(--card-border)"; }}
                  >
                    <Icon size={16} style={{ color: g.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 14, color: "var(--text-primary)", flex: 1 }}>{g.label}</span>
                    <ChevronRight size={14} style={{ color: "var(--text-tertiary)" }} />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 1: Experience */}
        {step === 1 && (
          <div style={{ animation: "fadeIn 0.25s ease-out" }}>
            <div style={{
              fontSize: 22, fontWeight: 600, color: "var(--text-primary)",
              textAlign: "center", marginBottom: 8, lineHeight: 1.3,
            }}>
              One more thing
            </div>
            <div style={{
              fontSize: 13, color: "var(--text-secondary)",
              textAlign: "center", marginBottom: 28,
            }}>
              What&apos;s your experience level?
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {LEVELS.map(l => {
                const selected = selectedLevel === l.value;
                return (
                  <button
                    key={l.value}
                    onClick={() => { setSelectedLevel(l.value); setStep(2); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "14px 16px", borderRadius: 10,
                      border: selected ? "1px solid var(--accent)" : "1px solid var(--card-border)",
                      background: selected ? "var(--accent-bg)" : "var(--card-bg)",
                      cursor: "pointer", transition: "all 150ms",
                      textAlign: "left",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; }}
                    onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = "var(--card-border)"; }}
                  >
                    <span style={{ fontSize: 14, color: "var(--text-primary)" }}>{l.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Recommendation */}
        {step === 2 && selectedGoal && (
          <div style={{ animation: "fadeIn 0.25s ease-out", textAlign: "center" }}>
            <div style={{
              fontSize: 22, fontWeight: 600, color: "var(--text-primary)",
              marginBottom: 8, lineHeight: 1.3,
            }}>
              You&apos;re all set
            </div>
            <div style={{
              fontSize: 13, color: "var(--text-secondary)",
              marginBottom: 32,
            }}>
              Based on your answers, we recommend:
            </div>

            <div style={{
              padding: 24, borderRadius: 14,
              border: `1px solid ${selectedGoal.color}`,
              background: `${selectedGoal.color}08`,
              marginBottom: 28,
            }}>
              {(() => { const Icon = selectedGoal.icon; return <Icon size={28} style={{ color: selectedGoal.color, marginBottom: 12 }} />; })()}
              <div style={{
                fontFamily: "var(--font-brand)", fontSize: 20, fontWeight: 700,
                letterSpacing: 2, color: "var(--text-primary)", marginBottom: 8,
              }}>
                {MODE_LABELS[selectedGoal.mode]}
              </div>
              <div style={{
                fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6,
              }}>
                {MODE_DESCRIPTIONS[selectedGoal.mode]}
              </div>
            </div>

            <button
              onClick={finish}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "14px 36px", borderRadius: 50,
                background: "var(--accent)", color: "var(--bg-primary)",
                fontFamily: "var(--font-brand)", fontWeight: 600, fontSize: 14,
                letterSpacing: 2, textTransform: "uppercase",
                border: "none", cursor: "pointer", transition: "all 200ms",
              }}
              onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.filter = "none"; }}
            >
              Let&apos;s go
            </button>
          </div>
        )}

        {/* Step dots + Skip */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 8, marginTop: 32,
        }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: step === i ? 16 : 6, height: 6, borderRadius: 3,
              background: step === i ? "var(--accent)" : "var(--card-border)",
              transition: "all 200ms",
            }} />
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button
            onClick={() => {
              localStorage.setItem("signux_onboarded", "true");
              onSkip();
            }}
            style={{
              background: "none", border: "none",
              fontSize: 12, color: "var(--text-tertiary)", cursor: "pointer",
              textDecoration: "underline", textUnderlineOffset: 2,
            }}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
