'use client';

type Props = {
  role: string;
  content: string;
  tier?: string;
};

export default function MessageBubble({ role, content, tier }: Props) {
  const isUser = role === 'user';

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '12px',
    }}>
      <div style={{
        maxWidth: '85%', padding: '12px 16px', borderRadius: '14px',
        fontSize: '14px', lineHeight: 1.7,
        background: isUser ? '#7C3AED' : 'var(--surface-1, #f9f9f8)',
        color: isUser ? '#fff' : 'var(--text-primary, #111)',
        whiteSpace: 'pre-wrap',
      }}>
        {content}
      </div>
      {!isUser && tier && (
        <span style={{ fontSize: '10px', color: 'var(--text-tertiary, #999)', marginTop: '3px', marginLeft: '4px' }}>
          {tier}
        </span>
      )}
    </div>
  );
}
