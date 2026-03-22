"use client";
import { useState } from "react";
import { Check, ArrowRight, Zap, Crown, Loader2, Infinity as InfinityIcon } from "lucide-react";
import { SignuxIcon } from "../components/SignuxIcon";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "",
    description: "See what AI can do for your business.",
    features: [
      "5 chat messages/day",
      "1 simulation/month",
      "AI business advisor",
      "Multilingual support",
    ],
    excluded: [
      "Research mode",
      "Launchpad",
      "Global Ops",
      "Invest mode",
      "Second Opinion",
      "Challenge This",
    ],
    cta: "Start free",
    color: "var(--text-secondary)",
    popular: false,
    icon: null,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "Access every mode. See the future before it happens.",
    features: [
      "Unlimited chat",
      "20 simulations/month",
      "10 deep researches/month",
      "5 Global Ops analyses/month",
      "5 investment analyses/month",
      "Launchpad project tracker",
      "Full Intel suite",
      "Decision journal",
      "Priority support",
    ],
    excluded: [
      "Second Opinion",
      "Challenge This",
      "Opus model",
    ],
    cta: "Upgrade to Pro",
    color: "#C8A84E",
    popular: true,
    icon: Zap,
  },
  {
    id: "max",
    name: "Max",
    price: "$99",
    period: "/month",
    description: "Unlimited everything. No limits, no blind spots.",
    features: [
      "Everything in Pro — unlimited",
      "Unlimited simulations",
      "Unlimited research",
      "Unlimited Global Ops",
      "Unlimited Invest analyses",
      "Second Opinion — 3 perspectives on every answer",
      "Challenge This — stress-test any analysis",
      "Opus model — most powerful AI available",
      "Priority access to new domains",
      "Founding member badge",
      "Early access to new features",
    ],
    excluded: [],
    cta: "Upgrade to Max",
    color: "#A855F7",
    popular: false,
    icon: Crown,
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (planId: string) => {
    if (planId === "free") {
      window.location.href = "/chat";
      return;
    }
    setLoading(planId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: planId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        if (res.status === 401) {
          window.location.href = "/login?redirect=/pricing";
        } else {
          alert(data.error);
        }
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      {/* Nav */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 24px", borderBottom: "1px solid var(--border-primary)",
      }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <SignuxIcon variant="gold" size={24} />
          <span style={{
            fontFamily: "var(--font-brand)", fontSize: 14, fontWeight: 600,
            letterSpacing: 2, color: "var(--text-primary)",
          }}>
            SIGNUX
          </span>
        </a>
        <a href="/chat" style={{
          fontSize: 13, color: "var(--text-secondary)", textDecoration: "none",
          fontFamily: "var(--font-brand)", letterSpacing: 1,
        }}>
          Back to app
        </a>
      </div>

      {/* Header */}
      <div style={{ textAlign: "center", padding: "60px 24px 20px" }}>
        <h1 style={{
          fontSize: 36, fontWeight: 700, marginBottom: 12,
          fontFamily: "var(--font-brand)", letterSpacing: 2,
        }}>
          Choose how you want to grow
        </h1>
        <p style={{ fontSize: 16, color: "var(--text-secondary)", maxWidth: 500, margin: "0 auto" }}>
          Pro gives you access to everything. Max removes all limits.
        </p>
      </div>

      {/* Pro vs Max comparison highlight */}
      <div style={{
        display: "flex", justifyContent: "center", gap: 24, padding: "0 24px 40px",
        flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}>
          <Zap size={14} style={{ color: "#C8A84E" }} />
          <span><strong style={{ color: "#C8A84E" }}>Pro</strong> — all modes, monthly limits</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}>
          <Crown size={14} style={{ color: "#A855F7" }} />
          <span><strong style={{ color: "#A855F7" }}>Max</strong> — unlimited + exclusive features</span>
        </div>
      </div>

      {/* Plans grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: 20, maxWidth: 920, margin: "0 auto",
        padding: "0 24px 40px",
      }}>
        {PLANS.map(plan => {
          const Icon = plan.icon;
          return (
            <div key={plan.id} style={{
              position: "relative",
              background: "var(--bg-secondary)",
              border: plan.popular ? `2px solid ${plan.color}` : plan.id === "max" ? "1px solid rgba(168,85,247,0.3)" : "1px solid var(--border-primary)",
              borderRadius: 16, padding: 28,
              display: "flex", flexDirection: "column",
            }}>
              {plan.popular && (
                <div style={{
                  position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                  padding: "4px 16px", borderRadius: 50,
                  background: plan.color, color: "#000",
                  fontSize: 11, fontWeight: 700, letterSpacing: 1,
                  fontFamily: "var(--font-brand)",
                }}>
                  MOST POPULAR
                </div>
              )}

              {plan.id === "max" && (
                <div style={{
                  position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                  padding: "4px 16px", borderRadius: 50,
                  background: plan.color, color: "#fff",
                  fontSize: 11, fontWeight: 700, letterSpacing: 1,
                  fontFamily: "var(--font-brand)",
                }}>
                  NO LIMITS
                </div>
              )}

              {/* Plan header */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                {Icon && <Icon size={18} style={{ color: plan.color }} />}
                <span style={{
                  fontFamily: "var(--font-brand)", fontSize: 16, fontWeight: 600,
                  letterSpacing: 1, color: plan.color,
                }}>
                  {plan.name.toUpperCase()}
                </span>
              </div>

              {/* Price */}
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 36, fontWeight: 700 }}>{plan.price}</span>
                <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>{plan.period}</span>
              </div>

              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 20, lineHeight: 1.4 }}>
                {plan.description}
              </p>

              {/* Features */}
              <div style={{ flex: 1, marginBottom: 24 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <Check size={14} style={{ color: plan.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 13 }}>{f}</span>
                  </div>
                ))}
                {plan.excluded.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ width: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ width: 8, height: 1, background: "var(--text-tertiary)", display: "block" }} />
                    </span>
                    <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>{f}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={loading === plan.id}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  width: "100%", padding: "12px 24px", borderRadius: 10,
                  background: plan.popular ? plan.color : plan.id === "max" ? plan.color : "transparent",
                  color: plan.popular ? "#000" : plan.id === "max" ? "#fff" : "var(--text-primary)",
                  border: (plan.popular || plan.id === "max") ? "none" : "1px solid var(--border-primary)",
                  fontSize: 14, fontWeight: 600, cursor: loading === plan.id ? "wait" : "pointer",
                  fontFamily: "var(--font-brand)", letterSpacing: 1,
                  opacity: loading === plan.id ? 0.7 : 1,
                  transition: "opacity 0.15s",
                }}
              >
                {loading === plan.id ? (
                  <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} />
                ) : (
                  <>
                    {plan.cta}
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Feature comparison table */}
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "0 24px 80px" }}>
        <h3 style={{
          textAlign: "center", fontSize: 18, fontWeight: 600,
          fontFamily: "var(--font-brand)", letterSpacing: 1, marginBottom: 24,
          color: "var(--text-secondary)",
        }}>
          Compare plans
        </h3>
        <div style={{
          background: "var(--bg-secondary)", borderRadius: 12,
          border: "1px solid var(--border-primary)", overflow: "hidden",
        }}>
          {[
            { feature: "Chat messages", free: "5/day", pro: "Unlimited", max: "Unlimited" },
            { feature: "Simulations", free: "1/month", pro: "20/month", max: "Unlimited" },
            { feature: "Deep Research", free: "—", pro: "10/month", max: "Unlimited" },
            { feature: "Global Ops", free: "—", pro: "5/month", max: "Unlimited" },
            { feature: "Invest Mode", free: "—", pro: "5/month", max: "Unlimited" },
            { feature: "Launchpad", free: "—", pro: "Full access", max: "Full access" },
            { feature: "Intel Suite", free: "—", pro: "Full access", max: "Full access" },
            { feature: "Second Opinion", free: "—", pro: "—", max: "Included" },
            { feature: "Challenge This", free: "—", pro: "—", max: "Included" },
            { feature: "AI Model", free: "Sonnet", pro: "Sonnet", max: "Opus" },
          ].map((row, i) => (
            <div key={row.feature} style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr",
              padding: "10px 16px", fontSize: 13,
              borderBottom: i < 9 ? "1px solid var(--border-primary)" : "none",
              background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
            }}>
              <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{row.feature}</span>
              <span style={{ color: "var(--text-tertiary)", textAlign: "center" }}>{row.free}</span>
              <span style={{ color: "#C8A84E", textAlign: "center", fontWeight: 500 }}>{row.pro}</span>
              <span style={{ color: "#A855F7", textAlign: "center", fontWeight: 500 }}>{row.max}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
