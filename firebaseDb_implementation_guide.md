# Firebase Database Implementation - CreditWise AI Instructions

## Overview
This document provides step-by-step instructions for implementing **Firebase Firestore** in the CreditWise application to store AI-processed transaction data, documents, and credit reports. This replaces the current localStorage-based data persistence with a scalable cloud database.

---

## 🎯 Implementation Goals

1. **Store AI-processed transactions** from document extraction flows in Firestore
2. **Persist user documents** with processing status and metadata
3. **Save credit reports** with historical tracking
4. **Retrieve and display data** in the transactions, documents, and reports pages
5. **Enable real-time updates** for document processing status
6. **Add user authentication context** for multi-user support

---

## 📋 Prerequisites

### Current State
- Firebase SDK already installed (`firebase@11.9.1` in package.json)
- Firebase App Hosting configured (`apphosting.yaml`)
- AI flows processing data: `extract-transactions-from-document.ts`, `calculate-credit-score.ts`
- Client-side localStorage usage in `transactions/page.tsx`, `documents/page.tsx`

### Required Setup
1. Firebase project with Firestore enabled
2. Firebase Admin SDK credentials for server-side operations
3. Environment variables for Firebase configuration
4. Security rules for Firestore collections

---

## 🏗️ Architecture Pattern

### Data Flow
```
User uploads document 
  → AI flow extracts transactions (server action)
  → Save to Firestore with user ID
  → Real-time listener updates UI
  → Display in transactions page
```

### Firestore Collections Structure
```
users/{userId}
  - email: string
  - displayName: string
  - createdAt: timestamp

transactions/{transactionId}
  - userId: string (index)
  - id: string
  - date: string
  - merchant: string
  - amount: number
  - type: 'income' | 'expense'
  - category: string
  - status: 'cleared' | 'pending'
  - sourceDocumentId: string (optional)
  - createdAt: timestamp
  - updatedAt: timestamp

documents/{documentId}
  - userId: string (index)
  - id: string
  - name: string
  - uploadDate: string
  - type: 'receipt' | 'utility bill' | 'wallet statement'
  - status: 'processed' | 'pending' | 'failed'
  - storageUrl: string (Firebase Storage path)
  - processedAt: timestamp (optional)
  - errorMessage: string (optional)
  - extractedTransactionCount: number
  - createdAt: timestamp

creditReports/{reportId}
  - userId: string (index)
  - id: string
  - generationDate: string
  - score: number
  - grade: 'A' | 'B' | 'C' | 'D'
  - factors: object (detailed breakdown)
  - url: string (PDF storage URL)
  - transactionCount: number
  - periodStart: string
  - periodEnd: string
  - createdAt: timestamp
```

---

## 📁 File Structure

### New Files to Create
```
src/lib/
  firebase/
    config.ts              # Firebase client initialization
    admin.ts               # Firebase Admin SDK (server-side)
    firestore.ts           # Firestore helper functions
    collections.ts         # Collection references and types
    converters.ts          # Firestore data converters
```

### Files to Modify
```
src/app/(app)/transactions/page.tsx    # Replace localStorage with Firestore
src/app/(app)/documents/page.tsx       # Add Firestore document persistence
src/app/(app)/reports/page.tsx         # Load reports from Firestore
src/ai/flows/extract-transactions-from-document.ts  # Save to Firestore after extraction
src/ai/flows/calculate-credit-score.ts # Save reports to Firestore
.env.local                             # Add Firebase config variables
```

---

## 🔧 Step-by-Step Implementation

### Step 1: Firebase Configuration Setup

#### Create `src/lib/firebase/config.ts`
```typescript
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (client-side)
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;
let storage: FirebaseStorage;

if (typeof window !== 'undefined' && !getApps().length) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
} else if (typeof window !== 'undefined') {
  app = getApps()[0];
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
}

export { app, db, auth, storage };
```

