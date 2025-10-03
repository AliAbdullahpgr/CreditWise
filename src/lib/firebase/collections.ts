
import { collection, CollectionReference } from 'firebase/firestore';
import { db } from './config';
import { Transaction, Document, CreditReport } from '@/lib/types';

// This file requires a client-side Firestore instance, so it should not be used in 'use server' files.
// The `db` import will be undefined on the server.

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

// These collection references are intended for client-side use with real-time listeners.
// They will not work in server components or server actions.
export const getTransactionsCollection = () => collection(db, 'transactions') as CollectionReference<FirestoreTransaction>;
export const getDocumentsCollection = () => collection(db, 'documents') as CollectionReference<FirestoreDocument>;
export const getCreditReportsCollection = () => collection(db, 'creditReports') as CollectionReference<FirestoreCreditReport>;
