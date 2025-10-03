'use server';

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App;
let adminDb: Firestore;

// Initialize Firebase Admin SDK for server-side operations
// This is a simplified check. In a real app, you might need more robust initialization logic.
if (!getApps().some(app => app.name === '[DEFAULT]')) {
  adminApp = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    }),
  });
  adminDb = getFirestore(adminApp);
} else {
  adminApp = getApps().find(app => app.name === '[DEFAULT]')!;
  adminDb = getFirestore(adminApp);
}


export { adminApp, adminDb };
