'use client';

/**
 * New conversation — octopus idle state, ready for input.
 * When user sends first message, creates conversation and redirects to /c/[id].
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OctopusVisual from '@/components/chat/OctopusVisual';
import ChatInput from '@/components/chat/ChatInput';

export default function NewConversation() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSend(message: string, tier: string) {
    if (!message.trim() || loading) return;
    setLoading(true);

    try {
      // Create conversation
      const res = await fetch('/api/c', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstMessage: message }),
      });
      const { id } = await res.json();

      // Send first message
      await fetch(`/api/c/${id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, tier }),
      });

      // Navigate to conversation
      router.push(`/c/${id}`);
    } catch {
      setLoading(false);
    }
  }

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', padding: '24px',
    }}>
      <OctopusVisual state="idle" />

      <div style={{ marginTop: '16px', marginBottom: '32px', textAlign: 'center' }}>
        <div style={{ fontSize: '20px', fontWeight: 300, color: '#7C3AED' }}>octux ai</div>
        <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
          Any decision. 10 AI specialists. Memory that compounds.
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px', justifyContent: 'center', maxWidth: '500px' }}>
        {[
          'Should I invest $10K in NVIDIA?',
          'Open a restaurant in Gangnam?',
          'Accept this job offer or negotiate?',
          'Is it time to raise a seed round?',
        ].map((suggestion, i) => (
          <button
            key={i}
            onClick={() => handleSend(suggestion, 'ink')}
            disabled={loading}
            style={{
              padding: '8px 14px', borderRadius: '20px', fontSize: '13px',
              border: '1px solid var(--border-default, rgba(0,0,0,0.10))',
              background: 'transparent', cursor: 'pointer',
              color: 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            {suggestion}
          </button>
        ))}
      </div>

      <div style={{ width: '100%', maxWidth: '600px' }}>
        <ChatInput
          onSend={handleSend}
          placeholder="What decision are you facing?"
          loading={loading}
        />
      </div>
    </div>
  );
}
