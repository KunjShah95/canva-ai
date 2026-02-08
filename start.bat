@echo off
start cmd /k "cd backend && npm install && npx prisma migrate dev --name init && npm start"
start cmd /k "npm run dev"
echo Backend and Frontend started!
