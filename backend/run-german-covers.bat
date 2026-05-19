@echo off
cd /d "C:\Users\Installation\Desktop\Website\BookLearn\backend"
npx ts-node src/scripts/fix-german-titles-covers.ts >> "C:\Users\Installation\Desktop\Website\BookLearn\backend\german-covers-log.txt" 2>&1
