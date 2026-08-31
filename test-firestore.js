import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFile } from 'fs/promises';

async function test() {
    try {
        const key = JSON.parse(await readFile('./service-account.json', 'utf8'));
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
