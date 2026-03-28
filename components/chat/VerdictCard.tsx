'use client';

import { useState, useCallback, useEffect } from 'react';
import VerdictCompact from '@/components/verdict/VerdictCompact';
import VerdictExpanded from '@/components/verdict/VerdictExpanded';
import SuggestionChips from '@/components/chat/SuggestionChips';
import { useSuggestions } from '@/lib/hooks/useSuggestions';
import type { VerdictData } from '@/components/verdict/VerdictCompact';

interface VerdictCardProps {
  verdict: any;
  simulationId?: string;
  conversationId?: string;
  onRefine?: (modification: string) => void;
}

export default function VerdictCard({ verdict, simulationId, conversationId, onRefine }: VerdictCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { suggestions, loading: sugLoading, fetchSuggestions, refresh } = useSuggestions({
    conversationId: conversationId || '',
    enabled: !!conversationId,
  });

  if (!verdict) return null;

  // Normalize verdict data
  const data: VerdictData = {
    recommendation: verdict.recommendation || 'proceed',
    probability: verdict.probability || 0,
    grade: verdict.grade,
    one_liner: verdict.one_liner || verdict.summary,
    summary: verdict.summary,
    main_risk: verdict.main_risk,
    next_action: verdict.next_action,
    citations: verdict.citations || [],
    agent_scores: verdict.agent_scores || [],
    confidence_heatmap: verdict.confidence_heatmap || [],
    disclaimer: verdict.disclaimer,
    calibration_adjusted: verdict.calibration_adjusted,
    calibration_note: verdict.calibration_note,
    action_urgency: verdict.action_urgency,
  };

  const handleShare = useCallback(() => {
    const url = `${window.location.origin}/c/${conversationId}/report`;
    if (navigator.share) {
      navigator.share({ title: 'Sukgo Decision Report', url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
    }
  }, [conversationId]);

  const handleAgentChat = useCallback((agentId: string, agentName: string) => {
    window.dispatchEvent(new CustomEvent('sukgo:agent-chat', {
      detail: { agentId, agentName, simulationId, conversationId },
    }));
  }, [simulationId, conversationId]);

  // Fetch suggestions when verdict renders
  useEffect(() => {
    if (verdict && conversationId) {
      fetchSuggestions('post_verdict', {
        verdict: {
          recommendation: data.recommendation,
          probability: data.probability,
          grade: data.grade,
          one_liner: data.one_liner,
          main_risk: data.main_risk,
          next_action: data.next_action,
          agent_scores: data.agent_scores,
        },
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  return (
    <div className="mb-4">
      {expanded ? (
        <VerdictExpanded
          verdict={data}
          simulationId={simulationId}
          conversationId={conversationId}
          onCollapse={() => setExpanded(false)}
          onShare={handleShare}
          onRefine={onRefine}
          onAgentChat={handleAgentChat}
        />
      ) : (
        <VerdictCompact
          verdict={data}
          simulationId={simulationId}
          conversationId={conversationId}
          onExpand={() => setExpanded(true)}
          onShare={handleShare}
          onRefine={onRefine}
          onAgentChat={handleAgentChat}
        />
      )}

      {(suggestions.length > 0 || sugLoading) && (
        <div className="mt-2">
          <SuggestionChips
            suggestions={suggestions}
            loading={sugLoading}
            onSelect={(text) => {
              window.dispatchEvent(new CustomEvent('sukgo:send-message', { detail: { text } }));
            }}
            onRefresh={() => refresh('post_verdict', {
              verdict: {
                recommendation: data.recommendation,
                probability: data.probability,
                one_liner: data.one_liner,
                main_risk: data.main_risk,
                next_action: data.next_action,
              },
            })}
          />
        </div>
      )}
    </div>
  );
}
