const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp();
const db = getFirestore('healthcare');

async function main() {
    const users = await db.collection('users').get();
    users.forEach(doc => {
        const u = doc.data();
        if (u.role === 'doctor') {
            console.log(`Doctor: Email: ${u.email}, UID: ${doc.id}`);
        }
    });
}
main().catch(console.error);
