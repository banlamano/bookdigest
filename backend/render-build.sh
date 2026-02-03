#!/usr/bin/env bash
# Render build script

echo "Installing dependencies..."
npm ci

echo "Removing cached Prisma client..."
rm -rf node_modules/.prisma || true

echo "Generating Prisma client..."
npx prisma generate

echo "Build complete!"
