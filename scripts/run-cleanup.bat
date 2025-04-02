@echo off
cd /d %~dp0
npx ts-node -P tsconfig.scripts.json cleanup-temp-images.ts 