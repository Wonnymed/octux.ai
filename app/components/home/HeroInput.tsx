"use client";

import { useState, useCallback } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

type HeroInputProps = {
  onSubmit: (query: string) => void;
  placeholder?: string;
  defaultValue?: string;
  isSubmitting?: boolean;
};

export default function HeroInput({ onSubmit, placeholder, defaultValue = "", isSubmitting = false }: HeroInputProps) {
  const [value, setValue] = useState(defaultValue);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = value.trim();
      if (trimmed) onSubmit(trimmed);
    },
    [value, onSubmit],
  );

  return (
    <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 560 }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex",
          alignItems: "center",
          border: `1px solid ${focused ? "var(--accent)" : "var(--border-default)"}`,
          borderBottom: focused ? "2px solid var(--accent)" : `1px solid ${hovered ? "var(--border-strong)" : "var(--border-default)"}`,
          borderRadius: "var(--radius-lg)",
          padding: focused ? "12px 16px 11px" : "12px 16px",
          background: "var(--surface-raised)",
          boxShadow: focused
            ? "0 0 0 3px var(--accent-glow), 0 2px 8px rgba(0,0,0,0.06)"
            : hovered
              ? "0 2px 8px rgba(0,0,0,0.08)"
              : "0 1px 4px rgba(0,0,0,0.03)",
          transition: "all var(--transition-normal)",
          gap: 12,
        }}
      >
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder || "What decision are you facing?"}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: 15,
            fontWeight: 400,
            color: "var(--text-primary)",
            lineHeight: 1.5,
            fontFamily: "inherit",
          }}
        />
        <button
          type="submit"
          disabled={isSubmitting || !value.trim()}
          style={{
            width: 32,
            height: 32,
            borderRadius: "var(--radius-md)",
            border: "none",
            background: isSubmitting ? "var(--accent)" : value.trim() ? "var(--accent)" : "var(--surface-2)",
            color: isSubmitting ? "#fff" : value.trim() ? "#fff" : "var(--text-disabled)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: isSubmitting || !value.trim() ? "default" : "pointer",
            opacity: isSubmitting ? 0.7 : 1,
            transition: "all var(--transition-normal)",
            flexShrink: 0,
          }}
        >
          {isSubmitting ? (
            <Loader2 size={16} strokeWidth={2} className="spin-icon" />
          ) : (
            <ArrowRight size={16} strokeWidth={2} />
          )}
        </button>
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin-icon { animation: spin 1s linear infinite; }
      `}</style>
    </form>
  );
}
