-- HealthChain Enterprise Cloudflare D1 SQL Relational Schema
-- Replaces Firebase Firestore completely with SQLite/D1 relational tables.

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('patient', 'doctor', 'clinical', 'hospital_admin', 'super_admin')),
    hospital_id TEXT DEFAULT 'hosp_central_01',
    department_id TEXT DEFAULT 'general',
    email_verified INTEGER DEFAULT 0,
    verification_token TEXT,
    onboarding_complete INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    permissions_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS hospitals (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    license_number TEXT,
    contact_email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS departments (
    id TEXT PRIMARY KEY,
    hospital_id TEXT NOT NULL,
    name TEXT NOT NULL,
    head_doctor_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
);

CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    hospital_id TEXT NOT NULL,
    abha_id TEXT,
    age INTEGER,
    gender TEXT,
    blood_group TEXT,
    allergies TEXT,
    contact_phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
);

CREATE TABLE IF NOT EXISTS doctors (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    hospital_id TEXT NOT NULL,
    department_id TEXT,
    specialty TEXT NOT NULL,
    license_number TEXT NOT NULL,
    shift TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
);

CREATE TABLE IF NOT EXISTS clinical_records (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    doctor_id TEXT,
    hospital_id TEXT NOT NULL,
    department_id TEXT,
    category TEXT NOT NULL,
    file_name TEXT NOT NULL,
    r2_object_key TEXT NOT NULL,
    r2_file_id TEXT,
    file_size INTEGER NOT NULL,
    content_type TEXT NOT NULL,
    cid_hash TEXT,
    blockchain_hash TEXT,
    consent_status TEXT DEFAULT 'approved',
    visibility_scope TEXT DEFAULT 'hospital_internal',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
);

CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    doctor_id TEXT NOT NULL,
    hospital_id TEXT NOT NULL,
    scheduled_at DATETIME NOT NULL,
    status TEXT DEFAULT 'scheduled',
    type TEXT DEFAULT 'General Consultation',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
);

CREATE TABLE IF NOT EXISTS prescriptions (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    doctor_id TEXT NOT NULL,
    hospital_id TEXT NOT NULL,
    medications_json TEXT NOT NULL,
    digital_signature TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
);

CREATE TABLE IF NOT EXISTS lab_reports (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    doctor_id TEXT,
    hospital_id TEXT NOT NULL,
    test_type TEXT NOT NULL,
    status TEXT DEFAULT 'completed',
    result_data_json TEXT,
    r2_object_key TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
);

CREATE TABLE IF NOT EXISTS radiology_reports (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    doctor_id TEXT,
    hospital_id TEXT NOT NULL,
    scan_type TEXT NOT NULL,
    imaging_notes TEXT,
    r2_object_key TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
);

CREATE TABLE IF NOT EXISTS insurance_claims (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    insurer_name TEXT NOT NULL,
    policy_number TEXT NOT NULL,
    claim_amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
);

CREATE TABLE IF NOT EXISTS consent_logs (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    grantee_id TEXT NOT NULL,
    scope TEXT NOT NULL,
    expires_at DATETIME,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    hospital_id TEXT DEFAULT 'hosp_central_01',
    action TEXT NOT NULL,
    resource_id TEXT,
    details_json TEXT,
    ip_address TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS ai_conversations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    messages_json TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    file_id TEXT UNIQUE NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    content_type TEXT NOT NULL,
    object_key TEXT NOT NULL,
    bucket_name TEXT DEFAULT 'healthchain-storage',
    uploaded_by TEXT NOT NULL,
    uploaded_for TEXT NOT NULL,
    hospital_id TEXT DEFAULT 'hosp_central_01',
    patient_id TEXT,
    doctor_id TEXT,
    department_id TEXT DEFAULT 'radiology',
    visibility_scope TEXT DEFAULT 'hospital_internal',
    consent_status TEXT DEFAULT 'approved',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value_json TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS access_requests (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    requester_id TEXT NOT NULL,
    purpose TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
);

CREATE TABLE IF NOT EXISTS storage_usage (
    id TEXT PRIMARY KEY,
    hospital_id TEXT NOT NULL,
    month TEXT NOT NULL,
    total_storage_bytes INTEGER DEFAULT 0,
    upload_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    preview_count INTEGER DEFAULT 0,
    delete_count INTEGER DEFAULT 0,
    class_a_requests INTEGER DEFAULT 0,
    class_b_requests INTEGER DEFAULT 0,
    category_breakdown_json TEXT,
    warning_level TEXT DEFAULT 'normal',
    is_blocked INTEGER DEFAULT 0,
    reset_at DATETIME NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
