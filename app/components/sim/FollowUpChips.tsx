"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type FollowUpChipsProps = {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  disabled?: boolean;
};

export default function FollowUpChips({
  suggestions,
  onSelect,
  disabled = false,
}: FollowUpChipsProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
      }}
    >
      {suggestions.map((s, i) => (
        <button
          key={i}
          onClick={() => onSelect(s)}
          disabled={disabled}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
          style={{
            padding: "8px 16px",
            borderRadius: "var(--radius-full)",
            border: `1px solid ${!disabled && hovered === i ? "var(--accent)" : "var(--border-default)"}`,
            background: !disabled && hovered === i ? "var(--accent-glow)" : "transparent",
            color: !disabled && hovered === i ? "var(--accent)" : "var(--text-secondary)",
            fontSize: 13,
            fontWeight: 400,
            cursor: disabled ? "default" : "pointer",
            opacity: disabled ? 0.5 : 1,
            transition: "all 150ms ease-out",
            fontFamily: "inherit",
          }}
        >
          {s}
        </button>
      ))}
    </motion.div>
  );
}
