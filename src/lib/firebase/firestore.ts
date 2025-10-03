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