#### Create `src/lib/firebase/admin.ts` (Server-side)
```typescript
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App;
let adminDb: Firestore;

// Initialize Firebase Admin SDK for server-side operations
if (!getApps().length) {
  adminApp = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
  adminDb = getFirestore(adminApp);
} else {
  adminApp = getApps()[0];
  adminDb = getFirestore(adminApp);
}

export { adminApp, adminDb };
```

#### Update `.env.local`
```bash
# Firebase Client Config (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin Config (Server-side only, keep secret)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

---

### Step 2: Firestore Helper Functions

#### Create `src/lib/firebase/collections.ts`
```typescript
import { collection, CollectionReference } from 'firebase/firestore';
import { db } from './config';
import { Transaction, Document, CreditReport } from '@/lib/types';

// Extended types with Firestore metadata
export type FirestoreTransaction = Transaction & {
  userId: string;
  sourceDocumentId?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type FirestoreDocument = Document & {
  userId: string;
  storageUrl: string;
  processedAt?: Date;
  errorMessage?: string;
  extractedTransactionCount: number;
  createdAt: Date;
};

export type FirestoreCreditReport = CreditReport & {
  userId: string;
  factors: Record<string, any>;
  transactionCount: number;
  periodStart: string;
  periodEnd: string;
  createdAt: Date;
};

// Collection references with proper typing
export const transactionsCollection = collection(
  db,
  'transactions'
) as CollectionReference<FirestoreTransaction>;

export const documentsCollection = collection(
  db,
  'documents'
) as CollectionReference<FirestoreDocument>;

export const creditReportsCollection = collection(
  db,
  'creditReports'
) as CollectionReference<FirestoreCreditReport>;
```

#### Create `src/lib/firebase/firestore.ts`
```typescript
'use server';

import { adminDb } from './admin';
import { Transaction, Document, CreditReport } from '@/lib/types';
import { 
  FirestoreTransaction, 
  FirestoreDocument, 
  FirestoreCreditReport 
} from './collections';

// ==================== TRANSACTIONS ====================

/**
 * Save multiple transactions to Firestore (called from AI flow)
 */
export async function saveTransactions(
  userId: string,
  transactions: Transaction[],
  sourceDocumentId?: string
): Promise<void> {
  const batch = adminDb.batch();
  const now = new Date();

  transactions.forEach((transaction) => {
    const docRef = adminDb.collection('transactions').doc(transaction.id);
    const firestoreData: FirestoreTransaction = {
      ...transaction,
      userId,
      sourceDocumentId,
      createdAt: now,
      updatedAt: now,
    };
    batch.set(docRef, firestoreData);
  });

  await batch.commit();
}

/**
 * Get all transactions for a user
 */
export async function getUserTransactions(userId: string): Promise<Transaction[]> {
  const snapshot = await adminDb
    .collection('transactions')
    .where('userId', '==', userId)
    .orderBy('date', 'desc')
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data() as FirestoreTransaction;
    // Return only the Transaction type fields (strip Firestore metadata)
    return {
      id: data.id,
      date: data.date,
      merchant: data.merchant,
      amount: data.amount,
      type: data.type,
      category: data.category,
      status: data.status,
    };
  });
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(transactionId: string): Promise<void> {
  await adminDb.collection('transactions').doc(transactionId).delete();
}

// ==================== DOCUMENTS ====================

/**
 * Create a document record (called when upload starts)
 */
export async function createDocument(
  userId: string,
  document: Omit<Document, 'id'>,
  storageUrl: string
): Promise<string> {
  const docRef = adminDb.collection('documents').doc();
  const now = new Date();

  const firestoreData: FirestoreDocument = {
    ...document,
    id: docRef.id,
    userId,
    storageUrl,
    extractedTransactionCount: 0,
    createdAt: now,
  };

  await docRef.set(firestoreData);
  return docRef.id;
}

/**
 * Update document status after processing
 */
