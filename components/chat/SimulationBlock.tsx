'use client';

/**
 * Simulation block — renders INLINE in the chat thread.
 * Connects to SSE, shows progress, renders verdict on complete.
 * PLACEHOLDER for P40 ocean animation.
 */

import { useState, useEffect } from 'react';

type Props = {
  question: string;
  streamUrl?: string;
  octopusState: string;
  onComplete: (verdict: any, simulationId: string) => void;
};

export default function SimulationBlock({ question, streamUrl, onComplete }: Props) {
  const [phase, setPhase] = useState('Starting...');
  const [agentReports, setAgentReports] = useState<any[]>([]);

  useEffect(() => {
    if (!streamUrl) return;

    const eventSource = new EventSource(streamUrl);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.event === 'phase_update') {
          setPhase(data.data?.phase || 'Analyzing...');
        }
        if (data.event === 'agent_report') {
          setAgentReports(prev => [...prev, data.data]);
        }
        if (data.event === 'verdict') {
          onComplete(data.data, data.data?.simulation_id || '');
          eventSource.close();
        }
        if (data.event === 'error' || data.event === 'complete') {
          eventSource.close();
        }
      } catch {}
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => eventSource.close();
  }, [streamUrl, onComplete]);

  return (
    <div style={{
      margin: '16px 0', padding: '20px', borderRadius: '12px',
      border: '2px solid rgba(124,58,237,0.15)',
      background: 'linear-gradient(180deg, rgba(124,58,237,0.03) 0%, rgba(124,58,237,0.08) 100%)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#7C3AED', animation: 'pulse 1.5s infinite' }}>~</span>
        <span style={{ fontSize: '14px', fontWeight: 500, color: '#7C3AED' }}>Deep Simulation</span>
        <span style={{ fontSize: '12px', color: 'var(--text-tertiary, #999)' }}> {phase}</span>
      </div>

      <div style={{ fontSize: '14px', color: 'var(--text-secondary, #555)', marginBottom: '12px', fontStyle: 'italic' }}>
        &ldquo;{question}&rdquo;
      </div>

      {agentReports.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {agentReports.map((report, i) => {
            const posColor = report.position === 'proceed' ? '#10B981' : report.position === 'delay' ? '#F59E0B' : '#F43F5E';
            return (
              <span key={i} style={{
                padding: '3px 8px', borderRadius: '4px', fontSize: '11px',
                background: `${posColor}15`, color: posColor,
              }}>
                {report.agent_name || `Agent ${i + 1}`}: {(report.position || '?').toUpperCase()}
              </span>
            );
          })}
        </div>
      )}

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }`}</style>
    </div>
  );
}
