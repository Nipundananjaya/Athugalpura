-- ============================================================
-- SmartServe – Supabase RLS Policies
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================
-- These policies allow the anon key (used by supabase_helper.js)
-- to read/write all tables. Tighten these for production.
-- ============================================================

-- Categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_categories" ON categories;
CREATE POLICY "allow_all_categories" ON categories FOR ALL USING (true) WITH CHECK (true);

-- Menu Items
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_menu_items" ON menu_items;
CREATE POLICY "allow_all_menu_items" ON menu_items FOR ALL USING (true) WITH CHECK (true);

-- Staff
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_staff" ON staff;
CREATE POLICY "allow_all_staff" ON staff FOR ALL USING (true) WITH CHECK (true);

-- Users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_users" ON users;
CREATE POLICY "allow_all_users" ON users FOR ALL USING (true) WITH CHECK (true);

-- Table Sessions
ALTER TABLE table_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_table_sessions" ON table_sessions;
CREATE POLICY "allow_all_table_sessions" ON table_sessions FOR ALL USING (true) WITH CHECK (true);

-- Orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_orders" ON orders;
CREATE POLICY "allow_all_orders" ON orders FOR ALL USING (true) WITH CHECK (true);

-- Order Items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_order_items" ON order_items;
CREATE POLICY "allow_all_order_items" ON order_items FOR ALL USING (true) WITH CHECK (true);

-- Tables QR
ALTER TABLE tables_qr ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_tables_qr" ON tables_qr;
CREATE POLICY "allow_all_tables_qr" ON tables_qr FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- Storage: Create public "uploads" bucket for QR/menu images
-- (Do this in Supabase Dashboard → Storage → New Bucket)
--   Name: uploads
--   Public: YES
-- ============================================================
