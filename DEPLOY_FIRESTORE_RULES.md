# Deploy Firestore Security Rules

## ⚠️ Current Issue
The Firestore Security Rules we updated in the code are NOT deployed to Firebase yet. 
You're getting permission denied because Firebase is still using the old rules.

## ✅ SOLUTION 1: Deploy via Firebase Console (Recommended - Fastest)

### Step-by-Step:

1. **Open Firebase Console**
   - Go to: https://console.firebase.google.com/
   - Select your "CreditWise" project

2. **Navigate to Firestore Rules**
   - Click "Firestore Database" in the left sidebar
   - Click the "Rules" tab at the top

3. **Copy the Updated Rules**
   - Open the file: `firestore.rules` in your project
   - Copy ALL the content (Ctrl+A, Ctrl+C)

4. **Paste and Publish**
   - Paste the rules into the Firebase Console editor
   - Click "Publish" button

5. **Wait for Deployment**
   - Should take 10-30 seconds
   - You'll see "Rules successfully published" message

### The Rules to Copy:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    /**
     * @description Rule for managing user profiles.
     */
    match /users/{userId} {
      function isSignedIn() {
        return request.auth != null;
      }

      function isOwner(userId) {
        return request.auth.uid == userId;
      }

      function isExistingOwner(userId) {
        return isOwner(userId) && resource != null;
      }

      allow get: if isSignedIn() && isOwner(userId);
      allow list: if isSignedIn() && isOwner(userId);
      allow create: if isSignedIn() && isOwner(userId);
      allow update: if isSignedIn() && isExistingOwner(userId);
      allow delete: if isSignedIn() && isExistingOwner(userId);
    }

    /**
     * @description Rule for managing user documents.
     */
    match /users/{userId}/documents/{documentId} {
      function isSignedIn() {
        return request.auth != null;
      }

      function isOwner(userId) {
        return request.auth.uid == userId;
      }

      function isExistingOwner(userId) {
        return isOwner(userId) && resource != null;
      }

      allow get: if isSignedIn() && isOwner(userId);
      allow list: if isSignedIn() && isOwner(userId);
      allow create: if isSignedIn() && isOwner(userId);
      allow update: if isSignedIn() && isExistingOwner(userId);
      allow delete: if isSignedIn() && isExistingOwner(userId);
    }

    /**
     * @description Rule for managing user transactions.
     */
    match /users/{userId}/transactions/{transactionId} {
      function isSignedIn() {
        return request.auth != null;
      }

      function isOwner(userId) {
        return request.auth.uid == userId;
      }

      function isExistingOwner(userId) {
        return isOwner(userId) && resource != null;
      }

      allow get: if isSignedIn() && isOwner(userId);
      allow list: if isSignedIn() && isOwner(userId);
      allow create: if isSignedIn() && isOwner(userId);
      allow update: if isSignedIn() && isExistingOwner(userId);
      allow delete: if isSignedIn() && isExistingOwner(userId);
    }

    /**
     * @description Rule for managing user credit scores.
     */
    match /users/{userId}/creditScores/{creditScoreId} {
      function isSignedIn() {
        return request.auth != null;
      }

      function isOwner(userId) {
        return request.auth.uid == userId;
      }

      function isExistingOwner(userId) {
        return isOwner(userId) && resource != null;
      }

      allow get: if isSignedIn() && isOwner(userId);
      allow list: if isSignedIn() && isOwner(userId);
      allow create: if isSignedIn() && isOwner(userId);
      allow update: if isSignedIn() && isExistingOwner(userId);
      allow delete: if isSignedIn() && isExistingOwner(userId);
    }

    /**
     * @description Rule for managing user financial metrics.
     */
    match /users/{userId}/financialMetrics/{financialMetricsId} {
      function isSignedIn() {
        return request.auth != null;
      }

      function isOwner(userId) {
        return request.auth.uid == userId;
      }

      function isExistingOwner(userId) {
        return isOwner(userId) && resource != null;
      }

      allow get: if isSignedIn() && isOwner(userId);
      allow list: if isSignedIn() && isOwner(userId);
      allow create: if isSignedIn() && isOwner(userId);
      allow update: if isSignedIn() && isExistingOwner(userId);
      allow delete: if isSignedIn() && isExistingOwner(userId);
    }

    /**
     * @description Rule for managing user credit reports.
     */
    match /users/{userId}/creditReports/{reportId} {
      function isSignedIn() {
        return request.auth != null;
      }

      function isOwner(userId) {
        return request.auth.uid == userId;
      }

      function isExistingOwner(userId) {
        return isOwner(userId) && resource != null;
      }

      allow get: if isSignedIn() && isOwner(userId);
      allow list: if isSignedIn() && isOwner(userId);
      allow create: if isSignedIn() && isOwner(userId);
      allow update: if isSignedIn() && isExistingOwner(userId);
      allow delete: if isSignedIn() && isExistingOwner(userId);
    }
  }
}
```

---

## ✅ SOLUTION 2: Install Firebase CLI and Deploy (Advanced)

If you want to deploy from command line:

### Install Firebase CLI:
```bash
npm install -g firebase-tools
```

### Login to Firebase:
```bash
firebase login
```

### Initialize Firebase (if not already):
```bash
firebase init firestore
# Select: Use an existing project
# Choose: Your CreditWise project
# Keep: firestore.rules as the rules file
```

### Deploy Rules:
```bash
firebase deploy --only firestore:rules
```

---

## 🧪 Test After Deployment

1. **Refresh your browser** (hard refresh: Ctrl+Shift+R)
2. **Clear console** (to see new logs)
3. **Go to dashboard**: `http://localhost:9003/dashboard`

**Expected Result:**
- ✅ No permission errors
- ✅ Dashboard loads successfully
- ✅ Data queries work

---

## 🔍 Verify Rules Are Deployed

In Firebase Console:
1. Go to Firestore Database → Rules tab
2. Check that you see `allow list: if isSignedIn() && isOwner(userId);`
3. NOT the old `allow list: if false;`

---

## ⚠️ Common Issues

### Issue: Still getting permission errors after deploying
**Solution:** 
- Hard refresh browser (Ctrl+Shift+R)
- Clear browser cache
- Wait 1-2 minutes for rules to propagate
- Check Firebase Console to confirm rules are deployed

### Issue: "Publish" button is greyed out
**Solution:**
- Check for syntax errors in the rules editor
- Red underlines indicate errors
- Fix any errors before publishing

### Issue: Rules show syntax error
**Solution:**
- Make sure you copied the ENTIRE content from firestore.rules
- Include the `rules_version = '2';` at the top
- Include the closing braces `}` at the end

---

## 📋 Quick Checklist

- [ ] Opened Firebase Console
- [ ] Went to Firestore Database → Rules
- [ ] Copied content from `firestore.rules` file
- [ ] Pasted into Firebase Console editor
- [ ] Clicked "Publish"
- [ ] Saw "Rules successfully published" message
- [ ] Hard refreshed browser
- [ ] Tested dashboard - no permission errors

---

## 🎉 Success!

Once deployed, your rules will:
- ✅ Allow users to read/write their own data
- ✅ Block access to other users' data
- ✅ Enable list operations on user's own collections
- ✅ Secure all user-scoped collections

The error should disappear and your app will work correctly!
