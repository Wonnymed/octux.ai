-- My Operator — adaptive profile for simulations (lib/operator/*, app/api/operator)

CREATE TABLE IF NOT EXISTS operator_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  profile JSONB NOT NULL DEFAULT '{}'::jsonb,
  operator_type TEXT,
  completeness INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_operator_user ON operator_profiles(user_id);

ALTER TABLE operator_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own operator profile" ON operator_profiles
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION touch_operator_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS operator_profiles_updated_at ON operator_profiles;
CREATE TRIGGER operator_profiles_updated_at
  BEFORE UPDATE ON operator_profiles
  FOR EACH ROW
  EXECUTE FUNCTION touch_operator_profiles_updated_at();
