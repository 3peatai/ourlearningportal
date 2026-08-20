#!/bin/bash
set -e

echo "-> Installing portal dependencies..."
cd portal
npm install --prefer-offline 2>/dev/null || npm install

echo "-> Building portal..."
npm run build

echo "-> Assembling public/ output..."
cd ..
mkdir -p public

# Scout homepage lives as gzip+base64 parts under homepage-src/ (the live
# index.html is ~96KB after stripping inlined PNGs; a single Contents API
# write was truncating it). Concatenate, inflate, and checksum.
EXPECTED_SHA="588294ec75b38feb1f5ad8fe9cb203f3e7f0645ce9c43905207d4e103c414962"
cat homepage-src/p00.b64 homepage-src/p01.b64 homepage-src/p02.b64 \
    homepage-src/p03.b64 homepage-src/p04.b64 homepage-src/p05.b64 \
    homepage-src/p06.b64 homepage-src/p07.b64 homepage-src/p08.b64 \
  | tr -d '\n\r ' | base64 -d | gzip -dc > public/index.html
GOT=$(sha256sum public/index.html | awk '{print $1}')
if [ "$GOT" != "$EXPECTED_SHA" ]; then
  echo "Homepage SHA mismatch: got $GOT expected $EXPECTED_SHA" >&2
  exit 1
fi

cp -f learning-centres.png public/ 2>/dev/null || true
cp -f sports-schools.png public/ 2>/dev/null || true
cp -f tutoring-practices.png public/ 2>/dev/null || true

echo "-> Copying brand favicons..."
cp -f portal/public/favicon.svg public/ 2>/dev/null || true
cp -f portal/public/favicon-16.png public/ 2>/dev/null || true
cp -f portal/public/favicon-32.png public/ 2>/dev/null || true
cp -f portal/public/favicon-180-apple-touch.png public/ 2>/dev/null || true
cp -f portal/public/favicon-192-android.png public/ 2>/dev/null || true
cp -f portal/public/favicon-512-android.png public/ 2>/dev/null || true
cp -f portal/public/site.webmanifest public/ 2>/dev/null || true

cp -f llms.txt public/ 2>/dev/null || true
cp -f robots.txt public/ 2>/dev/null || true
cp -f sitemap.xml public/ 2>/dev/null || true

echo "Build complete. Output in public/"
