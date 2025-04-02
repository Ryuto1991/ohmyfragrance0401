-- スケジュールタスクテーブルの作成
CREATE TABLE IF NOT EXISTS scheduled_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  schedule TEXT NOT NULL, -- cron式のスケジュール
  last_run TIMESTAMP WITH TIME ZONE,
  next_run TIMESTAMP WITH TIME ZONE NOT NULL,
  enabled BOOLEAN DEFAULT true,
  type TEXT NOT NULL CHECK (type IN ('security_scan', 'session_cleanup', 'vulnerability_update', 'notification_check')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- スケジュールタスクの初期データ
INSERT INTO scheduled_tasks (name, schedule, next_run, type)
VALUES
  -- セキュリティスキャン: 毎日午前0時
  ('Daily Security Scan', '0 0 * * *', NOW(), 'security_scan'),
  
  -- セッションクリーンアップ: 毎週日曜日午前1時
  ('Weekly Session Cleanup', '0 1 * * 0', NOW(), 'session_cleanup'),
  
  -- 脆弱性レポート更新: 毎週水曜日午前2時
  ('Weekly Vulnerability Update', '0 2 * * 3', NOW(), 'vulnerability_update'),
  
  -- セキュリティ通知チェック: 毎日午後6時
  ('Daily Notification Check', '0 18 * * *', NOW(), 'notification_check')
ON CONFLICT DO NOTHING;

-- RLSポリシーの設定
ALTER TABLE scheduled_tasks ENABLE ROW LEVEL SECURITY;

-- 管理者のみがアクセス可能
CREATE POLICY "Admin only" ON scheduled_tasks
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'
  ));

-- 更新時のタイムスタンプ自動更新
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_scheduled_tasks_updated_at
  BEFORE UPDATE ON scheduled_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 