export async function updateDocumentStatus(
  documentId: string,
  status: 'processed' | 'pending' | 'failed',
  extractedTransactionCount?: number,
  errorMessage?: string
): Promise<void> {
  const updates: any = {
    status,
    processedAt: new Date(),
  };

  if (extractedTransactionCount !== undefined) {
    updates.extractedTransactionCount = extractedTransactionCount;
  }

  if (errorMessage) {
    updates.errorMessage = errorMessage;
  }

  await adminDb.collection('documents').doc(documentId).update(updates);
}

/**
 * Get all documents for a user
 */
export async function getUserDocuments(userId: string): Promise<Document[]> {
  const snapshot = await adminDb
    .collection('documents')
    .where('userId', '==', userId)
    .orderBy('uploadDate', 'desc')
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data() as FirestoreDocument;
    return {
      id: data.id,
      name: data.name,
      uploadDate: data.uploadDate,
      type: data.type,
      status: data.status,
    };
  });
}

// ==================== CREDIT REPORTS ====================

/**
 * Save a credit report
 */
export async function saveCreditReport(
  userId: string,
  report: CreditReport,
  factors: Record<string, any>,
  transactionCount: number,
  periodStart: string,
  periodEnd: string
): Promise<void> {
  const docRef = adminDb.collection('creditReports').doc(report.id);

  const firestoreData: FirestoreCreditReport = {
    ...report,
    userId,
    factors,
    transactionCount,
    periodStart,
    periodEnd,
    createdAt: new Date(),
  };

  await docRef.set(firestoreData);
}

/**
 * Get all credit reports for a user
 */
export async function getUserCreditReports(userId: string): Promise<CreditReport[]> {
  const snapshot = await adminDb
    .collection('creditReports')
    .where('userId', '==', userId)
    .orderBy('generationDate', 'desc')
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data() as FirestoreCreditReport;
    return {
      id: data.id,
      generationDate: data.generationDate,
      score: data.score,
      grade: data.grade,
      url: data.url,
    };
  });
}
```

---

### Step 3: Modify AI Flows to Save Data

#### Update `src/ai/flows/extract-transactions-from-document.ts`
Add after the AI extraction logic:

```typescript
import { saveTransactions } from '@/lib/firebase/firestore';
import { updateDocumentStatus } from '@/lib/firebase/firestore';

