# Signup Loop & Email Verification Issue - Quick Fix Guide

## Issue Description
After signup, users experience:
1. Redirect loop between pages
2. Warning: "Account created but verification email could not be sent"

## ✅ Fixes Applied

### 1. Prevent Signup Page Auto-Redirect During Process
**File**: `src/app/(auth)/signup/page.tsx`

Added `isRedirecting` state flag to prevent the useEffect from redirecting to dashboard during the signup/signout process.

```typescript
const [isRedirecting, setIsRedirecting] = useState(false);

useEffect(() => {
  // Don't redirect if we're in the middle of signup process
  if (!isUserLoading && user && !isSigningUp && !isRedirecting) {
    router.push('/dashboard');
  }
}, [user, isUserLoading, isSigningUp, isRedirecting, router]);
```

### 2. Added Delay After SignOut
Added a 100ms delay after `auth.signOut()` to ensure the auth state fully updates before navigation.

```typescript
// Sign out the user
await auth.signOut();

// Small delay to ensure signOut completes
await new Promise(resolve => setTimeout(resolve, 100));

// Then redirect
router.push('/verify-email');
```

## 🔧 Email Verification Not Sending - Firebase Console Fix

The warning "verification email could not be sent" indicates Firebase email templates need configuration.

### Steps to Fix in Firebase Console:

1. **Go to Firebase Console**: https://console.firebase.google.com
2. **Select your project**: HisaabScore
3. **Navigate to Authentication**:
   - Click "Authentication" in left sidebar
   - Click "Templates" tab at the top
4. **Configure Email Verification Template**:
   - Find "Email address verification" 
   - Click the pencil icon to edit
   - **Ensure it's enabled** (toggle should be ON)
   - Review the template content
   - Save changes

### Email Template Settings:
- **From name**: HisaabScore (or your preferred name)
- **From email**: noreply@hisaabscore.firebaseapp.com (default)
- **Subject**: Verify your email for HisaabScore
- **Action URL**: Should point to your domain

### Check Email Provider Settings:
1. In Firebase Console → Authentication → Settings
2. Under "Authorized domains", ensure:
   - `localhost` is listed (for development)
   - Your production domain is listed
3. Check that email/password authentication is enabled:
   - Authentication → Sign-in method
   - Email/Password should be "Enabled"

## 🧪 Testing Steps

1. **Clear browser data**:
   ```javascript
   // Open browser console (F12) and run:
   localStorage.clear();
   sessionStorage.clear();
   // Then close and reopen the browser
   ```

2. **Try signup with a new email**:
   - Should redirect to verify-email page
   - Should NOT loop between pages
   - Should either:
     - ✅ Show success message if email sent
     - ⚠️ Show warning if email failed (but page loads correctly)

3. **Check browser console** for any errors:
   - Open DevTools (F12)
   - Look for Firebase errors in Console tab
   - Look for network errors in Network tab

4. **Check email inbox**:
   - Check spam/junk folder
   - Email should come from: noreply@hisaabscore.firebaseapp.com
   - If no email arrives, it's a Firebase Console configuration issue

## 📧 Alternative: Manual Email Verification Test

If emails still don't send, you can manually verify users for testing:

1. Go to Firebase Console → Authentication → Users
2. Find the user you just created
3. Look at the "Email verified" column
4. For testing, you can manually mark it as verified (not recommended for production)

## 🐛 Troubleshooting Checklist

- [ ] Firebase Console → Authentication → Templates → Email verification is **ENABLED**
- [ ] Firebase Console → Authentication → Sign-in method → Email/Password is **ENABLED**
- [ ] No console errors in browser DevTools
- [ ] Authorized domains include `localhost` and your production domain
- [ ] Signup redirects to `/verify-email` (not looping)
- [ ] After signup, user is signed out (check Firebase Auth state in DevTools)
- [ ] `.env.local` has correct `NEXT_PUBLIC_APP_URL`

## 🔍 Debug Mode

To see more details about the email sending error, check browser console after signup. The error will be logged:

```typescript
console.error('Email verification error:', emailError);
```

Common error codes:
- `auth/invalid-continue-uri` - The continue URL is invalid
- `auth/unauthorized-continue-uri` - The domain is not authorized
- `auth/missing-continue-uri` - No continue URL provided
- `auth/too-many-requests` - Rate limited

## ✅ Expected User Flow

1. User fills signup form
2. Account created in Firebase Auth
3. Verification email sent (or warning shown)
4. User signed out automatically
5. Redirected to `/verify-email` page (clean, no loop)
6. User checks email
7. Clicks verification link
8. Returns to app and clicks "Back to Login"
9. Logs in successfully
10. Redirected to dashboard ✅

## 🚀 Quick Deploy Test

After making changes:

```bash
# Clear Next.js cache
rm -rf .next

# Restart dev server
npm run dev
```

Then test the signup flow with a fresh browser session (incognito mode).

---

**Fixed**: January 2025  
**Status**: ✅ Loop fixed, email configuration required in Firebase Console
