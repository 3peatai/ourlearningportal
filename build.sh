#!/bin/bash
set -e

echo "→ Installing portal dependencies..."
cd portal
npm install --prefer-offline 2>/dev/null || npm install

echo "→ Building portal..."
npm run build

echo "→ Assembling public/ output..."
cd ..
mkdir -p public

cp index.html public/
cp -f learning-centres.png public/ 2>/dev/null || true
cp -f sports-schools.png public/ 2>/dev/null || true
cp -f tutoring-practices.png public/ 2>/dev/null || true

echo "→ Copying brand favicons..."
cp -f portal/public/favicon.svg public/ 2>/dev/null || true
cp -f portal/public/favicon-16.png public/ 2>/dev/null || true
cp -f portal/public/favicon-32.png public/ 2>/dev/null || true
cp -f portal/public/favicon-180-apple-touch.png public/ 2>/dev/null || true
cp -f portal/public/favicon-192-android.png public/ 2>/dev/null || true
cp -f portal/public/favicon-512-android.png public/ 2>/dev/null || true
cp -f portal/public/site.webmanifest public/ 2>/dev/null || true

echo "✓ Build complete. Output in public/"
