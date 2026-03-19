"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { Shield, Search, Crosshair, Swords, GitBranch, Users, Map, ChevronLeft, Microscope } from "lucide-react";

const ThreatRadar = dynamic(() => import("./ThreatRadar"), { ssr: false });
const DealXRay = dynamic(() => import("./DealXRay"), { ssr: false });
const WarGame = dynamic(() => import("./WarGame"), { ssr: false });
const CausalMap = dynamic(() => import("./CausalMap"), { ssr: false });
const NegotiationSim = dynamic(() => import("./NegotiationSim"), { ssr: false });
const ScenarioPlanner = dynamic(() => import("./ScenarioPlanner"), { ssr: false });
const ResearchView = dynamic(() => import("./ResearchView"), { ssr: false });
const DecisionAutopsy = dynamic(() => import("./DecisionAutopsy"), { ssr: false });

type IntelTool = "menu" | "threat-radar" | "deal-xray" | "war-game" | "causal-map" | "negotiation" | "scenarios" | "deep-research" | "autopsy";

type IntelViewProps = {
  lang: string;
  onContinueInChat?: (report: string) => void;
  onSetMode?: (m: any) => void;
  isLoggedIn?: boolean;
  tier?: string;
};

const TOOLS = [
  {
    id: "threat-radar" as IntelTool,
    name: "Threat Radar",
    description: "Map threats across 5 axes with real-time data",
    icon: Shield,
    color: "#DC2626",
    command: "/threats",
  },
  {
    id: "deal-xray" as IntelTool,
    name: "Deal X-Ray",
    description: "Detect deception and hidden incentives in any deal",
    icon: Crosshair,
    color: "#F59E0B",
    command: "/xray",
  },
  {
    id: "war-game" as IntelTool,
    name: "War Game",
    description: "Simulate competitive moves with game theory",
    icon: Swords,
    color: "#8B5CF6",
    command: "/wargame",
  },
  {
    id: "causal-map" as IntelTool,
    name: "Causal Map",
    description: "Separate correlation from causation",
    icon: GitBranch,
    color: "#06B6D4",
    command: "/causal",
  },
  {
    id: "negotiation" as IntelTool,
    name: "Negotiation War Room",
    description: "4-phase military-grade preparation",
    icon: Users,
    color: "#F97316",
    command: "/negotiate",
  },
  {
    id: "scenarios" as IntelTool,
    name: "Scenario Planner",
    description: "4 alternative futures with hedging strategy",
    icon: Map,
    color: "#22C55E",
    command: "/scenarios",
  },
  {
    id: "autopsy" as IntelTool,
    name: "Decision Autopsy",
    description: "Analyze a past decision — what went right, wrong, and why",
    icon: Microscope,
    color: "#A855F7",
    command: "/autopsy",
  },
];

