CREATE TABLE IF NOT EXISTS entries (
  id SERIAL PRIMARY KEY,
  tracking_id TEXT,
  spoc_name TEXT NOT NULL,
  subject TEXT,
  category TEXT,
  sub_category TEXT,
  date DATE,
  start_time TEXT,
  end_time TEXT,
  total_hours TEXT,
  student_name TEXT,
  details TEXT,
  created_date TIMESTAMPTZ,
  updated_date TEXT,
  approval_status TEXT DEFAULT 'Pending',
  comment TEXT,
  uploaded_file_name TEXT,
  approved_by TEXT,
  ecode TEXT,
  UNIQUE(tracking_id)
);
CREATE INDEX IF NOT EXISTS idx_entries_spoc ON entries(spoc_name);
CREATE INDEX IF NOT EXISTS idx_entries_status ON entries(approval_status);
CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(date);
CREATE INDEX IF NOT EXISTS idx_entries_category ON entries(category);
