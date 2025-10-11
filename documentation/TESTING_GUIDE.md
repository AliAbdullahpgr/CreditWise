# Firebase Authentication & Database - Quick Testing Guide

## ✅ What Was Fixed

Your Firebase authentication and database integration had **critical issues** that have been fixed:

1. **Database structure mismatch** - Collections are now properly user-scoped
2. **Security rules blocking queries** - Rules now allow users to query their own data
3. **Missing user profile creation** - Users now get profile documents created on login/signup
4. **Inconsistent data paths** - All code now uses the correct user-scoped paths

## 🧪 How to Test

### 1. Test User Signup/Login
```bash
# Start your development server if not already running
npm run dev
```

1. Go to `/signup` or `/login`
2. Click "Sign up with Google" or "Login with Google"
3. Complete Google authentication
4. You should be redirected to `/dashboard`

**Expected Result:**
- No errors in console
- User profile created at `users/{userId}` in Firestore
- Dashboard loads without errors (may show no data initially)

### 2. Check Firestore Console
1. Open Firebase Console → Firestore Database
2. Look for your user ID under the `users` collection
3. Verify the structure:
```
users/
  └── {your-user-id}/
      ├── email: "your@email.com"
      ├── displayName: "Your Name"
      ├── createdAt: timestamp
      └── lastLoginAt: timestamp
```

### 3. Test Data Isolation
1. Upload a document on `/documents` page
2. Log out
3. Log in with a different Google account
4. Verify you DON'T see the first user's document

### 4. Test All Pages Load Correctly
Visit each page while logged in:
- ✅ `/dashboard` - Should load without errors
- ✅ `/transactions` - Should load without errors
- ✅ `/documents` - Should load without errors
- ✅ `/reports` - Should load without errors

## 🔥 Deploy Firestore Rules

**IMPORTANT:** You need to deploy the updated security rules to Firebase:

### Option 1: Via Firebase Console (Recommended for Quick Testing)
1. Go to Firebase Console → Firestore Database → Rules
2. Copy the contents of `firestore.rules` from your project
3. Paste into the console
4. Click "Publish"

### Option 2: Via Firebase CLI
```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy rules
firebase deploy --only firestore:rules
```

## 🐛 Common Issues & Solutions

### Issue: "Permission Denied" errors in console
**Solution:** Make sure you deployed the updated Firestore rules (see above)

### Issue: Dashboard shows empty data
**Solution:** This is expected for new users. Upload documents first to generate transactions.

### Issue: "User not authenticated" errors
**Solution:** Log out and log back in to ensure user profile is created.

### Issue: Login redirects but shows blank page
**Solution:** Check browser console for errors. Ensure Firebase config is correct.

## 📊 Database Structure Now

### User Profile (users/{userId})
```typescript
{
  email: string
  displayName: string | null
  photoURL: string | null
  createdAt: timestamp
  updatedAt: timestamp
  lastLoginAt: timestamp
}
```

### User Transactions (users/{userId}/transactions/{id})
```typescript
{
  id: string
  userId: string
  date: string
  merchant: string
  amount: number
  type: "income" | "expense"
  category: string
  status: string
  sourceDocumentId?: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

### User Documents (users/{userId}/documents/{id})
```typescript
{
  id: string
  userId: string
  name: string
  type: string
  uploadDate: string
  status: "pending" | "processed" | "failed"
  storageUrl: string
  processedAt?: timestamp
  errorMessage?: string
  extractedTransactionCount: number
  createdAt: timestamp
}
```

### User Credit Reports (users/{userId}/creditReports/{id})
```typescript
{
  id: string
  userId: string
  score: number
  generationDate: string
  factors: object
  transactionCount: number
  periodStart: string
  periodEnd: string
  createdAt: timestamp
}
```

## ✨ Key Security Features

- ✅ Each user can ONLY access their own data
- ✅ No user can read another user's transactions, documents, or reports
- ✅ All collections are nested under the user's document
- ✅ Firestore rules enforce ownership at the database level
- ✅ Authentication required for all operations

## 🚀 Next Development Steps

1. **Test the authentication flow** with multiple accounts
2. **Upload test documents** to verify the document processing pipeline
3. **Generate credit reports** to test the complete workflow
4. **Monitor Firebase Console** for any rule violations or errors
5. **Check Network tab** in browser DevTools for any API errors

## 📝 Files Modified

Core files that were updated:
- `src/lib/firebase/collections.ts` - Collection path functions
- `src/lib/firebase/firestore.ts` - All CRUD operations
- `src/app/(auth)/login/page.tsx` - Added profile creation
- `src/app/(auth)/signup/page.tsx` - Added profile creation
- All pages in `src/app/(app)/` - Updated queries
- `firestore.rules` - Updated security rules
- NEW: `src/app/api/create-user-profile/route.ts` - Profile creation API

## 💡 Tips

1. **Clear browser cache** if you experience issues after updates
2. **Check Firebase Console → Authentication** to see all logged-in users
3. **Check Firebase Console → Firestore** to verify data structure
4. **Use Browser DevTools Console** to see detailed error messages
5. **Check Network tab** to see API calls and responses

## 📞 Troubleshooting

If something doesn't work:
1. Check browser console for errors
2. Check Firebase Console → Firestore → Rules for any permission errors
3. Verify your Firebase config in `src/firebase/config.ts`
4. Ensure Firestore rules are deployed
5. Try logging out and logging back in

---

**All authentication and database issues have been fixed!** 🎉
The code now properly creates separate collections for each user and enforces security at the database level.
