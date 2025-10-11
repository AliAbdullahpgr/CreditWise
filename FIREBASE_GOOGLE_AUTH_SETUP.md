# Firebase Google Sign-In Setup Fix

## Error: `auth/operation-not-allowed`

This error occurs because Google Sign-In is not enabled in your Firebase project.

## ✅ Solution: Enable Google Authentication

### Step-by-Step Instructions:

1. **Open Firebase Console**
   - Go to: https://console.firebase.google.com/
   - Select your "CreditWise" project

2. **Navigate to Authentication**
   - Click "Authentication" in the left sidebar
   - Click the "Sign-in method" tab at the top

3. **Enable Google Provider**
   - Find "Google" in the list of Sign-in providers
   - Click on the "Google" row
   - Toggle the "Enable" switch to **ON**
   - In "Project support email" dropdown, select your email
   - Click "Save" button

4. **Verify Authorized Domains** (Optional but recommended)
   - Go to "Authentication" → "Settings" tab
   - Scroll to "Authorized domains" section
   - Ensure `localhost` is listed (should be by default)
   - When deploying to production, add your domain here

## 🧪 Test After Enabling

1. **Refresh your browser** at `http://localhost:9003`
2. **Go to login page**: `http://localhost:9003/login`
3. **Click "Login with Google"**
4. **Complete Google authentication**

**Expected Result:**
- Google OAuth popup should appear
- After selecting your Google account, you should be logged in
- You'll be redirected to `/dashboard`
- User profile will be created in Firestore at `users/{userId}`

## 📋 Checklist

- [ ] Opened Firebase Console
- [ ] Selected CreditWise project
- [ ] Went to Authentication → Sign-in method
- [ ] Enabled Google provider
- [ ] Set project support email
- [ ] Saved changes
- [ ] Refreshed browser
- [ ] Tested login

## 🔍 Verify It's Working

After enabling and testing:

1. **Check Browser Console** - Should see no auth errors
2. **Check Firebase Console → Authentication → Users**
   - Your user should appear in the list after login
3. **Check Firebase Console → Firestore Database**
   - Should see `users/{your-user-id}` document created

## 🎯 Additional Providers (Optional)

If you want to enable other sign-in methods in the future:

### Email/Password Sign-In:
1. Same "Sign-in method" tab
2. Click "Email/Password"
3. Enable the first toggle
4. Click "Save"

### Other Providers:
- Facebook
- Twitter
- GitHub
- Microsoft
- Apple
- etc.

Follow the same process and each provider will have its own setup requirements.

## ⚠️ Common Issues

### Issue: Can't find "Google" in providers list
**Solution:** Make sure you're in the "Sign-in method" tab, not "Users" tab

### Issue: "Save" button is disabled
**Solution:** Make sure you selected a support email from the dropdown

### Issue: Still getting the same error after enabling
**Solution:** 
- Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache
- Try in incognito/private window
- Make sure you saved the changes in Firebase Console

### Issue: Google popup appears but then shows error
**Solution:** 
- Check that your Firebase config in `src/firebase/config.ts` is correct
- Verify the API key matches your Firebase project
- Ensure you're using the correct Firebase project

## 🎉 Success Indicators

You'll know it's working when:
1. ✅ No `auth/operation-not-allowed` error in console
2. ✅ Google OAuth popup appears when clicking "Login with Google"
3. ✅ After selecting Google account, you're logged in
4. ✅ Redirected to `/dashboard`
5. ✅ User document created in Firestore
6. ✅ Dashboard shows your user info (check DevTools for user object)

---

**This is a one-time setup!** Once enabled, Google Sign-In will work for all users of your app.
