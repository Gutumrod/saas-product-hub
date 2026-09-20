-- Migration: 0008_product_installations.sql
-- Target: hub-web product database (Project A, coyelzlgukvpgguqpjdi) ONLY.
--         NOT WSTERA LAB & CONTROL — those migrations are 0002..0006 and must never be applied here.
-- Status: DRAFT — NOT APPLIED. Requires the bounded Owner authorization described in
--         docs/platform/house-long-run/R15-D0-DECISION-OUTCOME-2026-09-20.md §5.
-- Purpose: create the objects that exist in drizzle/schema.ts but have no migration anywhere:
--          the two enum types and public.product_installations (with its FKs and unique index).
--          Verified column-by-column against drizzle/schema.ts:132-165.
-- Safety: ADDITIVE ONLY. No ALTER of any existing object, no DROP, no grants, no RLS change.
--         Every statement is IF NOT EXISTS / duplicate-tolerant so a re-run is a no-op.
--
-- Why this file is hand-authored rather than generated: this database has no
-- __drizzle_migrations journal, so `drizzle-kit generate|migrate` or `npm run db:push` would
-- attempt to reconcile the ENTIRE schema and would emit DDL for objects whose proper home is a
-- different project. Hand-authored additive DDL, reviewed against schema.ts, is the safe path.
--
-- Rollback: see docs/control-plane/BUILD-EVIDENCE-2026-09-06.md § Rollback Procedure pattern —
--           drop in reverse dependency order:
--             DROP TABLE IF EXISTS product_installations;
--             DROP TYPE IF EXISTS installation_status;
--             DROP TYPE IF EXISTS installation_source;
--           (0007 objects roll back separately; see that file's own header.)

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Enum types  (drizzle/schema.ts:26-28 and :40)
--    Postgres has no CREATE TYPE IF NOT EXISTS; the DO-block pattern below is the
--    duplicate-tolerant equivalent, matching 0007's enum handling.
-- ─────────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE installation_status AS ENUM ('trial', 'active', 'cancelled', 'suspended');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE installation_source AS ENUM ('manual', 'webhook');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Table  (drizzle/schema.ts:132-165)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_installations (
  id                 integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "productId"        integer NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  "customerEmail"    varchar(320),
  "customerName"     varchar(255),
  "externalCustomerId" varchar(255),
  status             installation_status NOT NULL DEFAULT 'active',
  "planLabel"        varchar(120),
  source             installation_source NOT NULL DEFAULT 'manual',
  notes              text,
  "recordedBy"       uuid REFERENCES profiles (id) ON DELETE SET NULL,
  "externalEventId"  varchar(255),
  "installedAt"      timestamptz NOT NULL DEFAULT now(),
  "updatedAt"        timestamptz NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Unique index  (drizzle/schema.ts:157-160)
--    NULLs are distinct in a Postgres unique index, so manual rows (externalEventId NULL)
--    never collide with each other — only genuine event replays do. This is the
--    idempotency key the product-event webhook relies on.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS product_installations_event_unique
  ON product_installations ("productId", "externalEventId");
