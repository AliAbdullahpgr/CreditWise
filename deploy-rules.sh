#!/bin/bash

# Script to deploy Firestore Security Rules using Firebase CLI

echo "🔥 Firebase Rules Deployment Script"
echo "===================================="
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed."
    echo ""
    echo "Would you like to install it? (y/n)"
    read -r response
    if [[ "$response" == "y" || "$response" == "Y" ]]; then
        echo "📦 Installing Firebase CLI..."
        npm install -g firebase-tools
        echo "✅ Firebase CLI installed!"
    else
        echo "⚠️  Please install Firebase CLI manually:"
        echo "   npm install -g firebase-tools"
        exit 1
    fi
fi

echo "✅ Firebase CLI is installed"
echo ""

# Check if user is logged in
echo "🔐 Checking Firebase authentication..."
firebase projects:list &> /dev/null
if [ $? -ne 0 ]; then
    echo "❌ Not logged in to Firebase."
    echo "📝 Please login to Firebase..."
    firebase login
fi

echo "✅ Logged in to Firebase"
echo ""

# Check if Firebase is initialized
if [ ! -f ".firebaserc" ]; then
    echo "⚠️  Firebase project not initialized in this directory."
    echo "📝 Initializing Firebase..."
    firebase init firestore
fi

echo "✅ Firebase project configured"
echo ""

# Deploy Firestore rules
echo "🚀 Deploying Firestore Security Rules..."
firebase deploy --only firestore:rules

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS! Firestore rules deployed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Hard refresh your browser (Ctrl+Shift+R)"
    echo "2. Go to http://localhost:9003/dashboard"
    echo "3. Check that there are no permission errors"
    echo ""
else
    echo ""
    echo "❌ Failed to deploy rules."
    echo "Please check the error message above and try again."
    exit 1
fi
