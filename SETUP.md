# 🦁 Wildbeat Safari - Complete Setup Guide

## 🚀 Quick Setup (Recommended)

### Option 1: Automatic Setup (Windows)
```bash
# Just double-click this file:
setup.bat
```

### Option 2: Manual Setup

1. **Setup Backend Database:**
```bash
cd backend
npm install
npm run setup-db
```

2. **Start Backend Server:**
```bash
npm start
```
Server runs on: http://localhost:3001

3. **Start Frontend (new terminal):**
```bash
cd ..
npm install
npm run dev
```
Website runs on: http://localhost:5173

## 📊 Database Features

- **SQLite Database** - Simple, no installation needed
- **Automatic Setup** - Creates all tables and sample data
- **Real Forms** - All forms save to database
- **API Endpoints** - RESTful API for all features

## 🔗 API Endpoints

- `GET /api/tours` - All tours
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - View all bookings
- `POST /api/reviews` - Submit review
- `GET /api/reviews` - Get approved reviews
- `GET /api/gallery` - Gallery images
- `POST /api/donations` - Process donation

## 📁 Database Location

After setup, your database will be at:
`backend/wildbeat.db`

## 🎯 What Works

✅ **Booking Form** - Saves customer bookings
✅ **Review Form** - Saves customer reviews  
✅ **Donation Form** - Processes donations
✅ **Gallery** - Loads images from database
✅ **Tours** - Dynamic tour data
✅ **Dark Mode** - Theme persistence

## 🔧 Troubleshooting

**Port 3001 already in use?**
```bash
# Kill the process and restart
taskkill /f /im node.exe
cd backend && npm start
```

**Database not found?**
```bash
cd backend
npm run setup-db
```

## 📱 Testing Forms

1. **Book a Tour** - Go to /book, fill form, check backend/wildbeat.db
2. **Submit Review** - Go to /reviews, submit review
3. **Make Donation** - Go to /support, donate any amount

All data is saved permanently in the SQLite database!

## 🌐 Production Deployment

For production, you can:
1. Deploy backend to Heroku/Railway/Vercel
2. Deploy frontend to Netlify/Vercel
3. Use PostgreSQL for production database

The current setup is perfect for development and testing!