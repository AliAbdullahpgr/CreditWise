#!/bin/bash
# Clean restart script for Next.js dev server

echo "🧹 Cleaning Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

echo "🚀 Starting dev server..."
npm run dev
