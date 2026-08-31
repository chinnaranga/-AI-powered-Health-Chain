import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import useAuthStore from '../store/authStore';
import { userService } from '../services/userService';

export function useAuditLogs() {
    const { user } = useAuthStore();
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userProfiles, setUserProfiles] = useState({});

    // 1. Fetch user profile names once for dynamic mapping
    useEffect(() => {
        userService.getUsers()
            .then(users => {
                const profileMap = {};
                users.forEach(u => {
                    profileMap[u.id] = u.name || u.displayName || u.email || 'Unknown Actor';
                });
                setUserProfiles(profileMap);
            })
            .catch(err => console.error("Failed to load user profiles for logs", err));
    }, []);

    // 2. Setup real-time listener based on user role
    useEffect(() => {
        const firebaseUid = auth.currentUser?.uid;
        const userId = firebaseUid || user?.uid || user?.id;

        if (!userId) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const logsRef = collection(db, 'auditLogs');
        const role = user?.role || 'patient';

        let unsubscribes = [];

        const processRawLogs = (rawDocs) => {
            return rawDocs.map(doc => {
                const data = doc.data();
                const timestampVal = data.timestamp?.seconds ? data.timestamp.seconds * 1000 : Date.now();
                return {
                    id: doc.id,
                    ...data,
                    timestamp: timestampVal,
                    actorName: userProfiles[data.userId] || data.details?.doctorName || 'System Node',
                    patientName: userProfiles[data.details?.patientId] || 'Self-Upload'
                };
            }).sort((a, b) => b.timestamp - a.timestamp);
        };

        if (role === 'admin' || role === 'clinical') {
            // Compliance Auditor / Admin sees all logs
            const q = query(logsRef);
            const unsub = onSnapshot(q, (snapshot) => {
                const rawDocs = snapshot.docs;
                setLogs(processRawLogs(rawDocs));
                setIsLoading(false);
            }, (err) => {
                console.error('[useAuditLogs] admin query failed:', err);
                setIsLoading(false);
            });
            unsubscribes.push(unsub);
        } else if (role === 'doctor') {
            // Doctor sees all logs where they are the primary actor
            const q = query(logsRef, where('userId', '==', userId));
            const unsub = onSnapshot(q, (snapshot) => {
                const rawDocs = snapshot.docs;
                setLogs(processRawLogs(rawDocs));
                setIsLoading(false);
            }, (err) => {
                console.error('[useAuditLogs] doctor query failed:', err);
                setIsLoading(false);
            });
            unsubscribes.push(unsub);
        } else {
            // Patient sees a dual merged stream:
            // 1. Logs they initiated (userId == patientId)
            // 2. Logs targeting them (details.patientId == patientId)
            let logsMap = new Map();
            let isStream1Loaded = false;
            let isStream2Loaded = false;

            const updatePatientLogs = () => {
                const mergedList = Array.from(logsMap.values())
                    .sort((a, b) => b.timestamp - a.timestamp);
                setLogs(mergedList);
                if (isStream1Loaded && isStream2Loaded) {
                    setIsLoading(false);
                }
            };

            const q1 = query(logsRef, where('userId', '==', userId));
            const unsub1 = onSnapshot(q1, (snapshot) => {
                snapshot.docs.forEach(docSnap => {
                    const data = docSnap.data();
                    const timestampVal = data.timestamp?.seconds ? data.timestamp.seconds * 1000 : Date.now();
                    logsMap.set(docSnap.id, {
                        id: docSnap.id,
                        ...data,
                        timestamp: timestampVal,
                        actorName: userProfiles[data.userId] || 'Patient Self',
                        patientName: userProfiles[data.details?.patientId] || 'Patient Self'
                    });
                });
                isStream1Loaded = true;
                updatePatientLogs();
            }, (err) => {
                console.error('[useAuditLogs] patient stream 1 failed:', err);
                isStream1Loaded = true;
                updatePatientLogs();
            });

            const q2 = query(logsRef, where('details.patientId', '==', userId));
            const unsub2 = onSnapshot(q2, (snapshot) => {
                snapshot.docs.forEach(docSnap => {
                    const data = docSnap.data();
                    const timestampVal = data.timestamp?.seconds ? data.timestamp.seconds * 1000 : Date.now();
                    logsMap.set(docSnap.id, {
                        id: docSnap.id,
                        ...data,
                        timestamp: timestampVal,
                        actorName: userProfiles[data.userId] || data.details?.doctorName || 'Attending Doctor',
                        patientName: userProfiles[data.details?.patientId] || 'Patient Self'
                    });
                });
                isStream2Loaded = true;
                updatePatientLogs();
            }, (err) => {
                console.error('[useAuditLogs] patient stream 2 failed:', err);
                isStream2Loaded = true;
                updatePatientLogs();
            });

            unsubscribes.push(unsub1, unsub2);
        }

        return () => {
            unsubscribes.forEach(unsub => unsub());
        };
    }, [user?.uid, user?.id, user?.role, userProfiles]);

    return { logs, isLoading };
}
