const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const key = require('./service-account.json');

async function test() {
    try {
        const app = initializeApp({ credential: cert(key) });
        const db = getFirestore(app);
        console.log('Fetching users...');
        const snap = await db.collection('users').limit(1).get();
        console.log('Found users:', snap.size);
    } catch (e) {
        console.error('Firestore Error:', e);
    }
}
test();
