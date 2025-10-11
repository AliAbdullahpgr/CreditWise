# EXACT FIX FOR YOUR DEPLOYMENT

Your app URL:
```
https://9000-firebase-hisaabscore-1759580313211.cluster-ancjwrkgr5dvux4qug5rbzyc2y.cloudworkstations.dev
```

## Step-by-Step Fix

### Step 1: Add Domain to Firebase (REQUIRED)

1. **Open Firebase Console**:
   https://console.firebase.google.com/project/hisaabscore/authentication/settings

2. **Scroll to "Authorized domains"**

3. **Click "Add domain"**

4. **Enter this EXACT domain**:
   ```
   9000-firebase-hisaabscore-1759580313211.cluster-ancjwrkgr5dvux4qug5rbzyc2y.cloudworkstations.dev
   ```

5. **Click "Add"**

### Step 2: Add Redirect URI to Google Cloud Console (REQUIRED)

1. **Open Google Cloud Console**:
   https://console.cloud.google.com/apis/credentials?project=hisaabscore

2. **Find your OAuth 2.0 Client ID** (should be one listed there)

3. **Click on it to edit**

4. **Scroll to "Authorized redirect URIs"**

5. **Click "ADD URI"**

6. **Add this EXACT URI**:
   ```
   https://9000-firebase-hisaabscore-1759580313211.cluster-ancjwrkgr5dvux4qug5rbzyc2y.cloudworkstations.dev/__/auth/handler
   ```

7. **Click "Save"** at the bottom

### Step 3: Test

1. **Wait 2-3 minutes** for changes to propagate

2. **Clear your browser cache** or open an **incognito window**

3. **Navigate to**:
   ```
   https://9000-firebase-hisaabscore-1759580313211.cluster-ancjwrkgr5dvux4qug5rbzyc2y.cloudworkstations.dev/login
   ```

4. **Click "Sign in with Google"**

5. It should now work! ✅

## Important Notes

### About Cloud Workstations URLs
⚠️ **Cloud Workstation domains are TEMPORARY!** 

When you restart your workstation or create a new one, you'll get a **different URL**. You'll need to:
- Add the new domain to Firebase
- Add the new redirect URI to Google Cloud Console

### For Production Deployment
For your actual production app, use:
- **Firebase Hosting**: `hisaabscore.web.app` or custom domain
- **Google Cloud Run**: Custom domain with SSL
- Any domain with a **fixed, permanent URL**

### Verification Checklist
After Step 1 & 2, verify in Firebase Console:
- [ ] Domain appears in "Authorized domains" list
- [ ] Domain shows as "Verified" (may take a minute)

In Google Cloud Console:
- [ ] Redirect URI appears in the list
- [ ] No error messages after saving

## If Still Not Working

1. **Check browser console** for exact error code
2. **Try different browser** (Chrome, Firefox, Safari)
3. **Disable popup blocker** for this domain
4. **Check if workstation URL changed** (restart can change it)

## Alternative: Test on Firebase Hosting

Deploy to Firebase Hosting for a permanent URL:
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Deploy
firebase deploy --only hosting
```

Then add the Firebase Hosting domain (`hisaabscore.web.app`) to authorized domains.

---

**Status**: After completing Steps 1 & 2, Google OAuth will work on your Cloud Workstation! 🎉
