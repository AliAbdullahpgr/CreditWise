# Deployment & Setup Guide

## Setting Up on a New Computer

### 1. Clone the Repository
```bash
git clone https://github.com/AliAbdullahpgr/CreditWise.git
cd CreditWise
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Copy `.env.local` from your secure location or create it with these variables:

```bash
GOOGLE_GENAI_API_KEY=your_key_here
NEXT_PUBLIC_APP_URL=http://localhost:9003

# Firebase Client Config (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCv5g4d29uFslxt3ddsNZbuHKIDQM4x88o
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=hisaabscore.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=hisaabscore
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=hisaabscore.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=818345881555
NEXT_PUBLIC_FIREBASE_APP_ID=1:818345881555:web:1b789186f60222ea7c0926

# Firebase Admin Config (Server-side only)
FIREBASE_PROJECT_ID=hisaabscore
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@hisaabscore.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="your_private_key_here"
```

### 4. Fix Firebase Auth Domain Error

If you get `auth/unauthorized-domain` error:

1. Go to [Firebase Console](https://console.firebase.google.com/project/hisaabscore/authentication/settings)
2. Scroll to **"Authorized domains"**
3. Click **"Add domain"**
4. Add these domains:
   - `localhost` (if not already there)
   - `127.0.0.1`
   - Any custom IP or domain you're using

### 5. Run Development Server
```bash
npm run dev
```

The app will be available at http://localhost:9003

## Common Issues

### auth/unauthorized-domain
**Cause**: The domain you're accessing from isn't authorized in Firebase
**Fix**: Add the domain to Firebase Console → Authentication → Settings → Authorized domains

### Firebase Project Mismatch
**Cause**: Client and server configs point to different projects
**Fix**: Ensure both `.env.local` and `src/firebase/config.ts` use the same project ID

### Missing Transactions/Data
**Cause**: Data written to one Firebase project, client reading from another
**Fix**: Verify `FIREBASE_PROJECT_ID` matches in all configs

### Port Already in Use
**Cause**: Port 9003 is occupied
**Fix**: Change port in `package.json` or kill the process:
```bash
# Linux/Mac
lsof -ti:9003 | xargs kill -9

# Windows
netstat -ano | findstr :9003
taskkill /PID <PID> /F
```

## Firebase Security Rules

Current rules location: `firestore.rules`

To deploy rules:
```bash
firebase deploy --only firestore:rules
```

## Project Structure
- `/src/app` - Next.js App Router pages
- `/src/components` - Reusable UI components
- `/src/lib` - Utility functions and types
- `/src/firebase` - Firebase client configuration
- `/src/ai` - AI/ML flows (Genkit)

## Important Notes

1. **Never commit `.env.local`** - It contains sensitive credentials
2. **Use the same Firebase project** for both client and admin SDK
3. **Clear browser cache** after changing Firebase configs
4. **Re-login after config changes** to refresh auth tokens
