'use client';

import { useState } from 'react';

type Props = {
  verdict: any;
  simulationId: string | null;
  conversationId: string;
  onRefine: (modification: string) => void;
};

export default function VerdictCard({ verdict, conversationId, onRefine }: Props) {
  const [showRefine, setShowRefine] = useState(false);
  const [refineInput, setRefineInput] = useState('');

  if (!verdict) return null;

  const rec = (verdict.recommendation || 'unknown').toUpperCase();
  const prob = verdict.probability || 0;
  const grade = verdict.grade || '?';
  const oneLiner = verdict.one_liner || '';
  const mainRisk = verdict.main_risk || '';
  const nextAction = verdict.next_action || '';
  const disclaimer = verdict.disclaimer || '';

  const recColor = rec === 'PROCEED' ? '#10B981' : rec === 'DELAY' ? '#F59E0B' : '#F43F5E';

  return (
    <div style={{ margin: '16px 0' }}>
      <div style={{
        padding: '20px', borderRadius: '12px',
        border: `2px solid ${recColor}30`,
        background: `${recColor}08`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
          <span style={{ padding: '4px 12px', borderRadius: '6px', background: `${recColor}18`, color: recColor, fontSize: '14px', fontWeight: 600 }}>
            {rec}
          </span>
          <span style={{ fontSize: '32px', fontWeight: 300, color: 'var(--text-primary, #111)' }}>{prob}%</span>
          <span style={{ marginLeft: 'auto', fontSize: '22px', fontWeight: 500, color: '#7C3AED' }}>{grade}</span>
        </div>

        {oneLiner && <div style={{ fontSize: '14px', color: 'var(--text-secondary, #555)', marginBottom: '8px' }}>{oneLiner}</div>}

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '12px' }}>
          {mainRisk && <span style={{ color: 'var(--text-tertiary, #999)' }}>Risk: {mainRisk}</span>}
          {nextAction && <span style={{ color: 'var(--text-tertiary, #999)' }}>Next: {nextAction}</span>}
        </div>
      </div>

      {disclaimer && (
        <div style={{ marginTop: '8px', padding: '10px 14px', borderRadius: '8px', background: '#FEF3C720', fontSize: '11px', color: '#92400E' }}>
          {disclaimer}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setShowRefine(!showRefine)}
          style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-default, rgba(0,0,0,0.1))', background: 'transparent', fontSize: '12px', cursor: 'pointer', color: 'var(--text-secondary, #555)' }}
        >
          What if...?
        </button>
        <button
          onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/c/${conversationId}/public`); }}
          style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-default, rgba(0,0,0,0.1))', background: 'transparent', fontSize: '12px', cursor: 'pointer', color: 'var(--text-secondary, #555)' }}
        >
          Share
        </button>
      </div>

      {showRefine && (
        <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
          <input
            value={refineInput}
            onChange={e => setRefineInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && refineInput.trim()) { onRefine(refineInput); setRefineInput(''); setShowRefine(false); } }}
            placeholder="e.g., What if budget was $100K?"
            style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-default, rgba(0,0,0,0.1))', fontSize: '13px', outline: 'none' }}
          />
          <button
            onClick={() => { if (refineInput.trim()) { onRefine(refineInput); setRefineInput(''); setShowRefine(false); } }}
            style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', background: '#7C3AED', color: '#fff', fontSize: '12px', cursor: 'pointer' }}
          >
            Refine
          </button>
        </div>
      )}
    </div>
  );
}
