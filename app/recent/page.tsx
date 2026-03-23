"use client";
import { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft, Search, Clock, Zap, Hammer, TrendingUp, UserCheck, Shield,
  Swords, ArrowRight, Loader2, Lock, Scale, FlaskConical, BookOpen,
  ChevronDown, Filter,
} from "lucide-react";
import { useIsMobile } from "../lib/useIsMobile";
import { useAuth } from "../lib/auth";
import { signuxFetch } from "../lib/api-client";
import { ENGINES, SIGNUX_GOLD, type EngineId } from "../lib/engines";

const ICON_MAP: Record<string, typeof Zap> = {
  Zap, Hammer, TrendingUp, UserCheck, Shield, Swords,
};

/* ═══ Workflow type metadata ═══ */
const WORKFLOW_TYPES: Record<string, { label: string; icon: typeof Zap; color: string }> = {
  simulate: { label: "Simulation", icon: Zap, color: SIGNUX_GOLD },
  build: { label: "Build plan", icon: Hammer, color: "#10B981" },
  grow: { label: "Growth analysis", icon: TrendingUp, color: "#8B5CF6" },
  hire: { label: "Hiring evaluation", icon: UserCheck, color: "#F59E0B" },
  protect: { label: "Risk scan", icon: Shield, color: "#EF4444" },
  compete: { label: "Competitive analysis", icon: Swords, color: "#F97316" },
  compare: { label: "Comparison", icon: Scale, color: SIGNUX_GOLD },
  "what-if": { label: "What-if", icon: FlaskConical, color: SIGNUX_GOLD },
};

/* ═══ Date helpers ═══ */
function formatRelative(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type SortMode = "newest" | "oldest";

export default function RecentPage() {
  const isMobile = useIsMobile();
  const { authUser } = useAuth();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [engineFilter, setEngineFilter] = useState<string | null>(null);

  /* ═══ Fetch recent work ═══ */
  useEffect(() => {
    if (!authUser) { setLoading(false); return; }
    (async () => {
      try {
        const res = await signuxFetch("/api/simulations/list");
        if (res.ok) {
          const data = await res.json();
          setItems(data);
        }
      } catch { /* silent */ }
      finally { setLoading(false); }
    })();
  }, [authUser]);

  /* ═══ Filtered + sorted ═══ */
  const filtered = useMemo(() => {
    let list = [...items];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        (s.scenario || "").toLowerCase().includes(q) ||
        (s.verdict?.reasoning || "").toLowerCase().includes(q)
      );
    }

    if (engineFilter) {
      list = list.filter(s => (s.engine || "simulate") === engineFilter);
    }

    list.sort((a, b) => {
      const da = new Date(a.updated_at || a.created_at).getTime();
      const db = new Date(b.updated_at || b.created_at).getTime();
      return sortMode === "newest" ? db - da : da - db;
    });

    return list;
  }, [items, search, sortMode, engineFilter]);

  /* ═══ Continue now — top 3 most recent ═══ */
  const continueItems = useMemo(() => {
    return [...items]
      .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
      .slice(0, 3);
  }, [items]);

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
                <Clock size={16} strokeWidth={1.5} style={{ color: SIGNUX_GOLD }} />
              </div>
              <h1 style={{
                fontSize: isMobile ? 20 : 22, fontWeight: 500,
                color: "var(--text-primary)", margin: 0, letterSpacing: 0.2,
              }}>Recent</h1>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-secondary, #5B5B5B)", margin: 0, lineHeight: 1.5 }}>
              Continue your most recent decisions, simulations, and workflows.
            </p>
          </div>
        </div>

        {/* ═══ Auth gate ═══ */}
        {!authUser && (
          <div style={{
            ...card,
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", padding: "80px 24px",
            border: "1px dashed var(--border-primary)", textAlign: "center",
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: "var(--bg-secondary)", border: "1px solid var(--border-primary)",
              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20,
            }}>
              <Lock size={24} strokeWidth={1.5} style={{ color: "var(--text-tertiary)" }} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 500, color: "var(--text-primary)", margin: "0 0 8px" }}>
              Sign in to see recent work
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", maxWidth: 340, lineHeight: 1.5, margin: "0 0 24px" }}>
              Your recent decisions and workflows will appear here once you sign in.
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

        {/* ═══ Loading ═══ */}
        {authUser && loading && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0" }}>
            <Loader2 size={24} strokeWidth={1.5} style={{ color: "var(--text-tertiary)", animation: "spin 1s linear infinite" }} />
          </div>
        )}

        {/* ═══ Main content ═══ */}
        {authUser && !loading && (
          <>
            {/* ═══ Empty state ═══ */}
            {items.length === 0 && (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                padding: "64px 24px", textAlign: "center",
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 14,
                  background: "var(--bg-secondary)", border: "1px solid var(--border-primary)",
                  display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20,
                }}>
                  <Clock size={24} strokeWidth={1.5} style={{ color: "var(--text-tertiary)" }} />
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 500, color: "var(--text-primary)", margin: "0 0 8px" }}>
                  No recent work yet
                </h3>
                <p style={{
                  fontSize: 13, color: "var(--text-secondary)", maxWidth: 360, lineHeight: 1.5, margin: "0 0 24px",
                }}>
                  Your recent simulations and workflows will appear here as you use Signux.
                </p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                  <ActionBtn
                    label="Go Home"
                    onClick={() => { window.location.href = "/chat"; }}
                  />
                  <ActionBtn
                    label="Start with Simulate"
                    icon={<Zap size={13} strokeWidth={1.5} />}
                    gold
                    onClick={() => { window.location.href = "/chat?mode=simulate"; }}
                  />
                </div>
              </div>
            )}

            {items.length > 0 && (
              <>
                {/* ═══ ZONE B: Continue now ═══ */}
                {continueItems.length > 0 && !search.trim() && !engineFilter && (
                  <div style={{ marginBottom: 32 }}>
                    <h2 style={sectionTitle}>Continue where you left off</h2>
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : continueItems.length === 1 ? "1fr" : continueItems.length === 2 ? "1fr 1fr" : "1fr 1fr 1fr",
                      gap: 12,
                    }}>
                      {continueItems.map(item => (
                        <ContinueCard key={item.id} item={item} isMobile={isMobile} />
                      ))}
                    </div>
                  </div>
                )}

                {/* ═══ Search + filter bar ═══ */}
                <div style={{
                  display: "flex",
                  alignItems: isMobile ? "stretch" : "center",
                  flexDirection: isMobile ? "column" : "row",
                  gap: 10,
                  marginBottom: 20,
                }}>
                  {/* Search */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "9px 14px", borderRadius: 10, flex: 1,
                    border: "1px solid var(--border-primary, #E8E8E3)",
                    background: "var(--bg-secondary, #FAFAF7)",
                  }}>
                    <Search size={15} style={{ color: "var(--text-tertiary)", flexShrink: 0 }} />
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search recent work..."
                      style={{
                        flex: 1, border: "none", background: "transparent",
                        color: "var(--text-primary)", fontSize: 13.5, outline: "none",
                        fontFamily: "inherit",
                      }}
                    />
                  </div>

                  {/* Engine filter */}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <FilterChip
                      label="All"
                      active={!engineFilter}
                      onClick={() => setEngineFilter(null)}
                    />
                    {(Object.keys(ENGINES) as EngineId[]).slice(0, 4).map(id => (
                      <FilterChip
                        key={id}
                        label={ENGINES[id].name}
                        active={engineFilter === id}
                        color={ENGINES[id].color}
                        onClick={() => setEngineFilter(engineFilter === id ? null : id)}
                      />
                    ))}
                  </div>

                  {/* Sort */}
                  <select
                    value={sortMode}
                    onChange={e => setSortMode(e.target.value as SortMode)}
                    style={{
                      padding: "8px 12px", borderRadius: 8,
                      border: "1px solid var(--border-primary, #E8E8E3)",
                      background: "var(--bg-secondary, #FAFAF7)",
                      color: "var(--text-secondary, #5B5B5B)",
                      fontSize: 12, cursor: "pointer", outline: "none",
                      fontFamily: "inherit",
                    }}
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                  </select>
                </div>

                {/* ═══ ZONE C: Recent work list ═══ */}
                <h2 style={sectionTitle}>
                  All recent work{filtered.length > 0 ? ` (${filtered.length})` : ""}
                </h2>

                {filtered.length === 0 && (
                  <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    padding: "48px 24px", textAlign: "center",
                  }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>
                      No matching recent work
                    </span>
                    <span style={{ fontSize: 12.5, color: "var(--text-tertiary)", maxWidth: 320, lineHeight: 1.5 }}>
                      Try a different keyword or clear filters.
                    </span>
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {filtered.map(item => (
                    <RecentRow key={item.id} item={item} isMobile={isMobile} />
                  ))}
                </div>
              </>
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

/* ═══ Continue card (top section) ═══ */
function ContinueCard({ item, isMobile }: { item: any; isMobile: boolean }) {
  const engine = (item.engine || "simulate") as string;
  const engineData = ENGINES[engine as EngineId];
  const Icon = engineData ? ICON_MAP[engineData.icon] || Zap : Zap;
  const color = engineData?.color || SIGNUX_GOLD;
  const verdict = item.verdict;

  return (
    <button
      onClick={() => { window.location.href = `/chat?load=${item.id}`; }}
      style={{
        display: "flex", flexDirection: "column", gap: 12,
        padding: 16, borderRadius: 14,
        border: `1px solid var(--border-primary, #E8E8E3)`,
        background: "var(--bg-secondary, #FAFAF7)",
        cursor: "pointer", textAlign: "left", width: "100%",
        transition: "border-color 200ms ease-out, background 200ms ease-out",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = `${color}50`;
        e.currentTarget.style.background = `${color}05`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "var(--border-primary, #E8E8E3)";
        e.currentTarget.style.background = "var(--bg-secondary, #FAFAF7)";
      }}
    >
      {/* Engine + time */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Icon size={13} strokeWidth={1.5} style={{ color }} />
          <span style={{
            fontSize: 10, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color,
          }}>{engineData?.name || engine}</span>
        </div>
        <span style={{ fontSize: 10, color: "var(--text-tertiary, #9CA3AF)" }}>
          {formatRelative(item.updated_at || item.created_at)}
        </span>
      </div>

      {/* Title */}
      <span style={{
        fontSize: 13.5, fontWeight: 500, color: "var(--text-primary, #111111)",
        lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical", overflow: "hidden",
      }}>
        {item.scenario || "Untitled decision"}
      </span>

      {/* Verdict chip + continue */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {verdict?.result && (
          <span style={{
            fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
            background: `${verdictColor(verdict.result)}12`,
            color: verdictColor(verdict.result),
          }}>
            {verdict.result === "GO" ? "Go" : verdict.result === "CAUTION" ? "Caution" : verdict.result === "STOP" ? "Stop" : verdict.result}
            {verdict.viabilityScore ? ` · ${verdict.viabilityScore}%` : ""}
          </span>
        )}
        <div style={{
          display: "flex", alignItems: "center", gap: 4,
          fontSize: 11, fontWeight: 500, color: SIGNUX_GOLD,
        }}>
          Continue <ArrowRight size={11} strokeWidth={2} />
        </div>
      </div>
    </button>
  );
}

/* ═══ Recent row (list section) ═══ */
function RecentRow({ item, isMobile }: { item: any; isMobile: boolean }) {
  const engine = (item.engine || "simulate") as string;
  const engineData = ENGINES[engine as EngineId];
  const Icon = engineData ? ICON_MAP[engineData.icon] || Zap : Zap;
  const color = engineData?.color || SIGNUX_GOLD;
  const verdict = item.verdict;

  return (
    <button
      onClick={() => { window.location.href = `/chat?load=${item.id}`; }}
      style={{
        display: "flex",
        alignItems: isMobile ? "flex-start" : "center",
        flexDirection: isMobile ? "column" : "row",
        gap: isMobile ? 8 : 16,
        padding: isMobile ? "14px 16px" : "12px 16px",
        borderRadius: 12,
        border: "1px solid var(--border-primary, #E8E8E3)",
        background: "var(--bg-primary, #FFFFFF)",
        cursor: "pointer", textAlign: "left", width: "100%",
        transition: "border-color 180ms ease-out, background 180ms ease-out",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "var(--border-hover, #D4D4CF)";
        e.currentTarget.style.background = "var(--bg-secondary, #FAFAF7)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "var(--border-primary, #E8E8E3)";
        e.currentTarget.style.background = "var(--bg-primary, #FFFFFF)";
      }}
    >
      {/* Engine icon */}
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: `${color}10`, border: `1px solid ${color}20`,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icon size={14} strokeWidth={1.5} style={{ color }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: "flex", alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "space-between", gap: 8,
          flexDirection: isMobile ? "column" : "row",
        }}>
          <span style={{
            fontSize: 13.5, fontWeight: 500, color: "var(--text-primary)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            flex: 1, minWidth: 0,
          }}>
            {item.scenario || "Untitled decision"}
          </span>

          <div style={{
            display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
          }}>
            {verdict?.result && (
              <span style={{
                fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 3,
                background: `${verdictColor(verdict.result)}10`,
                color: verdictColor(verdict.result),
              }}>
                {verdict.result === "GO" ? "Go" : verdict.result === "CAUTION" ? "Caution" : verdict.result === "STOP" ? "Stop" : verdict.result}
              </span>
            )}
            <span style={{ fontSize: 11, color: "var(--text-tertiary)", whiteSpace: "nowrap" }}>
              {formatRelative(item.updated_at || item.created_at)}
            </span>
          </div>
        </div>

        {/* Preview */}
        {verdict?.reasoning && (
          <p style={{
            fontSize: 12, color: "var(--text-tertiary)", margin: "4px 0 0",
            lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {verdict.reasoning.slice(0, 120)}
          </p>
        )}
      </div>

      {/* Arrow */}
      {!isMobile && (
        <ArrowRight size={14} strokeWidth={1.5} style={{ color: "var(--text-tertiary)", flexShrink: 0 }} />
      )}
    </button>
  );
}

/* ═══ Filter chip ═══ */
function FilterChip({ label, active, color, onClick }: {
  label: string; active: boolean; color?: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: 11, fontWeight: 500, padding: "5px 10px", borderRadius: 6,
        border: `1px solid ${active ? (color || SIGNUX_GOLD) + "40" : "var(--border-primary, #E8E8E3)"}`,
        background: active ? (color || SIGNUX_GOLD) + "10" : "transparent",
        color: active ? (color || SIGNUX_GOLD) : "var(--text-tertiary, #9CA3AF)",
        cursor: "pointer", transition: "all 180ms ease-out",
      }}
    >{label}</button>
  );
}

/* ═══ Action button ═══ */
function ActionBtn({ label, icon, gold, onClick }: {
  label: string; icon?: React.ReactNode; gold?: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "8px 18px", borderRadius: 8,
        background: gold ? SIGNUX_GOLD : "var(--bg-secondary, #FAFAF7)",
        border: gold ? "none" : "1px solid var(--border-primary, #E8E8E3)",
        color: gold ? "#FFFFFF" : "var(--text-secondary, #5B5B5B)",
        fontSize: 12.5, fontWeight: 500, cursor: "pointer",
        transition: "all 180ms ease-out",
      }}
      onMouseEnter={e => {
        if (!gold) {
          e.currentTarget.style.borderColor = "var(--border-hover, #D4D4CF)";
          e.currentTarget.style.color = "var(--text-primary)";
        }
      }}
      onMouseLeave={e => {
        if (!gold) {
          e.currentTarget.style.borderColor = "var(--border-primary, #E8E8E3)";
          e.currentTarget.style.color = "var(--text-secondary, #5B5B5B)";
        }
      }}
    >{icon}{label}</button>
  );
}

/* ═══ Verdict color ═══ */
function verdictColor(result?: string): string {
  if (!result) return "#9CA3AF";
  if (result === "GO") return "#3ECF8E";
  if (result === "CAUTION") return "#F59E0B";
  if (result === "STOP") return "#EF4444";
  return "#9CA3AF";
}
