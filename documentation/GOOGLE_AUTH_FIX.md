# Firebase Authentication Analysis & Fix

## Issue Summary
- ✅ **Email/Password Login**: Works on localhost AND hosted app
- ✅ **Google OAuth Login**: Works on localhost  
- ❌ **Google OAuth Login**: Fails on hosted app with `auth/popup-closed-by-user`

## Root Cause Analysis

The error `auth/popup-closed-by-user` on your hosted app (but NOT localhost) indicates:

### Primary Cause: Domain Authorization Missing
Google OAuth popup closes immediately because:
1. Your hosted domain is **not authorized** in Firebase Authentication
2. Your hosted domain is **not authorized** in Google Cloud Console

### Why Email/Password Works Everywhere
Email/password authentication doesn't require domain authorization - it's a direct Firebase Auth API call without OAuth redirects.

## Fix Steps

### Step 1: Authorize Your Hosted Domain in Firebase

1. Go to [Firebase Console - Authentication Settings](https://console.firebase.google.com/project/hisaabscore/authentication/settings)

2. Scroll to **"Authorized domains"** section

3. Click **"Add domain"**

4. Add your hosted app domain (e.g., `your-app.web.app` or `your-custom-domain.com`)

5. Click **"Add"**

### Step 2: Verify Google OAuth Redirect URIs

1. Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials?project=hisaabscore)

2. Find your **OAuth 2.0 Client ID** (the one used by your Firebase app)

3. Click on it to edit

4. Under **"Authorized redirect URIs"**, ensure these are present:
   - `https://hisaabscore.firebaseapp.com/__/auth/handler`
   - `https://YOUR-HOSTED-DOMAIN/__/auth/handler` (add your actual domain)

5. Click **"Save"**

### Step 3: Update Firebase Config (if needed)

If your hosted app uses a different auth domain, update your environment variables:

**Current config** (from `config.ts`):
```typescript
authDomain: "hisaabscore.firebaseapp.com"
```

**If you're using a custom domain**, update to:
```typescript
authDomain: "your-custom-domain.com"
```

## Current Code Analysis

### ✅ Login Implementation (Correct)
```typescript
// src/app/(auth)/login/page.tsx
const handleGoogleLogin = async () => {
  if (!auth) return;
  setIsLoggingIn(true);
  try {
    const result = await signInWithPopup(auth, new GoogleAuthProvider());
    await handlePostLogin(result.user);
  } catch (error) {
    console.error('Error signing in with Google:', error);
    toast({
      variant: 'destructive',
      title: 'Login Failed',
      description: 'Could not log in with Google. Please try again.',
    });
  } finally {
    setIsLoggingIn(false);
  }
};
```

### ✅ Signup Implementation (Correct)
```typescript
// src/app/(auth)/signup/page.tsx
const handleGoogleSignup = async () => {
  if (!auth) return;
  setIsSigningUp(true);
  try {
    const result = await signInWithPopup(auth, new GoogleAuthProvider());
    await handlePostSignup(result.user);
  } catch (error) {
    console.error('Error signing up with Google:', error);
    toast({
      variant: 'destructive',
      title: 'Sign Up Failed',
      description: 'Could not sign up with Google. Please try again.',
    });
  } finally {
    setIsSigningUp(false);
  }
};
```

### ✅ User Profile Creation (Correct)
```typescript
// Both login and signup call this after successful auth
const handlePostLogin = async (firebaseUser: User) => {
  try {
    await fetch('/api/create-user-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
      }),
    });
  } catch (profileError) {
    console.error('Error creating user profile:', profileError);
    // Don't block login if profile creation fails
  }
  
  toast({
    title: 'Login Successful',
    description: `Welcome back, ${firebaseUser.displayName || email}!`,
  });
  router.push('/dashboard');
};
```

## Improved Error Handling (Optional Enhancement)

To get better error messages, update your Google login handlers:

```typescript
const handleGoogleLogin = async () => {
  if (!auth) return;
  setIsLoggingIn(true);
  try {
    const result = await signInWithPopup(auth, new GoogleAuthProvider());
    await handlePostLogin(result.user);
  } catch (error: any) {
    console.error('Error signing in with Google:', error);
    
    let description = 'Could not log in with Google. Please try again.';
    
    // Specific error messages
    if (error.code === 'auth/popup-closed-by-user') {
      description = 'Login cancelled. Please try again.';
    } else if (error.code === 'auth/popup-blocked') {
      description = 'Popup blocked by browser. Please allow popups for this site.';
    } else if (error.code === 'auth/unauthorized-domain') {
      description = 'This domain is not authorized. Please contact support.';
    } else if (error.code === 'auth/cancelled-popup-request') {
      description = 'Another popup is already open. Please close it first.';
    }
    
    toast({
      variant: 'destructive',
      title: 'Login Failed',
      description,
    });
  } finally {
    setIsLoggingIn(false);
  }
};
```

## Alternative: Use Redirect Instead of Popup (Recommended for Mobile)

Popups can be unreliable on some devices/browsers. Consider using redirect flow:

```typescript
import { 
  signInWithRedirect, 
  getRedirectResult,
  GoogleAuthProvider 
} from 'firebase/auth';

// On component mount, check for redirect result
useEffect(() => {
  if (!auth) return;
  
  const checkRedirectResult = async () => {
    try {
      const result = await getRedirectResult(auth);
      if (result?.user) {
        await handlePostLogin(result.user);
      }
    } catch (error) {
      console.error('Redirect error:', error);
    }
  };
  
  checkRedirectResult();
}, [auth]);

// Use redirect instead of popup
const handleGoogleLogin = async () => {
  if (!auth) return;
  try {
    await signInWithRedirect(auth, new GoogleAuthProvider());
    // User will be redirected away, then back with auth result
  } catch (error) {
    console.error('Error initiating Google login:', error);
  }
};
```

## Testing Checklist

After implementing fixes:

- [ ] Verify hosted domain added to Firebase Authorized domains
- [ ] Verify redirect URI added to Google Cloud Console
- [ ] Clear browser cache/cookies on hosted app
- [ ] Test Google login on hosted app
- [ ] Test Google signup on hosted app
- [ ] Test email login (should still work)
- [ ] Test email signup (should still work)

## What Your Hosted Domain Should Be

Common patterns:
- Firebase Hosting: `your-project.web.app` or `your-project.firebaseapp.com`
- Custom domain: `app.yourdomain.com` or `www.yourdomain.com`
- App Hosting: Check your deployment URL

**Tell me your hosted app URL and I'll give you the exact domain to add!**
