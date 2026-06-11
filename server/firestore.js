import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// Initialize Firebase Admin once
let db;
function getDb() {
  if (!db) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace \\n with actual newlines in private key
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    db = getFirestore();
  }
  return db;
}

// Kerala districts with approximate coordinates for heatmap
const DISTRICT_COORDS = {
  'Thiruvananthapuram': { lat: 8.5241, lng: 76.9366 },
  'Kollam':            { lat: 8.8932, lng: 76.6141 },
  'Pathanamthitta':    { lat: 9.2648, lng: 76.7870 },
  'Alappuzha':         { lat: 9.4981, lng: 76.3388 },
  'Kottayam':          { lat: 9.5916, lng: 76.5222 },
  'Idukki':            { lat: 9.9189, lng: 77.1025 },
  'Ernakulam':         { lat: 9.9816, lng: 76.2999 },
  'Thrissur':          { lat: 10.5276, lng: 76.2144 },
  'Palakkad':          { lat: 10.7867, lng: 76.6548 },
  'Malappuram':        { lat: 11.0730, lng: 76.0740 },
  'Kozhikode':         { lat: 11.2588, lng: 75.7804 },
  'Wayanad':           { lat: 11.6854, lng: 76.1320 },
  'Kannur':            { lat: 11.8745, lng: 75.3704 },
  'Kasaragod':         { lat: 12.4996, lng: 74.9869 },
};

export async function saveReport({ crop, district, issue, severity }) {
  const db = getDb();
  const coords = DISTRICT_COORDS[district] || { lat: 10.8505, lng: 76.2711 }; // Kerala center

  await db.collection('reports').add({
    crop,
    district: district || 'Unknown',
    issue,
    severity,
    lat: coords.lat,
    lng: coords.lng,
    createdAt: Timestamp.now(),
  });
}

export async function getRecentReports() {
  const db = getDb();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30); // last 30 days

  const snapshot = await db.collection('reports')
    .where('createdAt', '>=', Timestamp.fromDate(cutoff))
    .orderBy('createdAt', 'desc')
    .limit(200)
    .get();

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt.toDate() }));
}
