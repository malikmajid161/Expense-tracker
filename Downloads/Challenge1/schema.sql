-- ================================================================================
--          CHAINGAURD AI — DATABASE SCHEMA & SEED DATA
-- ================================================================================

-- Enable UUID extension for unique primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Suppliers Directory Table
CREATE TABLE IF NOT EXISTS suppliers (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(200) NOT NULL,
  city          VARCHAR(100) NOT NULL,
  country       VARCHAR(100) DEFAULT 'Pakistan',
  materials     TEXT[],          -- e.g., ARRAY['Lithium Battery','PCB Board']
  price_index   DECIMAL(5,2),    -- relative price index (1.00 is base market cost)
  delivery_days INTEGER,         -- transit lead time in days
  quality_score DECIMAL(3,2),    -- 0.00 to 1.00 quality score
  api_endpoint  VARCHAR(500),    -- mock Purchase Order URL
  active        BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Incidents Log Table
CREATE TABLE IF NOT EXISTS incidents (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source              VARCHAR(100),   -- 'news', 'policy_doc', 'port_api'
  title               TEXT,
  raw_text            TEXT,
  risk_score          DECIMAL(5,2),   -- 0.00 to 1.00 score
  risk_pkr            BIGINT,         -- computed impact in PKR
  status              VARCHAR(50) DEFAULT 'detected', -- 'processing', 'mitigated'
  antigravity_run_id  VARCHAR(200),
  detected_at         TIMESTAMPTZ DEFAULT NOW(),
  mitigated_at        TIMESTAMPTZ
);

-- 3. Granular Agent Action Log Table
CREATE TABLE IF NOT EXISTS agent_actions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES incidents(id),
  agent_type  VARCHAR(50),      -- 'procurement', 'legal', 'fintech'
  action_name VARCHAR(100),     -- e.g., 'place_commodity_hedge'
  input_json  JSONB,
  output_json JSONB,
  status      VARCHAR(50),      -- 'success', 'failed'
  confidence  DECIMAL(4,3),
  savings_pkr BIGINT,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Pakistani Suppliers Directory (Phase 1, Step 4 & 5 Specifications)
INSERT INTO suppliers (name, city, materials, price_index, delivery_days, quality_score, api_endpoint) VALUES
('Karachi Electronics Hub', 'Karachi', ARRAY['Lithium Battery','PCB Board','Capacitors'], 0.95, 1, 0.88, 'https://mock-procurement.PLACEHOLDER/api/v1/purchase-orders'),
('Gujranwala Parts Market', 'Gujranwala', ARRAY['Steel','Aluminum','Copper Wire'], 0.90, 2, 0.82, 'https://mock-procurement.PLACEHOLDER/api/v1/purchase-orders'),
('Lahore Industrial Zone', 'Lahore', ARRAY['Lithium Battery','Electric Motors'], 1.05, 3, 0.91, 'https://mock-procurement.PLACEHOLDER/api/v1/purchase-orders'),
('Sialkot Tech Suppliers', 'Sialkot', ARRAY['Steel','Fasteners','Housing Units'], 0.88, 2, 0.85, 'https://mock-procurement.PLACEHOLDER/api/v1/purchase-orders'),
('Islamabad Component Store', 'Islamabad', ARRAY['PCB Board','Microcontrollers','Sensors'], 1.10, 4, 0.93, 'https://mock-procurement.PLACEHOLDER/api/v1/purchase-orders');
