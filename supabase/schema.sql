-- =============================================
-- College Place Apartments - Database Schema
-- =============================================

-- 1. Applications table (student + general)
CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ DEFAULT null,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'denied', 'withdrawn')),
  applicant_type TEXT NOT NULL CHECK (applicant_type IN ('student', 'international', 'professional')),
  notes TEXT,

  -- Personal Info (Step 1)
  full_name TEXT NOT NULL,
  ssn TEXT,
  marital_status TEXT,
  driving_license TEXT,
  date_of_birth DATE,
  email TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  specific_request TEXT,
  housing_requirement TEXT,
  preferred_move_in DATE,
  lease_duration TEXT,

  gender TEXT,

  -- Address & Education (Step 2)
  current_address TEXT,
  address_type TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  housing_status TEXT,
  residence_from DATE,
  residence_to DATE,
  landlord_email TEXT,
  rent_amount TEXT,
  reason_for_moving TEXT,
  university_name TEXT,
  student_id TEXT,
  school_address TEXT,
  course_name TEXT,
  course_start_date DATE,
  expected_graduation DATE,
  advisor_phone TEXT,
  advisor_email TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_email TEXT,
  emergency_relationship TEXT,
  emergency_contact2_name TEXT,
  emergency_contact2_phone TEXT,
  emergency_contact2_email TEXT,
  emergency_relationship2 TEXT,

  -- Employment & Income (Step 3)
  employment_status TEXT,
  employer_name TEXT,
  monthly_income TEXT,
  employment_start_date DATE,
  has_cosigner BOOLEAN DEFAULT false,
  cosigner_name TEXT,
  cosigner_phone TEXT,
  cosigner_email TEXT,

  -- References & History (Step 4)
  previous_landlord_name TEXT,
  landlord_phone TEXT,
  landlord_address TEXT,
  reason_for_leaving TEXT,
  length_of_stay TEXT,
  prior_landlord_name TEXT,
  prior_landlord_phone TEXT,
  prior_reason_for_leaving TEXT,
  ref1_name TEXT,
  ref1_phone TEXT,
  ref1_relationship TEXT,
  ref2_name TEXT,
  ref2_phone TEXT,
  ref2_relationship TEXT,

  -- Pets & Vehicle
  has_pets BOOLEAN DEFAULT false,
  pets JSONB DEFAULT '[]'::jsonb,
  has_vehicle BOOLEAN DEFAULT false,
  vehicle1_make TEXT,
  vehicle1_year TEXT,
  vehicle1_color TEXT,
  vehicle1_plate TEXT,
  has_second_vehicle BOOLEAN DEFAULT false,
  vehicle2_make TEXT,
  vehicle2_year TEXT,
  vehicle2_color TEXT,
  vehicle2_plate TEXT,

  -- Background Check
  filed_bankruptcy BOOLEAN DEFAULT false,
  bankruptcy_details TEXT,
  evicted_from_tenancy BOOLEAN DEFAULT false,
  eviction_details TEXT,
  convicted_felony BOOLEAN DEFAULT false,
  felony_details TEXT,
  arrested_or_convicted BOOLEAN DEFAULT false,
  arrest_details TEXT,

  -- Authorization & Signature
  agree_terms BOOLEAN DEFAULT false,
  signature_name TEXT,
  signature_date DATE,
  consent BOOLEAN DEFAULT false,
  consent_communications BOOLEAN DEFAULT false
);

-- 2. Tour bookings table
CREATE TABLE IF NOT EXISTS tour_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ DEFAULT null,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'completed', 'cancelled', 'no_show')),

  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  property_slug TEXT,
  floor_plan TEXT,

  tour_date DATE NOT NULL,
  tour_time TEXT NOT NULL,

  google_event_id TEXT,
  notes TEXT
);

-- Prevents double-booking per time slot
CREATE UNIQUE INDEX IF NOT EXISTS idx_tour_bookings_unique_slot
  ON tour_bookings (tour_date, tour_time)
  WHERE status != 'cancelled' AND deleted_at IS NULL;

-- 3. Contact inquiries / lease inquiries
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ DEFAULT null,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'resolved', 'archived')),

  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  property_slug TEXT,
  message TEXT,
  inquiry_type TEXT DEFAULT 'general' CHECK (inquiry_type IN ('general', 'lease', 'maintenance', 'pricing', 'other'))
);

