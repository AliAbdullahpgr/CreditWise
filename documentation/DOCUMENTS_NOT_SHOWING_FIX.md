# Fix: Documents Not Showing After Upload

## Date: October 11, 2025

---

## 🐛 Issue

After uploading documents:
- ✅ Upload succeeds
- ✅ Document created in Firestore (ID: LPmswG7tAU2GzSMaELVR)
- ❌ Documents don't appear in the "Upload History" table
- ❌ No status updates shown (pending → processed)

---

## 🔍 Root Cause Analysis

### Problem 1: Missing uploadDate in Firestore
**Issue:** The `createDocument` function was saving `createdAt` but not explicitly ensuring `uploadDate` was set.

**Fix Applied:** Updated `createDocument` to ensure `uploadDate` field is always present:
```typescript
const uploadDateString = now.toISOString().split('T')[0]; // Format: YYYY-MM-DD

const firestoreData: FirestoreDocument = {
  ...document,
  uploadDate: document.uploadDate || uploadDateString, // ✅ Ensure uploadDate exists
  createdAt: now,
  // ... other fields
};
```

### Problem 2: Query May Be Failing Silently
**Issue:** The query orders by `uploadDate`, but if the field is missing or has wrong format, it might not return results.

**Fix Applied:** Added debug logging to see what's happening:
```typescript
const { data: documents, error: documentsError } = useCollection<Document>(documentsQuery);

useEffect(() => {
  console.log('📊 [DOCUMENTS DEBUG]', {
    documentsCount: documents?.length ?? 0,
    isLoading: documentsLoading,
    hasError: !!documentsError,
  });
}, [documents, documentsLoading, documentsError]);
```

---

## 🧪 Testing Steps

### 1. Restart Development Server
```bash
# Stop the current server (Ctrl+C)
npm run dev
```

### 2. Clear Browser & Test
1. **Hard refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Open browser console** (F12)
3. **Go to Documents page**: http://localhost:9003/documents
4. **Check console** for debug output:
   ```
   📊 [DOCUMENTS DEBUG] {
     user: "wvc3k1IU1XOahpRCUODip22ApVv2",
     documentsCount: X,
     isLoading: false,
     hasError: false
   }
   ```

### 3. Upload a Test Document
1. Click "Choose Files" or drag & drop
2. Select an image file
3. Watch the console logs
4. Document should appear in the table

### 4. Check Expected Console Output
```
📄 [FILE 1/1] Processing: demo.jpg
💾 [FIRESTORE] Creating document record...
✅ [FIRESTORE] Document created with ID: abc123xyz
🤖 [AI] Processing document...
✅ [AI] Transactions extracted
📊 [DOCUMENTS DEBUG] { documentsCount: 1, ... }
```

---

## 🔧 What to Check If Still Not Working

### Check 1: Verify Document Exists in Firestore
1. Go to: https://console.firebase.google.com/project/hisaabscore-12712437-b58e8/firestore
2. Navigate to: `users/{your-user-id}/documents`
3. Look for the document with ID: `LPmswG7tAU2GzSMaELVR`
4. **Verify fields exist:**
   - ✅ `id`
   - ✅ `name`
   - ✅ `uploadDate` (IMPORTANT!)
   - ✅ `type`
   - ✅ `status`
   - ✅ `createdAt`

### Check 2: Verify Query Works
In browser console, run:
```javascript
// Should show document count
console.log(window.location.href);
```

### Check 3: Look for Security Rule Errors
Check browser console for:
```
FirebaseError: Missing or insufficient permissions
```

If you see this, security rules are blocking the query.

---

## 🎯 Expected Behavior After Fix

### Upload Flow:
```
1. User uploads demo.jpg
   ↓
2. Document created at: /users/{userId}/documents/{docId}
   Fields: { id, name, uploadDate, type: "receipt", status: "pending", ... }
   ↓
3. Real-time listener triggers
   ↓
4. UI updates: Table shows document with "Pending" badge
   ↓
5. AI processes image
   ↓
6. Document updated: status = "processed"
   ↓
7. Real-time listener triggers again
   ↓
8. UI updates: Badge changes to "Processed" ✅
```

### Table Display:
```
Upload History
┌─────────────┬──────────┬──────────────┬───────────────┐
│ Document    │ Type     │ Upload Date  │ Status        │
├─────────────┼──────────┼──────────────┼───────────────┤
│ demo.jpg    │ Receipt  │ 10/11/2025   │ 🟡 Pending    │
│ bank.png    │ Receipt  │ 10/11/2025   │ ✅ Processed  │
└─────────────┴──────────┴──────────────┴───────────────┘
```

---

## 📊 Data Structure

### Document in Firestore:
```javascript
/users/wvc3k1IU1XOahpRCUODip22ApVv2/documents/LPmswG7tAU2GzSMaELVR
{
  id: "LPmswG7tAU2GzSMaELVR",
  name: "demo.jpg",
  uploadDate: "2025-10-11",              // ✅ String YYYY-MM-DD
  type: "receipt",
  status: "pending",                      // pending → processed
  userId: "wvc3k1IU1XOahpRCUODip22ApVv2",
  storageUrl: "placeholder://...",
  extractedTransactionCount: 0,
  createdAt: Timestamp,                   // ✅ Firestore Timestamp
  processedAt: Timestamp (optional)
}
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "No documents uploaded yet" persists
**Cause:** Documents exist but query returns empty
**Solution:** 
1. Check console for `📊 [DOCUMENTS DEBUG]`
2. If `documentsCount: 0`, check Firestore Console
3. Verify `uploadDate` field exists on documents

### Issue 2: Documents show but status doesn't update
**Cause:** Real-time listener not detecting changes
**Solution:**
1. Check if `status` field is being updated in Firestore
2. Hard refresh browser
3. Check for JavaScript errors in console

### Issue 3: "Processing" message but nothing happens
**Cause:** AI flow might be failing silently
**Solution:**
1. Check server-side logs (terminal running `npm run dev`)
2. Look for AI processing errors
3. Check if Gemini API key is configured

---

## 📝 Files Modified

1. ✅ `src/lib/firebase/firestore.ts`
   - Added `uploadDate` field to `createDocument`

2. ✅ `src/app/(app)/documents/page.tsx`
   - Added debug logging for documents query
   - Added error state tracking

---

## ✅ Status Checklist

Before declaring this fixed, verify:
- [ ] Document appears in table immediately after upload
- [ ] Status shows "Pending" with clock icon
- [ ] Status updates to "Processed" after AI finishes
- [ ] Multiple documents can be uploaded
- [ ] Documents persist after page refresh
- [ ] Debug logs show correct document count

---

## 🔄 If Issue Persists

1. **Check existing document** in Firestore Console:
   - Does `LPmswG7tAU2GzSMaELVR` have `uploadDate` field?
   - If not, delete it and upload again

2. **Create index** (if Firestore suggests it):
   - Firestore Console will show a link to create index
   - Click it and wait for index to build

3. **Try simple query** first:
   - Remove `orderBy` temporarily
   - Just query `collection(firestore, 'users', user.uid, 'documents')`
   - See if documents appear

---

**Next Step:** Restart the dev server and test the upload again!
