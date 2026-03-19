"use client";
import { useState, useRef, useEffect } from "react";
import { Swords, Loader2, RotateCcw, Shield, Zap, Scale, AlertTriangle, Target } from "lucide-react";
import { signuxFetch } from "../lib/api-client";

type Move = { agent: string; round: number; content: string };
type Vulnerability = { vulnerability: string; exploited_by: string; severity: string };
type Scenario = { name: string; probability: string; description: string; triggers: string[] };
type Report = {
  nash_equilibrium: string;
  dominant_strategy: string;
  vulnerability_map: Vulnerability[];
  preemptive_moves: string[];
  scenarios: Scenario[];
  key_insight: string;
};

type AgentInfo = { id: string; name: string; role: string; color: string };

const AGENT_ICONS: Record<string, any> = {
  "Your Company": Shield,
  "Competitor Alpha": Target,
  "Competitor Beta": Zap,
  "Disruptor": Zap,
  "Regulator": Scale,
};

const PRESETS = [
  "SaaS project management — competing with Asana, Monday.com, and new AI-native tools",
  "Food delivery in São Paulo — competing with iFood and Rappi",
  "E-commerce fashion — competing with Shein and local brands",
  "Fintech payments — competing with Stripe and local processors",
];

export default function WarGame({ lang }: { lang: string }) {
  const [market, setMarket] = useState("");
  const [running, setRunning] = useState(false);
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [moves, setMoves] = useState<Move[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [status, setStatus] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [moves, status]);

  const run = async (preset?: string) => {
    const text = preset || market;
    if (!text.trim()) return;
    setMarket(text);
    setRunning(true);
    setAgents([]);
    setMoves([]);
    setCurrentRound(0);
    setStatus("Initializing...");
    setReport(null);
    setError("");

    try {
      const res = await signuxFetch("/api/wargame", {
        method: "POST",
        body: JSON.stringify({ market: text.trim(), lang }),
      });
      if (!res.body) throw new Error("No stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === "status") setStatus(data.message);
            else if (data.type === "agents") setAgents(data.agents);
            else if (data.type === "round") { setCurrentRound(data.round); setStatus(`Round ${data.round}: ${data.label}`); }
            else if (data.type === "agent_start") setStatus(`${data.agentName} is making a move...`);
            else if (data.type === "agent_done") setMoves(prev => [...prev, { agent: data.agentName, round: data.round, content: data.content }]);
            else if (data.type === "complete") setReport(data.report);
            else if (data.type === "error") setError(data.error || "War game failed");
          } catch {}
        }
      }
    } catch {
      setError("War game failed. Try again.");
    }
    setRunning(false);
  };

  const reset = () => { setReport(null); setMoves([]); setMarket(""); setError(""); setAgents([]); setCurrentRound(0); };

  /* ═══ Running State ═══ */
  if (running || (moves.length > 0 && !report && !error)) {
    return (
      <div style={{ padding: "20px 16px", maxWidth: 700, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <Swords size={18} style={{ color: "#D4AF37" }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>War Game</span>
          <span style={{ fontSize: 11, color: "var(--text-tertiary)", marginLeft: "auto" }}>
            Round {currentRound}/3
          </span>
        </div>

        {/* Status */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
          borderRadius: 8, marginBottom: 16,
          background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.12)",
        }}>
          <Loader2 size={14} style={{ color: "#D4AF37", animation: "spin 1s linear infinite" }} />
          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{status}</span>
        </div>

        {/* Round progress */}
        <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
          {[1, 2, 3].map(r => (
            <div key={r} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: r < currentRound ? "#D4AF37" : r === currentRound ? "rgba(212,175,55,0.4)" : "var(--bg-tertiary)",
              transition: "background 300ms",
            }} />
          ))}
        </div>

        {/* Moves feed */}
        <div ref={feedRef} style={{ maxHeight: 400, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
          {moves.map((m, i) => {
            const agentInfo = agents.find(a => a.name === m.agent);
            const color = agentInfo?.color || "#888";
            return (
              <div key={i} style={{
                padding: "10px 12px", borderRadius: 8,
                border: `1px solid ${color}20`, background: `${color}08`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color }}>{m.agent}</span>
                  <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>Round {m.round}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>{m.content}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ═══ Report State ═══ */
  if (report) {
    return (
      <div style={{ padding: "20px 16px", maxWidth: 700, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Swords size={18} style={{ color: "#D4AF37" }} />
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>War Game Report</span>
          </div>
          <button onClick={reset} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
            borderRadius: 8, border: "1px solid var(--border-primary)", background: "transparent",
            cursor: "pointer", fontSize: 11, color: "var(--text-secondary)",
          }}>
            <RotateCcw size={12} /> New game
          </button>
        </div>

        {/* Key Insight */}
        <div style={{
          padding: "14px 16px", borderRadius: 10, marginBottom: 16,
          background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.15)",
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#D4AF37", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Key Insight</div>
          <div style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5, fontWeight: 500 }}>{report.key_insight}</div>
        </div>

        {/* Game Board — show all moves */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Game Board</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4, fontSize: 10 }}>
            {[1, 2, 3].map(r => (
              <div key={r} style={{ textAlign: "center", fontWeight: 700, color: "var(--text-tertiary)", padding: "4px 0" }}>
                R{r}
              </div>
            ))}
          </div>
          {agents.map(agent => {
            const agentMoves = moves.filter(m => m.agent === agent.name);
            return (
              <div key={agent.id} style={{ marginBottom: 4 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: agent.color, marginBottom: 2 }}>{agent.name}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4 }}>
                  {[1, 2, 3].map(r => {
                    const move = agentMoves.find(m => m.round === r);
                    return (
                      <div key={r} style={{
                        padding: "6px 8px", borderRadius: 6, fontSize: 10,
                        background: `${agent.color}08`, border: `1px solid ${agent.color}15`,
                        color: "var(--text-secondary)", lineHeight: 1.4,
                        minHeight: 40,
                      }}>
                        {move?.content.slice(0, 80) || "—"}{move && move.content.length > 80 ? "..." : ""}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Nash Equilibrium & Dominant Strategy */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
          <div style={{ padding: "12px", borderRadius: 10, border: "1px solid var(--border-primary)", background: "var(--bg-secondary)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#3B82F6", marginBottom: 4, textTransform: "uppercase" }}>Nash Equilibrium</div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.5 }}>{report.nash_equilibrium}</div>
          </div>
          <div style={{ padding: "12px", borderRadius: 10, border: "1px solid var(--border-primary)", background: "var(--bg-secondary)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#22C55E", marginBottom: 4, textTransform: "uppercase" }}>Your Best Strategy</div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.5 }}>{report.dominant_strategy}</div>
          </div>
        </div>

        {/* Vulnerability Map */}
        {report.vulnerability_map.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
              <AlertTriangle size={12} style={{ marginRight: 6, verticalAlign: "middle", color: "#ef4444" }} />
              Vulnerability Map
            </div>
            {report.vulnerability_map.map((v, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 10px",
                borderRadius: 8, marginBottom: 4,
                border: `1px solid ${v.severity === "HIGH" ? "rgba(239,68,68,0.15)" : "var(--border-primary)"}`,
                background: v.severity === "HIGH" ? "rgba(239,68,68,0.04)" : "var(--bg-secondary)",
              }}>
                <span style={{
                  fontSize: 9, padding: "1px 5px", borderRadius: 4, fontWeight: 700, flexShrink: 0, marginTop: 2,
                  background: v.severity === "HIGH" ? "rgba(239,68,68,0.1)" : v.severity === "MEDIUM" ? "rgba(245,158,11,0.1)" : "var(--bg-tertiary)",
                  color: v.severity === "HIGH" ? "#ef4444" : v.severity === "MEDIUM" ? "#f59e0b" : "var(--text-tertiary)",
                }}>{v.severity}</span>
                <div>
                  <div style={{ fontSize: 12, color: "var(--text-primary)" }}>{v.vulnerability}</div>
                  <div style={{ fontSize: 10, color: "var(--text-tertiary)" }}>Exploited by: {v.exploited_by}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Preemptive Moves */}
        {report.preemptive_moves.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Preemptive Moves</div>
            {report.preemptive_moves.map((p, i) => (
              <div key={i} style={{ fontSize: 12, color: "var(--text-secondary)", padding: "4px 0", lineHeight: 1.5 }}>
                {i + 1}. {p}
              </div>
            ))}
          </div>
        )}

        {/* Scenarios */}
        {report.scenarios.length > 0 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Scenarios</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {report.scenarios.map((s, i) => {
                const colors = ["#22c55e", "#3b82f6", "#ef4444"];
                return (
                  <div key={i} style={{
                    padding: "10px 12px", borderRadius: 8,
                    border: `1px solid ${colors[i]}20`, background: `${colors[i]}05`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: colors[i] }}>{s.name}</span>
                      <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>{s.probability}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 4 }}>{s.description}</div>
                    <div style={{ fontSize: 10, color: "var(--text-tertiary)" }}>
                      Triggers: {s.triggers?.join(" • ") || "—"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ═══ Input State ═══ */
  return (
    <div style={{ padding: "24px 16px", maxWidth: 600, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <Swords size={20} style={{ color: "#D4AF37" }} />
        <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>War Game</span>
      </div>
      <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 16, lineHeight: 1.5 }}>
        Describe your market, your position, and your main competitors. 5 AI agents will play 3 rounds of competitive strategy using game theory.
      </p>

      <textarea
        value={market}
        onChange={e => setMarket(e.target.value)}
        placeholder="E.g.: I run a B2B SaaS for inventory management. $200K ARR, 50 customers. Main competitors are TradeGecko (acquired by Intuit) and Cin7. I'm cheaper but have fewer integrations. Considering raising prices 30%."
        style={{
          width: "100%", minHeight: 100, padding: "12px 14px", borderRadius: 10,
          border: "1px solid var(--border-primary)", background: "var(--bg-secondary)",
          color: "var(--text-primary)", fontSize: 13, resize: "vertical",
          lineHeight: 1.5, outline: "none", fontFamily: "inherit",
        }}
        onKeyDown={e => { if (e.key === "Enter" && e.metaKey) run(); }}
      />

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10, marginBottom: 16 }}>
        {PRESETS.map(p => (
          <button key={p} onClick={() => run(p)} style={{
            padding: "5px 10px", borderRadius: 6, fontSize: 11,
            border: "1px solid rgba(212,175,55,0.12)", background: "rgba(212,175,55,0.03)",
            color: "var(--text-secondary)", cursor: "pointer",
          }}>
            {p.length > 40 ? p.slice(0, 40) + "..." : p}
          </button>
        ))}
      </div>

      <button onClick={() => run()} disabled={!market.trim()} style={{
        width: "100%", padding: "12px", borderRadius: 10, border: "none",
        background: market.trim() ? "#D4AF37" : "var(--bg-tertiary)",
        color: market.trim() ? "#000" : "var(--text-tertiary)",
        fontSize: 13, fontWeight: 700, cursor: market.trim() ? "pointer" : "default",
      }}>
        Start War Game
      </button>

      {error && <div style={{ fontSize: 12, color: "#ef4444", marginTop: 10, textAlign: "center" }}>{error}</div>}
    </div>
  );
}
