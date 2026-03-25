'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import OctopusVisual from '@/components/chat/OctopusVisual';
import ChatInput from '@/components/chat/ChatInput';
import MessageBubble from '@/components/chat/MessageBubble';
import SimulationBlock from '@/components/chat/SimulationBlock';
import VerdictCard from '@/components/chat/VerdictCard';
import RefinementCard from '@/components/chat/RefinementCard';

type Message = {
  id: string;
  message_type: string;
  role: string;
  content: string | null;
  structured_data: any;
  model_tier: string;
  simulation_id: string | null;
  created_at: string;
};

type OctopusState = 'idle' | 'chatting' | 'diving' | 'resting';

export default function ConversationPage() {
  const params = useParams();
  const conversationId = params.id as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [octopusState, setOctopusState] = useState<OctopusState>('idle');
  const [, setActiveSimulation] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversation messages
  useEffect(() => {
    fetch(`/api/c/${conversationId}`)
      .then(r => r.json())
      .then(data => {
        setMessages(data.messages || []);
        const hasVerdict = data.messages?.some((m: Message) => m.message_type === 'simulation_verdict');
        const hasSimStart = data.messages?.some((m: Message) => m.message_type === 'simulation_start');
        if (hasVerdict) setOctopusState('resting');
        else if (hasSimStart) setOctopusState('diving');
        else if (data.messages?.length > 0) setOctopusState('chatting');
        else setOctopusState('idle');
      })
      .catch(() => {});
  }, [conversationId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send chat message
  const handleSend = useCallback(async (message: string, tier: string) => {
    if (!message.trim() || loading) return;
    setLoading(true);
    setOctopusState('chatting');

    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      message_type: 'text', role: 'user', content: message,
      structured_data: null, model_tier: tier, simulation_id: null,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await fetch(`/api/c/${conversationId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, tier }),
      });
      const data = await res.json();

      const assistantMsg: Message = {
        id: `resp-${Date.now()}`,
        message_type: data.suggestSimulation ? 'decision_card' : 'text',
        role: 'assistant', content: data.response,
        structured_data: data.suggestSimulation ? {
          suggest_simulation: true,
          simulation_prompt: data.simulationPrompt,
          disclaimer: data.disclaimer,
        } : data.disclaimer ? { disclaimer: data.disclaimer } : null,
        model_tier: data.tier, simulation_id: null,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`, message_type: 'text', role: 'assistant',
        content: 'Something went wrong. Try again.', structured_data: null,
        model_tier: 'ink', simulation_id: null, created_at: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
    }
  }, [conversationId, loading]);

  // Trigger simulation
  const handleSimulate = useCallback(async (question: string, tier: string) => {
    setOctopusState('diving');
    setActiveSimulation(question);

    try {
      const res = await fetch(`/api/c/${conversationId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'simulate', question, tier }),
      });
      const data = await res.json();

      if (data.streamUrl) {
        setMessages(prev => [...prev, {
          id: `sim-start-${Date.now()}`, message_type: 'simulation_start',
          role: 'system', content: question,
          structured_data: { streamUrl: data.streamUrl, tier },
          model_tier: tier, simulation_id: null,
          created_at: new Date().toISOString(),
        }]);
      }
    } catch {
      setOctopusState('chatting');
      setActiveSimulation(null);
    }
  }, [conversationId]);

  // Simulation completed callback
  const handleSimulationComplete = useCallback((verdict: any, simulationId: string) => {
    setOctopusState('resting');
    setActiveSimulation(null);

    setMessages(prev => [...prev, {
      id: `verdict-${Date.now()}`, message_type: 'simulation_verdict',
      role: 'assistant', content: null,
      structured_data: verdict,
      model_tier: 'deep', simulation_id: simulationId,
      created_at: new Date().toISOString(),
    }]);
  }, []);

  // Handle refinement
  async function handleRefine(simulationId: string, modification: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/c/${conversationId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refine', simulationId, modification, tier: 'deep' }),
      });
      const data = await res.json();

      setMessages(prev => [...prev, {
        id: `refine-${Date.now()}`, message_type: 'refinement',
        role: 'assistant', content: null,
        structured_data: data, model_tier: 'deep',
        simulation_id: simulationId, created_at: new Date().toISOString(),
      }]);
    } catch {} finally { setLoading(false); }
  }

  // Render a single message based on its type
  function renderMessage(msg: Message) {
    switch (msg.message_type) {
      case 'text':
        return <MessageBubble key={msg.id} role={msg.role} content={msg.content || ''} tier={msg.model_tier} />;

      case 'decision_card':
        return (
          <div key={msg.id}>
            <MessageBubble role="assistant" content={msg.content || ''} tier={msg.model_tier} />
            {msg.structured_data?.suggest_simulation && (
              <div style={{ margin: '8px 0 8px 48px' }}>
                <SimulationSuggestCard
                  prompt={msg.structured_data.simulation_prompt}
                  onSimulate={(q) => handleSimulate(q, 'deep')}
                />
              </div>
            )}
            {msg.structured_data?.disclaimer && (
              <div style={{ margin: '4px 0 4px 48px', padding: '8px 12px', borderRadius: '6px', background: '#FEF3C720', fontSize: '11px', color: '#92400E' }}>
                {msg.structured_data.disclaimer}
              </div>
            )}
          </div>
        );

      case 'simulation_start':
        return (
          <SimulationBlock
            key={msg.id}
            question={msg.content || ''}
            streamUrl={msg.structured_data?.streamUrl}
            octopusState={octopusState}
            onComplete={handleSimulationComplete}
          />
        );

      case 'simulation_verdict':
        return <VerdictCard key={msg.id} verdict={msg.structured_data} simulationId={msg.simulation_id} conversationId={conversationId} onRefine={(mod) => handleRefine(msg.simulation_id!, mod)} />;

      case 'refinement':
        return <RefinementCard key={msg.id} data={msg.structured_data} />;

      case 'system':
        return (
          <div key={msg.id} style={{ textAlign: 'center', padding: '8px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
            {msg.content}
          </div>
        );

      default:
        return <MessageBubble key={msg.id} role={msg.role} content={msg.content || ''} tier={msg.model_tier} />;
    }
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{
        display: 'flex', justifyContent: 'center', padding: '16px 0',
        transition: 'all 0.3s ease',
        height: messages.length === 0 ? '200px' : '80px',
        overflow: 'hidden',
      }}>
        <OctopusVisual state={octopusState} compact={messages.length > 0} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px', maxWidth: '720px', margin: '0 auto', width: '100%' }}>
        {messages.map(renderMessage)}
        {loading && (
          <div style={{ padding: '12px 0', fontSize: '13px', color: 'var(--text-tertiary)' }}>
            Thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '12px 24px 24px', maxWidth: '720px', margin: '0 auto', width: '100%' }}>
        <ChatInput onSend={handleSend} loading={loading} />
      </div>
    </div>
  );
}

// ═══ HELPER COMPONENTS ═══

function SimulationSuggestCard({ prompt, onSimulate }: { prompt: string; onSimulate: (q: string) => void }) {
  return (
    <div style={{
      padding: '12px 16px', borderRadius: '10px',
      border: '1px solid rgba(124,58,237,0.2)', background: 'rgba(124,58,237,0.04)',
    }}>
      <div style={{ fontSize: '12px', fontWeight: 500, color: '#7C3AED', marginBottom: '8px' }}>
        This looks like a decision worth analyzing deeply
      </div>
      <button
        onClick={() => onSimulate(prompt)}
        style={{
          padding: '8px 16px', borderRadius: '8px', border: 'none',
          background: '#7C3AED', color: '#fff', fontSize: '13px',
          fontWeight: 500, cursor: 'pointer',
        }}
      >
        Activate Deep Simulation
      </button>
    </div>
  );
}
