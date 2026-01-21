@echo off
echo Testing backend server...
echo.

cd backend

echo Installing dependencies...
call npm install

echo.
echo Setting up database...
call npm run setup-db

echo.
echo Starting server...
call npm start