-- SQL to set up RLS policies for your tables
-- Run this in the Supabase SQL Editor

-- Enable RLS on tables if not already enabled
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users to perform all operations
-- Clients table
CREATE POLICY "Authenticated users can perform all operations on clients"
ON clients FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Brands table
CREATE POLICY "Authenticated users can perform all operations on brands"
ON brands FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Templates table
CREATE POLICY "Authenticated users can perform all operations on templates"
ON templates FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Employees table
CREATE POLICY "Authenticated users can perform all operations on employees"
ON employees FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Activities table
CREATE POLICY "Authenticated users can perform all operations on activities"
ON activities FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Settings table
CREATE POLICY "Authenticated users can perform all operations on settings"
ON settings FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- For anonymous access (if needed)
-- This allows read-only access to public data
CREATE POLICY "Anonymous users can read public data from clients"
ON clients FOR SELECT TO anon
USING (true);

CREATE POLICY "Anonymous users can read public data from brands"
ON brands FOR SELECT TO anon
USING (true);

CREATE POLICY "Anonymous users can read public data from templates"
ON templates FOR SELECT TO anon
USING (true); 