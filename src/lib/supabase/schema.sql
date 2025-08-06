-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  company VARCHAR(255),
  phone VARCHAR(50),
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  source VARCHAR(100) DEFAULT 'website',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  stage VARCHAR(50) DEFAULT 'initial' CHECK (stage IN ('initial', 'discovery', 'analysis', 'proposal', 'follow_up', 'completed')),
  total_messages INTEGER DEFAULT 0,
  ai_cost DECIMAL(10, 6) DEFAULT 0.0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Create transcripts table
CREATE TABLE IF NOT EXISTS transcripts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  message_id VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'audio', 'file', 'system')),
  token_count INTEGER DEFAULT 0,
  cost DECIMAL(10, 6) DEFAULT 0.0,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  UNIQUE(conversation_id, message_id)
);

-- Create conversation_summaries table for periodic summaries
CREATE TABLE IF NOT EXISTS conversation_summaries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  summary_type VARCHAR(50) DEFAULT 'periodic' CHECK (summary_type IN ('periodic', 'final', 'milestone')),
  summary TEXT NOT NULL,
  key_points JSONB DEFAULT '[]',
  action_items JSONB DEFAULT '[]',
  message_range_start INTEGER,
  message_range_end INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Create email_logs table to track sent emails
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  email_type VARCHAR(50) NOT NULL CHECK (email_type IN ('welcome', 'follow_up', 'report', 'summary', 'marketing')),
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
  external_id VARCHAR(255), -- For tracking with email service (Resend, etc.)
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);

CREATE INDEX IF NOT EXISTS idx_conversations_lead_id ON conversations(lead_id);
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_stage ON conversations(stage);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);

CREATE INDEX IF NOT EXISTS idx_transcripts_conversation_id ON transcripts(conversation_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_role ON transcripts(role);
CREATE INDEX IF NOT EXISTS idx_transcripts_timestamp ON transcripts(timestamp);

CREATE INDEX IF NOT EXISTS idx_conversation_summaries_conversation_id ON conversation_summaries(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_summaries_type ON conversation_summaries(summary_type);

CREATE INDEX IF NOT EXISTS idx_email_logs_lead_id ON email_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_conversation_id ON email_logs(conversation_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create views for common queries
CREATE OR REPLACE VIEW lead_conversation_summary AS
SELECT 
  l.id as lead_id,
  l.email,
  l.name,
  l.company,
  l.status as lead_status,
  l.created_at as lead_created_at,
  COUNT(c.id) as total_conversations,
  SUM(c.total_messages) as total_messages,
  SUM(c.ai_cost) as total_ai_cost,
  MAX(c.updated_at) as last_conversation_at,
  ARRAY_AGG(c.stage ORDER BY c.created_at DESC) FILTER (WHERE c.stage IS NOT NULL) as conversation_stages
FROM leads l
LEFT JOIN conversations c ON l.id = c.lead_id
GROUP BY l.id, l.email, l.name, l.company, l.status, l.created_at;

-- Create RLS (Row Level Security) policies if needed
-- Note: Uncomment and modify these if you need user-specific access control

-- ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;

-- Example RLS policy (modify as needed):
-- CREATE POLICY "Users can access their own data" ON leads
--   FOR ALL USING (auth.uid() = user_id);

-- Insert some sample data for testing (optional)
-- INSERT INTO leads (email, name, company, status) VALUES
--   ('test@example.com', 'Test User', 'Test Company', 'new'),
--   ('demo@example.com', 'Demo User', 'Demo Corp', 'qualified')
-- ON CONFLICT (email) DO NOTHING;