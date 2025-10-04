
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
  console.log('\n💾 [FIRESTORE] saveTransactions called');
  console.log('👤 [USER ID]', userId);
  console.log('📊 [COUNT]', transactions.length, 'transaction(s)');
  console.log('📝 [SOURCE DOC]', sourceDocumentId || 'none');
  
  const batch = adminDb.batch();
  const now = new Date();

  transactions.forEach((transaction, index) => {
    const docRef = adminDb.collection('transactions').doc(transaction.id);
    console.log(`  ${index + 1}. Adding to batch: ${transaction.merchant} - $${transaction.amount}`);
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

  console.log('🚀 [BATCH WRITE] Committing batch write to Firestore...');
  await batch.commit();
  console.log('✅ [BATCH WRITE] All transactions saved successfully');
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
  console.log('\n💾 [FIRESTORE] createDocument called');
  console.log('👤 [USER ID]', userId);
  console.log('📄 [DOC NAME]', document.name);
  console.log('📌 [DOC TYPE]', document.type);
  
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

  console.log('🎯 [FIRESTORE ID]', docRef.id);
  console.log('🚀 [WRITING] Saving document to Firestore...');
  await docRef.set(firestoreData);
  console.log('✅ [CREATED] Document record created in Firestore');
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
  console.log('\n📋 [FIRESTORE] updateDocumentStatus called');
  console.log('🎯 [DOC ID]', documentId);
  console.log('📈 [STATUS]', status);
  console.log('📊 [TX COUNT]', extractedTransactionCount ?? 'not provided');
  if (errorMessage) console.log('❌ [ERROR]', errorMessage);
  
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

  console.log('🚀 [UPDATING] Updating document in Firestore...');
  await adminDb.collection('documents').doc(documentId).update(updates);
  console.log('✅ [UPDATED] Document status updated to:', status);
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
