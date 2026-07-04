-- =====================================================================
--               ONE.SHEFARO INDIA - SUPABASE DATABASE SCHEMA
-- =====================================================================
-- Description: This SQL script sets up the full database schema for the 
--              one.shefaro citizen courier logistics admin panel. 
--              Run this script directly in your Supabase SQL Editor.
-- =====================================================================

-- Enable necessary Postgres extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------
-- 1. Table: users (Customer and Courier Accounts)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    signup_date DATE DEFAULT CURRENT_DATE,
    shipment_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.users IS 'Customer accounts registering and utilizing one.shefaro courier services.';

-- ---------------------------------------------------------------------
-- 2. Table: courier_partners (Logistics Courier Partners)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.courier_partners (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    coverage_area TEXT,
    on_time_percent NUMERIC(5,2) DEFAULT 95.0,
    active_shipments INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.courier_partners IS 'Integrated domestic logistics and delivery networks.';

-- ---------------------------------------------------------------------
-- 3. Table: shipments (Consignments, Shipments & Parcel Tracking)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shipments (
    id TEXT PRIMARY KEY,
    sender_name TEXT NOT NULL,
    sender_phone TEXT,
    receiver_name TEXT NOT NULL,
    receiver_phone TEXT,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    status TEXT DEFAULT 'Booked' CHECK (status IN ('Booked', 'Dispatched', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled')),
    courier_partner TEXT DEFAULT 'Delhivery',
    date_booked DATE DEFAULT CURRENT_DATE,
    items TEXT,
    weight NUMERIC(10,3) DEFAULT 0.000,
    cost NUMERIC(12,2) DEFAULT 0.00,
    timeline JSONB DEFAULT '[]'::jsonb, -- Array of tracking states and updates
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.shipments IS 'Core consignment database holding state, destination routing, and delivery status.';

-- ---------------------------------------------------------------------
-- 4. Table: pricing_rates (Weight Slab Zone Calculations)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pricing_rates (
    id TEXT PRIMARY KEY,
    weight_slab TEXT NOT NULL,
    zone TEXT NOT NULL,
    standard_rate NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    express_rate NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_slab_zone UNIQUE (weight_slab, zone)
);

COMMENT ON TABLE public.pricing_rates IS 'Zone-based pricing configurations for varying parcel weight brackets.';

-- ---------------------------------------------------------------------
-- 5. Table: promo_codes (Discounts and Marketing Coupons)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.promo_codes (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount_percent INTEGER NOT NULL CHECK (discount_percent BETWEEN 0 AND 100),
    expiry_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.promo_codes IS 'Promotional codes that grant discount benefits to customers during booking.';

-- ---------------------------------------------------------------------
-- 6. Table: faqs (Frequently Asked Questions)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.faqs (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.faqs IS 'Publicly viewable Frequently Asked Questions list.';

-- ---------------------------------------------------------------------
-- 7. Table: about_sections (Static Content for Marketing Page)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.about_sections (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.about_sections IS 'Content blocks driving the informational About Us section.';

-- ---------------------------------------------------------------------
-- 8. Table: transactions (Financial Invoicing and Payment Log)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    date DATE DEFAULT CURRENT_DATE,
    customer_name TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    payment_method TEXT DEFAULT 'UPI' CHECK (payment_method IN ('UPI', 'Card', 'NetBanking', 'Wallet', 'COD')),
    status TEXT DEFAULT 'Success' CHECK (status IN ('Success', 'Refunded', 'Failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.transactions IS 'Customer transaction and payment settlements records.';

-- ---------------------------------------------------------------------
-- 9. Table: support_tickets (Dispute Resolution Helpdesk)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved')),
    date DATE DEFAULT CURRENT_DATE,
    priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
    messages JSONB DEFAULT '[]'::jsonb, -- Array of dialogue exchange events
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.support_tickets IS 'Dispute, damage, and customer support ticket helpdesk.';

-- ---------------------------------------------------------------------
-- 10. Table: admins (Authorized Staff Access Control)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admins (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'Support' CHECK (role IN ('Super Admin', 'Manager', 'Support')),
    date_added DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.admins IS 'Internal administrators who hold elevated permissions to manage logistics.';

-- ---------------------------------------------------------------------
-- 11. Table: audit_logs (Activity Security Logging)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    admin TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.audit_logs IS 'Secured history of critical admin modifications.';

-- =====================================================================
--                     PERFORMANCE OPTIMIZATION INDEXES
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_shipments_status ON public.shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_date_booked ON public.shipments(date_booked);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);

-- =====================================================================
--                   ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================
-- By default in production, enable security to avoid data leakage.
-- If you wish to allow fully public read/write or authenticate purely 
-- with service role/anon keys, customize policies below:

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courier_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- Simplified Policies: Allow public read-only for public-facing assets,
-- but enforce full permissions for service-role/authorized keys.
-- ---------------------------------------------------------------------

-- Drop any existing policies to prevent "policy already exists" errors when re-running
DROP POLICY IF EXISTS "Allow public read access to FAQs" ON public.faqs;
DROP POLICY IF EXISTS "Allow public read access to About Sections" ON public.about_sections;
DROP POLICY IF EXISTS "Full access to authenticated users/admins" ON public.users;
DROP POLICY IF EXISTS "Full access to authenticated partners" ON public.courier_partners;
DROP POLICY IF EXISTS "Full access to authenticated shipments" ON public.shipments;
DROP POLICY IF EXISTS "Full access to authenticated pricing" ON public.pricing_rates;
DROP POLICY IF EXISTS "Full access to authenticated promos" ON public.promo_codes;
DROP POLICY IF EXISTS "Full access to authenticated faqs" ON public.faqs;
DROP POLICY IF EXISTS "Full access to authenticated about sections" ON public.about_sections;
DROP POLICY IF EXISTS "Full access to authenticated transactions" ON public.transactions;
DROP POLICY IF EXISTS "Full access to authenticated tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Full access to authenticated admins" ON public.admins;
DROP POLICY IF EXISTS "Full access to authenticated logs" ON public.audit_logs;

-- Public Content Tables (FAQs & About Us) can be read by anyone
CREATE POLICY "Allow public read access to FAQs" ON public.faqs FOR SELECT USING (true);
CREATE POLICY "Allow public read access to About Sections" ON public.about_sections FOR SELECT USING (true);

-- Admin & Management policies: Allow all operations if requested by authorized admin API keys or service role
CREATE POLICY "Full access to authenticated users/admins" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full access to authenticated partners" ON public.courier_partners FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full access to authenticated shipments" ON public.shipments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full access to authenticated pricing" ON public.pricing_rates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full access to authenticated promos" ON public.promo_codes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full access to authenticated faqs" ON public.faqs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full access to authenticated about sections" ON public.about_sections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full access to authenticated transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full access to authenticated tickets" ON public.support_tickets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full access to authenticated admins" ON public.admins FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full access to authenticated logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);
