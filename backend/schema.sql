-- Mediczen Supabase Database Schema

-- 1. Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  specialty TEXT DEFAULT 'General Practitioner',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Patients Table
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  gender TEXT NOT NULL,
  age INT NOT NULL,
  ward_no TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('Low', 'Medium', 'High')) DEFAULT 'Medium',
  status TEXT CHECK (status IN ('Active', 'Recovered', 'Critical', 'Discharged')) DEFAULT 'Active',
  phone TEXT,
  email TEXT,
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Patient Medical Records & AI Symptom Analysis History
CREATE TABLE IF NOT EXISTS patient_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE NOT NULL,
  symptoms TEXT NOT NULL,
  vitals JSONB, -- e.g. {"bp": "120/80", "pulse": 72, "temp": "98.6F", "spo2": "99%"}
  notes TEXT,
  ai_summary TEXT, -- AI generated diagnostic recommendation
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  reason TEXT,
  status TEXT CHECK (status IN ('Scheduled', 'Completed', 'Cancelled', 'No-show')) DEFAULT 'Scheduled',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Schedules (Gantt Timeline blocks)
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  schedule_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  type TEXT CHECK (type IN ('Checkup', 'Surgery', 'Therapy', 'Break', 'Evaluation', 'Other')) DEFAULT 'Checkup',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Invoices / Billing Table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  items JSONB NOT NULL, -- e.g. [{"description": "Consultation Fee", "qty": 1, "price": 150}]
  total_amount NUMERIC(10, 2) NOT NULL,
  status TEXT CHECK (status IN ('Paid', 'Pending', 'Overdue')) DEFAULT 'Pending',
  issued_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Shared Patient Portal Links (Token Secured)
CREATE TABLE IF NOT EXISTS patient_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =======================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Dashboard data is owned by the authenticated Supabase user.
-- The service-role key used by the portal endpoint bypasses RLS.
-- =======================================================

ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read/write on doctors" ON doctors;
DROP POLICY IF EXISTS "Allow public read/write on patients" ON patients;
DROP POLICY IF EXISTS "Allow public read/write on patient_records" ON patient_records;
DROP POLICY IF EXISTS "Allow public read/write on appointments" ON appointments;
DROP POLICY IF EXISTS "Allow public read/write on schedules" ON schedules;
DROP POLICY IF EXISTS "Allow public read/write on invoices" ON invoices;
DROP POLICY IF EXISTS "Allow public read/write on patient_links" ON patient_links;

CREATE POLICY "Doctors can access their own profile" ON doctors
  FOR ALL USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "Doctors can access their own patients" ON patients
  FOR ALL USING (doctor_id = auth.uid()) WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can access their own records" ON patient_records
  FOR ALL USING (doctor_id = auth.uid()) WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can access their own appointments" ON appointments
  FOR ALL USING (doctor_id = auth.uid()) WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can access their own schedules" ON schedules
  FOR ALL USING (doctor_id = auth.uid()) WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can access their own invoices" ON invoices
  FOR ALL USING (doctor_id = auth.uid()) WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can manage their own portal links" ON patient_links
  FOR ALL
  USING (EXISTS (SELECT 1 FROM patients WHERE patients.id = patient_links.patient_id AND patients.doctor_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM patients WHERE patients.id = patient_links.patient_id AND patients.doctor_id = auth.uid()));

