# 🚨 Document Upload Stuck - Debugging Guide

## Problem: File stuck at "processing..." status

Your document upload is getting stuck because one of these steps is failing:

---

## 📋 Quick Checklist

### ✅ **1. Firebase Services Enabled?**

Go to [Firebase Console](https://console.firebase.google.com/project/hisaabscore) and check:

- **Firestore Database**: https://console.firebase.google.com/project/hisaabscore/firestore
  - Should show "Cloud Firestore" (not "Realtime Database")
  - If not enabled, click "Create database" → Production mode

- **Firebase Storage**: https://console.firebase.google.com/project/hisaabscore/storage
  - Should show a storage bucket
  - If not enabled, click "Get started" → Production mode

- **Authentication** (optional): https://console.firebase.google.com/project/hisaabscore/authentication
  - Enable Email/Password if you want real users

---

### ✅ **2. Check Console Logs**

1. Open your app: http://localhost:9003
2. Press `F12` to open DevTools
3. Go to "Console" tab
4. Upload a document
5. Look for error messages (red text)

**Common errors you might see:**

#### ❌ "Firebase: Error (auth/project-not-found)"
**Fix:** Double-check `NEXT_PUBLIC_FIREBASE_PROJECT_ID=hisaabscore` in `.env.local`

#### ❌ "Missing or insufficient permissions"
**Fix:** Firestore security rules need to be updated

#### ❌ "quota exceeded" or "429 rate limit"
**Fix:** Gemini API quota exceeded, wait or check billing

#### ❌ "Network error" or "fetch failed"
**Fix:** Internet connection or API endpoint issue

---

### ✅ **3. Set Firestore Security Rules (Critical!)**

Go to [Firestore Rules](https://console.firebase.google.com/project/hisaabscore/firestore/rules)

Replace the rules with this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all reads and writes for now (TESTING ONLY)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

Click **"Publish"** to save.

⚠️ **Note:** This allows anyone to read/write. For production, use proper user-based rules.

---

### ✅ **4. Set Storage Security Rules**

Go to [Storage Rules](https://console.firebase.google.com/project/hisaabscore/storage/rules)

Replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

---

### ✅ **5. Test File Upload Step by Step**

Upload a document and check console for this sequence:

```
🚀 [UPLOAD START] ← Should appear immediately
📄 [FILE 1/1] ← File info shown
⚡ [STEP 1] ← Temp UI update
☁️ [STEP 2] ← Storage upload (should complete in 2-5s)
💾 [STEP 3] ← Firestore create (should complete in 1-2s)
🔄 [STEP 4] ← Base64 conversion (quick)
🤖 [STEP 5] ← AI processing (5-15s, this might be where it gets stuck)
```

**If it stops at Step 2 (Storage):** Storage not enabled or security rules
**If it stops at Step 3 (Firestore):** Firestore not enabled or security rules  
**If it stops at Step 5 (AI):** Gemini API issue

---

## 🔧 Quick Fixes

### Fix 1: Restart Everything
```bash
# Stop dev server (Ctrl+C)
npm run dev
```

### Fix 2: Check Firebase Project
- Go to [Firebase Console](https://console.firebase.google.com/project/hisaabscore)
- Make sure you're in the "hisaabscore" project
- Enable Firestore and Storage if needed

### Fix 3: Check Gemini API
- Go to [Google AI Studio](https://aistudio.google.com/)
- Check if your API key works
- Try generating content manually

### Fix 4: Test with Simple File
- Try uploading a small image (< 1MB)
- Use a clear receipt/bill with obvious transactions

---

## 🧪 Debug Steps

### Step 1: Upload and Watch Console
1. Open http://localhost:9003/documents
2. Open console (F12)
3. Upload a file
4. Take screenshot of any errors

### Step 2: Check Firebase Console
- Go to [Firestore Data](https://console.firebase.google.com/project/hisaabscore/firestore/data)
- Look for `documents` and `transactions` collections
- See if document shows up with status "pending"

### Step 3: Check Network Tab
1. In DevTools, go to "Network" tab
2. Upload file
3. Look for failed requests (red entries)
4. Check status codes (500, 404, 403, etc.)

---

## 🎯 Most Likely Issues

### 1. **Firestore Not Enabled** (90% of cases)
- Go enable it in Firebase Console
- Set permissive rules for testing

### 2. **Gemini API Rate Limit** 
- You might have hit the free quota
- Check Google AI Studio for limits

### 3. **Security Rules Too Strict**
- Default rules block all access
- Set to `allow read, write: if true` for testing

### 4. **Network/Deployment Issue**
- Server actions not working
- Firebase Admin SDK not connecting

---

## 📞 Next Steps

1. **Check Firebase Console** - Enable Firestore & Storage
2. **Set permissive rules** - For testing only
3. **Upload file and watch console** - Tell me what error you see
4. **Share screenshot** - Of console errors if any

Try these steps and let me know what error messages you see in the console!