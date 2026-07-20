-- ============================================================
-- SmartServe — Waiter Assignment & Offline SMS Migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Step 1: Add is_online status column to staff table
-- Defaults to false (offline) for all existing staff
ALTER TABLE staff
  ADD COLUMN IF NOT EXISTS is_online BOOLEAN NOT NULL DEFAULT false;

-- Step 2: Create waiter-to-table assignments mapping table
-- NOTE: No UNIQUE on table_number — multiple waiters can share a table
CREATE TABLE IF NOT EXISTS waiter_table_assignments (
  id           BIGSERIAL PRIMARY KEY,
  waiter_id    BIGINT NOT NULL REFERENCES staff(staff_id) ON DELETE CASCADE,
  table_number INT    NOT NULL,
  assigned_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookups by table_number (used in Edge Function)
CREATE INDEX IF NOT EXISTS idx_wta_table_number
  ON waiter_table_assignments(table_number);

-- Index for fast lookups by waiter_id (used in admin assignment UI)
CREATE INDEX IF NOT EXISTS idx_wta_waiter_id
  ON waiter_table_assignments(waiter_id);

-- Step 3: Enable RLS (consistent with all other tables in the app)
ALTER TABLE waiter_table_assignments ENABLE ROW LEVEL SECURITY;

-- Open policy — consistent with existing app-wide dev policy
CREATE POLICY "allow_all" ON waiter_table_assignments
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- Verification queries — run after the above to confirm:
-- ============================================================
-- SELECT column_name, data_type, column_default
--   FROM information_schema.columns
--  WHERE table_name = 'staff' AND column_name = 'is_online';

-- SELECT tablename, rowsecurity
--   FROM pg_tables
--  WHERE tablename = 'waiter_table_assignments';
