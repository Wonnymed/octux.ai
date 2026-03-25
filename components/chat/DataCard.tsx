'use client';

// Placeholder — P41 (Structured Chat Responses) will flesh this out.

type Props = { data: any };

export default function DataCard({ data }: Props) {
  return (
    <div style={{
      margin: '8px 0', padding: '12px 16px', borderRadius: '8px',
      background: 'var(--surface-1, #f9f9f8)', border: '1px solid var(--border-subtle, rgba(0,0,0,0.06))',
    }}>
      <pre style={{ fontSize: '13px', color: 'var(--text-primary, #111)', whiteSpace: 'pre-wrap', margin: 0 }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
