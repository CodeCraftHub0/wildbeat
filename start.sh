#!/bin/bash
echo "🦁 Starting Wildbeat Safari..."
echo ""

# Start backend
echo "🚀 Starting backend server..."
cd backend
npm start &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🌐 Starting frontend..."
cd ..
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are running!"
echo "🌐 Frontend: http://localhost:5173"
echo "🔗 Backend API: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait