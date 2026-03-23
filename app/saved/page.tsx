"use client";
import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Search, ChevronDown, Zap, Hammer, TrendingUp, UserCheck, Shield, Swords, BookOpen, MoreHorizontal, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { SignuxIcon } from "../components/SignuxIcon";
import { useIsMobile } from "../lib/useIsMobile";
import { useAuth } from "../lib/auth";
import { ENGINES, type EngineId } from "../lib/engines";
import { signuxFetch } from "../lib/api-client";

const GOLD = "#C8A84E";

const ICON_MAP: Record<string, typeof Zap> = {
  Zap, Hammer, TrendingUp, UserCheck, Shield, Swords,
};

/* ═══ Verdict display helpers ═══ */
function verdictColor(result?: string): string {
  if (!result) return "var(--text-tertiary)";
  if (result === "GO") return "var(--success, #3ECF8E)";
  if (result === "CAUTION") return "var(--warning, #F59E0B)";
  if (result === "STOP") return "var(--error, #EF4444)";
  return "var(--text-tertiary)";
}

function verdictLabel(result?: string): string {
  if (!result) return "";
  if (result === "GO") return "Go";
  if (result === "CAUTION") return "Caution";
  if (result === "STOP") return "Stop";
  return result;
}

/* ═══ Date grouping ═══ */
function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined });
}

type SortMode = "recent" | "oldest" | "verdict";

export default function SavedPage() {
  const isMobile = useIsMobile();
  const { authUser } = useAuth();
  const [simulations, setSimulations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("recent");
  const [engineFilter, setEngineFilter] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Fetch saved simulations
  useEffect(() => {
    if (!authUser) { setLoading(false); return; }
    (async () => {
      try {
        const res = await signuxFetch("/api/simulations/list");
        if (res.ok) setSimulations(await res.json());
      } catch { /* silent */ }
      finally { setLoading(false); }
    })();
  }, [authUser]);

  // Filtered and sorted list
  const items = useMemo(() => {
    let list = [...simulations];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        (s.scenario || "").toLowerCase().includes(q) ||
        (s.verdict?.reasoning || "").toLowerCase().includes(q)
      );
    }

    // Engine filter (currently all simulations are "simulate" engine)
    if (engineFilter) {
      // Future: filter by engine type when other engines save work
      // For now, "simulate" is the only engine that saves
      if (engineFilter !== "simulate") list = [];
    }

    // Sort
    if (sortMode === "recent") {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortMode === "oldest") {
      list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sortMode === "verdict") {
      list.sort((a, b) => (b.verdict?.viabilityScore ?? b.verdict?.viability ?? 0) - (a.verdict?.viabilityScore ?? a.verdict?.viability ?? 0));
    }

    return list;
  }, [simulations, search, sortMode, engineFilter]);

  const handleOpen = (id: string) => {
    window.location.href = `/chat?load=${id}`;
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await signuxFetch(`/api/simulations/${id}`, { method: "DELETE" });
      setSimulations(prev => prev.filter(s => s.id !== id));
    } catch { /* silent */ }
    finally { setDeleting(null); setMenuOpen(null); }
  };

  const hasResults = items.length > 0;
  const hasSimulations = simulations.length > 0;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      {/* Nav */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 24px", borderBottom: "1px solid var(--border-primary)",
      }}>
        <a href="/chat" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <SignuxIcon variant="gold" size={22} />
          <span style={{
            fontFamily: "var(--font-brand)", fontSize: 13, fontWeight: 500,
            letterSpacing: 3, color: "var(--text-primary)",
          }}>
            SIGNUX
          </span>
        </a>
        <a href="/chat" style={{
          display: "flex", alignItems: "center", gap: 5,
          fontSize: 12, color: "var(--text-secondary)", textDecoration: "none",
          transition: "color 180ms ease-out",
        }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--text-secondary)"}
        >
          <ArrowLeft size={13} strokeWidth={1.5} /> Back to app
        </a>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: 800,
        margin: "0 auto",
        padding: isMobile ? "32px 16px 64px" : "48px 32px 80px",
      }}>
        {/* ═══ A. PAGE HEADER ═══ */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{
            fontSize: isMobile ? 22 : 26, fontWeight: 500,
            color: "var(--text-primary)", margin: 0, letterSpacing: 0.2,
          }}>
            Saved
          </h1>
          <p style={{
            fontSize: 13.5, color: "var(--text-secondary)", margin: "6px 0 0",
          }}>
            Revisit, search, and continue your saved decisions.
          </p>
        </div>

        {/* ═══ B. SEARCH / FILTER / SORT ═══ */}
        {hasSimulations && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 24,
            flexWrap: isMobile ? "wrap" : "nowrap",
          }}>
            {/* Search */}
            <div style={{
              flex: 1, minWidth: isMobile ? "100%" : 200,
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 12px", borderRadius: 8,
              background: "var(--bg-card)",
              border: "1px solid var(--border-primary)",
            }}>
              <Search size={14} strokeWidth={1.5} style={{ color: "var(--text-tertiary)", flexShrink: 0 }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search decisions..."
                style={{
                  flex: 1, border: "none", background: "transparent",
                  color: "var(--text-primary)", fontSize: 13, outline: "none",
                  fontFamily: "var(--font-body)",
                }}
              />
            </div>

            {/* Sort */}
            <div style={{ position: "relative" }}>
              <select
                value={sortMode}
                onChange={e => setSortMode(e.target.value as SortMode)}
                style={{
                  appearance: "none",
                  padding: "8px 30px 8px 12px",
                  borderRadius: 8,
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-primary)",
                  color: "var(--text-secondary)",
                  fontSize: 12.5,
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  outline: "none",
                }}
              >
                <option value="recent">Most recent</option>
                <option value="oldest">Oldest first</option>
                <option value="verdict">Highest score</option>
              </select>
              <ChevronDown size={12} style={{
                position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                color: "var(--text-tertiary)", pointerEvents: "none",
              }} />
            </div>

            {/* Count */}
            <span style={{
              fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-tertiary)",
              whiteSpace: "nowrap",
            }}>
              {items.length} saved
            </span>
          </div>
        )}

        {/* ═══ C. SAVED ITEMS LIST ═══ */}
        {loading ? (
          <div style={{
            display: "flex", justifyContent: "center", padding: "60px 0",
          }}>
            <Loader2 size={24} strokeWidth={1.5} style={{ color: "var(--text-tertiary)", animation: "spin 0.8s linear infinite" }} />
          </div>
        ) : !authUser ? (
          <EmptyArchive
            title="Sign in to view saved decisions"
            body="Your decision archive is available when you sign in."
            cta="Sign in"
            href="/login?redirect=/saved"
          />
        ) : !hasSimulations ? (
          <EmptyArchive
            title="No saved decisions yet"
            body="Save important simulations and plans to build your decision library."
            cta="Start with Simulate"
            href="/chat?mode=simulate"
          />
        ) : !hasResults ? (
          <EmptyArchive
            title="No matching saved decisions"
            body="Try a different keyword or clear filters."
            cta="Clear search"
            onClick={() => { setSearch(""); setEngineFilter(null); }}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {items.map(sim => (
              <SavedItemCard
                key={sim.id}
                sim={sim}
                isMobile={isMobile}
                menuOpen={menuOpen === sim.id}
                onToggleMenu={() => setMenuOpen(menuOpen === sim.id ? null : sim.id)}
                onOpen={() => handleOpen(sim.id)}
                onDelete={() => handleDelete(sim.id)}
                deleting={deleting === sim.id}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ═══ SAVED ITEM CARD ═══ */
function SavedItemCard({
  sim, isMobile, menuOpen, onToggleMenu, onOpen, onDelete, deleting,
}: {
  sim: any;
  isMobile: boolean;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onOpen: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  const scenario = sim.scenario || "Untitled decision";
  const verdict = sim.verdict;
  const result = verdict?.result;
  const viability = verdict?.viabilityScore ?? verdict?.viability;
  const reasoning = verdict?.reasoning;
  const created = sim.created_at;

  // Engine identity — currently all saved items are simulations
  const engineId = "simulate" as EngineId;
  const engine = ENGINES[engineId];
  const EngineIcon = ICON_MAP[engine?.icon] || Zap;

  return (
    <div
      onClick={onOpen}
      style={{
        padding: isMobile ? "16px 14px" : "18px 20px",
        borderRadius: 12,
        border: "1px solid var(--border-primary)",
        background: "var(--bg-card)",
        cursor: "pointer",
        transition: "border-color 180ms ease-out, background 180ms ease-out",
        position: "relative",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "var(--border-hover, #D4D4CF)";
        e.currentTarget.style.background = "var(--bg-card-hover, var(--bg-card))";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "var(--border-primary)";
        e.currentTarget.style.background = "var(--bg-card)";
      }}
    >
      {/* Top row: title + engine chip */}
      <div style={{
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        gap: 12, marginBottom: 8,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 14.5, fontWeight: 500, color: "var(--text-primary)",
            lineHeight: 1.4,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical" as any,
            overflow: "hidden",
          }}>
            {scenario}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {/* Engine chip */}
          <div style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "3px 8px", borderRadius: 5,
            background: `${engine.color}0A`,
            border: `1px solid ${engine.color}15`,
          }}>
            <EngineIcon size={11} strokeWidth={1.5} style={{ color: engine.color }} />
            <span style={{
              fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 500,
              color: engine.color, letterSpacing: 0.5,
            }}>
              {engine.name}
            </span>
          </div>

          {/* Verdict badge */}
          {result && (
            <span style={{
              fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 600,
              padding: "3px 8px", borderRadius: 5, letterSpacing: 0.5,
              background: `${verdictColor(result)}12`,
              color: verdictColor(result),
            }}>
              {verdictLabel(result)}
            </span>
          )}
        </div>
      </div>

      {/* Middle: preview / reasoning */}
      {reasoning && (
        <p style={{
          fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5,
          margin: "0 0 10px",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical" as any,
          overflow: "hidden",
        }}>
          {reasoning}
        </p>
      )}

      {/* Bottom row: metadata + actions */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
            {formatRelativeDate(created)}
          </span>
          {viability != null && (
            <span style={{
              fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-tertiary)",
            }}>
              {viability}/10
            </span>
          )}
        </div>

        {/* More menu */}
        <div style={{ position: "relative" }} onClick={e => e.stopPropagation()}>
          <button
            onClick={onToggleMenu}
            style={{
              width: 28, height: 28, borderRadius: 6,
              background: menuOpen ? "var(--bg-hover)" : "transparent",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--text-tertiary)",
              transition: "background 180ms ease-out",
            }}
            onMouseEnter={e => { if (!menuOpen) e.currentTarget.style.background = "var(--bg-hover, rgba(0,0,0,0.03))"; }}
            onMouseLeave={e => { if (!menuOpen) e.currentTarget.style.background = "transparent"; }}
          >
            <MoreHorizontal size={14} strokeWidth={1.5} />
          </button>

          {menuOpen && (
            <>
              <div onClick={onToggleMenu} style={{ position: "fixed", inset: 0, zIndex: 98 }} />
              <div style={{
                position: "absolute", right: 0, top: 32, zIndex: 99,
                width: 160, padding: 4, borderRadius: 10,
                background: "var(--bg-card, #FFFFFF)",
                border: "1px solid var(--border-primary)",
                boxShadow: "var(--shadow-md, 0 4px 16px rgba(0,0,0,0.08))",
              }}>
                <MenuButton icon={<ExternalLink size={13} />} label="Open" onClick={onOpen} />
                <MenuButton icon={<Trash2 size={13} />} label={deleting ? "Deleting..." : "Delete"} onClick={onDelete} danger />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══ Menu button ═══ */
function MenuButton({ icon, label, onClick, danger }: {
  icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        width: "100%", padding: "8px 10px", borderRadius: 7,
        background: "transparent", border: "none",
        cursor: "pointer", textAlign: "left",
        color: danger ? "var(--error, #EF4444)" : "var(--text-primary)",
        fontSize: 12.5,
        transition: "background 150ms",
      }}
      onMouseEnter={e => e.currentTarget.style.background = danger ? "rgba(239,68,68,0.06)" : "var(--bg-hover, rgba(0,0,0,0.03))"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      {icon}
      {label}
    </button>
  );
}

/* ═══ EMPTY ARCHIVE STATE ═══ */
function EmptyArchive({ title, body, cta, href, onClick }: {
  title: string;
  body: string;
  cta?: string;
  href?: string;
  onClick?: () => void;
}) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "64px 24px", textAlign: "center",
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: "var(--bg-hover, rgba(0,0,0,0.03))",
        border: "1px solid var(--border-primary)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 20,
      }}>
        <BookOpen size={22} strokeWidth={1.5} style={{ color: "var(--text-tertiary)" }} />
      </div>
      <span style={{
        fontSize: 16, fontWeight: 500, color: "var(--text-primary)",
        marginBottom: 8,
      }}>
        {title}
      </span>
      <span style={{
        fontSize: 13, color: "var(--text-secondary)",
        maxWidth: 360, lineHeight: 1.5, marginBottom: cta ? 24 : 0,
      }}>
        {body}
      </span>
      {cta && (
        href ? (
          <a
            href={href}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "9px 22px", borderRadius: 8,
              background: GOLD, border: "none",
              color: "#FFFFFF", fontSize: 13, fontWeight: 500,
              textDecoration: "none",
              transition: "background 180ms ease-out",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#D4AF37"}
            onMouseLeave={e => e.currentTarget.style.background = GOLD}
          >
            {cta}
          </a>
        ) : onClick ? (
          <button
            onClick={onClick}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "9px 22px", borderRadius: 8,
              background: "var(--bg-card)",
              border: "1px solid var(--border-primary)",
              color: "var(--text-primary)", fontSize: 13, fontWeight: 500,
              cursor: "pointer",
              transition: "background 180ms ease-out",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--bg-card)"}
          >
            {cta}
          </button>
        ) : null
      )}
    </div>
  );
}
