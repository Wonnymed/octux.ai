"use client";
import { t } from "../lib/i18n";
import ChatInput, { type FileAttachment } from "./ChatInput";

const SUGGESTION_KEYS = ["suggestion.1", "suggestion.2", "suggestion.3", "suggestion.4"];

type WelcomeScreenProps = {
  profileName: string;
  input: string;
  setInput: (v: string) => void;
  onSend: (text?: string) => void;
  loading: boolean;
  attachments: FileAttachment[];
  onAttachmentsChange: (atts: FileAttachment[]) => void;
  onToast?: (msg: string, type: "success" | "error" | "info") => void;
};

export default function WelcomeScreen({ profileName, input, setInput, onSend, loading, attachments, onAttachmentsChange, onToast }: WelcomeScreenProps) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", flex: 1,
      maxWidth: 640, margin: "0 auto", width: "100%", padding: "24px 24px 32px",
    }}>
      {/* Brand name */}
      <div style={{
        fontSize: 44, fontWeight: 300, letterSpacing: "0.12em",
        color: "var(--text-primary)", marginBottom: 8,
        animation: "fadeIn 0.4s ease-out",
      }}>
        SIGNUX
      </div>

      {/* Subtitle */}
      <div style={{
        fontSize: 15, color: "var(--text-tertiary)", marginBottom: 48,
        animation: "fadeIn 0.5s ease-out",
      }}>
        {t("chat.welcome_subtitle")}
      </div>

      {/* Input */}
      <div style={{ width: "100%", maxWidth: 600, marginBottom: 16 }}>
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={() => onSend()}
          loading={loading}
          showDisclaimer={false}
          attachments={attachments}
          onAttachmentsChange={onAttachmentsChange}
          onToast={onToast}
        />
      </div>

      {/* Suggestion chips */}
      <div
        style={{
          display: "flex", flexWrap: "wrap", gap: 8,
          justifyContent: "center", width: "100%",
          animation: "fadeIn 0.6s ease-out",
        }}
      >
        {SUGGESTION_KEYS.map(key => (
          <button
            key={key}
            onClick={() => onSend(t(key))}
            style={{
              padding: "8px 16px", borderRadius: "var(--radius-pill)",
              background: "transparent", border: "1px solid var(--border-secondary)",
              fontSize: 13, color: "var(--text-secondary)",
              cursor: "pointer", transition: "all 0.15s",
              whiteSpace: "nowrap",
            }}
            className="suggestion-chip"
          >
            {t(key)}
          </button>
        ))}
      </div>

      {/* Disclaimer */}
      <div style={{ textAlign: "center", marginTop: 12, fontSize: 11, color: "var(--text-tertiary)" }}>
        {t("common.disclaimer")}
      </div>
    </div>
  );
}
