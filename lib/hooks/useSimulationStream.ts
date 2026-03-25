'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ═══ TYPES ═══

export type SimPhase = 'idle' | 'planning' | 'opening' | 'adversarial' | 'convergence' | 'verdict' | 'complete' | 'error';

export type PhaseStep = {
  name: string;
  status: 'pending' | 'active' | 'complete';
  description?: string;
  details?: PlanTask[];
};

export type PlanTask = {
  task: string;
  assigned_agent?: string;
  status: 'pending' | 'active' | 'complete';
};

export type StreamingAgent = {
  agent_id: string;
  agent_name: string;
  category?: string;
  status: 'pending' | 'streaming' | 'complete';
  partial_text: string;
  position?: string;
  confidence?: number;
  confidence_trend?: 'up' | 'down' | 'stable';
  key_argument?: string;
  evidence?: string[];
  risks?: string[];
  round?: number;
};

export type ChallengeEvent = {
  id: string;
  challenger_id: string;
  challenger_name: string;
  challenged_id: string;
  challenged_name: string;
  topic: string;
  round: number;
  timestamp: number;
};

export type ConsensusState = {
  proceed: number;
  delay: number;
  abandon: number;
  total: number;
  avg_confidence: number;
  positions_changed: number;
  key_disagreement?: string;
  round: number;
};

export type HITLState = {
  active: boolean;
  assumptions: { key: string; value: string }[];
  round: number;
};

export type VerdictState = {
  streaming: boolean;
  partial_text: string;
  recommendation?: string;
  probability?: number;
  grade?: string;
  one_liner?: string;
  main_risk?: string;
  next_action?: string;
  citations?: any[];
  agent_scores?: any[];
  confidence_heatmap?: any[];
  disclaimer?: string;
  calibration_adjusted?: boolean;
  calibration_note?: string;
  complete: boolean;
};

export type SimulationStreamState = {
  phase: SimPhase;
  phases: PhaseStep[];
  agents: Map<string, StreamingAgent>;
  agentOrder: string[]; // preserves insertion order for rendering
  challenges: ChallengeEvent[];
  consensus: ConsensusState;
  hitl: HITLState;
  verdict: VerdictState;
  elapsed: number; // seconds since start
  error: string | null;
  question: string;
};

// ═══ INITIAL STATE ═══

const initialState: SimulationStreamState = {
  phase: 'idle',
  phases: [
    { name: 'Research Plan', status: 'pending' },
    { name: 'Opening Analysis', status: 'pending' },
    { name: 'Adversarial Debate', status: 'pending' },
    { name: 'Convergence', status: 'pending' },
    { name: 'Verdict', status: 'pending' },
  ],
  agents: new Map(),
  agentOrder: [],
  challenges: [],
  consensus: { proceed: 0, delay: 0, abandon: 0, total: 0, avg_confidence: 0, positions_changed: 0, round: 0 },
  hitl: { active: false, assumptions: [], round: 0 },
  verdict: { streaming: false, partial_text: '', complete: false },
  elapsed: 0,
  error: null,
  question: '',
};

// ═══ HOOK ═══

