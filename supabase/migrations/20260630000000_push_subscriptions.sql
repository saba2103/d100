-- ---------------------------------------------------------------------------
-- push_subscriptions — web push notification endpoints
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,      -- full PushSubscription object
  device_label TEXT,                -- "iPhone", "Chrome on Mac" etc
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, (subscription->>'endpoint'))
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions (user_id);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "push_subscriptions: owner all"
  ON push_subscriptions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
