# Data Migration Guide

## Current Situation

Your Firestore data is structured incorrectly:

### Current Structure (OLD - WRONG):
```
/creditReports/{reportId}
  - userId: "wvc3k1IU1XOahpRCUODip22ApVv2"
  - ...other fields

/documents/{docId}
  - userId: "wvc3k1IU1XOahpRCUODip22ApVv2"
  - ...other fields

/transactions/{txId}
  - userId: "wvc3k1IU1XOahpRCUODip22ApVv2"
  - ...other fields
```

### Required Structure (NEW - CORRECT):
```
/users/{userId}/creditReports/{reportId}
  - ...fields (including userId)

/users/{userId}/documents/{docId}
  - ...fields (including userId)

/users/{userId}/transactions/{txId}
  - ...fields (including userId)
```

---

## Why This Matters

1. **Security Rules** expect user-scoped paths
2. **Your App Code** queries user-scoped paths
3. **Data at root level** is inaccessible to your app

---

## Migration Options

### Option 1: Start Fresh (Recommended for Development)

**Pros:**
- Quick and clean
- No migration complexity
- Guaranteed to work

**Steps:**
1. Open Firebase Console: https://console.firebase.google.com/project/hisaabscore/firestore/databases/-default-/data
2. Delete these collections:
   - Click on `creditReports` → Click the 3 dots → Delete collection
   - Click on `documents` → Click the 3 dots → Delete collection  
   - Click on `transactions` → Click the 3 dots → Delete collection
3. **Keep** the `users` collection (has your profile)
4. Refresh your app
5. Upload new documents and create new transactions

---

### Option 2: Migrate Existing Data

**Use this if you have important data to preserve.**

#### Step 1: Run Migration Script

```bash
# Install ts-node if not already installed
npm install -g ts-node

# Run migration
ts-node migrate-firestore-data.ts
```

#### Step 2: Verify Migration

1. Check Firebase Console
2. Look for data under: `/users/{userId}/creditReports/`
3. Verify all data was copied

#### Step 3: Delete Old Collections

After verifying migration:
1. Delete old root-level collections
2. Keep only the new user-scoped structure

---

## Quick Fix for Right Now

If you want to **test immediately** without migration:

### Add Temporary Rules for Old Data

Add these rules to the **TOP** of your `firestore.rules` file (just after `match /databases/{database}/documents {`):

```javascript
// TEMPORARY: Allow access to old root-level collections
// TODO: Remove after data migration
match /creditReports/{reportId} {
  allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
}

match /documents/{docId} {
  allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
}

match /transactions/{txId} {
  allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
}
```

Then deploy:
```bash
firebase deploy --only firestore:rules
```

**⚠️ This is TEMPORARY!** You should still migrate data to the proper structure.

---

## Recommended Approach

Since you're in development:

1. **Delete old data** (Option 1)
2. **Test your app** with the new structure
3. **Upload sample documents** to verify everything works
4. **Move forward** with the correct structure from now on

---

## After Migration

Your data will be properly structured:
- ✅ Each user has their own isolated data
- ✅ Security rules work correctly
- ✅ No permission errors
- ✅ Scalable for multiple users

---

## Need Help?

If you have production data that must be migrated, let me know and I'll help you:
1. Export the data first (backup)
2. Run the migration script
3. Verify everything
4. Clean up old collections
