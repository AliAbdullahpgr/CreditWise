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