// Inside the extractTransactionsFromDocument function, after generating output:
export async function extractTransactionsFromDocument(
  input: ExtractTransactionsFromDocumentInput,
  userId: string,  // Add this parameter
  documentId: string  // Add this parameter
): Promise<ExtractTransactionsFromDocumentOutput> {
  try {
    const output = await extractTransactionsFlow(input);
    
    // Save transactions to Firestore
    if (userId && output.transactions.length > 0) {
      await saveTransactions(userId, output.transactions, documentId);
      
      // Update document status
      await updateDocumentStatus(
        documentId,
        'processed',
        output.transactions.length
      );
    }
    
    return output;
  } catch (error) {
    // Update document with error status
    if (documentId) {
      await updateDocumentStatus(
        documentId,
        'failed',
        0,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
    throw error;
  }
}
```

#### Update `src/ai/flows/calculate-credit-score.ts`
Add after credit score calculation:

```typescript
import { saveCreditReport } from '@/lib/firebase/firestore';

// Inside the calculateCreditScore function:
export async function calculateCreditScore(
  input: CalculateCreditScoreInput,
  userId: string  // Add this parameter
): Promise<CalculateCreditScoreOutput> {
  const output = await calculateCreditScoreFlow(input);
  
  // Save credit report to Firestore
  if (userId) {
    const report: CreditReport = {
      id: crypto.randomUUID(),
      generationDate: new Date().toISOString(),
      score: output.creditScore,
      grade: output.grade,
      url: '', // Generate PDF and upload to Storage if needed
    };
    
    await saveCreditReport(
      userId,
      report,
      output.factors,
      input.transactions.length,
      input.transactions[0]?.date || '',
      input.transactions[input.transactions.length - 1]?.date || ''
    );
  }
  
  return output;
}
```

---

### Step 4: Update Transaction Page

#### Modify `src/app/(app)/transactions/page.tsx`
Replace localStorage logic with Firestore:

```typescript
'use client';

import { useEffect, useState } from "react";
import { onSnapshot, query, where, orderBy } from "firebase/firestore";
import { transactionsCollection } from "@/lib/firebase/collections";
import { auth } from "@/lib/firebase/config";
import { getUserTransactions } from "@/lib/firebase/firestore";
// ... other imports

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Get current user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUserId(user?.uid || null);
    });
    return unsubscribe;
  }, []);
  
  // Real-time listener for transactions
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    const q = query(
      transactionsCollection,
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const transactionData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: data.id,
          date: data.date,
          merchant: data.merchant,
          amount: data.amount,
          type: data.type,
          category: data.category,
          status: data.status,
        } as Transaction;
      });
      
      setTransactions(transactionData);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [userId]);
  
  // Rest of component logic...
  
  if (loading) {
    return <div>Loading transactions...</div>;
  }
  
  if (!userId) {
    return <div>Please sign in to view transactions.</div>;
  }
  
  // ... rest of component
}
```

---

### Step 5: Update Documents Page

#### Modify `src/app/(app)/documents/page.tsx`
Add Firestore integration for document upload and status tracking:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '@/lib/firebase/config';
import { createDocument, getUserDocuments } from '@/lib/firebase/firestore';
import { extractTransactionsFromDocument } from '@/ai/flows/extract-transactions-from-document';
// ... other imports

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUserId(user?.uid || null);
    });
    return unsubscribe;
  }, []);
  
  useEffect(() => {
    if (userId) {
      loadDocuments();
    }
  }, [userId]);
  
  async function loadDocuments() {
    if (!userId) return;
    const docs = await getUserDocuments(userId);
    setDocuments(docs);
  }
  
  async function handleFileUpload(file: File, docType: Document['type']) {
    if (!userId) {
      alert('Please sign in to upload documents');
      return;
    }
    
    setUploading(true);
    
    try {
      // 1. Upload to Firebase Storage
      const storageRef = ref(storage, `documents/${userId}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      
      // 2. Create document record in Firestore
      const documentId = await createDocument(
        userId,
        {
          name: file.name,
          uploadDate: new Date().toISOString(),
          type: docType,
          status: 'pending',
        },
        downloadUrl
      );
      
      // 3. Convert file to base64 data URI for AI processing
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUri = reader.result as string;
        
        // 4. Call AI extraction flow
        await extractTransactionsFromDocument(
          { document: dataUri },
          userId,
          documentId
        );
        
        // 5. Reload documents to show updated status
        await loadDocuments();
      };
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload document');
    } finally {
      setUploading(false);
    }
  }
  
  // ... rest of component
}
```

---

### Step 6: Firestore Security Rules

Create these rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check authentication
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Transactions collection
    match /transactions/{transactionId} {
      allow read: if isSignedIn() && isOwner(resource.data.userId);
      allow create: if isSignedIn() && isOwner(request.resource.data.userId);
      allow update, delete: if isSignedIn() && isOwner(resource.data.userId);
    }
    
    // Documents collection
    match /documents/{documentId} {
      allow read: if isSignedIn() && isOwner(resource.data.userId);
      allow create: if isSignedIn() && isOwner(request.resource.data.userId);
      allow update: if isSignedIn() && isOwner(resource.data.userId);
      allow delete: if isSignedIn() && isOwner(resource.data.userId);
    }
    
    // Credit Reports collection
    match /creditReports/{reportId} {
      allow read: if isSignedIn() && isOwner(resource.data.userId);
      allow create: if isSignedIn() && isOwner(request.resource.data.userId);
      allow update, delete: if isSignedIn() && isOwner(resource.data.userId);
    }
    
    // Users collection (if you add user profiles)
    match /users/{userId} {
      allow read: if isSignedIn() && isOwner(userId);
      allow create, update: if isSignedIn() && isOwner(userId);
    }
  }
}
```

---

### Step 7: Firestore Indexes

