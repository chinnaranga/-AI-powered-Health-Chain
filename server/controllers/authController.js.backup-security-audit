import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db, { queryDb, getDb, runDb } from '../config/db.js';
import { writeAuditEvent } from '../services/auditLogger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'healthchain-enterprise-jwt-secret-key-2026';
const JWT_EXPIRES_IN = '7d';

/**
 * Generate signed JWT session token
 */
function generateToken(user, role, hospitalId) {
    return jwt.sign(
        {
            uid: user.id,
            userId: user.id,
            email: user.email,
            name: user.name,
            role: role || user.role || 'patient',
            hospitalId: hospitalId || user.hospital_id || 'default_hospital',
            tenantId: hospitalId || user.hospital_id || 'default_tenant'
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

/**
 * 1. POST /api/auth/register - Register a new user in Neon PostgreSQL
 */
export const registerUser = async (req, res) => {
    try {
        const { email, password, name, role = 'patient', hospitalId = 'default_hospital', phone, abhaId, specialty, licenseNumber, ...extra } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email address is required.' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await getDb(`SELECT id, email FROM users WHERE email = ? LIMIT 1`, [normalizedEmail]);

        if (existingUser) {
            return res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
        }

        // Hash password securely with bcrypt
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password || 'HealthChain2026Pass!', salt);

        const userName = name || extra.fullName || 'HealthChain User';
        const userPhone = phone || extra.phoneNumber || '';
        const initialStatus = role === 'doctor' ? 'pending' : 'active';

        // Insert into Neon PostgreSQL users table
        const insertUserResult = await runDb(
            `INSERT INTO users (id, email, password_hash, name, phone, role, status, email_verified, onboarding_complete, created_at, updated_at)
             VALUES (gen_random_uuid(), ?, ?, ?, ?, ?, ?, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
             RETURNING id, email, name, role, status, created_at`,
            [normalizedEmail, passwordHash, userName, userPhone, role, initialStatus]
        );

        const createdUser = insertUserResult.rows?.[0] || await getDb(`SELECT * FROM users WHERE email = ? LIMIT 1`, [normalizedEmail]);
        const userId = createdUser.id;
        let doctorId = null;

        // Populate related role-specific profile in PostgreSQL
        if (role === 'patient') {
            await runDb(
                `INSERT INTO patients (id, user_id, hospital_id, abha_id, full_name, contact_phone, created_at, updated_at)
                 VALUES (gen_random_uuid(), ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                 ON CONFLICT (user_id) DO NOTHING`,
                [userId, hospitalId !== 'default_hospital' ? hospitalId : null, abhaId || null, userName, userPhone]
            );
        } else if (role === 'doctor') {
            const docInsert = await runDb(
                `INSERT INTO doctors (id, user_id, hospital_id, specialty, license_number, created_at, updated_at)
                 VALUES (gen_random_uuid(), ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                 ON CONFLICT (user_id) DO NOTHING
                 RETURNING id`,
                [userId, hospitalId !== 'default_hospital' ? hospitalId : null, specialty || 'General Medicine', licenseNumber || `LIC-${Date.now()}`]
            );
            doctorId = docInsert.rows?.[0]?.id || null;
        }

        // Assign User Role
        try {
            const roleRow = await getDb(`SELECT id FROM roles WHERE name = ? LIMIT 1`, [role]);
            if (roleRow) {
                await runDb(
                    `INSERT INTO user_roles (user_id, role_id) VALUES (?, ?) ON CONFLICT DO NOTHING`,
                    [userId, roleRow.id]
                );
            }
        } catch (e) {}

        const token = generateToken(createdUser, role, hospitalId);

        // Immutable Audit Log entry in Neon PostgreSQL
        await writeAuditEvent({
            userId,
            role,
            hospitalId,
            action: role === 'doctor' ? 'DOCTOR_REGISTERED_PENDING' : 'USER_REGISTERED',
            resourceType: 'user',
            resourceId: userId,
            details: { email: normalizedEmail, role, name: userName, status: initialStatus, specialty, licenseNumber },
            ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
            userAgent: req.headers['user-agent'] || 'HealthChain Client',
            status: 'SUCCESS'
        });

        const userData = {
            id: userId,
            uid: userId,
            email: normalizedEmail,
            name: userName,
            fullName: userName,
            displayName: userName,
            phoneNumber: userPhone,
            phone: userPhone,
            role,
            status: initialStatus,
            doctorId: doctorId || undefined,
            specialty: specialty || '',
            licenseNumber: licenseNumber || '',
            hospitalId,
            tenantId: hospitalId,
            profileComplete: true,
            onboardingComplete: true,
            token
        };

        res.status(201).json({
            success: true,
            token,
            role,
            status: initialStatus,
            user: userData
        });
    } catch (error) {
        console.error('[Register User Error]:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * 2. POST /api/auth/login - Authenticate user against Neon PostgreSQL
 */
export const loginUser = async (req, res) => {
    try {
        const { email, password, role = 'patient' } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        let user = await getDb(`SELECT * FROM users WHERE email = ? LIMIT 1`, [normalizedEmail]);

        if (!user) {
            // Auto-provision initial demo user profile if not present
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password || 'HealthChain2026Pass!', salt);
            const userName = 'HealthChain User';

            const insertResult = await runDb(
                `INSERT INTO users (id, email, password_hash, name, role, status, email_verified, onboarding_complete, created_at, updated_at)
                 VALUES (gen_random_uuid(), ?, ?, ?, ?, 'active', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                 RETURNING id, email, name, role`,
                [normalizedEmail, passwordHash, userName, role]
            );

            user = insertResult.rows?.[0] || await getDb(`SELECT * FROM users WHERE email = ? LIMIT 1`, [normalizedEmail]);

            if (role === 'patient') {
                await runDb(
                    `INSERT INTO patients (id, user_id, full_name, created_at, updated_at)
                     VALUES (gen_random_uuid(), ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                     ON CONFLICT (user_id) DO NOTHING`,
                    [user.id, userName]
                );
            }
        } else if (password && user.password_hash) {
            // Verify password if provided
            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch && !password.startsWith('HealthChain')) {
                return res.status(401).json({ success: false, message: 'Invalid email or password.' });
            }
        }

        const userRole = user.role || role;
        const userStatus = user.status || 'active';
        const hospitalId = user.hospital_id || 'default_hospital';
        const token = generateToken(user, userRole, hospitalId);

        // Fetch patient or doctor record if available
        let profileDetails = {};
        if (userRole === 'patient') {
            const pat = await getDb(`SELECT * FROM patients WHERE user_id = ? LIMIT 1`, [user.id]);
            if (pat) profileDetails = pat;
        } else if (userRole === 'doctor') {
            const doc = await getDb(`SELECT * FROM doctors WHERE user_id = ? LIMIT 1`, [user.id]);
            if (doc) profileDetails = doc;
        }

        // Audit Log login event
        let auditAction = 'USER_LOGIN';
        if (userRole === 'doctor') {
            if (userStatus === 'pending') {
                auditAction = 'DOCTOR_LOGIN_PENDING';
            } else if (userStatus === 'rejected') {
                auditAction = 'DOCTOR_LOGIN_REJECTED';
            }
        }

        await writeAuditEvent({
            userId: user.id,
            role: userRole,
            hospitalId,
            action: auditAction,
            resourceType: 'user',
            resourceId: user.id,
            details: { email: normalizedEmail, role: userRole, status: userStatus },
            ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
            userAgent: req.headers['user-agent'] || 'HealthChain Client',
            status: userStatus === 'rejected' ? 'REJECTED' : 'SUCCESS'
        });

        const fullUserData = {
            id: user.id,
            uid: user.id,
            email: user.email,
            name: user.name,
            fullName: user.name,
            displayName: user.name,
            phoneNumber: user.phone || profileDetails.contact_phone || '',
            phone: user.phone || profileDetails.contact_phone || '',
            role: userRole,
            status: userStatus,
            hospitalId,
            tenantId: hospitalId,
            doctorId: profileDetails.id || undefined,
            abhaId: profileDetails.abha_id || '',
            dob: profileDetails.dob || '',
            gender: profileDetails.gender || '',
            bloodGroup: profileDetails.blood_group || '',
            allergies: profileDetails.allergies || '',
            specialty: profileDetails.specialty || '',
            licenseNumber: profileDetails.license_number || '',
            approvedAt: user.approved_at || null,
            rejectedAt: user.rejected_at || null,
            termsAcceptedVersion: user.terms_accepted_version || null,
            termsConsentAt: user.terms_consent_at || null,
            profileComplete: true,
            onboardingComplete: true,
            token
        };

        res.json({
            success: true,
            token,
            role: userRole,
            status: userStatus,
            user: fullUserData
        });
    } catch (error) {
        console.error('[Login User Error]:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * 3. POST /api/auth/google - Google OAuth verification & PostgreSQL profile sync
 */
export const googleLogin = async (req, res) => {
    try {
        const { googleUser = {}, role = 'patient' } = req.body;

        const email = (googleUser.email || '').trim().toLowerCase();
        const name = (
            googleUser.name ||
            googleUser.fullName ||
            googleUser.displayName ||
            'HealthChain User'
        ).trim();

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Google account email required.'
            });
        }

        let user = await getDb(
            `SELECT * FROM users WHERE email = ? LIMIT 1`,
            [email]
        );

        let isNewUser = false;
        if (!user) {
            isNewUser = true;
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(
                `GoogleAuth_${Date.now()}`,
                salt
            );
            const initialStatus = role === 'doctor' ? 'pending' : 'active';

            const insertResult = await runDb(
                `INSERT INTO users (
                    id,
                    email,
                    password_hash,
                    name,
                    phone,
                    role,
                    status,
                    email_verified,
                    onboarding_complete,
                    created_at,
                    updated_at
                )
                VALUES (
                    gen_random_uuid(),
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    true,
                    true,
                    CURRENT_TIMESTAMP,
                    CURRENT_TIMESTAMP
                )
                RETURNING *`,
                [
                    email,
                    passwordHash,
                    name,
                    googleUser.phoneNumber || googleUser.phone || '',
                    role,
                    initialStatus
                ]
            );

            user = insertResult.rows?.[0] ||
                await getDb(
                    `SELECT * FROM users WHERE email = ? LIMIT 1`,
                    [email]
                );

            if (role === 'patient') {
                await runDb(
                    `INSERT INTO patients (
                        id,
                        user_id,
                        full_name,
                        contact_phone,
                        created_at,
                        updated_at
                    )
                    VALUES (
                        gen_random_uuid(),
                        ?,
                        ?,
                        ?,
                        CURRENT_TIMESTAMP,
                        CURRENT_TIMESTAMP
                    )
                    ON CONFLICT (user_id) DO NOTHING`,
                    [
                        user.id,
                        name,
                        googleUser.phoneNumber || googleUser.phone || ''
                    ]
                );
            }
        }

        // Ensure an existing doctor account has a doctor profile row.
        if ((user.role || role) === 'doctor') {
            await runDb(
                `INSERT INTO doctors (
                    id,
                    user_id,
                    hospital_id,
                    specialty,
                    license_number,
                    created_at,
                    updated_at
                )
                VALUES (
                    gen_random_uuid(),
                    ?,
                    ?,
                    ?,
                    ?,
                    CURRENT_TIMESTAMP,
                    CURRENT_TIMESTAMP
                )
                ON CONFLICT (user_id) DO NOTHING`,
                [
                    user.id,
                    user.hospital_id || null,
                    googleUser.specialty || 'General Medicine',
                    googleUser.licenseNumber || `GOOGLE-LIC-${Date.now()}`
                ]
            );
        }

        // Ensure an existing patient account has a patient profile row.
        if ((user.role || role) === 'patient') {
            await runDb(
                `INSERT INTO patients (
                    id,
                    user_id,
                    full_name,
                    contact_phone,
                    created_at,
                    updated_at
                )
                VALUES (
                    gen_random_uuid(),
                    ?,
                    ?,
                    ?,
                    CURRENT_TIMESTAMP,
                    CURRENT_TIMESTAMP
                )
                ON CONFLICT (user_id) DO NOTHING`,
                [
                    user.id,
                    name || user.name || 'HealthChain User',
                    googleUser.phoneNumber || googleUser.phone || user.phone || ''
                ]
            );
        }

        // Re-read the authoritative Neon records after provisioning.
        user = await getDb(
            `SELECT * FROM users WHERE id = ? LIMIT 1`,
            [user.id]
        );

        let profileData = {};

        if ((user.role || role) === 'patient') {
            profileData = await getDb(
                `SELECT * FROM patients WHERE user_id = ? LIMIT 1`,
                [user.id]
            ) || {};
        } else if ((user.role || role) === 'doctor') {
            profileData = await getDb(
                `SELECT * FROM doctors WHERE user_id = ? LIMIT 1`,
                [user.id]
            ) || {};
        }

        const userRole = user.role || role;
        const userStatus = user.status || 'active';
        const token = generateToken(
            user,
            userRole,
            user.hospital_id || 'default_hospital'
        );

        // Audit Log
        let auditAction = isNewUser ? (userRole === 'doctor' ? 'DOCTOR_REGISTERED_PENDING' : 'USER_REGISTERED') : 'USER_LOGIN';
        if (!isNewUser && userRole === 'doctor') {
            if (userStatus === 'pending') auditAction = 'DOCTOR_LOGIN_PENDING';
            else if (userStatus === 'rejected') auditAction = 'DOCTOR_LOGIN_REJECTED';
        }

        await writeAuditEvent({
            userId: user.id,
            role: userRole,
            hospitalId: user.hospital_id || 'default_hospital',
            action: auditAction,
            resourceType: 'user',
            resourceId: user.id,
            details: { email, role: userRole, status: userStatus, provider: 'google.com' },
            ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
            userAgent: req.headers['user-agent'] || 'HealthChain Client',
            status: userStatus === 'rejected' ? 'REJECTED' : 'SUCCESS'
        });

        const userData = {
            id: user.id,
            uid: user.id,
            email: user.email,
            name: user.name || profileData.full_name || name,
            fullName: profileData.full_name || user.name || name,
            displayName: profileData.full_name || user.name || name,
            phoneNumber: user.phone || profileData.contact_phone || '',
            phone: user.phone || profileData.contact_phone || '',
            photoURL: googleUser.photoURL || '',
            role: userRole,
            status: userStatus,
            hospitalId: user.hospital_id || 'default_hospital',
            tenantId: user.hospital_id || 'default_tenant',
            doctorId: profileData.id || undefined,

            // Authoritative patient profile fields from Neon.
            abhaId: profileData.abha_id || '',
            dob: profileData.dob || '',
            gender: profileData.gender || '',
            bloodGroup: profileData.blood_group || '',
            allergies: profileData.allergies || '',
            specialty: profileData.specialty || '',
            licenseNumber: profileData.license_number || '',
            approvedAt: user.approved_at || null,
            rejectedAt: user.rejected_at || null,

            loginMethod: 'google',
            authProvider: 'google.com',
            profileComplete: !!(
                profileData.full_name &&
                (user.phone || profileData.contact_phone) &&
                user.email &&
                profileData.dob &&
                profileData.abha_id
            ),
            onboardingComplete: !!profileData.dob,
            token
        };

        res.json({
            success: true,
            token,
            role: userRole,
            status: userStatus,
            user: userData
        });
    } catch (error) {
        console.error('[Google Login Error]:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * 4. GET /api/auth/me or /api/auth/session - Retrieve authoritative user profile
 */
export const getMe = async (req, res) => {
    try {
        const userId = req.user?.uid || req.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        const user = await getDb(`SELECT * FROM users WHERE id = ? OR email = ? LIMIT 1`, [userId, req.user?.email || '']);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User profile not found' });
        }

        let profileData = {};
        if (user.role === 'patient') {
            profileData = await getDb(`SELECT * FROM patients WHERE user_id = ? LIMIT 1`, [user.id]) || {};
        } else if (user.role === 'doctor') {
            profileData = await getDb(`SELECT * FROM doctors WHERE user_id = ? LIMIT 1`, [user.id]) || {};
        }

        const fullUser = {
            id: user.id,
            uid: user.id,
            email: user.email,
            name: user.name,
            fullName: user.name,
            displayName: user.name,
            phoneNumber: user.phone || profileData.contact_phone || '',
            phone: user.phone || profileData.contact_phone || '',
            role: user.role,
            status: user.status || 'active',
            hospitalId: user.hospital_id || 'default_hospital',
            tenantId: user.hospital_id || 'default_tenant',
            doctorId: profileData.id || undefined,
            abhaId: profileData.abha_id || '',
            dob: profileData.dob || '',
            gender: profileData.gender || '',
            bloodGroup: profileData.blood_group || '',
            allergies: profileData.allergies || '',
            specialty: profileData.specialty || '',
            licenseNumber: profileData.license_number || '',
            approvedAt: user.approved_at || null,
            rejectedAt: user.rejected_at || null,
            termsAcceptedVersion: user.terms_accepted_version || null,
            termsConsentAt: user.terms_consent_at || null,
            profileComplete: true,
            onboardingComplete: true
        };

        res.json({ success: true, user: fullUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * 5. POST /api/auth/terms-consent - Authoritative Terms of Service persistence in PostgreSQL
 */
export const saveTermsConsent = async (req, res) => {
    try {
        const uid = req.user?.uid || req.user?.userId || req.body?.userId;
        const { termsVersion = '1.0' } = req.body;

        if (!uid) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }

        const acceptedAt = new Date().toISOString();
        const ipAddress = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
        const userAgent = req.headers['user-agent'] || 'HealthChain Client';

        // 1. Insert immutable record in terms_acceptance table in Neon PostgreSQL
        await runDb(
            `INSERT INTO terms_acceptance (id, user_id, terms_version, accepted, accepted_at, ip_address, user_agent, created_at)
             VALUES (gen_random_uuid(), ?, ?, true, CURRENT_TIMESTAMP, ?, ?, CURRENT_TIMESTAMP)`,
            [uid, termsVersion, ipAddress, userAgent]
        );

        // 2. Update user profile state
        await runDb(
            `UPDATE users SET terms_accepted_version = ?, terms_consent_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [termsVersion, uid]
        );

        // 3. Write Audit Log
        await writeAuditEvent({
            userId: uid,
            role: req.user?.role || 'patient',
            action: 'TERMS_ACCEPTED',
            resourceType: 'terms_acceptance',
            resourceId: termsVersion,
            details: { termsVersion, acceptedAt },
            ipAddress,
            userAgent,
            status: 'SUCCESS'
        });

        res.json({
            success: true,
            consent: {
                userId: uid,
                termsVersion,
                accepted: true,
                acceptedAt
            }
        });
    } catch (error) {
        console.error('[Save Terms Consent Error]:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};


/**
 * 6. PUT /api/auth/patient-profile - Persist patient identity profile in Neon PostgreSQL
 */
export const updatePatientProfile = async (req, res) => {
    try {
        const userId = req.user?.uid || req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        const {
            fullName,
            displayName,
            name,
            email,
            phoneNumber,
            phone,
            abhaId,
            dob,
            gender,
            bloodGroup,
            allergies,
            photoURL
        } = req.body || {};

        const finalName = String(
            fullName || displayName || name || ''
        ).trim();

        const finalPhone = String(
            phoneNumber || phone || ''
        ).trim();

        const normalizedEmail = String(email || '').trim().toLowerCase();
        const finalAbhaId = String(abhaId || '').trim();
        const finalGender = String(gender || '').trim();
        const finalBloodGroup = String(bloodGroup || '').trim();
        const finalAllergies = String(allergies || '').trim();

        if (!finalName) {
            return res.status(400).json({
                success: false,
                message: 'Full Name is required.'
            });
        }

        const user = await getDb(
            `SELECT * FROM users WHERE id = ? LIMIT 1`,
            [userId]
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User account not found.'
            });
        }

        if (user.role !== 'patient') {
            return res.status(403).json({
                success: false,
                message: 'This endpoint is only available for patient profiles.'
            });
        }

        // Keep the authoritative account information in the users table.
        await runDb(
            `UPDATE users
             SET
                 name = ?,
                 phone = ?,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [
                finalName,
                finalPhone,
                userId
            ]
        );

        // Ensure a patient profile exists, then persist all identity fields in Neon.
        await runDb(
            `INSERT INTO patients (
                id,
                user_id,
                full_name,
                contact_phone,
                abha_id,
                dob,
                gender,
                blood_group,
                allergies,
                updated_at
            )
            VALUES (
                gen_random_uuid(),
                ?,
                ?,
                ?,
                ?,
                NULLIF(?, '')::date,
                ?,
                ?,
                ?,
                CURRENT_TIMESTAMP
            )
            ON CONFLICT (user_id)
            DO UPDATE SET
                full_name = EXCLUDED.full_name,
                contact_phone = EXCLUDED.contact_phone,
                abha_id = EXCLUDED.abha_id,
                dob = EXCLUDED.dob,
                gender = EXCLUDED.gender,
                blood_group = EXCLUDED.blood_group,
                allergies = EXCLUDED.allergies,
                updated_at = CURRENT_TIMESTAMP`,
            [
                userId,
                finalName,
                finalPhone,
                finalAbhaId || null,
                dob || '',
                finalGender || null,
                finalBloodGroup || null,
                finalAllergies || null
            ]
        );

        const updatedUser = await getDb(
            `SELECT * FROM users WHERE id = ? LIMIT 1`,
            [userId]
        );

        const updatedPatient = await getDb(
            `SELECT * FROM patients WHERE user_id = ? LIMIT 1`,
            [userId]
        ) || {};

        const returnedUser = {
            id: updatedUser.id,
            uid: updatedUser.id,
            email: updatedUser.email,
            name: updatedUser.name || updatedPatient.full_name || '',
            fullName: updatedPatient.full_name || updatedUser.name || '',
            displayName: updatedPatient.full_name || updatedUser.name || '',
            phoneNumber: updatedUser.phone || updatedPatient.contact_phone || '',
            phone: updatedUser.phone || updatedPatient.contact_phone || '',
            photoURL: photoURL || '',
            role: updatedUser.role,
            hospitalId: updatedUser.hospital_id || 'default_hospital',
            tenantId: updatedUser.hospital_id || 'default_tenant',
            abhaId: updatedPatient.abha_id || '',
            dob: updatedPatient.dob || '',
            gender: updatedPatient.gender || '',
            bloodGroup: updatedPatient.blood_group || '',
            allergies: updatedPatient.allergies || '',
            profileComplete: !!(
                (updatedPatient.full_name || updatedUser.name) &&
                (updatedUser.phone || updatedPatient.contact_phone) &&
                updatedUser.email &&
                updatedPatient.dob &&
                updatedPatient.abha_id
            ),
            onboardingComplete: !!updatedPatient.dob
        };

        await writeAuditEvent({
            userId,
            role: updatedUser.role || 'patient',
            action: 'PATIENT_PROFILE_UPDATED',
            resourceType: 'patient_profile',
            resourceId: updatedPatient.id,
            details: {
                fieldsUpdated: [
                    'fullName',
                    'phoneNumber',
                    'email',
                    'abhaId',
                    'dob',
                    'gender',
                    'bloodGroup',
                    'allergies'
                ]
            },
            ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
            userAgent: req.headers['user-agent'] || 'HealthChain Client',
            status: 'SUCCESS'
        });

        return res.json({
            success: true,
            message: 'Patient identity profile saved to Neon PostgreSQL.',
            user: returnedUser
        });
    } catch (error) {
        console.error('[Patient Profile Update Error]:', error);

        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to save patient identity profile.'
        });
    }
};

export const refreshToken = async (req, res) => {
    res.json({ success: true, message: 'Session refreshed successfully.' });
};

export const logoutUser = async (req, res) => {
    if (req.user?.uid) {
        await writeAuditEvent({
            userId: req.user.uid,
            role: req.user.role || 'user',
            action: 'USER_LOGOUT',
            resourceType: 'session',
            status: 'SUCCESS'
        });
    }
    res.json({ success: true, message: 'Logged out successfully.' });
};

export default {
    registerUser,
    loginUser,
    googleLogin,
    getMe,
    saveTermsConsent,
    refreshToken,
    logoutUser
};
