const admin = require('firebase-admin');

admin.initializeApp({
  projectId: 'healthcare-edb75'
});

const auth = admin.auth();
const db = admin.firestore();

async function run() {
    console.log('Running local admin credentials setup script...');
    try {
        const u = { email: 'rchinnarangaswamyreddyr@gmail.com', password: 'password123', name: 'Dr. Chinnarangaswamy' };
        
        let firebaseUser;
        try {
            firebaseUser = await auth.getUserByEmail(u.email);
            console.log(`Found existing user in Auth: ${firebaseUser.uid}`);
            
            // Set password and mark email verified
            await auth.updateUser(firebaseUser.uid, {
                password: u.password,
                emailVerified: true
            });
            console.log(`✓ Updated password in Auth to password123`);
        } catch (err) {
            if (err.code === 'auth/user-not-found') {
                firebaseUser = await auth.createUser({
                    email: u.email,
                    password: u.password,
                    displayName: u.name,
                    emailVerified: true
                });
                console.log(`✓ Created new user in Auth: ${firebaseUser.uid}`);
            } else {
                throw err;
            }
        }

        // Now write Firestore doc in clinical_users
        await db.collection('clinical_users').doc(firebaseUser.uid).set({
            uid: firebaseUser.uid,
            fullName: u.name,
            companyName: 'Central Medical Hub',
            clinicalId: 'CLN-TEST-999',
            email: u.email,
            phoneNumber: '+917702484883',
            specialization: 'Cardiology',
            role: 'clinical',
            isVerified: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            loginHistory: [],
            profileStatus: 'approved',
            status: 'active'
        }, { merge: true });
        console.log(`✓ Wrote Firestore clinical_users doc for ${u.email}`);
        
        // Also do it for test@hospital.org
        const u2 = { email: 'test@hospital.org', password: 'password123', name: 'Test Clinical Staff' };
        let firebaseUser2;
        try {
            firebaseUser2 = await auth.getUserByEmail(u2.email);
            console.log(`Found existing user in Auth: ${firebaseUser2.uid}`);
            await auth.updateUser(firebaseUser2.uid, {
                password: u2.password,
                emailVerified: true
            });
            console.log(`✓ Updated password in Auth to password123`);
        } catch (err) {
            if (err.code === 'auth/user-not-found') {
                firebaseUser2 = await auth.createUser({
                    email: u2.email,
                    password: u2.password,
                    displayName: u2.name,
                    emailVerified: true
                });
                console.log(`✓ Created new user in Auth: ${firebaseUser2.uid}`);
            } else {
                throw err;
            }
        }
        await db.collection('clinical_users').doc(firebaseUser2.uid).set({
            uid: firebaseUser2.uid,
            fullName: u2.name,
            companyName: 'Central Medical Hub',
            clinicalId: 'CLN-TEST-999',
            email: u2.email,
            phoneNumber: '+917702484883',
            specialization: 'Cardiology',
            role: 'clinical',
            isVerified: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            loginHistory: [],
            profileStatus: 'approved',
            status: 'active'
        }, { merge: true });
        console.log(`✓ Wrote Firestore clinical_users doc for ${u2.email}`);
        
    } catch (e) {
        console.error('Error running setup:', e);
    }
}

run();
