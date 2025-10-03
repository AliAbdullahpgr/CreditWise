
'use server';

import { adminDb } from './admin';
import { Transaction, Document, CreditReport } from '@/lib/types';
import type { FirestoreTransaction, FirestoreDocument, FirestoreCreditReport } from './collections';

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
 * Update document status and other metadata after processing
 */
export async function updateDocumentStatus(
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

  await adminDb.collection('documents').doc(documentId).update(updates);
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
  const docRef = adminDb.collection('creditReports').doc();

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
