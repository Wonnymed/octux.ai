import { describe, it, expect } from 'vitest';
import { getModelForTier, getDefaultTier } from '@/lib/chat/tiers';

describe('chat tiers', () => {
  it('uses Haiku for default chat model', () => {
    expect(getModelForTier('default')).toContain('haiku');
  });

  it('default tier is stable', () => {
    expect(getDefaultTier('free')).toBe('default');
    expect(getDefaultTier('pro')).toBe('default');
  });
});
