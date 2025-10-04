# 🔥 Firestore Manual Setup Guide - CreditWise

## 📋 What You Need to Create in Firestore Console

Go to: https://console.firebase.google.com/project/hisaabscore/firestore

---

## 🗂️ Collections Structure

### 1. **`transactions` Collection**

**Path:** `/transactions/{transactionId}`

**Document Structure:**
```json
{
  "id": "transaction_uuid_here",
  "userId": "user-test-001",
  "date": "2025-10-03",
  "merchant": "Starbucks",
  "amount": -4.50,
  "type": "expense",
  "category": "Food & Dining",
  "status": "cleared",
  "sourceDocumentId": "doc_uuid_here",
  "createdAt": "2025-10-03T10:30:00.000Z",
  "updatedAt": "2025-10-03T10:30:00.000Z"
}
```

**Field Types:**
- `id`: string
- `userId`: string ⭐ (indexed)
- `date`: string (YYYY-MM-DD format)
- `merchant`: string
- `amount`: number (negative for expenses, positive for income)
- `type`: string ("income" | "expense")
- `category`: string
- `status`: string ("cleared" | "pending")
- `sourceDocumentId`: string (optional)
- `createdAt`: timestamp
- `updatedAt`: timestamp

---

### 2. **`documents` Collection**

**Path:** `/documents/{documentId}`

**Document Structure:**
```json
{
  "id": "document_uuid_here",
  "userId": "user-test-001",
  "name": "receipt.jpg",
  "uploadDate": "2025-10-03T10:25:00.000Z",
  "type": "receipt",
  "status": "processed",
  "storageUrl": "placeholder://no-storage/documents/user-test-001/1696339200000_receipt.jpg",
  "extractedTransactionCount": 3,
  "processedAt": "2025-10-03T10:30:00.000Z",
  "errorMessage": "",
  "createdAt": "2025-10-03T10:25:00.000Z"
}
```

**Field Types:**
- `id`: string
- `userId`: string ⭐ (indexed)
- `name`: string
- `uploadDate`: string (ISO date)
- `type`: string ("receipt" | "utility bill" | "wallet statement")
- `status`: string ("pending" | "processed" | "failed")
- `storageUrl`: string
- `extractedTransactionCount`: number
- `processedAt`: timestamp (optional)
- `errorMessage`: string (optional, for failed documents)
- `createdAt`: timestamp

---

### 3. **`creditReports` Collection** (Future Use)

**Path:** `/creditReports/{reportId}`

**Document Structure:**
```json
{
  "id": "report_uuid_here",
  "userId": "user-test-001",
  "generationDate": "2025-10-03T10:45:00.000Z",
  "score": 750,
  "grade": "A",
  "url": "placeholder://no-storage/reports/report_uuid_here.pdf",
  "factors": {
    "paymentHistory": 85,
    "creditUtilization": 92,
    "lengthOfHistory": 78,
    "newCredit": 88,
    "creditMix": 82
  },
  "transactionCount": 25,
  "periodStart": "2025-09-01",
  "periodEnd": "2025-10-01",
  "createdAt": "2025-10-03T10:45:00.000Z"
}
```

**Field Types:**
- `id`: string
- `userId`: string ⭐ (indexed)
- `generationDate`: string (ISO date)
- `score`: number (300-850)
- `grade`: string ("A" | "B" | "C" | "D")
- `url`: string
- `factors`: object (detailed score breakdown)
- `transactionCount`: number
- `periodStart`: string (YYYY-MM-DD)
- `periodEnd`: string (YYYY-MM-DD)
- `createdAt`: timestamp

---

## 📊 Required Composite Indexes

⚠️ **IMPORTANT:** You MUST create these indexes or queries will fail!

### 1. **Transactions Index**

**Collection:** `transactions`
**Fields:**
- `userId` (Ascending)
- `date` (Descending)

**Query this enables:**
```javascript
query(
  collection(db, 'transactions'),
  where('userId', '==', 'user-test-001'),
  orderBy('date', 'desc')
)
```

