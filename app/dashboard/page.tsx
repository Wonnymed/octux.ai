"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { LayoutDashboard, Zap, Shield, Eye, FileText, Link2, ArrowLeft } from "lucide-react";
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

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const [contextRes, watchRes, sharedRes, decisionRes] = await Promise.all([
        supabase.from("user_context").select("id, context_type, summary, created_at, key_insights").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
        supabase.from("intelligence_watches").select("id").eq("user_id", user.id).eq("status", "active"),
        supabase.from("shared_results").select("id").eq("user_id", user.id),
        supabase.from("decision_journal").select("id").eq("user_id", user.id),
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
    } catch {}
    setLoading(false);
  };

  const STAT_CARDS = [
    { label: "Simulations", value: stats.simulations, color: "#D4AF37", icon: Zap },
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
                      background: item.context_type === "simulation" ? "rgba(212,175,55,0.06)" : "rgba(220,38,38,0.06)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {item.context_type === "simulation" ? (
                        <Zap size={14} style={{ color: "#D4AF37" }} />
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
