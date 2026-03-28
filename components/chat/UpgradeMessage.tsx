'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowUpRight } from 'lucide-react';
import { OctButton } from '@/components/sukgo';
import { TIERS, type TierType } from '@/lib/billing/tiers';

interface UpgradeMessageProps {
  reason: string;
  suggestedTier?: string;
  tokensUsed?: number;
  tokensTotal?: number;
}

export default function UpgradeMessage({
  reason, suggestedTier = 'pro', tokensUsed, tokensTotal,
}: UpgradeMessageProps) {
  const [loading, setLoading] = useState(false);
  const tierKey = (suggestedTier in TIERS ? suggestedTier : 'pro') as TierType;
  const suggested = TIERS[tierKey];

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: tierKey }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      // Silent
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex justify-center my-4"
    >
      <div className="max-w-sm w-full p-4 rounded-xl border border-accent/15 bg-surface-1">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
            <Zap size={15} className="text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-txt-primary font-medium mb-0.5">{reason}</p>
            {tokensUsed !== undefined && tokensTotal !== undefined && (
              <p className="text-micro text-txt-disabled mb-3">
                {tokensUsed}/{tokensTotal} tokens used this month
              </p>
            )}
            <OctButton
              variant="default"
              size="sm"
              loading={loading}
              onClick={handleUpgrade}
            >
              Upgrade to {suggested.name} — {suggested.limits.tokensPerMonth} tokens
              <ArrowUpRight size={13} className="ml-1" />
            </OctButton>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
