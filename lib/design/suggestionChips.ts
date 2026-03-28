import {
  Briefcase,
  Code2,
  Factory,
  Store,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';

export interface SuggestionChipConfig {
  text: string;
  color: string;
  Icon: LucideIcon;
}

/** Shared hero + chat suggestion chips — category color + icon */
const CHIP_ICON = '#8a8578';

export const SUGGESTION_CHIP_CONFIG: SuggestionChipConfig[] = [
  { text: 'Should I import smartphones from China?', color: CHIP_ICON, Icon: Factory },
  { text: 'Open a restaurant in Gangnam, Seoul', color: CHIP_ICON, Icon: Store },
  { text: 'Invest $10K in NVIDIA or index funds?', color: CHIP_ICON, Icon: TrendingUp },
  { text: 'Launch a SaaS in Latin America', color: CHIP_ICON, Icon: Code2 },
  { text: 'Hire a CTO or outsource development?', color: CHIP_ICON, Icon: Briefcase },
];
