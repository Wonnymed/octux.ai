"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { getProfile, updateProfile } from "../lib/profile";

/* ═══ Toast System ═══ */
type Toast = { id: number; message: string; type: "success" | "error" | "info"; dismissing?: boolean };
let toastId = 0;

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}${t.dismissing ? " dismissing" : ""}`} onClick={() => onDismiss(t.id)}>
          <span>{t.type === "success" ? "✓" : t.type === "error" ? "⚠" : "ℹ"}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══ Keyboard Shortcuts Modal ═══ */
const SHORTCUTS = [
  { keys: ["⌘", "K"], desc: "Focar no input" },
  { keys: ["⌘", "⇧", "S"], desc: "Alternar Chat / Simulate" },
  { keys: ["⌘", "N"], desc: "Nova conversa" },
  { keys: ["Esc"], desc: "Fechar sidebar / modal" },
  { keys: ["?"], desc: "Mostrar atalhos" },
];

const GOLD = "#C9A84C";
const SERIF = "'Cormorant Garamond', serif";
const SANS = "'DM Sans', sans-serif";

const AGENTS = [
  { id: "auto", label: "Auto", desc: "Signux routes automatically", icon: "⚡" },
  { id: "offshore", label: "Offshore", desc: "International structuring", icon: "🏛️" },
  { id: "china", label: "China Ops", desc: "Import & suppliers", icon: "🇨🇳" },
  { id: "opsec", label: "OPSEC", desc: "Crypto security", icon: "🔐" },
  { id: "geointel", label: "GeoIntel", desc: "Geopolitics & macro", icon: "🌍" },
  { id: "language", label: "Language", desc: "Translation & contracts", icon: "🗣️" },
];

const SUGGESTIONS = [
  "Quero abrir empresa em Hong Kong",
  "Melhor estrutura para importar da China",
  "Como proteger $100K em crypto",
  "Impacto do conflito no Oriente Médio",
  "Traduz este contrato em mandarim",
  "Dubai vs Singapura para residência fiscal",
];

const SIM_EXAMPLES = [
  { emoji: "🇨🇳", text: "Importar 3.000 smartwatches de Guangzhou para o Brasil via FOB" },
  { emoji: "🏛️", text: "Abrir holding em Hong Kong morando no Brasil, volume de $20K/mês" },
  { emoji: "☕", text: "Exportar café especial brasileiro para distribuidores na China" },
];

const SIM_STAGES = [
  { icon: "🔍", label: "Extraindo entidades e relações" },
  { icon: "👥", label: "Gerando agentes especializados" },
  { icon: "⚡", label: "Rodando simulação multi-agente" },
  { icon: "💬", label: "Agentes debatendo cenários" },
  { icon: "📊", label: "Compilando relatório final" },
];

const ENTITY_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  product: { bg: "rgba(59,130,246,0.1)", color: "#3B82F6", border: "rgba(59,130,246,0.15)" },
  country: { bg: "rgba(34,197,94,0.1)", color: "#22C55E", border: "rgba(34,197,94,0.15)" },
  company: { bg: "rgba(168,85,247,0.1)", color: "#A855F7", border: "rgba(168,85,247,0.15)" },
  market: { bg: "rgba(168,85,247,0.1)", color: "#A855F7", border: "rgba(168,85,247,0.15)" },
  regulation: { bg: "rgba(239,68,68,0.1)", color: "#EF4444", border: "rgba(239,68,68,0.15)" },
  currency: { bg: "rgba(201,168,76,0.1)", color: "#C9A84C", border: "rgba(201,168,76,0.15)" },
  person: { bg: "rgba(59,130,246,0.1)", color: "#3B82F6", border: "rgba(59,130,246,0.15)" },
};
const DEFAULT_ENTITY_COLOR = { bg: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "rgba(255,255,255,0.1)" };

type Message = { role: "user" | "assistant"; content: string };

const OPERATIONS = ["Import/Export", "Offshore/Holdings", "Crypto", "Serviços digitais", "E-commerce", "Investimentos", "Outro"];

const MD_COMPONENTS = {
  h1: ({ children }: any) => <h1 style={{ fontSize: 20, fontWeight: 500, fontFamily: SERIF, marginBottom: 12, marginTop: 16, color: GOLD }}>{children}</h1>,
  h2: ({ children }: any) => <h2 style={{ fontSize: 17, fontWeight: 500, fontFamily: SERIF, marginBottom: 10, marginTop: 14, color: GOLD }}>{children}</h2>,
  h3: ({ children }: any) => <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 8, marginTop: 12, color: "rgba(255,255,255,0.85)" }}>{children}</h3>,
  p: ({ children }: any) => <p style={{ marginBottom: 10, lineHeight: 1.8 }}>{children}</p>,
  ul: ({ children }: any) => <ul style={{ paddingLeft: 20, marginBottom: 10 }}>{children}</ul>,
  ol: ({ children }: any) => <ol style={{ paddingLeft: 20, marginBottom: 10 }}>{children}</ol>,
  li: ({ children }: any) => <li style={{ marginBottom: 6, lineHeight: 1.7 }}>{children}</li>,
  strong: ({ children }: any) => <strong style={{ color: "rgba(255,255,255,0.95)", fontWeight: 500 }}>{children}</strong>,
  code: ({ children, className }: any) => {
    const isBlock = className?.includes("language-");
    if (isBlock) return <pre style={{ background: "rgba(201,168,76,0.06)", padding: 16, borderRadius: 8, overflow: "auto", marginBottom: 12 }}><code style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: GOLD }}>{children}</code></pre>;
    return <code style={{ background: "rgba(201,168,76,0.08)", padding: "2px 6px", borderRadius: 4, fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: GOLD }}>{children}</code>;
  },
  blockquote: ({ children }: any) => <blockquote style={{ borderLeft: `2px solid rgba(201,168,76,0.3)`, paddingLeft: 16, margin: "12px 0", color: "rgba(255,255,255,0.5)" }}>{children}</blockquote>,
  table: ({ children }: any) => <div style={{ overflowX: "auto", marginBottom: 12 }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>{children}</table></div>,
  th: ({ children }: any) => <th style={{ textAlign: "left" as const, padding: "8px 12px", borderBottom: "1px solid rgba(201,168,76,0.2)", color: GOLD, fontWeight: 500, fontSize: 12 }}>{children}</th>,
  td: ({ children }: any) => <td style={{ padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.7)" }}>{children}</td>,
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [agent, setAgent] = useState("auto");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [onboarded, setOnboarded] = useState<boolean | null>(null);
  const [onboardName, setOnboardName] = useState("");
  const [onboardCountry, setOnboardCountry] = useState("");
  const [onboardOps, setOnboardOps] = useState<string[]>([]);
  const [rates, setRates] = useState<any>(null);
  const [profileName, setProfileName] = useState("");
  const [mode, setMode] = useState<"chat" | "simulate">("chat");
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);
  const [simScenario, setSimScenario] = useState("");
  const [simStage, setSimStage] = useState(0);
  const [simLiveAgents, setSimLiveAgents] = useState<{ emoji: string; name: string; done: boolean }[]>([]);
  const [resultTab, setResultTab] = useState<"report" | "simulation" | "graph">("report");
  const [tokenCount, setTokenCount] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Record<number, string>>({});
  const [hoveredMsg, setHoveredMsg] = useState<number | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const addToast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, dismissing: true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
    }, 3000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, dismissing: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
  }, []);

  useEffect(() => {
    const profile = getProfile();
    setOnboarded(!!profile);
    if (profile) setProfileName(profile.name);
    fetch("/api/rates").then(r => r.json()).then(setRates).catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;

      if (meta && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (meta && e.shiftKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        setMode(prev => prev === "chat" ? "simulate" : "chat");
      } else if (meta && e.key === "n") {
        e.preventDefault();
        if (mode === "chat") { setMessages([]); } else { setSimResult(null); setSimScenario(""); setSimulating(false); }
        addToast(mode === "chat" ? "Nova conversa" : "Nova simulação", "info");
      } else if (e.key === "Escape") {
        setSidebarOpen(false);
        setShowShortcuts(false);
      } else if (e.key === "?" && !e.metaKey && !e.ctrlKey && document.activeElement?.tagName !== "TEXTAREA" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        setShowShortcuts(prev => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mode, addToast]);

  const send = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    const userMsg: Message = { role: "user", content: msg };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const assistantMsg: Message = { role: "assistant", content: "" };
    setMessages([...newMessages, assistantMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, agent, profile: getProfile(), rates }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let buffer = "";

      if (reader) {
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

              if (data.type === "text") {
                fullText += data.text;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content: fullText };
                  return updated;
                });
              } else if (data.type === "tool") {
                fullText += `\n\n---\n**🔧 ${data.name.replace(/_/g, " ")}**\n`;
                if (data.result?.breakdown) {
                  fullText += "\n| Item | Valor |\n|---|---|\n";
                  Object.entries(data.result.breakdown).forEach(([k, v]) => {
                    fullText += `| ${k.replace(/_/g, " ")} | ${v} |\n`;
                  });
                } else if (data.result && !data.result.error) {
                  Object.entries(data.result).forEach(([k, v]) => {
                    if (k !== "note") fullText += `- **${k.replace(/_/g, " ")}**: ${v}\n`;
                  });
                  if (data.result.note) fullText += `\n> ${data.result.note}\n`;
                }
                fullText += "\n---\n\n";
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content: fullText };
                  return updated;
                });
              } else if (data.type === "error") {
                fullText += `\n\nErro: ${data.message}`;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content: fullText };
                  return updated;
                });
              }
            } catch {}
          }
        }
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: "Erro de conexão. Tente novamente." };
        return updated;
      });
    }
    setLoading(false);
    inputRef.current?.focus();
  };

  const simulate = async () => {
    if (!simScenario.trim()) return;
    setSimulating(true);
    setSimResult(null);
    setSimLiveAgents([]);
    setSimStage(0);
    setResultTab("report");

    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: simScenario, context: getProfile() }),
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
            if (data.type === "stage") {
              setSimStage(data.stage);
            } else if (data.type === "agent_start") {
              setSimLiveAgents(prev => [...prev, { emoji: data.emoji, name: data.agentName, done: false }]);
            } else if (data.type === "agent_done") {
              setSimLiveAgents(prev => prev.map(a => a.name === data.agentName && !a.done ? { ...a, done: true } : a));
            } else if (data.type === "complete") {
              setSimResult(data.result);
            } else if (data.type === "error") {
              setSimResult({ error: data.error || "Erro na simulação." });
            }
          } catch {}
        }
      }
    } catch {
      setSimResult({ error: "Erro na simulação. Tente novamente." });
    }
    setSimulating(false);
  };

  const exportReport = () => {
    if (!simResult || simResult.error) return;
    const agents = (simResult.stages?.agents || []).map((a: any) => `${a.emoji} ${a.name} — ${a.role}`).join("\n");
    const sim = (simResult.simulation || []).map((m: any) => `[${m.emoji} ${m.agentName} — Round ${m.round}]\n${m.content}`).join("\n\n---\n\n");
    const text = `SIGNUX AI — SIMULATION REPORT\n${"=".repeat(50)}\n\nDate: ${new Date().toLocaleString()}\nAgents: ${simResult.metadata?.agents_count}\nRounds: ${simResult.metadata?.rounds}\nInteractions: ${simResult.metadata?.total_interactions}\n\nAGENTS:\n${agents}\n\n${"=".repeat(50)}\n\nFULL REPORT:\n\n${simResult.report}\n\n${"=".repeat(50)}\n\nSIMULATION LOG:\n\n${sim}`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `signux-simulation-${Date.now()}.txt`;
    a.click();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [hasSentFirst, setHasSentFirst] = useState(false);
  const messagesAreaRef = useRef<HTMLDivElement>(null);

  const activeAgent = AGENTS.find(a => a.id === agent) || AGENTS[0];
  const canSubmitOnboard = onboardName.trim() && onboardCountry.trim();

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 6) return "Boa madrugada";
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  };

  const getTimestamp = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
  };

  const userInitials = profileName ? profileName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "OP";

  // Scroll-to-bottom visibility
  useEffect(() => {
    const area = messagesAreaRef.current;
    if (!area) return;
    const onScroll = () => {
      const distFromBottom = area.scrollHeight - area.scrollTop - area.clientHeight;
      setShowScrollBtn(distFromBottom > 200);
    };
    area.addEventListener("scroll", onScroll);
    return () => area.removeEventListener("scroll", onScroll);
  }, [messages.length]);

  /* ══════════════════════════════════════════════════════ */
  /* ONBOARDING FULLSCREEN                                  */
  /* ══════════════════════════════════════════════════════ */
  if (onboarded === false) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#0A0A0A" }}>
        <div style={{ maxWidth: 440, width: "100%", padding: "48px 40px" }}>
          <div style={{ fontSize: 14, letterSpacing: "0.3em", color: GOLD, fontFamily: SERIF, textAlign: "center", marginBottom: 4 }}>SIGNUX</div>
          <div style={{ fontSize: 9, letterSpacing: "0.12em", color: "rgba(255,255,255,0.15)", textAlign: "center", textTransform: "uppercase", marginBottom: 48 }}>Operational Intelligence</div>
          <div style={{ width: 40, height: 1, background: "rgba(201,168,76,0.2)", margin: "0 auto 48px" }} />
          <div style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", textAlign: "center", fontFamily: SERIF, fontStyle: "italic", marginBottom: 40 }}>Antes de começar, preciso de contexto.</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ marginBottom: 32 }}>
              <label style={{ fontSize: 10, letterSpacing: "0.12em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: 8, display: "block" }}>Seu nome</label>
              <input value={onboardName} onChange={e => setOnboardName(e.target.value)} placeholder="Como quer ser chamado" className="onboard-input"
                style={{ width: "100%", padding: "14px 0", background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.08)", color: "white", fontSize: 15, fontFamily: SANS, outline: "none" }} />
            </div>
            <div style={{ marginBottom: 32 }}>
              <label style={{ fontSize: 10, letterSpacing: "0.12em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: 8, display: "block" }}>País de residência fiscal</label>
              <input value={onboardCountry} onChange={e => setOnboardCountry(e.target.value)} placeholder="Ex: Brasil, Portugal, EUA" className="onboard-input"
                style={{ width: "100%", padding: "14px 0", background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.08)", color: "white", fontSize: 15, fontFamily: SANS, outline: "none" }} />
            </div>
            <div style={{ marginBottom: 40 }}>
              <label style={{ fontSize: 10, letterSpacing: "0.12em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: 8, display: "block" }}>O que você opera?</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {OPERATIONS.map(op => (
                  <button key={op} onClick={() => setOnboardOps(prev => prev.includes(op) ? prev.filter(o => o !== op) : [...prev, op])} className="onboard-pill"
                    style={{ padding: "8px 18px", borderRadius: 20, fontSize: 12, cursor: "pointer", transition: "all 0.2s", fontFamily: SANS,
                      background: onboardOps.includes(op) ? "rgba(201,168,76,0.08)" : "transparent",
                      border: onboardOps.includes(op) ? "1px solid rgba(201,168,76,0.2)" : "1px solid rgba(255,255,255,0.08)",
                      color: onboardOps.includes(op) ? GOLD : "rgba(255,255,255,0.35)" }}>
                    {op}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => { if (!canSubmitOnboard) return; updateProfile({ name: onboardName.trim(), taxResidence: onboardCountry.trim(), operations: onboardOps }); setProfileName(onboardName.trim()); setOnboarded(true); }}
              disabled={!canSubmitOnboard}
              style={{ width: "100%", padding: 16, borderRadius: 8, background: "linear-gradient(135deg, #C9A84C, #A0832A)", color: "#0A0A0A", fontSize: 13, fontWeight: 600, fontFamily: SERIF, letterSpacing: "0.15em", textTransform: "uppercase", border: "none", cursor: canSubmitOnboard ? "pointer" : "not-allowed", marginTop: 8, opacity: canSubmitOnboard ? 1 : 0.4, transition: "opacity 0.2s" }}>
              Começar
            </button>
          </div>
        </div>
        <style>{`
          .onboard-input::placeholder { color: rgba(255,255,255,0.15); }
          .onboard-input:focus { border-bottom-color: rgba(201,168,76,0.3) !important; }
          .onboard-pill:hover { border-color: rgba(255,255,255,0.15) !important; }
        `}</style>
      </div>
    );
  }

  if (onboarded === null) return null;

  /* ══════════════════════════════════════════════════════ */
  /* SIMULATION RENDERER                                    */
  /* ══════════════════════════════════════════════════════ */
  const renderSimulation = () => {
    /* ── INPUT ── */
    if (!simResult && !simulating) {
      return (
        <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div className="sim-input-container" style={{ maxWidth: 640, width: "100%", textAlign: "center" }}>
            <div className="sim-pulse-icon" style={{ fontSize: 48, color: GOLD, marginBottom: 24 }}>◉</div>
            <div style={{ fontSize: 36, fontFamily: SERIF, fontWeight: 300, color: "white", marginBottom: 4 }}>Simulation Engine</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.25)", lineHeight: 1.7, marginBottom: 48 }}>
              Descreva um cenário de negócio. Signux cria agentes especializados,<br />simula a operação e entrega um relatório completo.
            </div>
            <textarea
              value={simScenario} onChange={e => setSimScenario(e.target.value)}
              placeholder="Ex: Quero importar 5.000 fones bluetooth de Shenzhen para São Paulo. Budget de $15.000. Nunca importei antes."
              className="sim-textarea"
              style={{ width: "100%", minHeight: 140, padding: 24, borderRadius: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", color: "white", fontSize: 15, lineHeight: 1.7, fontFamily: SANS, resize: "vertical", outline: "none" }}
            />
            <div style={{ fontSize: 9, letterSpacing: "0.15em", color: "rgba(255,255,255,0.15)", marginTop: 32, marginBottom: 16, textTransform: "uppercase" }}>Cenários exemplo</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {SIM_EXAMPLES.map(ex => (
                <div key={ex.text} onClick={() => setSimScenario(ex.text)}
                  className="sim-example-card"
                  style={{ padding: "14px 20px", borderRadius: 10, background: "transparent", border: "1px solid rgba(255,255,255,0.04)", fontSize: 13, color: "rgba(255,255,255,0.3)", cursor: "pointer", transition: "all 0.2s", textAlign: "left", width: "100%" }}>
                  {ex.emoji} {ex.text}
                </div>
              ))}
            </div>
            <button onClick={simulate} disabled={!simScenario.trim()}
              style={{ width: "100%", padding: 18, borderRadius: 12, background: "linear-gradient(135deg, #C9A84C, #A0832A)", color: "#0A0A0A", fontSize: 13, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", border: "none", cursor: simScenario.trim() ? "pointer" : "not-allowed", marginTop: 32, opacity: simScenario.trim() ? 1 : 0.3, transition: "opacity 0.2s", fontFamily: SERIF }}>
              Iniciar Simulação
            </button>
          </div>
        </div>
      );
    }

    /* ── SIMULATING ── */
    if (simulating) {
      return (
        <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ maxWidth: 500, width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: 24, fontFamily: SERIF, color: "white", marginBottom: 8 }}>Simulação em andamento</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", marginBottom: 48 }}>Múltiplos agentes analisando seu cenário...</div>
            {/* Pipeline stages */}
            <div style={{ display: "flex", flexDirection: "column", gap: 0, textAlign: "left" }}>
              {SIM_STAGES.map((stage, idx) => {
                const isDone = idx < simStage;
                const isCurrent = idx === simStage;
                return (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 0" }}>
                    <span style={{ fontSize: 18, width: 28, textAlign: "center", ...(isDone ? { color: GOLD } : isCurrent ? { animation: "iconPulse 1.5s ease-in-out infinite" } : { opacity: 0.2 }) }}>
                      {isDone ? "✓" : stage.icon}
                    </span>
                    <span style={{ fontSize: 14, fontFamily: SANS, ...(isDone ? { color: "rgba(255,255,255,0.5)" } : isCurrent ? { color: "white", fontWeight: 500 } : { color: "rgba(255,255,255,0.15)" }) }}>
                      {stage.label}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Live agent updates */}
            {simLiveAgents.length > 0 && (
              <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 6, textAlign: "left" }}>
                <div style={{ fontSize: 9, letterSpacing: "0.12em", color: "rgba(255,255,255,0.15)", textTransform: "uppercase", marginBottom: 4 }}>Agentes</div>
                {simLiveAgents.map((a, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ fontSize: 14, ...(a.done ? {} : { animation: "iconPulse 1.5s ease-in-out infinite" }) }}>{a.emoji}</span>
                    <span style={{ fontSize: 12, color: a.done ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.7)", flex: 1 }}>{a.name}</span>
                    <span style={{ fontSize: 10, color: a.done ? GOLD : "rgba(255,255,255,0.15)" }}>{a.done ? "✓" : "..."}</span>
                  </div>
                ))}
              </div>
            )}
            {/* Progress bar */}
            <div style={{ width: "100%", height: 2, background: "rgba(255,255,255,0.04)", borderRadius: 1, marginTop: 24 }}>
              <div style={{ height: "100%", background: "linear-gradient(90deg, #C9A84C, #A0832A)", borderRadius: 1, transition: "width 0.5s ease", width: `${(simStage / 4) * 100}%` }} />
            </div>
          </div>
        </div>
      );
    }

    /* ── ERROR ── */
    if (simResult?.error) {
      return (
        <div style={{ flex: 1, padding: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>{simResult.error}</div>
            <button onClick={() => setSimResult(null)} style={{ padding: "10px 24px", borderRadius: 8, background: "rgba(201,168,76,0.1)", border: `1px solid ${GOLD}`, color: GOLD, fontSize: 13, cursor: "pointer", fontFamily: SANS }}>Tentar novamente</button>
          </div>
        </div>
      );
    }

    /* ── RESULT ── */
    if (simResult) {
      const meta = simResult.metadata || {};
      const stagesData = simResult.stages || {};
      const simAgents = stagesData.agents || [];
      const simParams = stagesData.simulation_parameters || {};
      const graph = stagesData.graph || {};
      const simulation = simResult.simulation || [];

      return (
        <div style={{ flex: 1, overflowY: "auto", padding: 32 }} className="sim-result-outer">
          {/* Header */}
          <div className="sim-result-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, maxWidth: 1000, margin: "0 auto 32px", flexWrap: "wrap", gap: 12 }}>
            <div style={{ fontSize: 24, fontFamily: SERIF, color: "white" }}>Resultado da Simulação</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { setSimResult(null); setSimScenario(""); }}
                style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", background: "transparent", border: "1px solid rgba(255,255,255,0.06)", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontFamily: SANS, transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}>
                Nova simulação
              </button>
              <button onClick={exportReport}
                style={{ fontSize: 12, color: "#0A0A0A", background: GOLD, border: "none", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontFamily: SANS, fontWeight: 500 }}>
                Exportar
              </button>
            </div>
          </div>

          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            {/* Metadata cards */}
            <div className="sim-meta-cards" style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap" }}>
              {[
                { value: `${meta.agents_count || 0}`, label: "Especialistas" },
                { value: `${meta.rounds || 0}`, label: "Rodadas" },
                { value: `${meta.total_interactions || 0}`, label: "Interações" },
                { value: simParams.scenario_type || "—", label: "Tipo" },
              ].map(card => (
                <div key={card.label} style={{ flex: "1 1 140px", padding: 16, borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ fontSize: 18, fontFamily: SERIF, color: GOLD, marginBottom: 4 }}>{card.value}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{card.label}</div>
                </div>
              ))}
            </div>

            {/* Agents */}
            <div style={{ fontSize: 9, letterSpacing: "0.15em", color: "rgba(255,255,255,0.15)", marginBottom: 16, textTransform: "uppercase" }}>Agentes na simulação</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 32 }}>
              {simAgents.map((a: any) => (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ fontSize: 16 }}>{a.emoji}</span>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{a.name}</span>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>{a.role}</span>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 0, marginBottom: 24, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              {(["report", "simulation", "graph"] as const).map(tab => (
                <button key={tab} onClick={() => setResultTab(tab)}
                  style={{ padding: "12px 24px", fontSize: 12, letterSpacing: "0.08em", cursor: "pointer", background: "none", border: "none", borderBottom: resultTab === tab ? `2px solid ${GOLD}` : "2px solid transparent", color: resultTab === tab ? GOLD : "rgba(255,255,255,0.25)", fontFamily: SANS, transition: "all 0.2s", textTransform: "capitalize" }}>
                  {tab === "report" ? "Relatório" : tab === "simulation" ? "Simulação" : "Grafo"}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {resultTab === "report" && (
              <div style={{ padding: "24px 28px", borderRadius: 14, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", fontSize: 14, lineHeight: 1.8, color: "rgba(255,255,255,0.75)", fontFamily: SANS }}>
                <ReactMarkdown components={MD_COMPONENTS}>{simResult.report || ""}</ReactMarkdown>
              </div>
            )}

            {resultTab === "simulation" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {simulation.map((msg: any, i: number) => (
                  <div key={i} style={{ padding: 20, borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <span style={{ fontSize: 20 }}>{msg.emoji}</span>
                      <span style={{ fontSize: 14, fontWeight: 500, color: "white" }}>{msg.agentName}</span>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{msg.role}</span>
                      <span style={{ fontSize: 10, color: "rgba(201,168,76,0.4)", marginLeft: "auto", padding: "2px 8px", borderRadius: 10, background: "rgba(201,168,76,0.06)" }}>Round {msg.round}</span>
                    </div>
                    <div style={{ fontSize: 14, lineHeight: 1.8, color: "rgba(255,255,255,0.7)", whiteSpace: "pre-wrap" }}>{msg.content}</div>
                  </div>
                ))}
              </div>
            )}

            {resultTab === "graph" && (
              <div>
                {/* Entities */}
                <div style={{ fontSize: 9, letterSpacing: "0.15em", color: "rgba(255,255,255,0.15)", marginBottom: 16, textTransform: "uppercase" }}>Entidades</div>
                <div style={{ marginBottom: 32 }}>
                  {(graph.entities || []).map((e: any, i: number) => {
                    const c = ENTITY_COLORS[e.type] || DEFAULT_ENTITY_COLOR;
                    return (
                      <span key={i} style={{ padding: "6px 14px", borderRadius: 16, fontSize: 12, marginRight: 6, marginBottom: 6, display: "inline-block", background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
                        {e.name} <span style={{ opacity: 0.6, fontSize: 10 }}>({e.type})</span>
                      </span>
                    );
                  })}
                </div>

                {/* Relationships */}
                <div style={{ fontSize: 9, letterSpacing: "0.15em", color: "rgba(255,255,255,0.15)", marginBottom: 16, textTransform: "uppercase" }}>Relações</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {(graph.relationships || []).map((r: any, i: number) => (
                    <div key={i} style={{ padding: "10px 16px", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                      <span style={{ color: "rgba(255,255,255,0.7)" }}>{r.from}</span>
                      <span style={{ color: GOLD, margin: "0 8px" }}>→</span>
                      <span style={{ color: "rgba(255,255,255,0.7)" }}>{r.to}</span>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginLeft: 8 }}>({r.type})</span>
                      {r.details && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 4 }}>{r.details}</div>}
                    </div>
                  ))}
                </div>

                {/* Key variables */}
                {graph.key_variables?.length > 0 && (
                  <>
                    <div style={{ fontSize: 9, letterSpacing: "0.15em", color: "rgba(255,255,255,0.15)", marginTop: 32, marginBottom: 16, textTransform: "uppercase" }}>Variáveis-chave</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {graph.key_variables.map((v: string, i: number) => (
                        <span key={i} style={{ padding: "4px 12px", borderRadius: 12, fontSize: 12, background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.1)", color: "rgba(255,255,255,0.4)" }}>{v}</span>
                      ))}
                    </div>
                  </>
                )}

                {/* Critical questions */}
                {graph.critical_questions?.length > 0 && (
                  <>
                    <div style={{ fontSize: 9, letterSpacing: "0.15em", color: "rgba(255,255,255,0.15)", marginTop: 32, marginBottom: 16, textTransform: "uppercase" }}>Questões críticas</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {graph.critical_questions.map((q: string, i: number) => (
                        <div key={i} style={{ padding: "10px 16px", borderRadius: 8, background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.08)", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{q}</div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  /* ══════════════════════════════════════════════════════ */
  /* MAIN APP                                               */
  /* ══════════════════════════════════════════════════════ */
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", zIndex: 40, animation: "fadeIn 0.2s ease" }} />
      )}

      {/* ═══ SIDEBAR ═══ */}
      <aside className={`sidebar${sidebarOpen ? " open" : ""}`} style={{ width: 270, background: "#080808", borderRight: "1px solid rgba(255,255,255,0.05)", padding: "20px 16px", flexShrink: 0, display: "flex", flexDirection: "column", zIndex: 50 }}>
        {/* Logo */}
        <div style={{ padding: "0 4px", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 11, color: GOLD, fontFamily: SERIF, fontWeight: 500 }}>S</span>
            </div>
            <span style={{ fontSize: 17, letterSpacing: "0.2em", color: GOLD, fontFamily: SERIF, fontWeight: 300 }}>SIGNUX</span>
          </div>
          <div style={{ fontSize: 9, letterSpacing: "0.1em", color: "rgba(255,255,255,0.12)", textTransform: "uppercase", marginLeft: 34 }}>Operational Intelligence</div>
        </div>

        {/* Mode toggle */}
        <div style={{ display: "flex", marginBottom: 20, borderRadius: 8, overflow: "hidden", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <button onClick={() => setMode("chat")}
            style={{ flex: 1, padding: "10px 0", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", background: mode === "chat" ? "rgba(201,168,76,0.06)" : "transparent", color: mode === "chat" ? GOLD : "rgba(255,255,255,0.2)", border: "none", cursor: "pointer", fontFamily: SANS, transition: "all 0.2s" }}>
            Chat
          </button>
          <button onClick={() => { setMode("simulate"); setSimResult(null); setSimulating(false); }}
            style={{ flex: 1, padding: "10px 0", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", background: mode === "simulate" ? "rgba(201,168,76,0.06)" : "transparent", color: mode === "simulate" ? GOLD : "rgba(255,255,255,0.2)", border: "none", cursor: "pointer", fontFamily: SANS, transition: "all 0.2s" }}>
            Simulate
          </button>
        </div>

        <div style={{ height: 1, background: "rgba(255,255,255,0.04)", marginBottom: 16 }} />

        {mode === "chat" && (
          <>
            <div style={{ fontSize: 9, letterSpacing: "0.15em", color: "rgba(255,255,255,0.12)", textTransform: "uppercase", marginBottom: 12, padding: "0 4px" }}>Agents</div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {AGENTS.map(a => (
                <div key={a.id} onClick={() => { setAgent(a.id); setSidebarOpen(false); }}
                  style={{ padding: "10px 12px", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "all 0.2s", marginBottom: 2, position: "relative",
                    background: agent === a.id ? "rgba(201,168,76,0.04)" : "transparent",
                    borderLeft: agent === a.id ? `2px solid ${GOLD}` : "2px solid transparent",
                  }}
                  onMouseEnter={e => { if (agent !== a.id) e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                  onMouseLeave={e => { if (agent !== a.id) e.currentTarget.style.background = "transparent"; }}>
                  <span style={{ fontSize: 18, width: 28, textAlign: "center" }}>{a.icon}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: agent === a.id ? "white" : "rgba(255,255,255,0.7)", fontWeight: agent === a.id ? 500 : 400 }}>{a.label}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {mode === "simulate" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 9, letterSpacing: "0.15em", color: "rgba(255,255,255,0.12)", textTransform: "uppercase", marginBottom: 12, padding: "0 4px" }}>Pipeline</div>
            {SIM_STAGES.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px" }}>
                <span style={{ fontSize: 14, width: 28, textAlign: "center" }}>{s.icon}</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Bottom section */}
        <div style={{ marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 12 }}>
          <button
            onClick={() => { if (mode === "chat") { setMessages([]); setHasSentFirst(false); } else { setSimResult(null); setSimScenario(""); setSimulating(false); } setSidebarOpen(false); addToast(mode === "chat" ? "Nova conversa" : "Nova simulação", "info"); }}
            style={{ width: "100%", fontSize: 11, color: "rgba(255,255,255,0.2)", cursor: "pointer", padding: "8px 12px", background: "none", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 8, textAlign: "left", fontFamily: SANS, transition: "all 0.2s", marginBottom: 12 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.2)"; }}>
            + {mode === "chat" ? "Nova conversa" : "Nova simulação"}
          </button>
          {/* User profile */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 4px" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid rgba(201,168,76,0.2)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: GOLD, fontWeight: 500, flexShrink: 0 }}>{userInitials}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{profileName || "Operador"}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.15)" }}>v0.1 Beta</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ═══ MAIN ═══ */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", background: "#0A0A0A", minWidth: 0 }}>
        {/* Header */}
        <header style={{ padding: "12px 24px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => setSidebarOpen(true)} className="mobile-menu-btn" style={{ display: "none", background: "none", border: "none", color: "white", fontSize: 18, cursor: "pointer", padding: 4 }}>☰</button>
            {/* Breadcrumb */}
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.15)" }}>SIGNUX</span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.1)" }}>›</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>{mode === "chat" ? "Chat" : "Simulate"}</span>
            {mode === "chat" && (
              <>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.1)" }}>›</span>
                <span style={{ fontSize: 14, marginRight: 2 }}>{activeAgent.icon}</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>{activeAgent.label}</span>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E", marginLeft: 4, animation: "goldPulse 3s ease-in-out infinite" }} />
              </>
            )}
            {mode === "simulate" && (
              <>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.1)" }}>›</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Engine</span>
              </>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {tokenCount > 0 && <div className="rates-ticker" style={{ fontSize: 9, color: "rgba(255,255,255,0.1)" }}>{tokenCount.toLocaleString()} tokens</div>}
            {rates && <div className="rates-ticker" style={{ fontSize: 9, color: "rgba(255,255,255,0.12)", padding: "3px 8px", borderRadius: 6, background: "rgba(255,255,255,0.02)" }}>USD/BRL {rates.USDBRL?.toFixed(2)} · USD/CNY {rates.USDCNY?.toFixed(2)}</div>}
            {mode === "chat" && messages.length > 0 && (
              <button onClick={() => { const text = messages.map(m => (m.role === "user" ? "Você: " : "Signux: ") + m.content).join("\n\n---\n\n"); const blob = new Blob([text], { type: "text/plain" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "signux-conversa.txt"; a.click(); addToast("Conversa exportada", "success"); }}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "rgba(255,255,255,0.15)", padding: 4, transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = GOLD)} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.15)")} title="Exportar conversa">↓</button>
            )}
            <button onClick={() => setShowShortcuts(true)} style={{ background: "none", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6, padding: "2px 6px", cursor: "pointer", fontSize: 11, color: "rgba(255,255,255,0.15)", fontFamily: "'JetBrains Mono', monospace", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.15)"; e.currentTarget.style.color = GOLD; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.15)"; }}
              title="Atalhos de teclado">?</button>
          </div>
        </header>

        {/* Content */}
        {mode === "simulate" ? renderSimulation() : (
          <>
            <div ref={messagesAreaRef} style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", position: "relative" }} className="messages-area">
              {messages.length === 0 ? (
                /* ═══ WELCOME STATE ═══ */
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, textAlign: "center", maxWidth: 640, margin: "0 auto", width: "100%" }}>
                  <div className="welcome-title" style={{ fontSize: 32, fontFamily: SERIF, fontWeight: 300, color: "white", marginBottom: 6, animation: "fadeInUp 0.5s ease-out" }}>
                    {getGreeting()}, {profileName || "Operador"}.
                  </div>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.2)", marginBottom: 20, animation: "fadeInUp 0.6s ease-out" }}>
                    Seus agentes estão prontos.
                  </div>
                  {/* Agent icons */}
                  <div style={{ display: "flex", gap: 6, marginBottom: 40, animation: "fadeInUp 0.7s ease-out" }}>
                    {AGENTS.filter(a => a.id !== "auto").map(a => (
                      <div key={a.id} onClick={() => setAgent(a.id)}
                        style={{ width: 36, height: 36, borderRadius: 10, background: agent === a.id ? "rgba(201,168,76,0.08)" : "rgba(255,255,255,0.03)", border: agent === a.id ? "1px solid rgba(201,168,76,0.15)" : "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, cursor: "pointer", transition: "all 0.2s" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.15)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = agent === a.id ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.05)"; e.currentTarget.style.transform = "translateY(0)"; }}
                        title={a.label}>
                        {a.icon}
                      </div>
                    ))}
                  </div>
                  {/* Quick Actions */}
                  <div style={{ fontSize: 9, letterSpacing: "0.15em", color: "rgba(255,255,255,0.1)", textTransform: "uppercase", marginBottom: 12, animation: "fadeInUp 0.8s ease-out" }}>Quick Actions</div>
                  <div className="suggestions-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, width: "100%", animation: "fadeInUp 0.9s ease-out" }}>
                    {SUGGESTIONS.map(s => (
                      <div key={s} onClick={() => { send(s); setHasSentFirst(true); }}
                        className="card-hover"
                        style={{ padding: "16px 20px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", fontSize: 13, color: "rgba(255,255,255,0.35)", cursor: "pointer", textAlign: "left", lineHeight: 1.5 }}>
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* ═══ MESSAGES ═══ */
                <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 800, margin: "0 auto", width: "100%" }}>
                  {messages.map((m, i) => (
                    <div key={i}
                      onMouseEnter={() => setHoveredMsg(i)}
                      onMouseLeave={() => setHoveredMsg(null)}
                      style={{ display: "flex", gap: 10, animation: "fadeInUp 0.3s ease-out", alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: m.role === "user" ? "75%" : "85%", flexDirection: m.role === "user" ? "row-reverse" : "row", alignItems: "flex-start" }}>
                      {/* Avatar */}
                      <div style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 4,
                        ...(m.role === "user"
                          ? { border: "1px solid rgba(201,168,76,0.2)", fontSize: 10, color: GOLD, fontWeight: 500 }
                          : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", fontSize: 14 }) }}>
                        {m.role === "user" ? userInitials : activeAgent.icon}
                      </div>
                      {/* Bubble */}
                      <div style={{ position: "relative", flex: 1 }}>
                        <div style={{
                          padding: m.role === "user" ? "12px 18px" : "16px 20px",
                          borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                          background: m.role === "user" ? "rgba(201,168,76,0.06)" : "rgba(255,255,255,0.02)",
                          border: m.role === "user" ? "1px solid rgba(201,168,76,0.08)" : "1px solid rgba(255,255,255,0.04)",
                          fontSize: 14, lineHeight: 1.8, fontFamily: SANS, wordBreak: "break-word" as const,
                          color: m.role === "user" ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.75)",
                          ...(m.role === "user" ? { whiteSpace: "pre-wrap" as const } : {}),
                        }}>
                          {m.role === "user" ? m.content : (
                            <>
                              <ReactMarkdown components={MD_COMPONENTS}>{m.content}</ReactMarkdown>
                              {loading && i === messages.length - 1 && (
                                <span style={{ display: "inline-block", width: 2, height: 16, background: GOLD, marginLeft: 2, animation: "blink 1s infinite", verticalAlign: "text-bottom" }} />
                              )}
                            </>
                          )}
                        </div>
                        {/* Timestamp on hover */}
                        <div style={{ position: "absolute", bottom: -16, [m.role === "user" ? "right" : "left"]: 4, fontSize: 9, color: "rgba(255,255,255,0.12)", opacity: hoveredMsg === i ? 1 : 0, transition: "opacity 0.2s" }}>
                          {getTimestamp()}
                        </div>
                        {/* Action bar for assistant */}
                        {m.role === "assistant" && !(loading && i === messages.length - 1) && m.content && (
                          <div style={{ display: "flex", gap: 4, marginTop: 6, opacity: hoveredMsg === i || feedback[i] ? 1 : 0, transition: "opacity 0.2s" }}>
                            <button onClick={() => { navigator.clipboard.writeText(m.content); setCopiedIndex(i); addToast("Copiado!", "success"); setTimeout(() => setCopiedIndex(null), 2000); }}
                              style={{ background: "none", border: "none", cursor: "pointer", padding: "3px 6px", borderRadius: 4, display: "flex", alignItems: "center", gap: 3, fontSize: 10, color: copiedIndex === i ? GOLD : "rgba(255,255,255,0.2)", transition: "all 0.2s" }}>
                              {copiedIndex === i ? "✓ Copiado" : "📋 Copiar"}
                            </button>
                            {i === messages.length - 1 && (
                              <button onClick={() => { const lastUserMsg = messages.filter(msg => msg.role === "user").pop(); if (lastUserMsg) { setMessages(messages.slice(0, -1)); setTimeout(() => setInput(lastUserMsg.content), 100); } }}
                                style={{ background: "none", border: "none", cursor: "pointer", padding: "3px 6px", borderRadius: 4, display: "flex", alignItems: "center", gap: 3, fontSize: 10, color: "rgba(255,255,255,0.2)", transition: "all 0.2s" }}>
                                🔄 Retry
                              </button>
                            )}
                            <button onClick={() => setFeedback(prev => ({ ...prev, [i]: prev[i] === "positive" ? "" : "positive" }))}
                              style={{ background: "none", border: "none", cursor: "pointer", padding: "3px 6px", borderRadius: 4, fontSize: 10, color: feedback[i] === "positive" ? GOLD : "rgba(255,255,255,0.2)", transition: "all 0.2s" }}>👍</button>
                            <button onClick={() => setFeedback(prev => ({ ...prev, [i]: prev[i] === "negative" ? "" : "negative" }))}
                              style={{ background: "none", border: "none", cursor: "pointer", padding: "3px 6px", borderRadius: 4, fontSize: 10, color: feedback[i] === "negative" ? "#EF4444" : "rgba(255,255,255,0.2)", transition: "all 0.2s" }}>👎</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {/* Loading indicator */}
                  {loading && messages[messages.length - 1]?.content === "" && (
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", animation: "fadeInUp 0.3s ease-out" }}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, animation: "goldPulse 2s ease-in-out infinite", marginTop: 4 }}>
                        {activeAgent.icon}
                      </div>
                      <div style={{ padding: "12px 18px", borderRadius: "16px 16px 16px 4px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          {[0, 1, 2].map(j => (
                            <div key={j} style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(201,168,76,0.4)", animation: `dotPulse 1.4s ease-in-out ${j * 0.2}s infinite` }} />
                          ))}
                        </div>
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>Analyzing...</span>
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>
              )}
              {/* Scroll to bottom */}
              {showScrollBtn && messages.length > 0 && (
                <button onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
                  style={{ position: "sticky", bottom: 16, alignSelf: "center", padding: "6px 14px", borderRadius: 20, background: "rgba(10,10,10,0.9)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)", fontSize: 11, cursor: "pointer", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", transition: "all 0.2s", animation: "fadeIn 0.2s ease", zIndex: 5 }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.15)"; e.currentTarget.style.color = GOLD; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}>
                  ↓ Scroll to bottom
                </button>
              )}
            </div>
            {/* ═══ INPUT AREA ═══ */}
            <div style={{ padding: "12px 24px 16px", borderTop: "1px solid rgba(255,255,255,0.04)", flexShrink: 0 }} className="input-area">
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end", maxWidth: 800, margin: "0 auto", width: "100%" }}>
                {/* Agent icon */}
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, marginBottom: 2 }}>{activeAgent.icon}</div>
                <div style={{ flex: 1, position: "relative" }}>
                  <textarea ref={inputRef} value={input} onChange={handleTextareaInput} onKeyDown={e => { handleKey(e); if (e.key === "Enter" && !e.shiftKey) setHasSentFirst(true); }} placeholder="Pergunte qualquer coisa..." rows={1}
                    style={{ width: "100%", resize: "none", padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", color: "white", fontSize: 14, outline: "none", fontFamily: SANS, transition: "border-color 0.2s" }}
                    onFocus={e => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.15)")} onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")} />
                  {/* Char count */}
                  {input.length > 100 && (
                    <span style={{ position: "absolute", right: 12, bottom: 8, fontSize: 9, color: input.length > 3000 ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)" }}>{input.length}</span>
                  )}
                </div>
                <button onClick={() => { send(); setHasSentFirst(true); }} disabled={!input.trim() || loading} className="send-btn"
                  style={{ width: 36, height: 36, borderRadius: 10, background: input.trim() && !loading ? GOLD : "rgba(255,255,255,0.04)", border: "none", cursor: input.trim() && !loading ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", flexShrink: 0, marginBottom: 2 }}>
                  <span style={{ fontSize: 16, color: input.trim() && !loading ? "#0A0A0A" : "rgba(255,255,255,0.15)", fontWeight: "bold", lineHeight: 1 }}>↑</span>
                </button>
              </div>
              {/* Keyboard hint */}
              {!hasSentFirst && (
                <div style={{ textAlign: "center", marginTop: 8, fontSize: 10, color: "rgba(255,255,255,0.08)", animation: "fadeIn 0.5s ease" }}>
                  Enter to send · Shift+Enter for new line
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <style>{`
        @keyframes dotPulse {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
        @keyframes iconPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        .sim-pulse-icon { animation: simPulse 3s ease-in-out infinite; }
        @keyframes simPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        textarea::placeholder { color: rgba(255,255,255,0.15); }
        .sim-textarea:focus { border-color: rgba(201,168,76,0.15) !important; }
        .sim-example-card:hover { border-color: rgba(201,168,76,0.08) !important; color: rgba(255,255,255,0.5) !important; }
        .send-btn:hover:not(:disabled) { transform: scale(1.05); }
        .card-hover:hover { border-color: rgba(201,168,76,0.1) !important; color: rgba(255,255,255,0.5) !important; background: rgba(201,168,76,0.02) !important; transform: translateY(-1px); }
        @media (max-width: 768px) {
          .sidebar {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            bottom: 0 !important;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }
          .sidebar.open { transform: translateX(0) !important; }
          .mobile-menu-btn { display: block !important; }
          .messages-area { padding: 16px !important; }
          .input-area { padding: 10px 16px 14px !important; }
          .suggestions-grid { grid-template-columns: 1fr !important; }
          .welcome-title { font-size: 26px !important; }
          .rates-ticker { display: none !important; }
          .sim-input-container { padding: 0 !important; }
          .sim-result-outer { padding: 20px !important; }
          .sim-result-header { flex-direction: column !important; align-items: flex-start !important; }
          .sim-meta-cards { display: grid !important; grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Keyboard shortcuts modal */}
      {showShortcuts && (
        <>
          <div onClick={() => setShowShortcuts(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", zIndex: 100, animation: "fadeIn 0.2s ease" }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 101, width: 360, padding: 28, borderRadius: 16, background: "#111", border: "1px solid rgba(255,255,255,0.08)", animation: "scaleIn 0.2s ease-out" }}>
            <div style={{ fontSize: 15, fontFamily: SERIF, color: GOLD, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Atalhos de teclado</span>
              <button onClick={() => setShowShortcuts(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 16 }}>✕</button>
            </div>
            {SHORTCUTS.map((s, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < SHORTCUTS.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{s.desc}</span>
                <div style={{ display: "flex", gap: 4 }}>
                  {s.keys.map((k, j) => <span key={j} className="kbd">{k}</span>)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