Create composite indexes in Firebase Console or via `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "transactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "documents",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "uploadDate", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "creditReports",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "generationDate", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## 🧪 Testing Strategy

### 1. Local Development Testing
```bash
# Install Firebase CLI if needed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firestore emulator
firebase init emulators

# Start emulators
firebase emulators:start

# Update firebase config to use emulators in development
```

### 2. Test Data Flow
1. Upload a document → Check Firestore documents collection
2. Wait for AI processing → Verify transactions collection populated
3. View transactions page → Confirm real-time updates
4. Generate credit report → Check creditReports collection

### 3. Security Testing
- Test unauthorized access attempts
- Verify user can only see their own data
- Test cross-user data isolation

---

## 📊 Migration Strategy (LocalStorage → Firestore)

### Create Migration Utility
```typescript
// src/lib/firebase/migrate-localStorage.ts
'use server';

import { saveTransactions } from './firestore';
import { Transaction } from '@/lib/types';

export async function migrateLocalStorageToFirestore(
  userId: string,
  transactions: Transaction[]
): Promise<void> {
  if (transactions.length === 0) return;
  
  await saveTransactions(userId, transactions);
  console.log(`Migrated ${transactions.length} transactions to Firestore`);
}
```

### Add to Transaction Page
```typescript
// One-time migration on mount
useEffect(() => {
  const migrateData = async () => {
    const localData = localStorage.getItem('transactions');
    if (localData && userId) {
      const transactions = JSON.parse(localData);
      await migrateLocalStorageToFirestore(userId, transactions);
      localStorage.removeItem('transactions'); // Clear after migration
    }
  };
  
  migrateData();
}, [userId]);
```

---

## 🚀 Deployment Checklist

- [ ] Add Firebase config to environment variables
- [ ] Deploy Firestore security rules
- [ ] Create composite indexes
- [ ] Test with Firebase emulators locally
- [ ] Deploy to Firebase App Hosting
- [ ] Monitor Firestore usage in Firebase Console
- [ ] Set up billing alerts for Firestore reads/writes
- [ ] Enable Firebase Authentication (if not already done)

---

## 💡 Best Practices

### Performance Optimization
1. **Use pagination** for transactions list (limit queries to 50-100 items)
2. **Cache queries** with React Query or SWR
3. **Batch writes** when saving multiple transactions
4. **Use real-time listeners** only when needed (consider polling for some views)

### Cost Optimization
1. **Limit read operations** - don't fetch all transactions on every render
2. **Use server-side fetching** for initial page loads
3. **Implement proper indexes** to avoid expensive queries
4. **Monitor Firestore dashboard** for usage patterns

### Error Handling
1. **Wrap all Firestore calls** in try-catch blocks
2. **Provide user feedback** during uploads and processing
3. **Log errors** to Firebase Crashlytics or similar service
4. **Implement retry logic** for failed operations

### Data Validation
1. **Validate data** before saving to Firestore
2. **Use TypeScript types** for type safety
3. **Implement Firestore security rules** for server-side validation
4. **Sanitize user inputs** before storage

---

## 🔗 Additional Resources

- [Firebase Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Next.js with Firebase](https://firebase.google.com/docs/hosting/nextjs)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firestore Data Modeling](https://firebase.google.com/docs/firestore/manage-data/structure-data)

---

## 🎓 Key Concepts for AI Implementation

When implementing this:
1. **Always use server actions** (`'use server'`) for Firestore writes via Admin SDK
2. **Use client-side SDK** for real-time listeners in UI components
3. **Maintain type safety** with TypeScript across all Firebase operations
4. **Follow the established pattern** of AI flows → Firestore → UI components
5. **Test incrementally** - implement one collection at a time (transactions → documents → reports)
6. **Preserve existing UI/UX** - only change data layer, not component structure
7. **Add loading states** for async operations
8. **Handle authentication state** before accessing Firestore

---

**Last Updated**: October 3, 2025  
**Compatible with**: CreditWise v0.1.0, Next.js 15, Firebase 11.9.1
