"use client";
import { useState, useEffect } from "react";
import type { Tier } from "./plans";

type UsageData = {
  tier: Tier;
  usage: {
    chat_today: number;
    simulations_month: number;
    researches_month: number;
    protect_month: number;
    hire_month: number;
  };
  limits: {
    chat_daily: number;
    simulate_monthly: number;
    research_monthly: number;
    protect_monthly: number;
    hire_monthly: number;
    second_opinion: boolean;
    challenge: boolean;
    model: string;
  };
};

const DEFAULT: UsageData = {
  tier: "free",
  usage: { chat_today: 0, simulations_month: 0, researches_month: 0, protect_month: 0, hire_month: 0 },
  limits: { chat_daily: 5, simulate_monthly: 3, research_monthly: 0, protect_monthly: 0, hire_monthly: 0, second_opinion: false, challenge: false, model: "sonnet" },
};

export function useUserTier(isLoggedIn: boolean) {
  const [data, setData] = useState<UsageData>(DEFAULT);
  const [loading, setLoading] = useState(false);

  const refresh = () => {
    if (!isLoggedIn) { setData(DEFAULT); return; }
    setLoading(true);
    fetch("/api/usage")
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  return { ...data, loading, refresh };
}
