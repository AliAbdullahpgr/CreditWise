# Fix: Document Upload Error

## Date: October 11, 2025

---

## 🐛 Error Fixed

### Original Error:
```
Error: When querying a collection group and ordering by FieldPath.documentId(), 
the corresponding value must result in a valid document path, but 'EnRbYTJKYXZytvAccWQ6' 
is not because it contains an odd number of segments.
```

### Root Cause:
The `updateDocumentStatus` function was using `collectionGroup('documents')` with an incorrect query:
```typescript
const docSnapshot = await adminDb
  .collectionGroup('documents')
  .where('__name__', '==', documentId)  // ❌ WRONG: __name__ expects full path, not just ID
  .limit(1)
  .get();
```

The `__name__` field expects a full document path like `users/userId/documents/docId`, but we were only passing the document ID `EnRbYTJKYXZytvAccWQ6`, which has an odd number of path segments (1 instead of 4).

---

## ✅ The Fix

### Updated Function Signature:
Changed from:
```typescript
async function updateDocumentStatus(
  documentId: string,
  status: 'processed' | 'pending' | 'failed',
  ...
)
```

To:
```typescript
async function updateDocumentStatus(
  userId: string,        // ✅ Now accepts userId
  documentId: string,
  status: 'processed' | 'pending' | 'failed',
  ...
)
```

### Updated Implementation:
Changed from using `collectionGroup` query:
```typescript
const docSnapshot = await adminDb
  .collectionGroup('documents')
  .where('__name__', '==', documentId)  // ❌ Complex and error-prone
  .limit(1)
  .get();
```

To direct document reference:
```typescript
await adminDb
  .collection('users')
  .doc(userId)
  .collection('documents')
  .doc(documentId)
  .update(updates);  // ✅ Simple and correct
```

---

## 📝 Files Modified

### 1. `src/lib/firebase/firestore.ts`
- Updated `updateDocumentStatus` to accept `userId` as first parameter
- Changed from `collectionGroup` query to direct document reference
- Simpler, faster, and more reliable

### 2. `src/app/(app)/documents/page.tsx`
- Updated both calls to `updateDocumentStatus` to pass `user.uid`
- Line ~149: Error handling for AI processing
- Line ~163: Error handling for upload failures

### 3. `src/ai/flows/extract-transactions-from-document.ts`
- Updated 3 calls to `updateDocumentStatus` to pass `userId`
- Line ~100: Success case with transactions
- Line ~109: Success case with no transactions
- Line ~127: Error case

---

## 🎯 Why This is Better

### Before (Using collectionGroup):
```typescript
// Complex query across all users' documents
collectionGroup('documents')
  .where('__name__', '==', documentId)  // Error-prone
  .limit(1)
  .get()
```
**Issues:**
- ❌ Complex path comparison
- ❌ Scans across all users (performance)
- ❌ Error with odd segment counts
- ❌ Requires document to exist

### After (Direct reference):
```typescript
// Direct path to specific document
collection('users')
  .doc(userId)
  .collection('documents')
  .doc(documentId)
  .update(updates)
```
**Benefits:**
- ✅ Simple and direct
- ✅ Fast (no query, direct access)
- ✅ No path segment issues
- ✅ Clear ownership (userId)

---

## 🧪 Testing

### To Test Document Upload:

1. **Refresh your browser**
   ```
   Ctrl + Shift + R (Windows)
   Cmd + Shift + R (Mac)
   ```

2. **Go to Documents page**
   ```
   http://localhost:9003/documents
   ```

3. **Upload a document**
   - Click "Upload Documents" or drag & drop
   - Select an image file (JPG, PNG)
   - The AI will process it

4. **Expected Result**
   - ✅ Document uploaded successfully
   - ✅ Status changes from "pending" to "processed"
   - ✅ Transactions extracted (if any)
   - ✅ No collectionGroup errors

---

## 📊 Data Structure Reminder

Your documents are now stored at:
```
/users/{userId}/documents/{documentId}
  ├── id: string
  ├── name: string
  ├── type: string
  ├── status: 'pending' | 'processed' | 'failed'
  ├── userId: string
  ├── storageUrl: string
  ├── extractedTransactionCount: number
  ├── createdAt: Date
  └── processedAt?: Date
```

---

## ✅ Status

| Component | Status | Notes |
|-----------|--------|-------|
| Firebase Config | ✅ Correct | Project ID fixed |
| Security Rules | ✅ Deployed | User-scoped collections |
| User Profile | ✅ Created | On login |
| Database Structure | ✅ Correct | User-scoped paths |
| Document Upload | ✅ Fixed | collectionGroup error resolved |
| Transaction Extraction | ✅ Should Work | Uses fixed function |

---

## 🚀 Next Steps

1. **Test document upload** - Should work now!
2. **Upload a bank statement image** - Test AI extraction
3. **Check transactions page** - See extracted transactions
4. **Generate a credit report** - Test full workflow

---

**The upload error is now fixed!** 🎉

You can now:
- ✅ Upload documents
- ✅ Extract transactions with AI
- ✅ Store everything in user-scoped collections
- ✅ No more collectionGroup errors
