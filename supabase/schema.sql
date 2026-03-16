-- =============================================
-- College Place Apartments - Database Schema
-- =============================================

-- 1. Applications table (student + general)
CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'denied', 'withdrawn')),
  applicant_type TEXT NOT NULL CHECK (applicant_type IN ('student', 'international', 'professional')),

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

  -- Address & Education (Step 2)
  current_address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  university_name TEXT,
  student_id TEXT,
  expected_graduation DATE,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_relationship TEXT,

  -- Employment & Income (Step 3)
  employment_status TEXT,
  employer_name TEXT,
  monthly_income TEXT,
  income_source TEXT,
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
  ref1_name TEXT,
  ref1_phone TEXT,
  ref1_relationship TEXT,
  ref2_name TEXT,
  ref2_phone TEXT,
  ref2_relationship TEXT,

  consent BOOLEAN DEFAULT false
);

-- 2. Tour bookings table
CREATE TABLE IF NOT EXISTS tour_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
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

-- 3. Contact inquiries / lease inquiries
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
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
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  source TEXT DEFAULT 'website',
  subscribed BOOLEAN DEFAULT true
);

-- 5. Staff users (for dashboard auth)
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
ALTER TABLE staff_users ENABLE ROW LEVEL SECURITY;

-- Policies: allow inserts from anon (public forms), reads only for authenticated/service role
CREATE POLICY "Allow public inserts on applications" ON applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public inserts on tour_bookings" ON tour_bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public inserts on contact_inquiries" ON contact_inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public inserts on email_subscribers" ON email_subscribers FOR INSERT WITH CHECK (true);

-- Allow public reads for staff dashboard (using anon key with pin-based auth in app)
CREATE POLICY "Allow public reads on applications" ON applications FOR SELECT USING (true);
CREATE POLICY "Allow public reads on tour_bookings" ON tour_bookings FOR SELECT USING (true);
CREATE POLICY "Allow public reads on contact_inquiries" ON contact_inquiries FOR SELECT USING (true);
CREATE POLICY "Allow public reads on email_subscribers" ON email_subscribers FOR SELECT USING (true);
CREATE POLICY "Allow public reads on staff_users" ON staff_users FOR SELECT USING (true);

-- Allow updates for status changes
CREATE POLICY "Allow public updates on applications" ON applications FOR UPDATE USING (true);
CREATE POLICY "Allow public updates on tour_bookings" ON tour_bookings FOR UPDATE USING (true);
CREATE POLICY "Allow public updates on contact_inquiries" ON contact_inquiries FOR UPDATE USING (true);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tour_bookings_date ON tour_bookings(tour_date);
CREATE INDEX IF NOT EXISTS idx_tour_bookings_status ON tour_bookings(status);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status ON contact_inquiries(status);
