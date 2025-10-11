# Quick Fix: Google OAuth on Hosted App

## The Problem
Google OAuth works on `localhost` but fails on your hosted app with:
```
FirebaseError: auth/popup-closed-by-user
```

## The Solution (2 steps, 5 minutes)

### Step 1: Add Your Hosted Domain to Firebase
1. Open: https://console.firebase.google.com/project/hisaabscore/authentication/settings
2. Scroll to **"Authorized domains"**
3. Click **"Add domain"**
4. Enter your hosted app domain (e.g., `your-app.web.app`)
5. Click **"Add"**

### Step 2: Update Google Cloud OAuth Settings
1. Open: https://console.cloud.google.com/apis/credentials?project=hisaabscore
2. Click on your **OAuth 2.0 Client ID**
3. Under **"Authorized redirect URIs"**, add:
   ```
   https://YOUR-HOSTED-DOMAIN/__/auth/handler
   ```
4. Click **"Save"**

## What's Your Hosted Domain?

Check where your app is deployed:

### Firebase Hosting:
- Default: `hisaabscore.web.app` or `hisaabscore.firebaseapp.com`
- Custom: Whatever domain you configured

### Firebase App Hosting:
- Check your deployment URL in Firebase Console

### Other Cloud Service:
- Use the exact domain from your browser's address bar (without `http://` or trailing `/`)

## After Making Changes

1. **Wait 5 minutes** for changes to propagate
2. **Clear browser cache** on your hosted app
3. **Try Google login again**

## Still Not Working?

If you still get `auth/popup-closed-by-user`, check:

1. **Browser popup blocker** - Allow popups for your domain
2. **Incognito mode** - Try in an incognito window
3. **Different browser** - Test in Chrome/Firefox/Safari
4. **Console errors** - Check browser DevTools for other errors

## Alternative: Use Redirect Instead of Popup

If popups keep failing, switch to redirect flow (better for mobile):

See `GOOGLE_AUTH_FIX.md` for implementation details.

---

**Need Help?** Share your hosted app URL and I'll tell you exactly what to add!
