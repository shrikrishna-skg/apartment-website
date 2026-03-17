-- ============================================================
-- College Place Apartments - Complete Supabase Database Setup
-- Run this entire script in Supabase SQL Editor (one shot)
-- Dashboard: https://supabase.com/dashboard/project/wcirkgqhuubhthonsora
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 0. SHARED TRIGGER FUNCTION
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ────────────────────────────────────────────────────────────
-- 1. CONTACT INQUIRIES
--    Sources: Contact page, Lease Inquiry page
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  email         text NOT NULL,
  phone         text,
  property_slug text,
  message       text NOT NULL,
  inquiry_type  text NOT NULL DEFAULT 'general'
                CHECK (inquiry_type IN ('general','lease','maintenance','pricing','other')),
  status        text NOT NULL DEFAULT 'new'
                CHECK (status IN ('new','read','replied','archived')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_contact_inquiries_updated_at
  BEFORE UPDATE ON contact_inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status     ON contact_inquiries (status);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_created_at ON contact_inquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_email      ON contact_inquiries (email);

-- ────────────────────────────────────────────────────────────
-- 2. APPLICATIONS
--    Sources: Student Application, General Application, International
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS applications (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Type: student | professional | international
  applicant_type          text NOT NULL DEFAULT 'student'
                          CHECK (applicant_type IN ('student','professional','international')),

  -- Personal info (shared)
  full_name               text NOT NULL,
  email                   text NOT NULL,
  mobile_number           text,
  date_of_birth           date,
  ssn                     text,
  driving_license         text,
  marital_status          text,

  -- Address (shared)
  current_address         text,
  city                    text,
  state                   text,
  zip_code                text,

  -- Employment (shared)
  employer_name           text,
  monthly_income          text,

  -- Student-application specific
  specific_request        text,
  housing_requirement     text,
  preferred_move_in       text,
  lease_duration          text,
  university_name         text,
  student_id              text,
  expected_graduation     text,
  emergency_contact_name  text,
  emergency_contact_phone text,
  emergency_relationship  text,
  employment_status       text,
  income_source           text,
  has_cosigner            boolean DEFAULT false,
  cosigner_name           text,
  cosigner_phone          text,
  cosigner_email          text,
  previous_landlord_name  text,
  landlord_phone          text,
  landlord_address        text,
  reason_for_leaving      text,
  length_of_stay          text,
  ref1_name               text,
  ref1_phone              text,
  ref1_relationship       text,
  ref2_name               text,
  ref2_phone              text,
  ref2_relationship       text,

  -- Consent & status
  consent                 boolean NOT NULL DEFAULT false,
  status                  text NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending','reviewing','approved','denied','withdrawn')),

  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_applications_status         ON applications (status);
CREATE INDEX IF NOT EXISTS idx_applications_type           ON applications (applicant_type);
CREATE INDEX IF NOT EXISTS idx_applications_created_at     ON applications (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_email          ON applications (email);

-- ────────────────────────────────────────────────────────────
-- 3. TOUR BOOKINGS
--    Source: Schedule Tour page
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tour_bookings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name      text NOT NULL,
  last_name       text NOT NULL,
  email           text NOT NULL,
  phone           text NOT NULL,
  property_slug   text,
  floor_plan      text,
  tour_date       date NOT NULL,
  tour_time       text NOT NULL,
  notes           text,
  google_event_id text,
  status          text NOT NULL DEFAULT 'confirmed'
                  CHECK (status IN ('confirmed','completed','cancelled','no_show')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_tour_bookings_updated_at
  BEFORE UPDATE ON tour_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_tour_bookings_date       ON tour_bookings (tour_date);
CREATE INDEX IF NOT EXISTS idx_tour_bookings_status     ON tour_bookings (status);
CREATE INDEX IF NOT EXISTS idx_tour_bookings_created_at ON tour_bookings (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tour_bookings_email      ON tour_bookings (email);

-- Unique constraint: one booking per time slot per date (prevents double-booking)
CREATE UNIQUE INDEX IF NOT EXISTS idx_tour_bookings_unique_slot
  ON tour_bookings (tour_date, tour_time)
  WHERE status != 'cancelled';

-- ────────────────────────────────────────────────────────────
-- 4. EMAIL SUBSCRIBERS
--    Source: Newsletter signup (homepage footer)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS email_subscribers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text NOT NULL UNIQUE,
  name        text,
  source      text,
  subscribed  boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_subscribers_email ON email_subscribers (email);

-- ────────────────────────────────────────────────────────────
-- 5. MAINTENANCE REQUESTS
--    Source: Maintenance page (traditional form + chat)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment     text NOT NULL,
  full_name     text NOT NULL,
  email         text NOT NULL,
  phone         text,
  category      text CHECK (category IN ('plumbing','electrical','hvac','appliance','pest control','other')),
  urgency       text NOT NULL DEFAULT 'medium'
                CHECK (urgency IN ('low','medium','high','emergency')),
  description   text NOT NULL,
  status        text NOT NULL DEFAULT 'open'
                CHECK (status IN ('open','in_progress','resolved','closed')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_maintenance_requests_updated_at
  BEFORE UPDATE ON maintenance_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status     ON maintenance_requests (status);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_urgency    ON maintenance_requests (urgency);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_created_at ON maintenance_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_apartment  ON maintenance_requests (apartment);

-- ────────────────────────────────────────────────────────────
-- 6. REFERRALS
--    Source: Referral page
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS referrals (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Referrer info (current resident)
  referrer_name       text NOT NULL,
  referrer_email      text NOT NULL,
  referrer_phone      text NOT NULL,
  referrer_unit       text NOT NULL,
  preferred_contact   text DEFAULT 'email'
                      CHECK (preferred_contact IN ('email','sms','call')),
  relationship        text DEFAULT 'friend'
                      CHECK (relationship IN ('friend','classmate','family','other')),

  -- Friend info (referred person)
  friend_name         text NOT NULL,
  friend_email        text,
  friend_phone        text,
  move_in_timeline    text,
  budget_range        text,
  occupants           text,
  notes               text,

  -- Consent
  consent_share       boolean NOT NULL DEFAULT false,
  consent_contact     boolean NOT NULL DEFAULT false,

  -- Status tracking
  status              text NOT NULL DEFAULT 'submitted'
                      CHECK (status IN ('submitted','contacted','toured','leased','expired','rejected')),

  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_referrals_updated_at
  BEFORE UPDATE ON referrals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_referrals_status     ON referrals (status);
CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON referrals (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_referrals_email      ON referrals (referrer_email);

-- ────────────────────────────────────────────────────────────
-- 7. ROW LEVEL SECURITY (RLS)
-- ────────────────────────────────────────────────────────────
-- Enable RLS on all tables
ALTER TABLE contact_inquiries    ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications         ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_bookings        ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscribers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals            ENABLE ROW LEVEL SECURITY;

-- INSERT policies (public forms)
CREATE POLICY "Allow public insert" ON contact_inquiries    FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public insert" ON applications         FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public insert" ON tour_bookings        FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public insert" ON email_subscribers    FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public insert" ON maintenance_requests FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public insert" ON referrals            FOR INSERT TO anon WITH CHECK (true);

-- SELECT policies (staff dashboard + available-slots API)
CREATE POLICY "Allow public read" ON contact_inquiries    FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read" ON applications         FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read" ON tour_bookings        FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read" ON email_subscribers    FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read" ON maintenance_requests FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read" ON referrals            FOR SELECT TO anon USING (true);

-- UPDATE policies (status changes via PATCH APIs)
CREATE POLICY "Allow public update" ON contact_inquiries    FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow public update" ON applications         FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow public update" ON tour_bookings        FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow public update" ON maintenance_requests FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow public update" ON referrals            FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- ────────────────────────────────────────────────────────────
-- DONE! 6 tables created:
--   1. contact_inquiries    ← Contact page + Lease Inquiry
--   2. applications         ← Student / General / International apps
--   3. tour_bookings        ← Schedule Tour
--   4. email_subscribers    ← Newsletter signup
--   5. maintenance_requests ← Maintenance requests
--   6. referrals            ← Referral program
-- ────────────────────────────────────────────────────────────