-- 4. Email subscribers
CREATE TABLE IF NOT EXISTS email_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ DEFAULT null,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  source TEXT DEFAULT 'website',
  subscribed BOOLEAN DEFAULT true
);

-- 5. Maintenance requests
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ DEFAULT null,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),

  apartment TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  category TEXT,
  urgency TEXT DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'emergency')),
  description TEXT NOT NULL
);

-- 6. Referrals
CREATE TABLE IF NOT EXISTS referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ DEFAULT null,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'contacted', 'toured', 'leased', 'expired', 'rejected')),

  referrer_name TEXT NOT NULL,
  referrer_email TEXT NOT NULL,
  referrer_phone TEXT,
  referrer_unit TEXT,
  preferred_contact TEXT DEFAULT 'email',
  relationship TEXT DEFAULT 'friend',
  friend_name TEXT NOT NULL,
  friend_email TEXT,
  friend_phone TEXT,
  move_in_timeline TEXT,
  budget_range TEXT,
  occupants TEXT,
  notes TEXT,
  consent_share BOOLEAN DEFAULT false,
  consent_contact BOOLEAN DEFAULT false
);

-- 7. Staff users (for dashboard auth)
CREATE TABLE IF NOT EXISTS staff_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'staff' CHECK (role IN ('admin', 'manager', 'staff')),
  pin_hash TEXT NOT NULL,
  active BOOLEAN DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_users ENABLE ROW LEVEL SECURITY;

-- Policies: allow inserts from anon (public forms)
CREATE POLICY "Allow public inserts on applications" ON applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public inserts on tour_bookings" ON tour_bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public inserts on contact_inquiries" ON contact_inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public inserts on email_subscribers" ON email_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public inserts on maintenance_requests" ON maintenance_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public inserts on referrals" ON referrals FOR INSERT WITH CHECK (true);

-- Allow public reads for staff dashboard (using anon key with pin-based auth in app)
CREATE POLICY "Allow public reads on applications" ON applications FOR SELECT USING (true);
CREATE POLICY "Allow public reads on tour_bookings" ON tour_bookings FOR SELECT USING (true);
CREATE POLICY "Allow public reads on contact_inquiries" ON contact_inquiries FOR SELECT USING (true);
CREATE POLICY "Allow public reads on email_subscribers" ON email_subscribers FOR SELECT USING (true);
CREATE POLICY "Allow public reads on maintenance_requests" ON maintenance_requests FOR SELECT USING (true);
CREATE POLICY "Allow public reads on referrals" ON referrals FOR SELECT USING (true);
CREATE POLICY "Allow public reads on staff_users" ON staff_users FOR SELECT USING (true);

-- Allow updates for status changes and soft deletes
CREATE POLICY "Allow public updates on applications" ON applications FOR UPDATE USING (true);
CREATE POLICY "Allow public updates on tour_bookings" ON tour_bookings FOR UPDATE USING (true);
CREATE POLICY "Allow public updates on contact_inquiries" ON contact_inquiries FOR UPDATE USING (true);
CREATE POLICY "Allow public updates on maintenance_requests" ON maintenance_requests FOR UPDATE USING (true);
CREATE POLICY "Allow public updates on referrals" ON referrals FOR UPDATE USING (true);
CREATE POLICY "Allow public updates on email_subscribers" ON email_subscribers FOR UPDATE USING (true);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_deleted_at ON applications(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tour_bookings_date ON tour_bookings(tour_date);
CREATE INDEX IF NOT EXISTS idx_tour_bookings_status ON tour_bookings(status);
CREATE INDEX IF NOT EXISTS idx_tour_bookings_deleted_at ON tour_bookings(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status ON contact_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_deleted_at ON contact_inquiries(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status ON maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_deleted_at ON maintenance_requests(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_referrals_deleted_at ON referrals(deleted_at) WHERE deleted_at IS NULL;

-- =============================================
-- Migration: Add deleted_at to existing tables
-- Run this if tables already exist without deleted_at
-- =============================================
-- ALTER TABLE applications ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT null;
-- ALTER TABLE applications ADD COLUMN IF NOT EXISTS notes TEXT;
-- ALTER TABLE tour_bookings ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT null;
-- ALTER TABLE tour_bookings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
-- ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT null;
-- ALTER TABLE email_subscribers ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT null;
-- ALTER TABLE maintenance_requests ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT null;
-- ALTER TABLE referrals ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT null;
