CREATE TABLE simulations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  scenario TEXT NOT NULL,
  variables JSONB,
  rounds JSONB NOT NULL,
  verdict JSONB,
  evolution JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own" ON simulations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own" ON simulations FOR INSERT WITH CHECK (auth.uid() = user_id);
