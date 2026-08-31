


async function test() {
    try {
        const loginRes = await fetch('http://localhost:3001/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'doctor@health.com', password: 'password' })
        });
        const doctor = await loginRes.json();
        console.log('Logged in as:', doctor.email);

        const usersRes = await fetch('http://localhost:3001/api/users');
        const users = await usersRes.json();
        const patient = users.find(u => u.email === 'patient@health.com');
        console.log('Found patient:', patient.id);

        // Add a record as patient
        const newRecord = {
            id: 'rec_' + Date.now(),
            data: { name: 'Test Record', type: 'Test', content: 'Encrypted' },
            hash: '0x123',
            previousHash: '0x000',
            timestamp: Date.now(),
            patientId: patient.id
        };

        await fetch('http://localhost:3001/api/records', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newRecord)
        });
        console.log('Created test record');

        const recordsUrl = `http://localhost:3001/api/records?role=doctor&userId=${doctor.id}&patientIdForDoctor=${patient.id}`;
        console.log('Fetching:', recordsUrl);
        const recordsRes = await fetch(recordsUrl);
        const records = await recordsRes.json();

        console.log('Records found:', records.length);
        if (records.length > 0) {
            console.log('First Record Structure:', JSON.stringify(records[0], null, 2));
        }

    } catch (e) {
        console.error(e);
    }
}

test();
