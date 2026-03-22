"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { LayoutDashboard, Zap, Shield, Eye, FileText, Link2, ArrowLeft, Target } from "lucide-react";
import { useIsMobile } from "../lib/useIsMobile";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Activity = {
  id: string;
  context_type: string;
  summary: string;
  created_at: string;
  key_insights?: string[];
};

export default function DashboardPage() {
  const isMobile = useIsMobile();
  const [stats, setStats] = useState({
    simulations: 0,
    intelReports: 0,
    activeWatches: 0,
    decisions: 0,
    sharedResults: 0,
  });
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [patterns, setPatterns] = useState<any>(null);
  const [accuracy, setAccuracy] = useState<string | null>(null);
  const [trackedCount, setTrackedCount] = useState(0);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const [contextRes, watchRes, sharedRes, decisionRes, decisionScoresRes] = await Promise.all([
        supabase.from("user_context").select("id, context_type, summary, created_at, key_insights").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
        supabase.from("intelligence_watches").select("id").eq("user_id", user.id).eq("status", "active"),
        supabase.from("shared_results").select("id").eq("user_id", user.id),
        supabase.from("decision_journal").select("id").eq("user_id", user.id),
        supabase.from("decision_journal").select("score").eq("user_id", user.id).not("score", "is", null),
      ]);

      const contexts = contextRes.data || [];
      setRecentActivity(contexts.slice(0, 10));
      setStats({
        simulations: contexts.filter(c => c.context_type === "simulation").length,
        intelReports: contexts.filter(c => ["chat", "intel", "research"].includes(c.context_type)).length,
        activeWatches: watchRes.data?.length || 0,
        decisions: decisionRes.data?.length || 0,
        sharedResults: sharedRes.data?.length || 0,
      });
      // Calibration: compute accuracy from decision scores
      const scores = decisionScoresRes.data || [];
      if (scores.length > 0) {
        const accurate = scores.filter((d: any) => d.score >= 6).length;
        setAccuracy((accurate / scores.length * 100).toFixed(0));
        setTrackedCount(scores.length);
      }

      // Load patterns (background, don't block)
      fetch(`/api/patterns?userId=${user.id}`)
        .then(r => r.json())
        .then(d => { if (d.patterns) setPatterns(d.patterns); })
        .catch(() => {});
    } catch {}
    setLoading(false);
  };

  const STAT_CARDS = [
    { label: "Simulations", value: stats.simulations, color: "#C8A84E", icon: Zap },
    { label: "Intel Reports", value: stats.intelReports, color: "#DC2626", icon: Shield },
    { label: "Active Watches", value: stats.activeWatches, color: "#22C55E", icon: Eye },
    { label: "Decisions", value: stats.decisions, color: "#8B5CF6", icon: FileText },
    { label: "Shared", value: stats.sharedResults, color: "#06B6D4", icon: Link2 },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg-primary)",
      color: "var(--text-primary)", padding: isMobile ? 16 : 24,
    }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Back link */}
        <a href="/chat" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          color: "var(--text-tertiary)", fontSize: 12, textDecoration: "none",
          marginBottom: 20,
        }}>
          <ArrowLeft size={14} /> Back to chat
        </a>

        <h1 style={{
          fontFamily: "var(--font-brand)", fontSize: isMobile ? 20 : 24, fontWeight: 700,
          marginBottom: 4, display: "flex", alignItems: "center", gap: 10,
        }}>
          <LayoutDashboard size={22} style={{ color: "var(--accent)" }} />
          Intelligence Dashboard
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-tertiary)", marginBottom: 24 }}>
          Your decision intelligence at a glance
        </p>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-tertiary)" }}>Loading...</div>
        ) : (
          <>
            {/* Stats grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(5, 1fr)",
              gap: 12, marginBottom: 32,
            }}>
              {STAT_CARDS.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} style={{
                    padding: "16px 14px", borderRadius: 12,
                    border: "1px solid var(--border-secondary)",
                    background: "var(--card-bg)",
                  }}>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 6,
                      fontSize: 10, color: "var(--text-tertiary)", marginBottom: 6,
                    }}>
                      <Icon size={12} style={{ color: stat.color }} /> {stat.label}
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: stat.color }}>
                      {stat.value}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Calibration + Patterns row */}
            <div style={{ display: "grid", gridTemplateColumns: accuracy ? (isMobile ? "1fr" : "200px 1fr") : "1fr", gap: 16, marginBottom: 32 }}>
              {/* Accuracy card */}
              {accuracy && (
                <div style={{
                  padding: "20px 14px", borderRadius: 12,
                  border: "1px solid var(--border-secondary)",
                  background: "var(--card-bg)", textAlign: "center",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 8 }}>
                    <Target size={14} style={{ color: parseInt(accuracy) >= 70 ? "#22c55e" : "#f59e0b" }} />
                    <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>Prediction Accuracy</span>
                  </div>
                  <div style={{
                    fontSize: 36, fontWeight: 800,
                    color: parseInt(accuracy) >= 70 ? "#22c55e" : parseInt(accuracy) >= 50 ? "#f59e0b" : "#ef4444",
                  }}>
                    {accuracy}%
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 4 }}>
                    Based on {trackedCount} tracked outcomes
                  </div>
                </div>
              )}

              {/* Patterns */}
              {patterns && patterns.patterns && patterns.patterns.length > 0 && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                    <span style={{ fontSize: 14 }}>🧠</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Patterns from your analyses</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {patterns.patterns.map((p: any, i: number) => {
                      const tc: Record<string, { color: string; bg: string; icon: string }> = {
                        strength: { color: "#22c55e", bg: "rgba(34,197,94,0.06)", icon: "💪" },
                        weakness: { color: "#f59e0b", bg: "rgba(245,158,11,0.06)", icon: "⚠️" },
                        blind_spot: { color: "#ef4444", bg: "rgba(239,68,68,0.06)", icon: "👁" },
                      };
                      const cfg = tc[p.type] || tc.strength;
                      return (
                        <div key={i} style={{
                          padding: "10px 12px", borderRadius: 8,
                          background: cfg.bg, border: `1px solid ${cfg.color}15`,
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                            <span style={{ fontSize: 12 }}>{cfg.icon}</span>
                            <span style={{ fontSize: 9, fontWeight: 700, color: cfg.color, textTransform: "uppercase", letterSpacing: 0.5 }}>
                              {p.type.replace("_", " ")}
                            </span>
                          </div>
                          <div style={{ fontSize: 12, color: "var(--text-primary)", fontWeight: 500 }}>{p.insight}</div>
                          <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 2 }}>{p.evidence}</div>
                        </div>
                      );
                    })}
                  </div>
                  {patterns.recommendation && (
                    <div style={{
                      marginTop: 8, padding: "8px 12px", borderRadius: 8,
                      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                      fontSize: 11, color: "var(--text-secondary)",
                    }}>
                      <span style={{ color: "var(--accent)", fontWeight: 600 }}>Tip:</span> {patterns.recommendation}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Recent activity */}
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
              Recent Activity
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {recentActivity.length === 0 ? (
                <div style={{
                  padding: 32, textAlign: "center", color: "var(--text-tertiary)",
                  border: "1px dashed var(--border-secondary)", borderRadius: 12,
                }}>
                  <div style={{ fontSize: 14, marginBottom: 8 }}>No activity yet</div>
                  <a href="/chat" style={{ color: "var(--accent)", fontSize: 13, textDecoration: "none" }}>
                    Start your first analysis →
                  </a>
                </div>
              ) : (
                recentActivity.map((item) => (
                  <div key={item.id} style={{
                    padding: "12px 16px", borderRadius: 10,
                    border: "1px solid var(--border-secondary)",
                    background: "var(--card-bg)",
                    display: "flex", alignItems: "center", gap: 12,
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: item.context_type === "simulation" ? "rgba(255,255,255,0.03)" : "rgba(220,38,38,0.06)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {item.context_type === "simulation" ? (
                        <Zap size={14} style={{ color: "#C8A84E" }} />
                      ) : (
                        <Shield size={14} style={{ color: "#DC2626" }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13, fontWeight: 500,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {item.summary?.slice(0, 100) || item.context_type}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                        {new Date(item.created_at).toLocaleDateString()} — {item.context_type}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
