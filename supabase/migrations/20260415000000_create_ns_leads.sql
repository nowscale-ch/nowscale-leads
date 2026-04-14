CREATE TABLE IF NOT EXISTS ns_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT,
  email TEXT,
  phone TEXT,
  company TEXT,
  message TEXT,
  form_data JSONB DEFAULT '{}',
  source TEXT NOT NULL,
  form_type TEXT NOT NULL,
  page_url TEXT,
  status TEXT DEFAULT 'neu',
  assigned_to TEXT,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ns_leads ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can do everything' AND tablename = 'ns_leads') THEN
    CREATE POLICY "Authenticated users can do everything" ON ns_leads FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can insert leads' AND tablename = 'ns_leads') THEN
    CREATE POLICY "Anyone can insert leads" ON ns_leads FOR INSERT WITH CHECK (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ns_leads_status ON ns_leads(status);
CREATE INDEX IF NOT EXISTS idx_ns_leads_source ON ns_leads(source);
CREATE INDEX IF NOT EXISTS idx_ns_leads_created ON ns_leads(created_at DESC);
