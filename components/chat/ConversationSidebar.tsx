'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type Conversation = {
  id: string;
  title: string;
  has_simulation: boolean;
  latest_verdict: string | null;
  is_pinned: boolean;
  updated_at: string;
};

export default function ConversationSidebar() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetch('/api/c').then(r => r.json()).then(d => setConversations(d.conversations || [])).catch(() => {});
  }, [pathname]);

  const pinned = conversations.filter(c => c.is_pinned);
  const recent = conversations.filter(c => !c.is_pinned);

  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const todayConvos = recent.filter(c => new Date(c.updated_at).toDateString() === today);
  const yesterdayConvos = recent.filter(c => new Date(c.updated_at).toDateString() === yesterday);
  const olderConvos = recent.filter(c => {
    const d = new Date(c.updated_at).toDateString();
    return d !== today && d !== yesterday;
  });

  return (
    <div style={{
      width: collapsed ? '56px' : '260px',
      background: 'var(--surface-1, #f9f9f8)',
      borderRight: '1px solid var(--border-subtle, rgba(0,0,0,0.06))',
      display: 'flex', flexDirection: 'column',
      transition: 'width 0.15s ease',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {!collapsed && (
          <button
            onClick={() => router.push('/c')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: 500, color: '#7C3AED', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            octux
          </button>
        )}
        <button
          onClick={() => collapsed ? setCollapsed(false) : router.push('/c')}
          title={collapsed ? 'Expand sidebar' : 'New conversation'}
          style={{
            width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border-default, rgba(0,0,0,0.1))',
            background: 'transparent', cursor: 'pointer', fontSize: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {collapsed ? '>' : '+'}
        </button>
      </div>

      {collapsed ? null : (
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
          {pinned.length > 0 && (
            <Section label="Pinned">
              {pinned.map(c => <ConvoItem key={c.id} convo={c} active={pathname === `/c/${c.id}`} onClick={() => router.push(`/c/${c.id}`)} />)}
            </Section>
          )}

          {todayConvos.length > 0 && (
            <Section label="Today">
              {todayConvos.map(c => <ConvoItem key={c.id} convo={c} active={pathname === `/c/${c.id}`} onClick={() => router.push(`/c/${c.id}`)} />)}
            </Section>
          )}

          {yesterdayConvos.length > 0 && (
            <Section label="Yesterday">
              {yesterdayConvos.map(c => <ConvoItem key={c.id} convo={c} active={pathname === `/c/${c.id}`} onClick={() => router.push(`/c/${c.id}`)} />)}
            </Section>
          )}

          {olderConvos.length > 0 && (
            <Section label="Previous">
              {olderConvos.slice(0, 15).map(c => <ConvoItem key={c.id} convo={c} active={pathname === `/c/${c.id}`} onClick={() => router.push(`/c/${c.id}`)} />)}
            </Section>
          )}
        </div>
      )}

      {!collapsed && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-subtle, rgba(0,0,0,0.06))' }}>
          <button
            onClick={() => setCollapsed(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: 'var(--text-tertiary, #999)' }}
          >
            Collapse
          </button>
        </div>
      )}
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ padding: '4px 8px', fontSize: '10px', fontWeight: 500, color: 'var(--text-tertiary, #999)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function ConvoItem({ convo, active, onClick }: { convo: Conversation; active: boolean; onClick: () => void }) {
  const icon = convo.is_pinned ? '|' : convo.has_simulation ? (
    convo.latest_verdict === 'proceed' ? '*' : convo.latest_verdict === 'delay' ? '~' : convo.latest_verdict === 'abandon' ? 'x' : '>'
  ) : '>';

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        width: '100%', padding: '6px 8px', border: 'none',
        background: active ? 'var(--surface-2, #f2f2ef)' : 'transparent',
        cursor: 'pointer', textAlign: 'left', borderRadius: '6px',
        fontSize: '13px', color: active ? 'var(--text-primary, #111)' : 'var(--text-secondary, #555)',
      }}
    >
      <span style={{ fontSize: '10px', flexShrink: 0, fontFamily: 'monospace' }}>{icon}</span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {convo.title}
      </span>
    </button>
  );
}
