-- SQL to set up RLS policies for your tables (DEVELOPMENT ONLY)
-- Run this in the Supabase SQL Editor

-- Enable RLS on tables if not already enabled
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous users to perform all operations (DEVELOPMENT ONLY)
-- Clients table
CREATE POLICY "Anonymous users can perform all operations on clients"
ON clients FOR ALL TO anon
USING (true)
WITH CHECK (true);

-- Brands table
CREATE POLICY "Anonymous users can perform all operations on brands"
ON brands FOR ALL TO anon
USING (true)
WITH CHECK (true);

-- Templates table
CREATE POLICY "Anonymous users can perform all operations on templates"
ON templates FOR ALL TO anon
USING (true)
WITH CHECK (true);

-- Employees table
CREATE POLICY "Anonymous users can perform all operations on employees"
ON employees FOR ALL TO anon
USING (true)
WITH CHECK (true);

-- Activities table
CREATE POLICY "Anonymous users can perform all operations on activities"
ON activities FOR ALL TO anon
USING (true)
WITH CHECK (true);

-- Settings table
CREATE POLICY "Anonymous users can perform all operations on settings"
ON settings FOR ALL TO anon
USING (true)
WITH CHECK (true); 