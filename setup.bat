@echo off
echo 🚀 Setting up Wildbeat Safari Database...
echo.

cd backend
echo Installing backend dependencies...
call npm install

echo.
echo Creating database...
call npm run setup-db

echo.
echo ✅ Setup complete!
echo.
echo To start the backend server:
echo   cd backend
echo   npm start
echo.
echo To start the frontend:
echo   npm run dev
echo.
pause