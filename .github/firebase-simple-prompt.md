# Simple Firebase Implementation Prompt for CreditWise

Copy and paste this prompt to any AI assistant:

---

**PROMPT:**

I need you to implement Firebase Firestore database in my CreditWise Next.js app. Currently, the app uses localStorage to store transactions. I want to replace it with Firebase Firestore.

## What the app does:
- Users upload financial documents (receipts, bills, wallet statements)
- AI extracts transactions from documents using Google Genkit
- Transactions are displayed on the transactions page
- Credit scores are calculated from transactions

## What I need you to do:

### 1. Create Firebase configuration files:
- `src/lib/firebase/config.ts` - Initialize Firebase client (auth, firestore, storage)
- `src/lib/firebase/admin.ts` - Initialize Firebase Admin SDK for server-side
- `src/lib/firebase/firestore.ts` - Helper functions for CRUD operations
- `src/lib/firebase/collections.ts` - Type definitions and collection references

### 2. Create these Firestore collections:

**transactions** collection with fields:
- userId (string) - to identify user
- id, date, merchant, amount, type, category, status (existing Transaction type)
- sourceDocumentId (string, optional) - which document created this
- createdAt, updatedAt (timestamps)

**documents** collection with fields:
- userId (string)
- id, name, uploadDate, type, status (existing Document type)
- storageUrl (string) - Firebase Storage URL
- extractedTransactionCount (number)
- processedAt (timestamp, optional)
- errorMessage (string, optional)
- createdAt (timestamp)

**creditReports** collection with fields:
- userId (string)
- id, generationDate, score, grade, url (existing CreditReport type)
- factors (object) - detailed breakdown
- transactionCount, periodStart, periodEnd (strings)
- createdAt (timestamp)

### 3. Update these AI flows to save data:

In `src/ai/flows/extract-transactions-from-document.ts`:
- After extracting transactions, save them to Firestore using `saveTransactions(userId, transactions, documentId)`
- Update document status to 'processed' after success
- Handle errors and update status to 'failed' if needed

In `src/ai/flows/calculate-credit-score.ts`:
- After calculating score, save the report to Firestore using `saveCreditReport()`

### 4. Update the UI to use Firestore:

In `src/app/(app)/transactions/page.tsx`:
- Remove localStorage code
- Use `onSnapshot` to listen to Firestore transactions in real-time
- Filter by current userId from Firebase Auth
- Add loading states

In `src/app/(app)/documents/page.tsx`:
- Add file upload to Firebase Storage
- Create document record in Firestore
- Call AI extraction flow with userId and documentId
- Show real-time document status updates

### 5. Add environment variables to `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

### 6. Create Firestore security rules:
- Users can only read/write their own data
- Check `request.auth.uid == resource.data.userId`

### 7. Create Firestore indexes:
- transactions: userId + date (descending)
- documents: userId + uploadDate (descending)  
- creditReports: userId + generationDate (descending)

## Important rules:
- Use Firebase Admin SDK (`firebase-admin`) for server-side writes in AI flows (mark functions with `'use server'`)
- Use Firebase client SDK (`firebase`) for real-time listeners in UI components
- Always check if user is authenticated before Firestore operations
- Use TypeScript types from `src/lib/types.ts` (Transaction, Document, CreditReport)
- Keep existing UI/UX, only change data layer
- Add try-catch blocks for error handling
- Use batch writes when saving multiple transactions

## Testing:
1. Upload a document
2. Check Firestore console - document should appear with status 'pending'
3. Wait for AI processing
4. Check Firestore - transactions should be created, document status should be 'processed'
5. Check transactions page - data should appear in real-time

Please implement this step by step, creating files in order, and test after each major step.

---

**End of prompt - paste this to Gemini or any AI assistant**
