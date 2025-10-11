
'use server';

import { adminDb } from './admin';
import { Transaction, Document, CreditReport } from '@/lib/types';
import type { FirestoreTransaction, FirestoreDocument, FirestoreCreditReport } from './collections';

// ==================== USER PROFILE ====================

/**
 * Create or update a user profile document
 */
export async function createOrUpdateUserProfile(
  userId: string,
  userData: {
    email: string;
    displayName?: string;
    photoURL?: string;
  }
): Promise<void> {
  const userRef = adminDb.collection('users').doc(userId);
  const userDoc = await userRef.get();
  
  const now = new Date();
  
  if (!userDoc.exists) {
    // Create new user profile
    await userRef.set({
      email: userData.email,
      displayName: userData.displayName || null,
      photoURL: userData.photoURL || null,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    });
  } else {
    // Update existing user profile
    await userRef.update({
      displayName: userData.displayName || null,
      photoURL: userData.photoURL || null,
      updatedAt: now,
      lastLoginAt: now,
    });
  }
}

/**
 * Get user profile
 */
export async function getUserProfile(userId: string): Promise<any | null> {
  const userDoc = await adminDb.collection('users').doc(userId).get();
  
  if (!userDoc.exists) {
    return null;
  }
  
  return { id: userDoc.id, ...userDoc.data() };
}

// ==================== TRANSACTIONS ====================

/**
 * Get all transactions for a user
 */
export async function getUserTransactions(userId: string): Promise<Transaction[]> {
  // Fetch without orderBy to avoid index requirement
  const snapshot = await adminDb
    .collection('users')
    .doc(userId)
    .collection('transactions')
    .get();

  const transactions = snapshot.docs.map(doc => {
    const data = doc.data() as FirestoreTransaction;
    // Convert Firestore document to Transaction type
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

  // Sort by date in memory (newest first)
  transactions.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });

  return transactions;
}

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
    const docRef = adminDb.collection('users').doc(userId).collection('transactions').doc(transaction.id);
    const firestoreData: Omit<FirestoreTransaction, 'id'> & { id?: string } = {
      ...transaction,
      userId,
      sourceDocumentId,
      createdAt: now,
      updatedAt: now,
    };
    // The transaction object from the AI might not have an ID, so we use the docRef.id
    firestoreData.id = docRef.id;
    batch.set(docRef, firestoreData);
  });

  await batch.commit();
}

// ==================== DOCUMENTS ====================

/**
 * Create a document record in Firestore (called when upload starts)
 */
export async function createDocument(
  userId: string,
  document: Omit<Document, 'id'>,
  storageUrl: string
): Promise<string> {
  const docRef = adminDb.collection('users').doc(userId).collection('documents').doc();
  const now = new Date();
  const uploadDateString = now.toISOString().split('T')[0]; // Format: YYYY-MM-DD

  // Normalize uploadDate to YYYY-MM-DD format
  let normalizedUploadDate = uploadDateString;
  if (document.uploadDate) {
    // If uploadDate exists, ensure it's in YYYY-MM-DD format
    normalizedUploadDate = document.uploadDate.split('T')[0];
  }

  const firestoreData: FirestoreDocument = {
    ...document,
    id: docRef.id,
    uploadDate: normalizedUploadDate,
    userId,
    storageUrl,
    extractedTransactionCount: 0,
    createdAt: now,
  };

  await docRef.set(firestoreData);
  return docRef.id;
}

/**
 * Update document status and other metadata after processing
 * Now accepts userId to properly construct the document path
 */
export async function updateDocumentStatus(
  userId: string,
  documentId: string,
  status: 'processed' | 'pending' | 'failed',
  extractedTransactionCount?: number,
  errorMessage?: string
): Promise<void> {
  const updates: Record<string, any> = {
    status,
    processedAt: new Date(),
  };

  if (extractedTransactionCount !== undefined) {
    updates.extractedTransactionCount = extractedTransactionCount;
  }

  if (errorMessage) {
    updates.errorMessage = errorMessage;
  }

  await adminDb
    .collection('users')
    .doc(userId)
    .collection('documents')
    .doc(documentId)
    .update(updates);
}

// ==================== CREDIT REPORTS ====================

/**
 * Save a credit report to Firestore
 */
export async function saveCreditReport(
  userId: string,
  report: Omit<CreditReport, 'id'>,
  factors: Record<string, any>,
  transactionCount: number,
  periodStart: string,
  periodEnd: string
): Promise<void> {
  const docRef = adminDb.collection('users').doc(userId).collection('creditReports').doc();

  const firestoreData: FirestoreCreditReport = {
    ...report,
    id: docRef.id,
    userId,
    factors,
    transactionCount,
    periodStart,
    periodEnd,
    createdAt: new Date(),
  };

  await docRef.set(firestoreData);
}