export default function IntelView({ lang, onContinueInChat, onSetMode, isLoggedIn, tier }: IntelViewProps) {
  const [activeTool, setActiveTool] = useState<IntelTool>("menu");

  /* ═══ TOOL VIEWS ═══ */
  if (activeTool !== "menu") {
    const backButton = (
      <button onClick={() => setActiveTool("menu")} style={{
        display: "flex", alignItems: "center", gap: 6,
        alignSelf: "flex-start", margin: "12px 16px 0",
        background: "none", border: "none", cursor: "pointer",
        fontSize: 13, color: "var(--text-tertiary)",
      }}>
        <ChevronLeft size={16} /> Back to Intel
      </button>
    );

    if (activeTool === "deep-research") {
      return (
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflowY: "auto" }}>
          {backButton}
          <ResearchView
            lang={lang}
            onContinueInChat={onContinueInChat}
            onSetMode={onSetMode}
            isLoggedIn={isLoggedIn}
            tier={tier}
          />
        </div>
      );
    }

    if (activeTool === "threat-radar") {
      return (
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflowY: "auto" }}>
          {backButton}
          <ThreatRadar lang={lang} />
        </div>
      );
    }

    if (activeTool === "deal-xray") {
      return (
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflowY: "auto" }}>
          {backButton}
          <DealXRay lang={lang} />
        </div>
      );
    }

    if (activeTool === "war-game") {
      return (
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflowY: "auto" }}>
          {backButton}
          <WarGame lang={lang} />
        </div>
      );
    }

    if (activeTool === "causal-map") {
      return (
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflowY: "auto" }}>
          {backButton}
          <CausalMap lang={lang} />
        </div>
      );
    }

    if (activeTool === "negotiation") {
      return (
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflowY: "auto" }}>
          {backButton}
          <NegotiationSim lang={lang} />
        </div>
      );
    }

    if (activeTool === "scenarios") {
      return (
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflowY: "auto" }}>
          {backButton}
          <ScenarioPlanner lang={lang} />
        </div>
      );
    }

    if (activeTool === "autopsy") {
      return (
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflowY: "auto" }}>
          {backButton}
          <DecisionAutopsy lang={lang} />
        </div>
      );
    }
  }

  /* ═══ MENU STATE ═══ */
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "calc(100vh - 120px)",
      padding: "20px 16px", maxWidth: 760, margin: "0 auto",
    }}>
      {/* Header */}
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: "rgba(220,38,38,0.08)", display: "flex",
        alignItems: "center", justifyContent: "center", marginBottom: 12,
      }}>
        <Shield size={24} style={{ color: "#DC2626" }} />
      </div>

      <h1 style={{
        fontFamily: "var(--font-brand)", fontWeight: 700,
        fontSize: 36, letterSpacing: 6, color: "var(--text-primary)",
        marginBottom: 4, textAlign: "center",
      }}>
        <span style={{ color: "#DC2626" }}>INTEL</span>
        <span style={{ fontWeight: 300, opacity: 0.2, marginLeft: 8 }}>ENGINE</span>
      </h1>

      <p style={{
        fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 2,
        color: "#DC2626", textTransform: "uppercase", marginBottom: 24,
        opacity: 0.7,
      }}>
        Operational intelligence suite
      </p>

      {/* Knowledge badge */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "6px 14px", borderRadius: 50,
        background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.12)",
        marginBottom: 28, fontSize: 11, color: "var(--text-tertiary)",
      }}>
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#DC2626" }} />
        Powered by proprietary intelligence across 27+ domains
      </div>

      {/* Tools grid — 3+3 */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
        gap: 10, width: "100%", maxWidth: 680, marginBottom: 12,
      }}>
        {TOOLS.map(tool => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            style={{
              display: "flex", flexDirection: "column", gap: 8,
              padding: "16px 14px", borderRadius: 12,
              border: `1px solid ${tool.color}18`,
              background: `${tool.color}06`,
              cursor: "pointer", textAlign: "left",
              transition: "all 200ms",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = `${tool.color}40`;
              (e.currentTarget as HTMLElement).style.background = `${tool.color}10`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = `${tool.color}18`;
              (e.currentTarget as HTMLElement).style.background = `${tool.color}06`;
            }}
          >
            <tool.icon size={18} style={{ color: tool.color }} />
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
              {tool.name}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-tertiary)", lineHeight: 1.4 }}>
              {tool.description}
            </div>
          </button>
        ))}
      </div>

      {/* Deep Research — full width row below */}
      <button
        onClick={() => setActiveTool("deep-research")}
        style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "12px 16px", borderRadius: 10,
          border: "1px solid rgba(107,138,255,0.15)",
          background: "rgba(107,138,255,0.04)",
          cursor: "pointer", width: "100%", maxWidth: 680,
          textAlign: "left", transition: "all 200ms",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = "rgba(107,138,255,0.35)";
          e.currentTarget.style.background = "rgba(107,138,255,0.08)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = "rgba(107,138,255,0.15)";
          e.currentTarget.style.background = "rgba(107,138,255,0.04)";
        }}
      >
        <Search size={16} style={{ color: "#6B8AFF" }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
            Deep Research
          </div>
          <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
            Multi-source web search with structured report and PDF export
          </div>
        </div>
        <span style={{ fontSize: 10, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
          /research
        </span>
      </button>

      {/* Disclaimer */}
      <p style={{
        fontSize: 11, color: "var(--text-tertiary)", marginTop: 20,
        textAlign: "center", opacity: 0.5,
      }}>
        Always verify critical decisions with qualified professionals.
      </p>
    </div>
  );
}
