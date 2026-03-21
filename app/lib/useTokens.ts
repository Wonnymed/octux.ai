"use client";
import { useState, useEffect, useCallback } from "react";
import { ACTION_COSTS, getGuestTokens, consumeGuestTokens, PLAN_TOKENS, PLAN_FEATURES } from "./tokens";
import type { TokenStatus } from "./tokens";

const GUEST_DEFAULT: TokenStatus = {
  available: 50,
  monthlyTotal: 50,
  monthlyUsed: 0,
  bonusTokens: 0,
  plan: "guest",
  daysUntilReset: 30,
  features: PLAN_FEATURES.guest,
};

export function useTokens(isLoggedIn: boolean) {
  const [status, setStatus] = useState<TokenStatus & { costs: Record<string, number> }>({
    ...GUEST_DEFAULT,
    costs: ACTION_COSTS,
  });
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(() => {
    if (!isLoggedIn) {
      // Guest: read from localStorage
      const available = typeof window !== "undefined" ? getGuestTokens() : 50;
      setStatus({
        available,
        monthlyTotal: 50,
        monthlyUsed: 50 - available,
        bonusTokens: 0,
        plan: "guest",
        daysUntilReset: 30,
        features: PLAN_FEATURES.guest,
        costs: ACTION_COSTS,
      });
      return;
    }
    setLoading(true);
    fetch("/api/tokens")
      .then(r => r.json())
      .then(data => setStatus({ ...GUEST_DEFAULT, costs: ACTION_COSTS, ...data }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  useEffect(() => { refresh(); }, [refresh]);

  const canAfford = useCallback((action: string) => {
    const cost = ACTION_COSTS[action] ?? 1;
    return status.available >= cost;
  }, [status.available]);

  /** Consume tokens client-side for guests, or call API for logged-in users */
  const consume = useCallback(async (action: string, metadata?: Record<string, any>): Promise<boolean> => {
    const cost = ACTION_COSTS[action] ?? 1;
    if (cost === 0) return true;

    if (!isLoggedIn) {
      const ok = consumeGuestTokens(action);
      if (ok) {
        setStatus(prev => ({ ...prev, available: prev.available - cost, monthlyUsed: prev.monthlyUsed + cost }));
      }
      return ok;
    }

    try {
      const res = await fetch("/api/tokens/consume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, metadata }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      setStatus(prev => ({ ...prev, available: data.remaining, monthlyUsed: prev.monthlyUsed + cost }));
      return true;
    } catch {
      return false;
    }
  }, [isLoggedIn]);

  return { ...status, loading, refresh, canAfford, consume };
}
