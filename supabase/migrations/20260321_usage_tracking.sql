-- Usage tracking table (if not already created by the app)
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  chat_messages INTEGER DEFAULT 0,
  simulations INTEGER DEFAULT 0,
  researches INTEGER DEFAULT 0,
  globalops INTEGER DEFAULT 0,
  invest INTEGER DEFAULT 0,
  UNIQUE(user_id, date)
);

ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own usage" ON usage_tracking
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own usage" ON usage_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own usage" ON usage_tracking
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_date
  ON usage_tracking (user_id, date);
