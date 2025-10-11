import { collection, CollectionReference, Firestore } from 'firebase/firestore';
import { Transaction, Document, CreditReport } from '@/lib/types';

// This file can now be used on both client and server, as it no longer depends on a client-only `db` instance.

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

// Functions to get collection references, ensuring the db instance is passed.
// This makes them usable on both client (with useFirestore) and server (with adminDb).
// Collections are now user-scoped: users/{userId}/transactions, users/{userId}/documents, etc.
export const getTransactionsCollection = (db: Firestore, userId: string) => 
  collection(db, 'users', userId, 'transactions') as CollectionReference<FirestoreTransaction>;

export const getDocumentsCollection = (db: Firestore, userId: string) => 
  collection(db, 'users', userId, 'documents') as CollectionReference<FirestoreDocument>;

export const getCreditReportsCollection = (db: Firestore, userId: string) => 
  collection(db, 'users', userId, 'creditReports') as CollectionReference<FirestoreCreditReport>;
