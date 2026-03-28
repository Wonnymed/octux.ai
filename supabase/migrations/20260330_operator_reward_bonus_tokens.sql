-- Operator profile completion reward + bonus token pool on subscriptions

ALTER TABLE operator_profiles
  ADD COLUMN IF NOT EXISTS reward_claimed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS reward_claimed_at TIMESTAMPTZ;

ALTER TABLE user_subscriptions
  ADD COLUMN IF NOT EXISTS bonus_tokens INTEGER NOT NULL DEFAULT 0;
