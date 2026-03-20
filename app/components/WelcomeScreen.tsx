"use client";
import { Search, Swords, Zap, Shield, ChevronDown } from "lucide-react";
import { t } from "../lib/i18n";
import { useIsMobile } from "../lib/useIsMobile";
import ChatInput, { type FileAttachment } from "./ChatInput";
import { SignuxIcon } from "./SignuxIcon";
import type { Mode } from "../lib/types";

type WelcomeScreenProps = {
  profileName: string;
  input: string;
  setInput: (v: string) => void;
  onSend: (text?: string) => void;
  loading: boolean;
  attachments: FileAttachment[];
  onAttachmentsChange: (atts: FileAttachment[]) => void;
  onToast?: (msg: string, type: "success" | "error" | "info") => void;
  onSwitchToSimulate?: () => void;
  onSwitchToResearch?: () => void;
  onSwitchMode?: (mode: Mode) => void;
  onOpenThreatRadar?: () => void;
  onOpenDealXRay?: () => void;
  onOpenWarGame?: () => void;
  onOpenCausalMap?: () => void;
  onOpenScenarios?: () => void;
  lang?: string;
};

const PROMPTS = [
  {
    text: "Is this deal legit? Evaluate a partnership offer",
    tags: "deal · red flags · due diligence",
    icon: <Search size={13} />,
  },
  {
    text: "How will competitors react if I launch this?",
    tags: "war game · predictions · strategy",
    icon: <Swords size={13} />,
  },
  {
    text: "Test my business idea — will it work?",
    tags: "simulation · viability · risks",
    icon: <Zap size={13} />,
  },
  {
    text: "What's the biggest threat to my business right now?",
    tags: "threats · radar · protection",
    icon: <Shield size={13} />,
  },
];

export default function WelcomeScreen({
  input, setInput, onSend, loading, attachments, onAttachmentsChange,
  onToast, lang,
}: WelcomeScreenProps) {
  const isMobile = useIsMobile();

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center",
      minHeight: isMobile ? "calc(100vh - 52px)" : "calc(100vh - 60px)",
      padding: isMobile ? "0 16px" : "0 24px",
      maxWidth: 680,
      margin: "0 auto",
      width: "100%",
    }}>

      {/* ===== LOGO — minimal, subtle ===== */}
      {!isMobile && (
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          marginBottom: 32,
          opacity: 0.4,
        }}>
          <SignuxIcon size={18} />
          <span style={{
            fontFamily: "var(--font-brand)",
            fontSize: 11, fontWeight: 700,
            letterSpacing: 4,
            color: "var(--text-tertiary)",
          }}>
            SIGNUX AI
          </span>
        </div>
      )}

      {/* ===== QUESTION — actionable h1 ===== */}
      <h1 style={{
        fontSize: isMobile ? 22 : 26, fontWeight: 600,
        color: "var(--text-primary)",
        textAlign: "center",
        marginBottom: isMobile ? 18 : 24,
        lineHeight: 1.3,
        fontFamily: "var(--font-brand)",
        marginTop: isMobile ? 0 : undefined,
      }}>
        What decision are you facing?
      </h1>

      {/* ===== INPUT — the HERO ===== */}
      <div style={{ width: "100%", marginBottom: isMobile ? 16 : 20 }}>
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={() => onSend()}
          loading={loading}
          showDisclaimer={false}
          showVoice={false}
          attachments={attachments}
          onAttachmentsChange={onAttachmentsChange}
          onToast={onToast}
          placeholder="I'm thinking about launching a coffee franchise in 3 cities with $200K..."
        />
      </div>

      {/* ===== PROMPT SUGGESTIONS ===== */}
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{
          fontSize: 10, color: "var(--text-tertiary)",
          fontFamily: "var(--font-mono)",
          letterSpacing: 0.5, textTransform: "uppercase",
          textAlign: "center", marginBottom: 2,
        }}>
          Or try one of these
        </span>

        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: 8,
        }}>
          {PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => setInput(prompt.text)}
              className="interactive-card"
              style={{
                display: "flex", flexDirection: "column",
                padding: "12px 14px", borderRadius: 10,
                border: "1px solid var(--border-secondary)",
                background: "var(--card-bg)",
                textAlign: "left", cursor: "pointer",
                gap: 6,
              }}
            >
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 8,
              }}>
                <div style={{
                  color: "var(--text-tertiary)",
                  marginTop: 1,
                  flexShrink: 0,
                }}>
                  {prompt.icon}
                </div>
                <span style={{
                  fontSize: 13, color: "var(--text-primary)",
                  lineHeight: 1.4,
                }}>
                  {prompt.text}
                </span>
              </div>
              <span style={{
                fontSize: 10, color: "var(--text-tertiary)",
                fontFamily: "var(--font-mono)",
                letterSpacing: 0.3, opacity: 0.6,
              }}>
                {prompt.tags}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ===== TRUST + SCROLL ===== */}
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: 12, marginTop: 20,
      }}>
        <span style={{
          fontSize: 11, color: "var(--text-tertiary)", opacity: 0.5,
        }}>
          Free to start · No credit card required
        </span>

        <button onClick={() => {
          document.getElementById("landing-start")?.scrollIntoView({ behavior: "smooth" });
        }} style={{
          width: 32, height: 32, borderRadius: "50%",
          border: "1px solid var(--border-secondary)",
          background: "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: "var(--text-tertiary)",
          animation: "bounce 2.5s ease-in-out infinite",
        }}>
          <ChevronDown size={14} />
        </button>
      </div>
    </div>
  );
}
