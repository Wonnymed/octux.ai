'use client';

type Props = { data: any };

export default function RefinementCard({ data }: Props) {
  if (!data) return null;

  const changed = data.verdictChanged;
  const newRec = data.newRecommendation?.toUpperCase();
  const newProb = data.newProbability;

  return (
    <div style={{
      margin: '12px 0', padding: '16px', borderRadius: '10px',
      border: '1px solid rgba(124,58,237,0.15)', background: 'rgba(124,58,237,0.03)',
    }}>
      <div style={{ fontSize: '12px', fontWeight: 500, color: '#7C3AED', marginBottom: '8px' }}>
        Quick Refinement
      </div>

      {changed && newRec && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-tertiary, #999)' }}>{data.originalVerdict?.recommendation?.toUpperCase()} ({data.originalVerdict?.probability}%)</span>
          <span style={{ color: 'var(--text-tertiary, #999)' }}>&rarr;</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: newRec === 'PROCEED' ? '#10B981' : newRec === 'DELAY' ? '#F59E0B' : '#F43F5E' }}>
            {newRec} ({newProb}%)
          </span>
        </div>
      )}

      <div style={{ fontSize: '14px', color: 'var(--text-primary, #111)', lineHeight: 1.7 }}>
        {data.refinedAssessment || 'No significant change expected.'}
      </div>

      {data.keyImpacts?.length > 0 && (
        <div style={{ marginTop: '8px' }}>
          {data.keyImpacts.map((impact: string, i: number) => (
            <div key={i} style={{ fontSize: '12px', color: 'var(--text-secondary, #555)', padding: '2px 0' }}>
              - {impact}
            </div>
          ))}
        </div>
      )}

      {data.suggestFullSim && (
        <div style={{ marginTop: '8px', fontSize: '12px', color: '#7C3AED', fontWeight: 500 }}>
          This change is significant — consider running a full Deep Simulation for accurate analysis.
        </div>
      )}
    </div>
  );
}
