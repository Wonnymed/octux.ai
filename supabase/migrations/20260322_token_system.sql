-- Token balance per user
CREATE TABLE IF NOT EXISTS token_balance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  monthly_tokens INTEGER NOT NULL DEFAULT 200,
  monthly_used INTEGER NOT NULL DEFAULT 0,
  bonus_tokens INTEGER NOT NULL DEFAULT 0,
  plan TEXT NOT NULL DEFAULT 'free',
  reset_date TIMESTAMPTZ NOT NULL DEFAULT (date_trunc('month', NOW()) + interval '1 month'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Token usage log (every action)
CREATE TABLE IF NOT EXISTS token_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  tokens_used INTEGER NOT NULL,
  channel TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE token_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own balance" ON token_balance FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own balance" ON token_balance FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users insert own balance" ON token_balance FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users see own log" ON token_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own log" ON token_log FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_token_balance_user ON token_balance(user_id);
CREATE INDEX IF NOT EXISTS idx_token_log_user_date ON token_log(user_id, created_at);