### 2. **Documents Index**

**Collection:** `documents`  
**Fields:**
- `userId` (Ascending)
- `uploadDate` (Descending)

**Query this enables:**
```javascript
query(
  collection(db, 'documents'),
  where('userId', '==', 'user-test-001'),
  orderBy('uploadDate', 'desc')
)
```

### 3. **Credit Reports Index**

**Collection:** `creditReports`
**Fields:**
- `userId` (Ascending) 
- `generationDate` (Descending)

**Query this enables:**
```javascript
query(
  collection(db, 'creditReports'),
  where('userId', '==', 'user-test-001'),
  orderBy('generationDate', 'desc')
)
```

---

## 🛠️ How to Create Manually

### **Option 1: Let the App Create Them (Recommended)**

1. **Don't create anything manually**
2. **Upload a document** in your app
3. **Firestore will auto-create collections** when first document is added
4. **Indexes will be suggested** in Firebase Console when queries run

### **Option 2: Create Collections Manually**

#### Step 1: Create Collections
1. Go to [Firestore Data](https://console.firebase.google.com/project/hisaabscore/firestore/data)
2. Click **"+ Start collection"**
3. Collection ID: `transactions`
4. Document ID: **Auto-ID**
5. Add fields manually (see structure above)
6. Repeat for `documents` and `creditReports`

#### Step 2: Create Indexes
1. Go to [Firestore Indexes](https://console.firebase.google.com/project/hisaabscore/firestore/indexes)
2. Click **"Create Index"**
3. Collection: `transactions`
4. Add fields:
   - `userId` → Ascending
   - `date` → Descending
5. Click **"Create"**
6. Repeat for other collections

---

## 🚨 Security Rules (MUST SET)

Go to [Firestore Rules](https://console.firebase.google.com/project/hisaabscore/firestore/rules)

**Replace with this (for testing):**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Transactions collection
    match /transactions/{transactionId} {
      allow read, write: if true; // Open for testing
      // Later: allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Documents collection  
    match /documents/{documentId} {
      allow read, write: if true; // Open for testing
      // Later: allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Credit Reports collection
    match /creditReports/{reportId} {
      allow read, write: if true; // Open for testing
      // Later: allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

Click **"Publish"** to save.

---

## 🎯 What Will Happen When You Upload

### First Upload:
1. **Collections auto-created** when first document is added
2. **Index errors in console** - Firebase will suggest creating indexes
3. **Click suggested index links** to create them automatically

### After Indexes Created:
1. ✅ Real-time queries work
2. ✅ Data loads instantly  
3. ✅ No more index errors

---

## 🧪 Testing Data (Optional)

If you want to test with sample data, create a document in `transactions`:

**Collection:** `transactions`
**Document ID:** `test-transaction-1`
**Data:**
```json
{
  "id": "test-transaction-1",
  "userId": "user-test-001",
  "date": "2025-10-03",
  "merchant": "Test Coffee Shop", 
  "amount": -5.50,
  "type": "expense",
  "category": "Food & Dining",
  "status": "cleared",
  "sourceDocumentId": "test-doc-1",
  "createdAt": "2025-10-03T10:00:00.000Z",
  "updatedAt": "2025-10-03T10:00:00.000Z"
}
```

This will show up in your Transactions page immediately!

---

## 📋 Summary Checklist

- [ ] ✅ Firestore enabled (done)
- [ ] 🔒 Security rules set to `allow read, write: if true`
- [ ] 🗂️ Let collections auto-create on first upload **OR** create manually
- [ ] 📊 Create indexes (wait for suggestions **OR** create manually)
- [ ] 🧪 Test upload a document
- [ ] 👀 Watch console for index error suggestions
- [ ] ✅ Create suggested indexes
- [ ] 🎉 Everything should work!

**Recommendation:** Just upload a document and let Firebase suggest the indexes - it's easier! 🚀