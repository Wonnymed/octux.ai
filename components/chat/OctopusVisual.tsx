'use client';

/**
 * Octopus visual — 4 states. PLACEHOLDER for P40 animation.
 * P40 replaces this with Framer Motion / Rive animation.
 */

type Props = {
  state: 'idle' | 'chatting' | 'diving' | 'resting';
  compact?: boolean;
};

export default function OctopusVisual({ state, compact }: Props) {
  const size = compact ? 48 : 96;
  const stateLabel: Record<string, string> = {
    idle: 'OX', chatting: 'OX', diving: '~', resting: '*',
  };
  const stateText: Record<string, string> = {
    idle: '', chatting: '', diving: 'Diving deep...', resting: '',
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      transition: 'all 0.3s ease',
    }}>
      <div style={{
        width: `${size}px`, height: `${size}px`,
        borderRadius: size > 60 ? '24px' : '12px',
        background: '#7C3AED',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: `${size * 0.25}px`, fontWeight: 700,
        letterSpacing: 1,
        animation: state === 'diving' ? 'pulse 1.5s infinite' : state === 'idle' ? 'float 3s ease-in-out infinite' : 'none',
      }}>
        {stateLabel[state]}
      </div>
      {stateText[state] && (
        <div style={{ fontSize: '12px', color: 'var(--text-tertiary, #999)', marginTop: '4px' }}>
          {stateText[state]}
        </div>
      )}
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
      `}</style>
    </div>
  );
}