export function useSimulationStream(streamUrl: string | null, question: string) {
  const [state, setState] = useState<SimulationStreamState>({ ...initialState, question });
  const esRef = useRef<EventSource | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Elapsed timer
  useEffect(() => {
    if (state.phase !== 'idle' && state.phase !== 'complete' && state.phase !== 'error') {
      if (!startTimeRef.current) startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setState(prev => ({ ...prev, elapsed: Math.floor((Date.now() - startTimeRef.current) / 1000) }));
      }, 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [state.phase]);

  const processEvent = useCallback((eventType: string, data: any) => {
    setState(prev => {
      const next = { ...prev };

      switch (eventType) {
        // ─── PLAN ───
        case 'plan_complete':
        case 'planning_complete': {
          next.phases = next.phases.map((p, i) =>
            i === 0 ? { ...p, status: 'complete' as const, description: `${data.task_count || data.sub_tasks?.length || '?'} sub-tasks`, details: data.sub_tasks?.map((t: any) => ({ task: t.task || t, assigned_agent: t.assigned || t.agent, status: 'pending' as const })) }
            : i === 1 ? { ...p, status: 'active' as const, description: `${data.agent_count || '?'} agents selected` }
            : p
          );
          next.phase = 'opening';
          break;
        }

        // ─── PHASE TRANSITIONS ───
        case 'phase_start':
        case 'phase_started':
        case 'phase_update': {
          const phaseName = (data.phase || data.name || '').toLowerCase();
          let targetPhase: SimPhase = prev.phase;

          if (phaseName.includes('open')) targetPhase = 'opening';
          else if (phaseName.includes('adversarial') || phaseName.includes('challenge')) targetPhase = 'adversarial';
          else if (phaseName.includes('converg') || phaseName.includes('final')) targetPhase = 'convergence';
          else if (phaseName.includes('verdict') || phaseName.includes('chair')) targetPhase = 'verdict';

          next.phase = targetPhase;
          next.phases = next.phases.map(p => {
            const pLower = p.name.toLowerCase();
            if (pLower.includes(phaseName) || (targetPhase === 'opening' && pLower.includes('opening'))) return { ...p, status: 'active' as const };
            if (p.status === 'active') return { ...p, status: 'complete' as const };
            return p;
          });
          break;
        }

        // ─── AGENT STREAMING ───
        case 'agent_started': {
          const id = data.agent_id || data.id;
          const name = data.agent_name || data.name || id;
          if (!next.agents.has(id)) {
            next.agentOrder = [...next.agentOrder, id];
          }
          next.agents = new Map(next.agents);
          next.agents.set(id, {
            agent_id: id,
            agent_name: name,
            category: data.category,
            status: 'streaming',
            partial_text: '',
            round: data.round,
          });
          break;
        }

        case 'agent_token': {
          const id = data.agent_id || data.id;
          const token = data.token || data.text || '';
          next.agents = new Map(next.agents);
          const agent = next.agents.get(id);
          if (agent) {
            next.agents.set(id, { ...agent, partial_text: agent.partial_text + token });
          }
          break;
        }

        case 'agent_report':
        case 'agent_complete': {
          const id = data.agent_id || data.id;
          next.agents = new Map(next.agents);
          const existing = next.agents.get(id);
          next.agents.set(id, {
            agent_id: id,
            agent_name: data.agent_name || existing?.agent_name || id,
            category: data.category || existing?.category,
            status: 'complete',
            partial_text: '',
            position: data.position,
            confidence: data.confidence,
            confidence_trend: data.confidence_trend || (data.confidence_delta ? (data.confidence_delta > 0 ? 'up' : data.confidence_delta < 0 ? 'down' : 'stable') : 'stable'),
            key_argument: data.key_argument || data.summary,
            evidence: data.evidence,
            risks: data.risks,
            round: data.round || existing?.round,
          });
          if (!next.agentOrder.includes(id)) {
            next.agentOrder = [...next.agentOrder, id];
          }
          // Update consensus
          const pos = (data.position || '').toLowerCase();
          if (pos === 'proceed') next.consensus = { ...next.consensus, proceed: next.consensus.proceed + 1, total: next.consensus.total + 1 };
          else if (pos === 'delay') next.consensus = { ...next.consensus, delay: next.consensus.delay + 1, total: next.consensus.total + 1 };
          else if (pos === 'abandon') next.consensus = { ...next.consensus, abandon: next.consensus.abandon + 1, total: next.consensus.total + 1 };
          // Avg confidence
          const allAgents = Array.from(next.agents.values()).filter(a => a.status === 'complete' && a.confidence);
          if (allAgents.length > 0) {
            next.consensus.avg_confidence = allAgents.reduce((s, a) => s + (a.confidence || 0), 0) / allAgents.length;
          }
          break;
        }

        // ─── CHALLENGES ───
        case 'challenge_event':
        case 'adversarial_exchange': {
          const challenge: ChallengeEvent = {
            id: `ch_${Date.now()}`,
            challenger_id: data.challenger_id || data.from_agent,
            challenger_name: data.challenger_name || data.from_name,
            challenged_id: data.challenged_id || data.to_agent,
            challenged_name: data.challenged_name || data.to_name,
            topic: data.topic || data.dispute || data.summary,
            round: data.round || 0,
            timestamp: Date.now(),
          };
          next.challenges = [...next.challenges, challenge];
          break;
        }

        // ─── CONSENSUS UPDATES ───
        case 'consensus_update': {
          next.consensus = {
            ...next.consensus,
            proceed: data.proceed ?? next.consensus.proceed,
            delay: data.delay ?? next.consensus.delay,
            abandon: data.abandon ?? next.consensus.abandon,
            total: data.total ?? next.consensus.total,
            avg_confidence: data.avg_confidence ?? next.consensus.avg_confidence,
            positions_changed: data.positions_changed ?? next.consensus.positions_changed,
            key_disagreement: data.key_disagreement ?? next.consensus.key_disagreement,
            round: data.round ?? next.consensus.round,
          };
          if (data.agent_positions) {
            next.agents = new Map(next.agents);
            for (const [agentId, posData] of Object.entries(data.agent_positions as Record<string, any>)) {
              const agent = next.agents.get(agentId);
              if (agent) {
                const oldPos = agent.position;
                const newPos = (posData as any).position || posData;
                const newConf = (posData as any).confidence;
                if (oldPos && oldPos !== newPos) {
                  next.consensus.positions_changed = (next.consensus.positions_changed || 0) + 1;
                }
                next.agents.set(agentId, {
                  ...agent,
                  position: typeof newPos === 'string' ? newPos : agent.position,
                  confidence: typeof newConf === 'number' ? newConf : agent.confidence,
                  confidence_trend: newConf && agent.confidence ? (newConf > agent.confidence ? 'up' : newConf < agent.confidence ? 'down' : 'stable') : agent.confidence_trend,
                });
              }
            }
          }
          break;
        }

        // ─── HITL ───
        case 'hitl_checkpoint':
        case 'checkpoint': {
          next.hitl = {
            active: true,
            assumptions: data.assumptions || data.items || [],
            round: data.round || 5,
          };
          break;
        }

        case 'hitl_resumed':
        case 'checkpoint_response': {
          next.hitl = { ...next.hitl, active: false };
          break;
        }

        // ─── CONVERGENCE ───
        case 'convergence_started':
        case 'convergence_start': {
          next.phase = 'convergence';
          next.phases = next.phases.map(p =>
            p.name.toLowerCase().includes('converg') ? { ...p, status: 'active' as const } :
            p.status === 'active' ? { ...p, status: 'complete' as const } : p
          );
          break;
        }

        // ─── VERDICT STREAMING ───
        case 'verdict_streaming':
        case 'verdict_token': {
          next.phase = 'verdict';
          next.phases = next.phases.map(p =>
            p.name.toLowerCase().includes('verdict') ? { ...p, status: 'active' as const } :
            p.status === 'active' ? { ...p, status: 'complete' as const } : p
          );
          next.verdict = {
            ...next.verdict,
            streaming: true,
            partial_text: next.verdict.partial_text + (data.token || data.text || ''),
          };
          break;
        }

        // ─── VERDICT COMPLETE ───
        case 'verdict':
        case 'verdict_complete':
        case 'simulation_complete':
        case 'sim_complete': {
          const v = data.verdict || data.result || data;
          next.phase = 'complete';
          next.phases = next.phases.map(p => ({ ...p, status: 'complete' as const }));
          next.verdict = {
            streaming: false,
            partial_text: '',
            recommendation: v.recommendation,
            probability: v.probability,
            grade: v.grade,
            one_liner: v.one_liner || v.summary,
            main_risk: v.main_risk,
            next_action: v.next_action,
            citations: v.citations,
            agent_scores: v.agent_scores,
            confidence_heatmap: v.confidence_heatmap,
            disclaimer: v.disclaimer,
            calibration_adjusted: v.calibration_adjusted,
            calibration_note: v.calibration_note,
            complete: true,
          };
          if (timerRef.current) clearInterval(timerRef.current);
          break;
        }

        // ─── ERROR ───
        case 'error': {
          next.phase = 'error';
          next.error = data.message || data.error || 'Simulation failed';
          if (timerRef.current) clearInterval(timerRef.current);
          break;
        }
      }

      return next;
    });
  }, []);

  // SSE connection
  useEffect(() => {
    if (!streamUrl) return;

    setState(prev => ({
      ...prev,
      ...initialState,
      question,
      phase: 'planning',
      phases: initialState.phases.map((p, i) => ({ ...p, status: i === 0 ? 'active' as const : 'pending' as const })),
    }));
    startTimeRef.current = Date.now();

    const es = new EventSource(streamUrl);
    esRef.current = es;

    es.onmessage = (event) => {
      try {
        const raw = JSON.parse(event.data);
        const data = raw.data || raw;
        const eventType = raw.event || raw.type || '';
        processEvent(eventType, data);
      } catch {}
    };

    es.onerror = () => {
      setState(prev => ({
        ...prev,
        phase: 'error',
        error: 'Connection lost. The simulation may still be running on the server.',
      }));
      es.close();
    };

    return () => {
      es.close();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [streamUrl, processEvent, question]);

  // HITL response function
  const respondToHITL = useCallback(async (response: { approved: boolean; corrections?: Record<string, string> }) => {
    const hitlUrl = streamUrl?.replace('/stream', '/hitl');
    if (!hitlUrl) return;

    try {
      await fetch(hitlUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(response),
      });
      setState(prev => ({ ...prev, hitl: { ...prev.hitl, active: false } }));
    } catch {
      setState(prev => ({ ...prev, hitl: { ...prev.hitl, active: false } }));
    }
  }, [streamUrl]);

  return { state, respondToHITL };
}
