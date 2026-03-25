'use client';

import { useState, useRef } from 'react';

type Props = {
  onSend: (message: string, tier: string) => void;
  placeholder?: string;
  loading?: boolean;
};

type ModelTier = 'ink' | 'deep' | 'kraken';

const TIERS: { id: ModelTier; label: string }[] = [
  { id: 'ink', label: 'Ink' },
  { id: 'deep', label: 'Deep' },
  { id: 'kraken', label: 'Kraken' },
];

export default function ChatInput({ onSend, placeholder, loading }: Props) {
  const [input, setInput] = useState('');
  const [tier, setTier] = useState<ModelTier>('ink');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit() {
    if (!input.trim() || loading) return;
    onSend(input.trim(), tier);
    setInput('');
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '8px 12px', borderRadius: '12px',
      border: '1px solid var(--border-default, rgba(0,0,0,0.10))',
      background: 'var(--surface-0, #fff)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    }}>
      {/* Tier selector */}
      <div style={{ display: 'flex', gap: '2px' }}>
        {TIERS.map(t => (
          <button
            key={t.id}
            onClick={() => setTier(t.id)}
            title={t.label}
            style={{
              padding: '4px 8px', borderRadius: '4px', border: 'none',
              background: tier === t.id ? 'rgba(124,58,237,0.1)' : 'transparent',
              cursor: 'pointer', fontSize: '11px', fontWeight: 500,
              color: tier === t.id ? '#7C3AED' : 'var(--text-tertiary, #999)',
              transition: 'all 0.1s ease',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
        placeholder={placeholder || 'Ask Octux anything...'}
        disabled={loading}
        style={{
          flex: 1, border: 'none', outline: 'none', fontSize: '14px',
          background: 'transparent', color: 'var(--text-primary, #111)',
          fontFamily: 'inherit',
        }}
      />

      {/* Send */}
      <button
        onClick={handleSubmit}
        disabled={loading || !input.trim()}
        style={{
          width: '32px', height: '32px', borderRadius: '8px', border: 'none',
          background: input.trim() ? '#7C3AED' : 'var(--surface-2, #eee)',
          color: input.trim() ? '#fff' : 'var(--text-tertiary, #999)',
          cursor: loading || !input.trim() ? 'default' : 'pointer',
          fontSize: '14px', fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s ease',
        }}
      >
        ^
      </button>
    </div>
  );
}
