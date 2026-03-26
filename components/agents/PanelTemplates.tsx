'use client';

import { cn } from '@/lib/design/cn';
import { OctBadge } from '@/components/octux';

export interface PanelTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  agentIds: string[];
  agentCount: number;
  icon: string;
  popular?: boolean;
}

export const PANEL_TEMPLATES: PanelTemplate[] = [
  {
    id: 'startup_launch',
    name: 'Startup Launch',
    description: 'Full analysis for launching a new business',
    category: 'business',
    agentIds: ['base_rate_archivist', 'regulatory_gatekeeper', 'demand_signal_analyst', 'unit_economics_auditor', 'execution_operator', 'second_order_thinker', 'market_cycle_analyst', 'risk_adjusted_return'],
    agentCount: 8,
    icon: '\u{1F680}',
    popular: true,
  },
  {
    id: 'investment_decision',
    name: 'Investment Decision',
    description: 'Risk-adjusted analysis for financial decisions',
    category: 'investment',
    agentIds: ['risk_adjusted_return', 'market_cycle_analyst', 'base_rate_archivist', 'unit_economics_auditor', 'second_order_thinker', 'regret_minimizer'],
    agentCount: 6,
    icon: '\u{1F4C8}',
  },
  {
    id: 'relationship_check',
    name: 'Relationship Check',
    description: 'Multi-perspective relationship analysis',
    category: 'relationships',
    agentIds: ['emotional_intelligence', 'attachment_style_analyst', 'cognitive_bias_detector', 'regret_minimizer', 'second_order_thinker'],
    agentCount: 5,
    icon: '\u2764\uFE0F',
  },
  {
    id: 'career_pivot',
    name: 'Career Pivot',
    description: 'Should you make the jump?',
    category: 'career',
    agentIds: ['career_trajectory', 'risk_adjusted_return', 'regret_minimizer', 'base_rate_archivist', 'execution_operator', 'second_order_thinker', 'unit_economics_auditor'],
    agentCount: 7,
    icon: '\u{1F4BC}',
  },
  {
    id: 'life_decision',
    name: 'Life Decision',
    description: 'Big personal choices with lasting impact',
    category: 'life',
    agentIds: ['regret_minimizer', 'second_order_thinker', 'emotional_intelligence', 'cognitive_bias_detector', 'base_rate_archivist', 'execution_operator'],
    agentCount: 6,
    icon: '\u{1F30D}',
  },
];

interface PanelTemplatesProps {
  onSelect: (template: PanelTemplate) => void;
  className?: string;
}

export default function PanelTemplates({ onSelect, className }: PanelTemplatesProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <span className="text-micro font-medium text-txt-tertiary">Quick panels</span>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {PANEL_TEMPLATES.map(template => (
          <button
            key={template.id}
            onClick={() => onSelect(template)}
            className={cn(
              'flex items-start gap-3 p-3 rounded-lg border text-left',
              'transition-all duration-normal',
              'border-border-subtle hover:border-border-default hover:bg-surface-2/30',
              template.popular && 'border-accent/20 hover:border-accent/40',
            )}
          >
            <span className="text-lg shrink-0">{template.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-xs font-medium text-txt-primary">{template.name}</span>
                {template.popular && <OctBadge size="xs" className="bg-accent/10 text-accent">Popular</OctBadge>}
              </div>
              <p className="text-micro text-txt-tertiary">{template.description}</p>
              <span className="text-micro text-txt-disabled mt-0.5 block">{template.agentCount} agents</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
